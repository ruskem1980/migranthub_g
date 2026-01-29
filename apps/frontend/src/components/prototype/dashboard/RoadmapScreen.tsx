'use client';

import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  FileText,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';

interface RoadmapStage {
  id: string;
  icon: React.ElementType;
  deadline: number; // days from entry
  fineMin?: number;
  fineMax?: number;
  risks: string[];
}

type StageStatus = 'completed' | 'current' | 'upcoming' | 'overdue' | 'warning';

interface RoadmapScreenProps {
  onClose?: () => void;
}

export function RoadmapScreen({ onClose }: RoadmapScreenProps) {
  const { t } = useTranslation();
  const { profile } = useProfileStore();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  // Parse entry date from profile
  const entryDate = useMemo(() => {
    if (profile?.entryDate) {
      return new Date(profile.entryDate);
    }
    return null;
  }, [profile?.entryDate]);

  // Calculate days since entry
  const daysSinceEntry = useMemo(() => {
    if (!entryDate) return null;
    const today = new Date();
    const diffTime = today.getTime() - entryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [entryDate]);

  // Roadmap stages configuration
  const stages: RoadmapStage[] = [
    {
      id: 'entry',
      icon: Calendar,
      deadline: 0,
      risks: [],
    },
    {
      id: 'registration',
      icon: ClipboardCheck,
      deadline: 7,
      fineMin: 2000,
      fineMax: 5000,
      risks: ['deportation', 'entryBan'],
    },
    {
      id: 'patent',
      icon: FileText,
      deadline: 30,
      fineMin: 5000,
      fineMax: 7000,
      risks: ['deportation', 'entryBan3Years', 'illegalWork'],
    },
    {
      id: 'longRegistration',
      icon: Home,
      deadline: 90,
      fineMin: 2000,
      fineMax: 5000,
      risks: ['deportation', 'entryBan'],
    },
  ];

  // Determine stage status
  const getStageStatus = (stage: RoadmapStage): StageStatus => {
    if (daysSinceEntry === null) return 'upcoming';

    if (stage.id === 'entry') return 'completed';

    const daysRemaining = stage.deadline - daysSinceEntry;

    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 3) return 'warning';
    if (daysRemaining <= stage.deadline * 0.3) return 'current';
    return 'upcoming';
  };

  // Get days remaining for a stage
  const getDaysRemaining = (stage: RoadmapStage): number | null => {
    if (daysSinceEntry === null) return null;
    return stage.deadline - daysSinceEntry;
  };

  // Status colors and icons
  const getStatusStyle = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: CheckCircle,
          iconColor: 'text-green-500',
          lineBg: 'bg-green-500',
        };
      case 'current':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: Clock,
          iconColor: 'text-blue-500',
          lineBg: 'bg-blue-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-500',
          text: 'text-amber-700',
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          lineBg: 'bg-amber-500',
        };
      case 'overdue':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-700',
          icon: XCircle,
          iconColor: 'text-red-500',
          lineBg: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-600',
          icon: Clock,
          iconColor: 'text-gray-400',
          lineBg: 'bg-gray-300',
        };
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDeadlineDate = (stage: RoadmapStage): Date | null => {
    if (!entryDate) return null;
    const deadline = new Date(entryDate);
    deadline.setDate(deadline.getDate() + stage.deadline);
    return deadline;
  };

  const toggleExpand = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  // If no entry date, show prompt to set it
  if (!entryDate) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
        <div className="w-full bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
            <div className="flex items-center gap-3 mb-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold">{t('roadmap.title')}</h1>
                <p className="text-sm text-white/80">{t('roadmap.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* No entry date message */}
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('roadmap.noEntryDate.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('roadmap.noEntryDate.description')}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('roadmap.noEntryDate.goToProfile')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
      <div className="w-full bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold">{t('roadmap.title')}</h1>
              <p className="text-sm text-white/80">{t('roadmap.subtitle')}</p>
            </div>
          </div>

          {/* Entry date info */}
          <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">{t('roadmap.entryDate')}</p>
                <p className="font-semibold">{formatDate(entryDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">{t('roadmap.daysInRussia')}</p>
                <p className="font-semibold text-xl">{daysSinceEntry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4">
          <div className="relative">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage);
              const style = getStatusStyle(status);
              const daysRemaining = getDaysRemaining(stage);
              const deadlineDate = getDeadlineDate(stage);
              const isExpanded = expandedStage === stage.id;
              const StageIcon = stage.icon;
              const StatusIcon = style.icon;

              return (
                <div key={stage.id} className="relative">
                  {/* Connecting line */}
                  {index < stages.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-16 ${style.lineBg}`}
                    />
                  )}

                  {/* Stage card */}
                  <div
                    className={`relative flex items-start gap-4 mb-4 p-4 rounded-2xl border-2 ${style.bg} ${style.border} cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => stage.id !== 'entry' && toggleExpand(stage.id)}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0`}>
                      <StageIcon className={`w-6 h-6 ${style.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-bold ${style.text}`}>
                            {t(`roadmap.stages.${stage.id}.title`)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {t(`roadmap.stages.${stage.id}.description`)}
                          </p>
                        </div>
                        <StatusIcon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
                      </div>

                      {/* Deadline info */}
                      {stage.id !== 'entry' && (
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {stage.deadline} {t('common.days')}
                            </span>
                          </div>
                          {daysRemaining !== null && (
                            <div className={`flex items-center gap-1 font-medium ${
                              daysRemaining < 0 ? 'text-red-600' :
                              daysRemaining <= 3 ? 'text-amber-600' :
                              'text-green-600'
                            }`}>
                              {daysRemaining < 0 ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  {t('roadmap.overdue', { days: Math.abs(daysRemaining) })}
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4" />
                                  {t('roadmap.daysLeft', { days: daysRemaining })}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Deadline date */}
                      {deadlineDate && stage.id !== 'entry' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('roadmap.deadlineBy')}: {formatDate(deadlineDate)}
                        </p>
                      )}

                      {/* Expand indicator for stages with fines */}
                      {stage.id !== 'entry' && (stage.fineMin || stage.risks.length > 0) && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          {t('roadmap.tapForDetails')}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      )}

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top duration-200">
                          {/* Fines */}
                          {stage.fineMin && stage.fineMax && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {t('roadmap.fines.title')}
                              </h4>
                              <p className="text-sm text-red-600 font-medium">
                                {stage.fineMin.toLocaleString()} – {stage.fineMax.toLocaleString()} ₽
                              </p>
                            </div>
                          )}

                          {/* Risks */}
                          {stage.risks.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                {t('roadmap.risks.title')}
                              </h4>
                              <ul className="space-y-2">
                                {stage.risks.map((risk) => (
                                  <li key={risk} className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">
                                      {t(`roadmap.risks.${risk}`)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {t('roadmap.legend.title')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">{t('roadmap.legend.completed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">{t('roadmap.legend.inProgress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">{t('roadmap.legend.warning')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">{t('roadmap.legend.overdue')}</span>
              </div>
            </div>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('common.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
