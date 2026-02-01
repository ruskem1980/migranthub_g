'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ClipboardList, CheckCircle2, Circle, Calendar, AlertTriangle, Settings2, Info } from 'lucide-react';
import { useProfileStore } from '@/lib/stores/profileStore';

const STORAGE_KEY = 'migranthub_checklist';
const SIMULATOR_KEY = 'migranthub_checklist_simulator';

// ЕАЭС countries - 30 days for registration
const EAEU_COUNTRIES = ['KZ', 'KG', 'AM', 'BY'];

// Tajikistan - 15 days for registration
const TJ_COUNTRIES = ['TJ'];

// All CIS countries
const CITIZENSHIP_OPTIONS = [
  { code: 'UZ', labelKey: 'uzbekistan' },
  { code: 'TJ', labelKey: 'tajikistan' },
  { code: 'KG', labelKey: 'kyrgyzstan' },
  { code: 'KZ', labelKey: 'kazakhstan' },
  { code: 'AM', labelKey: 'armenia' },
  { code: 'AZ', labelKey: 'azerbaijan' },
  { code: 'MD', labelKey: 'moldova' },
  { code: 'BY', labelKey: 'belarus' },
  { code: 'UA', labelKey: 'ukraine' },
  { code: 'GE', labelKey: 'georgia' },
  { code: 'TM', labelKey: 'turkmenistan' },
  { code: 'OTHER', labelKey: 'other_country' },
];

// Entry points (borders)
const ENTRY_POINT_OPTIONS = [
  { code: 'air', labelKey: 'entry_air' },
  { code: 'land_kz', labelKey: 'entry_land_kz' },
  { code: 'land_by', labelKey: 'entry_land_by' },
  { code: 'land_other', labelKey: 'entry_land_other' },
];

// Purpose of visit according to migration card
const PURPOSE_OPTIONS = [
  { code: 'work', labelKey: 'purpose_work' },
  { code: 'private', labelKey: 'purpose_private' },
  { code: 'tourist', labelKey: 'purpose_tourism' },
  { code: 'study', labelKey: 'purpose_study' },
  { code: 'business', labelKey: 'purpose_business' },
  { code: 'transit', labelKey: 'purpose_transit' },
  { code: 'official', labelKey: 'purpose_official' },
];

type ValidPurpose = 'work' | 'study' | 'tourist' | 'private' | 'business' | 'official' | 'transit';

interface SimulatorData {
  entryDate: string;
  citizenship: string;
  entryPoint: string;
  purpose: ValidPurpose | '';
}

interface ChecklistItem {
  id: string;
  key: string;
  titleKey: string;
  required: boolean;
  deadline: Date | null;
  deadlineDays: number | null;
  riskKey: string | null;
  completed: boolean;
}

