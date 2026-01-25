'use client';

import { QrCode, ChevronRight, Volume2, History, Lock, Edit2, Globe, Trash2, X, Rocket, FileText, AlertTriangle, CreditCard, Grid3x3, Languages, Briefcase, Home as HomeIcon, Calculator, Shield, MapPin, FileCheck, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { LegalizationWizard } from '../wizard/LegalizationWizard';
import { useTranslation, LANGUAGES } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useProfileStore } from '@/lib/stores';

// Generate initials from full name
function getInitials(fullName: string): string {
  if (!fullName) return '??';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

export function HomeScreen() {
  const { t, language, setLanguage: setAppLanguage } = useTranslation();
  const { profile, updateProfile, reset: resetProfile } = useProfileStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showOtherServices, setShowOtherServices] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAILanguages, setShowAILanguages] = useState(false);

  // Initialize from profile store, fallback to empty
  const [editEntryDate, setEditEntryDate] = useState(profile?.entryDate || '');
  const [editPurpose, setEditPurpose] = useState<string>(profile?.purpose || 'work');
  const [editFullName, setEditFullName] = useState(profile?.fullName || '');
  const [editCitizenship, setEditCitizenship] = useState(profile?.citizenship || '');
  const [editRegion, setEditRegion] = useState(profile?.patentRegion || '');
  const [checkedDocs, setCheckedDocs] = useState<string[]>(profile?.selectedDocuments || []);

  // Sync local state when profile changes (including after Zustand hydration)
  useEffect(() => {
    if (profile) {
      setEditEntryDate(profile.entryDate || '');
      setEditPurpose(profile.purpose || 'work');
      setEditFullName(profile.fullName || '');
      setEditCitizenship(profile.citizenship || '');
      setEditRegion(profile.patentRegion || '');
      // Only update checkedDocs if profile has selectedDocuments defined
      if (profile.selectedDocuments !== undefined) {
        setCheckedDocs(profile.selectedDocuments);
      }
    }
  }, [profile]);

  // Calculate initials from name
  const userInitials = useMemo(() => getInitials(editFullName), [editFullName]);

  // Calculate remaining days based on entry date (90 day rule)
  const daysRemaining = useMemo(() => {
    const entry = new Date(editEntryDate);
    const deadline = new Date(entry);
    deadline.setDate(deadline.getDate() + 90);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [editEntryDate]);

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
        {/* Top row: Language switcher */}
        <div className="flex justify-end mb-2">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Main row: User info + Status + Days */}
        <div className="flex items-center justify-between">
          {/* Left: User Info + Edit */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfileEdit(true)}
              className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95"
            >
              {userInitials}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-gray-900">{editFullName}</h2>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors active:scale-95"
                  title={t('profile.editTitle')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {editCitizenship === 'UZ' && '🇺🇿'}
                {editCitizenship === 'TJ' && '🇹🇯'}
                {editCitizenship === 'KG' && '🇰🇬'}
                {editCitizenship === 'AM' && '🇦🇲'}
                {editCitizenship === 'AZ' && '🇦🇿'}
                {editCitizenship === 'BY' && '🇧🇾'}
                {editCitizenship === 'GE' && '🇬🇪'}
                {editCitizenship === 'KZ' && '🇰🇿'}
                {editCitizenship === 'MD' && '🇲🇩'}
                {editCitizenship === 'UA' && '🇺🇦'}
                {' '}{t(`countries.${editCitizenship}`)}
              </p>
            </div>
          </div>

          {/* Right: Status Badge + Days Counter */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {checkedDocs.length >= 7 ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white">{t('dashboard.statusValues.legal')}</span>
              </div>
            ) : checkedDocs.length >= 4 ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white">{t('dashboard.statusValues.risk')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white">{t('dashboard.statusValues.illegal')}</span>
              </div>
            )}

            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.daysRemaining')}</p>
              <div className={`text-xl font-bold ${daysRemaining > 30 ? 'text-green-600' : daysRemaining > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {daysRemaining}
              </div>
              <p className="text-xs text-gray-500">{t('common.days')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Single Primary Action */}
      <div className="px-4 py-8">
        <button
          onClick={() => setShowWizard(true)}
          className="w-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-98 relative overflow-hidden group"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <FileCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">
              {t('dashboard.hero.title')}
            </h2>
            <p className="text-center text-blue-100 text-sm mb-4">
              {t('dashboard.hero.subtitle')}
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-xs text-white/90 text-center leading-relaxed">
                {t('dashboard.hero.description')}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Task Carousel */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('dashboard.attentionRequired')}
        </h3>

        <div className="space-y-3">
          {/* Urgent Card - Patent */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 shadow-xl">
            <div className="inline-block px-2 py-1 bg-white/20 rounded-md text-xs font-semibold text-white mb-2">
              {t('common.urgent')}
            </div>
            <h4 className="text-white font-bold text-lg mb-1">
              {t('documents.patent.title')}
            </h4>
            <p className="text-white/90 text-sm mb-4">
              {t('dashboard.cards.patent.expiresIn', { days: '3' })}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors active:scale-98 flex items-center justify-center shadow-lg">
                {t('payment.pay')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Secondary Card - Registration */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg">
            <h4 className="text-white font-bold text-lg mb-1">
              {t('documents.registration.title')}
            </h4>
            <p className="text-white/90 text-sm mb-4">
              {t('dashboard.cards.registration.needExtend')}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors active:scale-98 flex items-center justify-center shadow-lg">
                {t('common.extend')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">📜 {t('history.title')}</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{t('history.subtitle')}</p>

            <div className="space-y-3">
              {/* History Items */}
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{t('history.items.patentPayment')}</h4>
                  <span className="text-xs text-gray-500">15.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">{t('history.details.amount')}: 5,000₽</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">{t('common.encrypted')}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{t('history.items.registrationExtension')}</h4>
                  <span className="text-xs text-gray-500">10.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">{t('history.details.documentsSubmitted')}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">{t('common.encrypted')}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{t('history.items.medicalCertificate')}</h4>
                  <span className="text-xs text-gray-500">05.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">{t('history.details.receivedAt')} ММЦ №3</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">{t('common.encrypted')}</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{t('history.items.entryRF')}</h4>
                  <span className="text-xs text-gray-500">01.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">{t('history.details.border')}: Домодедово</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">{t('common.encrypted')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full mt-6 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{t('profile.editTitle')}</h3>
              </div>
              <button onClick={() => setShowProfileEdit(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.fields.fullName')}
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder={t('profile.fields.fullNamePlaceholder')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Citizenship */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.fields.citizenship')}
                </label>
                <select
                  value={editCitizenship}
                  onChange={(e) => setEditCitizenship(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UZ">🇺🇿 {t('countries.UZ')}</option>
                  <option value="TJ">🇹🇯 {t('countries.TJ')}</option>
                  <option value="KG">🇰🇬 {t('countries.KG')}</option>
                  <option value="AM">🇦🇲 {t('countries.AM')} (ЕАЭС)</option>
                  <option value="AZ">🇦🇿 {t('countries.AZ')}</option>
                  <option value="BY">🇧🇾 {t('countries.BY')} (ЕАЭС)</option>
                  <option value="GE">🇬🇪 {t('countries.GE')}</option>
                  <option value="KZ">🇰🇿 {t('countries.KZ')} (ЕАЭС)</option>
                  <option value="MD">🇲🇩 {t('countries.MD')}</option>
                  <option value="UA">🇺🇦 {t('countries.UA')}</option>
                  <option value="CN">🇨🇳 {t('countries.CN')}</option>
                  <option value="IN">🇮🇳 {t('countries.IN')}</option>
                  <option value="VN">🇻🇳 {t('countries.VN')}</option>
                </select>

                {/* EAEU Note */}
                {['AM', 'BY', 'KZ'].includes(editCitizenship) && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800">
                      ✅ {t('profile.eaeuNote')}
                    </p>
                  </div>
                )}
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.fields.region')}
                </label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="moscow">🏙️ {t('cities.moscow')}</option>
                  <option value="saintPetersburg">🏛️ {t('cities.saintPetersburg')}</option>
                  <option value="novosibirsk">❄️ {t('cities.novosibirsk')}</option>
                  <option value="yekaterinburg">{t('cities.yekaterinburg')}</option>
                  <option value="kazan">{t('cities.kazan')}</option>
                  <option value="nizhnyNovgorod">{t('cities.nizhnyNovgorod')}</option>
                  <option value="samara">{t('cities.samara')}</option>
                  <option value="omsk">{t('cities.omsk')}</option>
                  <option value="chelyabinsk">{t('cities.chelyabinsk')}</option>
                  <option value="rostovOnDon">{t('cities.rostovOnDon')}</option>
                  <option value="ufa">{t('cities.ufa')}</option>
                  <option value="krasnoyarsk">{t('cities.krasnoyarsk')}</option>
                  <option value="voronezh">{t('cities.voronezh')}</option>
                  <option value="perm">{t('cities.perm')}</option>
                  <option value="volgograd">{t('cities.volgograd')}</option>
                </select>
              </div>

              {/* Entry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.fields.entryDate')}
                </label>
                <input
                  type="date"
                  value={editEntryDate}
                  onChange={(e) => setEditEntryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Quick Action Chips */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setEditEntryDate(today);
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors active:scale-95 border border-blue-200"
                  >
                    {t('common.today')}
                  </button>
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setEditEntryDate(yesterday.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors active:scale-95 border border-gray-200"
                  >
                    {t('common.yesterday')}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ {t('profile.dateHint')}
                </p>
              </div>

              {/* Purpose of Visit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('profile.fields.purpose')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'work', label: `💼 ${t('profile.purposes.work')}`, subtitle: t('profile.purposes.workSubtitle') },
                    { value: 'study', label: `📚 ${t('profile.purposes.study')}`, subtitle: t('profile.purposes.studySubtitle') },
                    { value: 'tourism', label: `✈️ ${t('profile.purposes.tourist')}`, subtitle: t('profile.purposes.touristSubtitle') },
                    { value: 'private', label: `🏠 ${t('profile.purposes.private')}`, subtitle: t('profile.purposes.privateSubtitle') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditPurpose(option.value)}
                      className={`flex flex-col items-start gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                        editPurpose === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          editPurpose === option.value
                            ? 'border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {editPurpose === option.value && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <span className="font-semibold text-sm">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">{option.subtitle}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ {t('profile.purposeHint')}
                  </p>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">{t('profile.myDocuments')}</h4>
                <p className="text-xs text-gray-500 mb-3">{t('profile.markDocuments')}</p>

                <div className="space-y-2">
                  {[
                    // УРОВЕНЬ 1: ОСНОВА
                    { id: 'passport', label: `🛂 ${t('documents.types.passport')}` },

                    // УРОВЕНЬ 2: ВЪЕЗД И ПРЕБЫВАНИЕ
                    { id: 'mig_card', label: `🎫 ${t('documents.types.migCard')}` },
                    { id: 'registration', label: `📋 ${t('documents.types.registration')}` },

                    // УРОВЕНЬ 3: РАБОТА
                    { id: 'green_card', label: `💳 ${t('documents.types.greenCard')}` },
                    { id: 'education', label: `🎓 ${t('documents.types.education')}` },
                    { id: 'patent', label: `📄 ${t('documents.types.patent')}` },
                    { id: 'contract', label: `📝 ${t('documents.types.contract')}` },

                    // УРОВЕНЬ 4: ПОДДЕРЖКА
                    { id: 'receipts', label: `🧾 ${t('documents.types.receipts')}` },
                    { id: 'insurance', label: `🩺 ${t('documents.types.insurance')}` },
                    { id: 'inn', label: `🔢 ${t('documents.types.inn')}` },
                    { id: 'family', label: `💍 ${t('documents.types.family')}` },
                  ].map((doc) => {
                    const isChecked = checkedDocs.includes(doc.id);
                    
                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          if (isChecked) {
                            setCheckedDocs(checkedDocs.filter(d => d !== doc.id));
                          } else {
                            setCheckedDocs([...checkedDocs, doc.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isChecked
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm font-medium ${isChecked ? 'text-green-700' : 'text-gray-700'}`}>
                          {doc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Status Calculation */}
                <div className="mt-4 p-3 rounded-xl border-2 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{t('common.status')}:</span>
                    {checkedDocs.length >= 7 ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white">{t('dashboard.statusValues.legal')}</span>
                      </div>
                    ) : checkedDocs.length >= 4 ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white">{t('dashboard.statusValues.risk')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white">{t('dashboard.statusValues.illegal')}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('profile.documentsCount')}: {checkedDocs.length} {t('common.outOf')} 11
                  </p>
                </div>
              </div>

              {/* Settings Section */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">{t('profile.settings.title')}</h4>

                {/* Language Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.settings.interfaceLanguage')}
                  </label>
                  <button 
                    onClick={() => setShowLanguageModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {LANGUAGES.find(l => l.code === language)
                          ? `${LANGUAGES.find(l => l.code === language)?.flag} ${LANGUAGES.find(l => l.code === language)?.nativeName}`
                          : `🌐 ${language}`}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Delete Data */}
                <button
                  onClick={() => {
                    if (window.confirm(t('profile.settings.deleteConfirm'))) {
                      resetProfile();
                      setEditFullName('');
                      setEditCitizenship('');
                      setEditEntryDate('');
                      setEditPurpose('work');
                      setEditRegion('');
                      setCheckedDocs([]);
                      setShowProfileEdit(false);
                      window.location.href = '/prototype';
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-600">{t('profile.settings.deleteData')}</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('profile.settings.deleteDataWarning')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <button
                onClick={() => {
                  // Save to profile store
                  updateProfile({
                    fullName: editFullName,
                    citizenship: editCitizenship,
                    entryDate: editEntryDate,
                    purpose: editPurpose as 'work' | 'study' | 'tourist' | 'private',
                    patentRegion: editRegion,
                    selectedDocuments: checkedDocs,
                  });
                  setShowProfileEdit(false);
                }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                {t('profile.saveChanges')}
              </button>

              <button
                onClick={() => setShowProfileEdit(false)}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Services Modal */}
      {showOtherServices && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('services.otherServices.title')}</h3>
                <p className="text-sm text-gray-500">{t('services.otherServices.subtitle')}</p>
              </div>
              <button
                onClick={() => setShowOtherServices(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Secondary Services Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Translator */}
              <button className="bg-indigo-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Languages className="w-7 h-7 text-indigo-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.translator.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.translator.subtitle')}</p>
              </button>

              {/* Contracts */}
              <button className="bg-orange-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <FileCheck className="w-7 h-7 text-orange-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.contracts.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.contracts.subtitle')}</p>
              </button>

              {/* Jobs */}
              <button className="bg-green-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Briefcase className="w-7 h-7 text-green-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.jobs.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.jobs.subtitle')}</p>
              </button>

              {/* Housing */}
              <button className="bg-purple-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <HomeIcon className="w-7 h-7 text-purple-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.housing.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.housing.subtitle')}</p>
              </button>

              {/* Calculator */}
              <button
                onClick={() => window.location.href = '/calculator'}
                className="bg-blue-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Calculator className="w-7 h-7 text-blue-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.calculator.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.calculator.subtitle')}</p>
              </button>

              {/* Medical/Insurance */}
              <button className="bg-pink-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Shield className="w-7 h-7 text-pink-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.insurance.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.insurance.subtitle')}</p>
              </button>

              {/* Map */}
              <button className="bg-red-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <MapPin className="w-7 h-7 text-red-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.map.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.map.subtitle')}</p>
              </button>

              {/* Ban Check */}
              <button className="bg-yellow-50 border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Shield className="w-7 h-7 text-yellow-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{t('services.items.banCheck.title')}</h3>
                <p className="text-xs text-gray-600 text-center">{t('services.items.banCheck.subtitle')}</p>
              </button>
            </div>

            {/* Info Card */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4 mt-6">
              <p className="text-sm text-blue-800">
                {t('services.otherServices.tip')}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOtherServices(false)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('languages.selectTitle')}</h3>
                <p className="text-sm text-gray-500">{t('languages.selectSubtitle')}</p>
              </div>
              <button 
                onClick={() => {
                  setShowLanguageModal(false);
                  setShowAILanguages(false);
                }} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Base 4 Languages */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">{t('languages.mainLanguages')}</h4>

              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setAppLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === lang.code
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{t(`languages.${lang.code}`)}</p>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* AI Translation Option */}
            <div className="pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setShowAILanguages(!showAILanguages)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">🌍 {t('languages.otherLanguages')}</p>
                    <p className="text-xs text-gray-600">{t('languages.aiTranslation')}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showAILanguages ? 'rotate-90' : ''}`} />
              </button>

              {/* AI Languages List */}
              {showAILanguages && (
                <div className="mt-3 space-y-2 pl-4">
                  {[
                    { code: 'en', flag: '🇬🇧', name: 'English' },
                    { code: 'ar', flag: '🇸🇦', name: 'العربية' },
                    { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
                    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
                    { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
                    { code: 'zh', flag: '🇨🇳', name: '中文' },
                    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
                    { code: 'am', flag: '🇦🇲', name: 'Հայերեն' },
                    { code: 'az', flag: '🇦🇿', name: 'Azərbaycan' },
                    { code: 'ka', flag: '🇬🇪', name: 'ქართული' },
                  ].map((lang) => (
                    <div
                      key={lang.code}
                      className="w-full flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-500">{lang.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{t('common.comingSoon')}</span>
                    </div>
                  ))}

                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-800 leading-relaxed">
                        {t('languages.aiNote')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowLanguageModal(false);
                setShowAILanguages(false);
              }}
              className="w-full mt-6 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Legalization Wizard */}
      {showWizard && (
        <LegalizationWizard
          onClose={() => setShowWizard(false)}
          onComplete={(addedDocs) => {
            const newDocs = [...new Set([...checkedDocs, ...addedDocs])];
            setCheckedDocs(newDocs);
          }}
          profileData={{
            citizenship: editCitizenship,
            entryDate: editEntryDate,
            purpose: editPurpose,
            checkedDocs: checkedDocs,
          }}
        />
      )}
    </div>
  );
}
