'use client';

import { AlertTriangle, Phone, FileX, MapPin, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

// Strict bureaucratic priority order (0 = highest priority)
const PRIORITY_ORDER = ['passport', 'mig_card', 'green_card', 'education', 'registration', 'patent', 'receipts', 'contract', 'insurance', 'inn', 'family'] as const;

type DocumentKey = typeof PRIORITY_ORDER[number];

interface DocumentOption {
  key: DocumentKey;
  icon: string;
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  // УРОВЕНЬ 1: ОСНОВА
  { key: 'passport', icon: '🛂' },
  // УРОВЕНЬ 2: ВЪЕЗД И ПРЕБЫВАНИЕ
  { key: 'mig_card', icon: '🎫' },
  { key: 'registration', icon: '📋' },
  // УРОВЕНЬ 3: РАБОТА
  { key: 'green_card', icon: '💳' },
  { key: 'education', icon: '🎓' },
  { key: 'patent', icon: '📄' },
  { key: 'contract', icon: '📝' },
  // УРОВЕНЬ 4: ПОДДЕРЖКА
  { key: 'receipts', icon: '🧾' },
  { key: 'insurance', icon: '🩺' },
  { key: 'inn', icon: '🔢' },
  { key: 'family', icon: '💍' },
];

// Police reason keys for translation
const POLICE_REASONS = ['documentCheck', 'noDocuments', 'trafficViolation', 'other'] as const;
type PoliceReasonKey = typeof POLICE_REASONS[number];

export function SOSScreen() {
  const { t } = useTranslation();
  const [showPoliceModal, setShowPoliceModal] = useState(false);
  const [showLostDocsModal, setShowLostDocsModal] = useState(false);
  const [policeReason, setPoliceReason] = useState<PoliceReasonKey | ''>('');
  const [selectedDocs, setSelectedDocs] = useState<Set<DocumentKey>>(new Set());
  const [showRecoveryPlan, setShowRecoveryPlan] = useState(false);

  // Convert snake_case to camelCase for JSON keys
  const snakeToCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  // Helper to get document label
  const getDocLabel = (key: DocumentKey) => t(`sosDetailed.documents.${snakeToCamel(key)}`);
  // Helper to get recovery instruction
  const getRecoveryInstruction = (key: DocumentKey) => t(`sosDetailed.recovery.${snakeToCamel(key)}`);

  return (
    <div className="h-full overflow-y-auto pb-4 bg-gradient-to-b from-red-50 to-white relative">
      {/* Header */}
      <div className="px-4 py-4 bg-red-600 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">🚨 {t('sos.title')}</h1>
            <p className="text-sm text-red-100">{t('sos.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main Emergency Button */}
      <div className="px-4 py-8">
        <button
          onClick={() => setShowPoliceModal(true)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-98 border-4 border-red-800"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-12 h-12" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('sos.detained.title')}</h2>
            <p className="text-sm text-red-100">
              {t('sos.detained.description')}
            </p>
          </div>
        </button>

        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-medium text-center">
            ⚠️ {t('sos.instructions.step1')}, {t('sos.instructions.step3')}
          </p>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('sos.lostDocuments.subtitle')}
        </h3>
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setShowLostDocsModal(true)}
            className="w-full flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl transition-all hover:scale-102 active:scale-98 shadow-md"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <FileX className="w-6 h-6 text-orange-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">{t('sos.lostDocuments.title')}</h4>
              <p className="text-sm text-gray-600">{t('sos.lostDocuments.startRecovery')}</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl transition-all hover:scale-102 active:scale-98 shadow-md">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-6 h-6 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">{t('sos.emergency')}</h4>
              <p className="text-sm text-gray-600">{t('sos.embassy.subtitle')}</p>
            </div>
          </button>
        </div>

        {/* Quick Calls */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('sos.emergency')}
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm active:scale-95">
            <Phone className="w-6 h-6 text-red-600 mb-2" />
            <div className="text-xs font-medium text-gray-600 mb-1">{t('sos.police')}</div>
            <div className="text-lg font-bold text-red-600">102</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm active:scale-95">
            <Phone className="w-6 h-6 text-red-600 mb-2" />
            <div className="text-xs font-medium text-gray-600 mb-1">{t('sos.ambulance')}</div>
            <div className="text-lg font-bold text-red-600">112</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm active:scale-95">
            <span className="text-2xl mb-2">🏛</span>
            <div className="text-xs font-medium text-gray-600 mb-1">{t('sos.embassy.title')}</div>
            <div className="text-xs font-bold text-blue-600">{t('sos.call')}</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm active:scale-95">
            <span className="text-2xl mb-2">👨‍⚖️</span>
            <div className="text-xs font-medium text-gray-600 mb-1">{t('sos.lawyer')}</div>
            <div className="text-xs font-bold text-blue-600">{t('sos.call')}</div>
          </button>
        </div>
      </div>

      {/* Police Modal */}
      {showPoliceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('sos.detained.title')}</h3>
              <button onClick={() => setShowPoliceModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{t('sos.detained.description')}:</p>

            <div className="space-y-3 mb-6">
              {POLICE_REASONS.map((reasonKey) => (
                <button
                  key={reasonKey}
                  onClick={() => setPoliceReason(reasonKey)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    policeReason === reasonKey
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {t(`sosDetailed.policeReasons.${reasonKey}`)}
                </button>
              ))}
            </div>

            {policeReason && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
                <h4 className="font-bold text-blue-900 mb-2">⚖️ {t('sosDetailed.policeInstructions.yourRightsAndActions')}</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  {policeReason === 'documentCheck' && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ {t('sosDetailed.policeInstructions.whatToDo')}:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t('sosDetailed.policeInstructions.documentCheck.do1')}</li>
                          <li>{t('sosDetailed.policeInstructions.documentCheck.do2')}</li>
                          <li>{t('sosDetailed.policeInstructions.documentCheck.do3')}</li>
                        </ul>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg">
                        <p className="font-bold text-red-900 mb-1">❌ {t('sosDetailed.policeInstructions.whatNotToDo')}:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t('sosDetailed.policeInstructions.documentCheck.dont1')}</li>
                          <li>{t('sosDetailed.policeInstructions.documentCheck.dont2')}</li>
                        </ul>
                      </div>
                    </>
                  )}
                  {policeReason === 'noDocuments' && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ {t('sosDetailed.policeInstructions.yourRights')}:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t('sosDetailed.policeInstructions.noDocuments.right1')}</li>
                          <li>{t('sosDetailed.policeInstructions.noDocuments.right2')}</li>
                          <li>{t('sosDetailed.policeInstructions.noDocuments.right3')}</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <p className="font-bold text-yellow-900 mb-1">⚠️ {t('sosDetailed.policeInstructions.important')}:</p>
                        <p>{t('sosDetailed.policeInstructions.noDocuments.say')}</p>
                      </div>
                    </>
                  )}
                  {(policeReason === 'trafficViolation' || policeReason === 'other') && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ {t('sosDetailed.policeInstructions.immediately')}:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t('sosDetailed.policeInstructions.other.do1')}</li>
                          <li>{t('sosDetailed.policeInstructions.other.do2')}</li>
                          <li>{t('sosDetailed.policeInstructions.other.do3')}</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="bg-purple-100 p-3 rounded-lg mt-2">
                    <p className="font-bold text-purple-900 mb-1">📞 {t('sosDetailed.policeInstructions.contacts')}:</p>
                    <ul className="space-y-1">
                      <li>{t('sosDetailed.policeInstructions.lawyerPhone')}: <span className="font-mono">+7 (495) 123-45-67</span></li>
                      <li>{t('sosDetailed.policeInstructions.consulatePhone')}: <span className="font-mono">+7 (495) 234-56-78</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowPoliceModal(false)}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}

      {/* Lost Documents Modal */}
      {showLostDocsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('sos.lostDocuments.title')}</h3>
              <button
                onClick={() => {
                  setShowLostDocsModal(false);
                  setSelectedDocs(new Set());
                  setShowRecoveryPlan(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!showRecoveryPlan ? (
              <>
                <p className="text-sm text-gray-600 mb-4">{t('sos.lostDocuments.selectDocument')}</p>

                {/* Multi-select Checkboxes */}
                <div className="space-y-3 mb-6">
                  {DOCUMENT_OPTIONS.map((doc) => {
                    const isSelected = selectedDocs.has(doc.key);

                    return (
                      <button
                        key={doc.key}
                        onClick={() => {
                          const newSelected = new Set(selectedDocs);
                          if (isSelected) {
                            newSelected.delete(doc.key);
                          } else {
                            newSelected.add(doc.key);
                          }
                          setSelectedDocs(newSelected);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                        </div>

                        {/* Icon and Label */}
                        <span className="text-2xl">{doc.icon}</span>
                        <span className={`font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                          {getDocLabel(doc.key)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Warning */}
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      {t('sos.lostDocuments.importantNote')}: {t('sos.lostDocuments.timeLimit')}
                    </p>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={() => {
                    if (selectedDocs.size > 0) {
                      setShowRecoveryPlan(true);
                    }
                  }}
                  disabled={selectedDocs.size === 0}
                  className={`w-full font-bold py-4 rounded-xl transition-colors mb-3 ${
                    selectedDocs.size > 0
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('sos.lostDocuments.startRecovery')}
                </button>
              </>
            ) : (
              <>
                {/* Recovery Plan - Numbered Vertical Stepper */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileX className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-gray-900">{t('sos.lostDocuments.recoverySteps')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('sos.lostDocuments.importantNote')}:
                  </p>
                </div>

                {/* Sorted Steps */}
                <div className="space-y-4 mb-6">
                  {PRIORITY_ORDER
                    .filter(key => selectedDocs.has(key))
                    .map((key, index) => {
                      const doc = DOCUMENT_OPTIONS.find(d => d.key === key)!;

                      return (
                        <div key={key} className="relative flex gap-4">
                          {/* Step Number */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg shadow-md">
                              {index + 1}
                            </div>
                            {/* Vertical Line */}
                            {index < Array.from(selectedDocs).length - 1 && (
                              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-orange-200" />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{doc.icon}</span>
                              <h5 className="font-bold text-gray-900">{getDocLabel(key)}</h5>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {getRecoveryInstruction(key)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Important Notice */}
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('sos.lostDocuments.importantNote')}
                  </h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>{t('sos.lostDocuments.timeLimit')}</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors">
                    {t('sos.lostDocuments.startRecovery')}
                  </button>

                  <button
                    onClick={() => setShowRecoveryPlan(false)}
                    className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    ← {t('common.back')}
                  </button>
                </div>
              </>
            )}

            {!showRecoveryPlan && (
              <button
                onClick={() => {
                  setShowLostDocsModal(false);
                  setSelectedDocs(new Set());
                }}
                className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
              >
                {t('common.close')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