interface CalculatedDeadline {
  key: string;
  titleKey: string;
  deadline: Date;
  deadlineDays: number;
  riskKey: string;
  required: boolean;
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineColor(daysLeft: number): string {
  if (daysLeft < 0) return 'text-red-600';
  if (daysLeft < 3) return 'text-red-500';
  if (daysLeft <= 7) return 'text-yellow-600';
  return 'text-green-600';
}

function getDeadlineBgColor(daysLeft: number): string {
  if (daysLeft < 0) return 'bg-red-50 border-red-200';
  if (daysLeft < 3) return 'bg-red-50 border-red-200';
  if (daysLeft <= 7) return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
}

// Calculate deadlines based on simulator data
function calculateDeadlines(data: SimulatorData): CalculatedDeadline[] {
  if (!data.entryDate) return [];

  const entryDate = new Date(data.entryDate);
  const deadlines: CalculatedDeadline[] = [];
  const { citizenship, purpose } = data;

  // 1. Migration card - received at entry, no deadline
  // (not added to deadlines, always first item)

  // 2. Registration deadline - varies by citizenship
  let registrationDays = 7; // Default: 7 working days (~7-10 calendar days)
  if (EAEU_COUNTRIES.includes(citizenship)) {
    registrationDays = 30; // EAEU: 30 days
  } else if (TJ_COUNTRIES.includes(citizenship)) {
    registrationDays = 15; // Tajikistan: 15 days
  }

  const registrationDeadline = new Date(entryDate);
  registrationDeadline.setDate(registrationDeadline.getDate() + registrationDays);
  deadlines.push({
    key: 'registration',
    titleKey: 'checklist.items.registration',
    deadline: registrationDeadline,
    deadlineDays: registrationDays,
    riskKey: 'checklist.risks.registration',
    required: true,
  });

  // 3. Patent-related deadlines (only for work purpose)
  if (purpose === 'work') {
    // Medical certificates - needed before patent, recommend within 20 days
    const medicalDeadline = new Date(entryDate);
    medicalDeadline.setDate(medicalDeadline.getDate() + 20);
    deadlines.push({
      key: 'medical',
      titleKey: 'checklist.items.medical',
      deadline: medicalDeadline,
      deadlineDays: 20,
      riskKey: 'checklist.risks.medical',
      required: true,
    });

    // Patent application - 30 days from entry
    const patentDeadline = new Date(entryDate);
    patentDeadline.setDate(patentDeadline.getDate() + 30);
    deadlines.push({
      key: 'patent',
      titleKey: 'checklist.items.patent',
      deadline: patentDeadline,
      deadlineDays: 30,
      riskKey: 'checklist.risks.patent',
      required: true,
    });

    // Fingerprinting - at patent submission, no specific deadline
    deadlines.push({
      key: 'fingerprints',
      titleKey: 'checklist.items.fingerprints',
      deadline: patentDeadline, // Same as patent
      deadlineDays: 30,
      riskKey: 'checklist.risks.fingerprints',
      required: true,
    });
  }

  // 4. 90-day stay limit (for all except EAEU with work)
  const isEAEU = EAEU_COUNTRIES.includes(citizenship);
  if (!(isEAEU && purpose === 'work')) {
    const stayLimitDeadline = new Date(entryDate);
    stayLimitDeadline.setDate(stayLimitDeadline.getDate() + 90);
    deadlines.push({
      key: 'stay_limit',
      titleKey: 'checklist.items.stay_limit',
      deadline: stayLimitDeadline,
      deadlineDays: 90,
      riskKey: 'checklist.risks.stay_limit',
      required: true,
    });
  }

  // 5. Study-specific items
  if (purpose === 'study') {
    // University enrollment confirmation
    const enrollmentDeadline = new Date(entryDate);
    enrollmentDeadline.setDate(enrollmentDeadline.getDate() + 30);
    deadlines.push({
      key: 'enrollment',
      titleKey: 'checklist.items.enrollment',
      deadline: enrollmentDeadline,
      deadlineDays: 30,
      riskKey: 'checklist.risks.enrollment',
      required: true,
    });
  }

  return deadlines;
}

export default function ChecklistPage() {
  const { t, language } = useTranslation();
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [simulatorData, setSimulatorData] = useState<SimulatorData>({
    entryDate: '',
    citizenship: '',
    entryPoint: 'air',
    purpose: 'work',
  });

  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompleted = localStorage.getItem(STORAGE_KEY);
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          setCompletedItems(parsed);
        }
      } catch {
        // ignore
      }
    }

    const savedSimulator = localStorage.getItem(SIMULATOR_KEY);
    if (savedSimulator) {
      try {
        const parsed = JSON.parse(savedSimulator);
        setSimulatorData(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Sync with profile
  useEffect(() => {
    if (profile?.entryDate && !simulatorData.entryDate) {
      setSimulatorData(prev => ({ ...prev, entryDate: profile.entryDate || '' }));
    }
    if (profile?.citizenship && !simulatorData.citizenship) {
      setSimulatorData(prev => ({ ...prev, citizenship: profile.citizenship || '' }));
    }
    if (profile?.purpose && !simulatorData.purpose) {
      setSimulatorData(prev => ({ ...prev, purpose: profile.purpose || 'work' }));
    }
  }, [profile, simulatorData.entryDate, simulatorData.citizenship, simulatorData.purpose]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedItems));
  }, [completedItems]);

  useEffect(() => {
    localStorage.setItem(SIMULATOR_KEY, JSON.stringify(simulatorData));
    // Also update profile
    if (simulatorData.entryDate) {
      updateProfile({ entryDate: simulatorData.entryDate });
    }
    if (simulatorData.citizenship) {
      updateProfile({ citizenship: simulatorData.citizenship });
    }
    if (simulatorData.purpose) {
      updateProfile({ purpose: simulatorData.purpose });
    }
  }, [simulatorData, updateProfile]);

  // Calculate deadlines based on simulator data
  const calculatedDeadlines = useMemo(() => {
    return calculateDeadlines(simulatorData);
  }, [simulatorData]);

  // Build checklist items
  const checklistItems = useMemo((): ChecklistItem[] => {
    const items: ChecklistItem[] = [];

    // Always add migration card first (no deadline)
    items.push({
      id: 'migration_card',
      key: 'migration_card',
      titleKey: 'checklist.items.migration_card',
      required: true,
      deadline: null,
      deadlineDays: null,
      riskKey: null,
      completed: completedItems['migration_card'] || false,
    });

    // Add calculated deadline items
    for (const dl of calculatedDeadlines) {
      items.push({
        id: dl.key,
        key: dl.key,
        titleKey: dl.titleKey,
        required: dl.required,
        deadline: dl.deadline,
        deadlineDays: dl.deadlineDays,
        riskKey: dl.riskKey,
        completed: completedItems[dl.key] || false,
      });
    }

    return items;
  }, [calculatedDeadlines, completedItems]);

  const toggleItem = (key: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSimulatorChange = (field: keyof SimulatorData, value: string) => {
    setSimulatorData(prev => ({ ...prev, [field]: value }));
  };

  const fillFromProfile = () => {
    if (!profile) return;
    setSimulatorData(prev => ({
      ...prev,
      ...(profile.entryDate && { entryDate: profile.entryDate }),
      ...(profile.citizenship && { citizenship: profile.citizenship }),
      ...(profile.purpose && { purpose: profile.purpose as ValidPurpose }),
    }));
  };

  const hasProfileData = profile && (profile.entryDate || profile.citizenship || profile.purpose);

  const hasData = !!simulatorData.entryDate && !!simulatorData.citizenship;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 safe-area-top">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">{t('checklist.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('checklist.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Simulator Card - Always visible */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <button
              onClick={() => setIsSimulatorExpanded(!isSimulatorExpanded)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base text-blue-900">
                  {t('checklist.simulator_title')}
                </CardTitle>
                {hasProfileData && (
                  <button
                    onClick={(e) => { e.stopPropagation(); fillFromProfile(); }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('checklist.use_profile_data')}
                  </button>
                )}
              </div>
              <span className="text-blue-600 text-sm">
                {isSimulatorExpanded ? '▲' : '▼'}
              </span>
            </button>
          </CardHeader>

          {isSimulatorExpanded && (
            <CardContent className="space-y-4">
              {/* Entry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checklist.entry_date')} *
                </label>
                <input
                  type="date"
                  value={simulatorData.entryDate}
                  onChange={(e) => handleSimulatorChange('entryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Citizenship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checklist.citizenship')} *
                </label>
                <select
                  value={simulatorData.citizenship}
                  onChange={(e) => handleSimulatorChange('citizenship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('checklist.select_citizenship')}</option>
                  {CITIZENSHIP_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {t(`checklist.countries.${opt.labelKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry Point */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checklist.entry_point')}
                </label>
                <select
                  value={simulatorData.entryPoint}
                  onChange={(e) => handleSimulatorChange('entryPoint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ENTRY_POINT_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {t(`checklist.${opt.labelKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checklist.purpose')} *
                </label>
                <select
                  value={simulatorData.purpose}
                  onChange={(e) => handleSimulatorChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {t(`checklist.${opt.labelKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info about EAEU */}
              {EAEU_COUNTRIES.includes(simulatorData.citizenship) && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800">
                    {t('checklist.eaeu_info')}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Checklist */}
        {!hasData ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {t('checklist.fill_simulator')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checklist.required_documents')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklistItems.map((item) => {
                const daysLeft = item.deadline ? getDaysUntil(item.deadline) : null;
                const showRisk = daysLeft !== null && (daysLeft <= 7 || daysLeft < 0);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.key)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer active:scale-[0.98] ${
                      item.completed
                        ? 'bg-gray-50 border-gray-200'
                        : item.deadline && daysLeft !== null
                          ? getDeadlineBgColor(daysLeft)
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={item.completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                          {t(item.titleKey)}
                        </span>

                        {/* Deadline info */}
                        {!item.completed && item.deadline && daysLeft !== null && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/50 ${getDeadlineColor(daysLeft)}`}>
                                <Calendar className="w-3 h-3" />
                                {t('checklist.deadline_date', {
                                  date: item.deadline.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                    day: 'numeric',
                                    month: 'long'
                                  })
                                })}
                              </span>
                              <span className={`text-xs font-bold ${getDeadlineColor(daysLeft)}`}>
                                {daysLeft < 0
                                  ? t('checklist.deadline_passed')
                                  : daysLeft === 0
                                    ? t('checklist.deadline_today')
                                    : t('checklist.days_left', { count: daysLeft })
                                }
                              </span>
                            </div>

                            {/* Term explanation */}
                            {item.deadlineDays && (
                              <p className="text-xs text-muted-foreground">
                                {t('checklist.term_info', { days: item.deadlineDays })}
                              </p>
                            )}

                            {/* Risk warning */}
                            {showRisk && item.riskKey && (
                              <div className="flex items-start gap-1.5 mt-1 p-2 bg-red-100 rounded">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-red-700 font-medium">
                                  {t(item.riskKey)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* No deadline items info */}
                        {!item.completed && !item.deadline && item.key === 'migration_card' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('checklist.migration_card_info')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Legal disclaimer */}
        <Card variant="outlined">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              {t('checklist.legal_disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
