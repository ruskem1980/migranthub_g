'use client';

import { useState } from 'react';
import { X, Camera, Edit3, FileText, MapPin, Calendar, AlertTriangle, Download, Eye, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { previewPDF } from '@/features/documents/pdfGenerator';

interface LegalizationWizardProps {
  onClose: () => void;
  onComplete?: (addedDocs: string[]) => void;
  profileData: {
    citizenship: string;
    entryDate: string;
    purpose: string;
    checkedDocs: string[];
  };
}

type WizardStep = 'intro' | 'required-docs' | 'additional-docs' | 'document-scan' | 'scanning' | 'verification' | 'processing' | 'action-plan';

interface DocumentToScan {
  id: string;
  title: string;
  icon: string;
  description: string;
  fields: string[];
  isRequired?: boolean;
}

export function LegalizationWizard({ onClose, onComplete, profileData }: LegalizationWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [scanMode, setScanMode] = useState<'required' | 'additional' | 'quick-select' | 'step-by-step' | null>(null);
  const [selectedDocsToScan, setSelectedDocsToScan] = useState<string[]>([]);
  const [selectedAdditionalDocs, setSelectedAdditionalDocs] = useState<string[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [dataMethod, setDataMethod] = useState<'scan' | 'manual' | null>(null);
  const [scannedDocuments, setScannedDocuments] = useState<Record<string, any>>({});
  const [currentDocData, setCurrentDocData] = useState<Record<string, string>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [passportData, setPassportData] = useState({
    lastName: '',
    firstName: '',
    passportNumber: '',
    issueDate: '',
    citizenship: 'Узбекистан'
  });

  // Calculate missing documents
  const allRequiredDocs = ['passport', 'mig_card', 'registration', 'green_card', 'patent', 'receipts'];
  const missingDocs = allRequiredDocs.filter(doc => !profileData.checkedDocs.includes(doc));

  // Define documents to scan based on purpose (Russian Federation legislation)
  const getDocumentsToScan = (purpose: string, citizenship: string): DocumentToScan[] => {
    const docs: DocumentToScan[] = [];
    const isEAEU = ['Армения', 'Беларусь', 'Казахстан', 'Киргизия', 'Armenia', 'Belarus', 'Kazakhstan', 'Kyrgyzstan'].includes(citizenship);

    // 1. PASSPORT (Always required)
    if (!profileData.checkedDocs.includes('passport')) {
      docs.push({
        id: 'passport',
        title: t('wizard.documents.passport.title'),
        icon: '🛂',
        description: t('wizard.documents.passport.description'),
        fields: ['lastName', 'firstName', 'middleName', 'passportNumber', 'issueDate', 'birthDate', 'birthPlace'],
      });
    }

    // 2. MIGRATION CARD (Always required for non-EAEU)
    if (!isEAEU && !profileData.checkedDocs.includes('mig_card')) {
      docs.push({
        id: 'mig_card',
        title: t('wizard.documents.migCard.title'),
        icon: '🎫',
        description: t('wizard.documents.migCard.description'),
        fields: ['cardNumber', 'entryDate', 'borderPoint', 'purpose'],
      });
    }

    // FOR PURPOSE "WORK"
    if (purpose === 'Работа' || purpose === 'work') {
      // 3. MEDICAL CERTIFICATE + FINGERPRINTING (Green card)
      if (!profileData.checkedDocs.includes('green_card')) {
        docs.push({
          id: 'green_card',
          title: t('wizard.documents.greenCard.title'),
          icon: '💳',
          description: t('wizard.documents.greenCard.description'),
          fields: ['cardNumber', 'issueDate', 'expiryDate', 'medicalCenter', 'doctorName'],
        });
      }

      // 4. RUSSIAN LANGUAGE CERTIFICATE
      if (!profileData.checkedDocs.includes('education')) {
        docs.push({
          id: 'education',
          title: t('wizard.documents.education.title'),
          icon: '🎓',
          description: t('wizard.documents.education.description'),
          fields: ['certificateNumber', 'issueDate', 'testCenter', 'score'],
        });
      }

      // 5. HEALTH INSURANCE (DMS)
      if (!profileData.checkedDocs.includes('insurance')) {
        docs.push({
          id: 'insurance',
          title: t('wizard.documents.insurance.title'),
          icon: '🩺',
          description: t('wizard.documents.insurance.description'),
          fields: ['policyNumber', 'issueDate', 'expiryDate', 'insuranceCompany'],
        });
      }

      // 6. EMPLOYMENT CONTRACT (If has employer)
      if (!isEAEU && !profileData.checkedDocs.includes('contract')) {
        docs.push({
          id: 'contract',
          title: t('wizard.documents.contract.title'),
          icon: '📝',
          description: t('wizard.documents.contract.description'),
          fields: ['employerName', 'employerINN', 'jobTitle', 'salary', 'startDate'],
        });
      }

      // 7. ARRIVAL NOTIFICATION (Registration)
      if (!profileData.checkedDocs.includes('registration')) {
        docs.push({
          id: 'registration',
          title: t('wizard.documents.registration.title'),
          icon: '📋',
          description: t('wizard.documents.registration.description'),
          fields: ['hostFullName', 'hostAddress', 'registrationDate', 'expiryDate'],
        });
      }

      // 8. PHOTO 3x4 (For patent)
      docs.push({
        id: 'photo',
        title: t('wizard.documents.photo.title'),
        icon: '📸',
        description: t('wizard.documents.photo.description'),
        fields: ['photoConfirm'],
      });
    }

    // FOR PURPOSE "STUDY"
    if (purpose === 'Учеба' || purpose === 'study') {
      // Invitation from educational institution
      if (!profileData.checkedDocs.includes('invitation')) {
        docs.push({
          id: 'invitation',
          title: t('wizard.documents.invitation.title'),
          icon: '📨',
          description: t('wizard.documents.invitation.description'),
          fields: ['universityName', 'invitationNumber', 'issueDate', 'studyPeriod'],
        });
      }

      // Medical certificate
      if (!profileData.checkedDocs.includes('medical')) {
        docs.push({
          id: 'medical',
          title: t('wizard.documents.medical.title'),
          icon: '🏥',
          description: t('wizard.documents.medical.description'),
          fields: ['certificateNumber', 'issueDate', 'clinicName'],
        });
      }
    }

    // FOR PURPOSE "TOURISM"
    if (purpose === 'Туризм' || purpose === 'tourist') {
      // Return ticket
      docs.push({
        id: 'ticket',
        title: t('wizard.documents.ticket.title'),
        icon: '✈️',
        description: t('wizard.documents.ticket.description'),
        fields: ['ticketNumber', 'departureDate', 'destination'],
      });

      // Hotel booking
      docs.push({
        id: 'hotel',
        title: t('wizard.documents.hotel.title'),
        icon: '🏨',
        description: t('wizard.documents.hotel.description'),
        fields: ['hotelName', 'hotelAddress', 'checkIn', 'checkOut'],
      });
    }

    // FOR PURPOSE "PRIVATE"
    if (purpose === 'Частный' || purpose === 'private') {
      // Invitation from individual
      if (!profileData.checkedDocs.includes('private_invitation')) {
        docs.push({
          id: 'private_invitation',
          title: t('wizard.documents.privateInvitation.title'),
          icon: '💌',
          description: t('wizard.documents.privateInvitation.description'),
          fields: ['inviterFullName', 'inviterPassport', 'inviterAddress', 'notaryName'],
        });
      }
    }

    return docs;
  };

  const allPossibleDocuments = getDocumentsToScan(profileData.purpose, profileData.citizenship);
  
  // Separate required (missing) and additional (for other forms) documents
  const requiredDocuments = allPossibleDocuments.filter(doc => 
    !profileData.checkedDocs.includes(doc.id)
  );
  
  const additionalDocuments = allPossibleDocuments.filter(doc => 
    profileData.checkedDocs.includes(doc.id)
  );
  
  // Determine which documents to scan based on mode
  const documentsToScan = scanMode === 'required' 
    ? requiredDocuments
    : scanMode === 'additional' && selectedAdditionalDocs.length > 0
    ? allPossibleDocuments.filter(doc => selectedAdditionalDocs.includes(doc.id))
    : allPossibleDocuments;
    
  const currentDocument = documentsToScan[currentDocIndex];
  
  // Calculate deadline (mock - 90 days from entry)
  const entryDate = new Date(profileData.entryDate);
  const deadline = new Date(entryDate);
  deadline.setDate(deadline.getDate() + 90);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const renderIntro = () => (
    <div className="space-y-6">
      {/* Current Situation */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">{t('wizard.intro.currentSituation')}</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('wizard.intro.citizenship')}</p>
              <p className="font-semibold text-gray-900">🇺🇿 {profileData.citizenship}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('wizard.intro.entryDate')}</p>
              <p className="font-semibold text-gray-900">{profileData.entryDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('wizard.intro.purpose')}</p>
              <p className="font-semibold text-gray-900">💼 {profileData.purpose}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-300">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-orange-900 mb-2">{t('wizard.intro.verdict')}</h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              {t('wizard.intro.needDocuments', { count: missingDocs.length, date: deadline.toLocaleDateString(), days: daysLeft })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mt-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">{t('wizard.intro.missingDocs')}:</p>
          <div className="flex flex-wrap gap-2">
            {missingDocs.map(doc => (
              <span key={doc} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {doc === 'green_card' && `💳 ${t('wizard.documents.greenCard.title')}`}
                {doc === 'patent' && `📄 ${t('wizard.documents.patent.title')}`}
                {doc === 'registration' && `📋 ${t('documents.types.registration')}`}
                {doc === 'receipts' && `🧾 ${t('wizard.documents.receipts.title')}`}
                {doc === 'mig_card' && `🎫 ${t('wizard.documents.migCard.title')}`}
                {doc === 'passport' && `🛂 ${t('wizard.documents.passport.title')}`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={() => {
            if (requiredDocuments.length > 0) {
              setScanMode('required');
              setCurrentDocIndex(0);
              setCurrentStep('required-docs');
            } else {
              setCurrentStep('additional-docs');
            }
          }}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-5 px-6 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all active:scale-98 shadow-xl flex items-center justify-center gap-2"
        >
          <span className="text-lg">{t('wizard.intro.startProcessing')}</span>
          <ChevronRight className="w-6 h-6" />
        </button>

        <p className="text-xs text-center text-gray-500">
          {t('wizard.intro.scanRequired', { count: requiredDocuments.length })}
        </p>
      </div>

      <p className="text-xs text-center text-gray-500">
        {t('wizard.intro.generateNote')}
      </p>
    </div>
  );

  const renderRequiredDocs = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('wizard.requiredDocs.title')}</h3>
        <p className="text-sm text-gray-600">
          {t('wizard.requiredDocs.description')}
        </p>
      </div>

      {/* Required Documents List */}
      <div className="space-y-3">
        {requiredDocuments.map((doc, index) => (
          <div
            key={doc.id}
            className="flex items-start gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{doc.icon}</span>
                <p className="font-semibold text-gray-900">{doc.title}</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{doc.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          💡 <strong>{t('wizard.requiredDocs.important')}:</strong> {t('wizard.requiredDocs.importantNote')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            setCurrentDocIndex(0);
            setCurrentStep('document-scan');
          }}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {t('wizard.requiredDocs.startScanning', { count: requiredDocuments.length })}
        </button>

        <button
          onClick={() => setCurrentStep('intro')}
          className="w-full text-gray-500 text-sm hover:text-gray-700"
        >
          ← {t('wizard.requiredDocs.back')}
        </button>
      </div>
    </div>
  );

  const renderAdditionalDocs = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('wizard.additionalDocs.title')}</h3>
        <p className="text-sm text-gray-600">
          {t('wizard.additionalDocs.description')}
        </p>
      </div>

      {/* Additional Documents Checklist */}
      <div className="space-y-3">
        {allPossibleDocuments.map((doc) => {
          const isSelected = selectedAdditionalDocs.includes(doc.id);
          const isAlreadyScanned = scannedDocuments[doc.id];

          return (
            <button
              key={doc.id}
              onClick={() => {
                if (isAlreadyScanned) return; // Already scanned, skip

                if (isSelected) {
                  setSelectedAdditionalDocs(selectedAdditionalDocs.filter(id => id !== doc.id));
                } else {
                  setSelectedAdditionalDocs([...selectedAdditionalDocs, doc.id]);
                }
              }}
              disabled={isAlreadyScanned}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                isAlreadyScanned
                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-green-50 border-green-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                isAlreadyScanned
                  ? 'bg-gray-400 border-gray-400'
                  : isSelected
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}>
                {(isSelected || isAlreadyScanned) && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>

              {/* Icon and Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{doc.icon}</span>
                  <p className={`font-semibold ${isAlreadyScanned ? 'text-gray-500' : isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                    {doc.title}
                  </p>
                  {isAlreadyScanned && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {t('wizard.additionalDocs.alreadyScanned')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{doc.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
        <p className="text-sm text-purple-800">
          💡 <strong>{t('wizard.additionalDocs.tip')}:</strong> {t('wizard.additionalDocs.tipText')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {selectedAdditionalDocs.length > 0 && (
          <button
            onClick={() => {
              setScanMode('additional');
              setCurrentDocIndex(0);
              setCurrentStep('document-scan');
            }}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            {t('wizard.additionalDocs.scanSelected', { count: selectedAdditionalDocs.length })}
          </button>
        )}

        <button
          onClick={() => setCurrentStep('processing')}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {selectedAdditionalDocs.length > 0 ? t('wizard.additionalDocs.skipAdditional') : t('wizard.additionalDocs.continueWithout')}
        </button>
      </div>
    </div>
  );

  const renderQuickSelect = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('wizard.quickSelect.title')}</h3>
        <p className="text-sm text-gray-600">
          {t('wizard.quickSelect.description')}
        </p>
      </div>

      {/* Document Checklist - ALL 11 DOCUMENTS */}
      <div className="space-y-3">
        {[
          // LEVEL 1: BASE
          { id: 'passport', titleKey: 'wizard.quickSelect.docs.passport', icon: '🛂', descKey: 'wizard.quickSelect.docs.passportDesc', levelKey: 'wizard.quickSelect.levels.base' },

          // LEVEL 2: ENTRY AND STAY
          { id: 'mig_card', titleKey: 'wizard.quickSelect.docs.migCard', icon: '🎫', descKey: 'wizard.quickSelect.docs.migCardDesc', levelKey: 'wizard.quickSelect.levels.entry' },
          { id: 'registration', titleKey: 'wizard.quickSelect.docs.registration', icon: '📋', descKey: 'wizard.quickSelect.docs.registrationDesc', levelKey: 'wizard.quickSelect.levels.entry' },

          // LEVEL 3: WORK
          { id: 'green_card', titleKey: 'wizard.quickSelect.docs.greenCard', icon: '💳', descKey: 'wizard.quickSelect.docs.greenCardDesc', levelKey: 'wizard.quickSelect.levels.work' },
          { id: 'education', titleKey: 'wizard.quickSelect.docs.education', icon: '🎓', descKey: 'wizard.quickSelect.docs.educationDesc', levelKey: 'wizard.quickSelect.levels.work' },
          { id: 'patent', titleKey: 'wizard.quickSelect.docs.patent', icon: '📄', descKey: 'wizard.quickSelect.docs.patentDesc', levelKey: 'wizard.quickSelect.levels.work' },
          { id: 'contract', titleKey: 'wizard.quickSelect.docs.contract', icon: '📝', descKey: 'wizard.quickSelect.docs.contractDesc', levelKey: 'wizard.quickSelect.levels.work' },

          // LEVEL 4: SUPPORT
          { id: 'receipts', titleKey: 'wizard.quickSelect.docs.receipts', icon: '🧾', descKey: 'wizard.quickSelect.docs.receiptsDesc', levelKey: 'wizard.quickSelect.levels.support' },
          { id: 'insurance', titleKey: 'wizard.quickSelect.docs.insurance', icon: '🩺', descKey: 'wizard.quickSelect.docs.insuranceDesc', levelKey: 'wizard.quickSelect.levels.support' },
          { id: 'inn', titleKey: 'wizard.quickSelect.docs.inn', icon: '🔢', descKey: 'wizard.quickSelect.docs.innDesc', levelKey: 'wizard.quickSelect.levels.support' },
          { id: 'family', titleKey: 'wizard.quickSelect.docs.family', icon: '💍', descKey: 'wizard.quickSelect.docs.familyDesc', levelKey: 'wizard.quickSelect.levels.support' },
        ].map((doc) => {
          const isSelected = selectedDocsToScan.includes(doc.id);

          return (
            <button
              key={doc.id}
              onClick={() => {
                if (isSelected) {
                  setSelectedDocsToScan(selectedDocsToScan.filter(id => id !== doc.id));
                } else {
                  setSelectedDocsToScan([...selectedDocsToScan, doc.id]);
                }
              }}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'bg-green-50 border-green-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                isSelected
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}>
                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>

              {/* Icon and Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{doc.icon}</span>
                  <p className={`font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                    {t(doc.titleKey)}
                  </p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{t(doc.descKey)}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {t(doc.levelKey)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900 mb-1">{t('wizard.quickSelect.important')}</p>
            <p className="text-xs text-yellow-800 leading-relaxed">
              {t('wizard.quickSelect.importantNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            if (selectedDocsToScan.length > 0) {
              setScanMode('quick-select');
              setCurrentDocIndex(0);
              setCurrentStep('document-scan');
            }
          }}
          disabled={selectedDocsToScan.length === 0}
          className={`w-full font-bold py-4 rounded-xl transition-colors ${
            selectedDocsToScan.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('wizard.quickSelect.scanSelected', { count: selectedDocsToScan.length })}
        </button>

        <button
          onClick={() => {
            setScanMode('step-by-step');
            setCurrentStep('processing');
          }}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          {t('wizard.quickSelect.skipScanning')}
        </button>

        <button
          onClick={() => setCurrentStep('intro')}
          className="w-full text-gray-500 text-sm hover:text-gray-700"
        >
          ← {t('wizard.quickSelect.back')}
        </button>
      </div>
    </div>
  );

  const renderDocumentScan = () => {
    if (!currentDocument) {
      setCurrentStep('processing');
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {documentsToScan.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentDocIndex
                    ? 'bg-green-500 text-white'
                    : index === currentDocIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentDocIndex ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {currentDocIndex + 1} {t('wizard.documentScan.of')} {documentsToScan.length}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{currentDocument.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentDocument.title}</h3>
          <p className="text-sm text-gray-600">
            {currentDocument.description}
          </p>
        </div>

        {!dataMethod ? (
          <div className="space-y-4">
            {/* Scan Option */}
            <button
              onClick={() => setDataMethod('scan')}
              className="relative w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all active:scale-98 text-left group"
            >
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {t('wizard.documentScan.recommended')}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">📸 {t('wizard.documentScan.scan')}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('wizard.documentScan.scanDescription')}
                  </p>
                </div>
              </div>
            </button>

            {/* Manual Option */}
            <button
              onClick={() => setDataMethod('manual')}
              className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all active:scale-98 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-7 h-7 text-gray-600" />
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">✍️ {t('wizard.documentScan.manual')}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('wizard.documentScan.manualDescription')}
                  </p>
                </div>
              </div>
            </button>

            {/* Skip Option - NEW */}
            <button
              onClick={() => {
                console.log('Skip clicked:', {
                  currentDocIndex,
                  totalDocs: documentsToScan.length,
                  hasMore: currentDocIndex < documentsToScan.length - 1
                });

                // Skip this document and move to next
                const hasMoreDocuments = currentDocIndex < documentsToScan.length - 1;

                if (hasMoreDocuments) {
                  // Move to next document
                  setCurrentDocIndex(currentDocIndex + 1);
                  setDataMethod(null);
                  setCurrentDocData({});
                  setIsConfirmed(false);
                  // Stay on document-scan step
                } else {
                  // This was the last document, go to processing
                  setCurrentStep('processing');
                }
              }}
              className="w-full p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-all active:scale-98"
            >
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-700">
                  {t('wizard.documentScan.noDocSkip', { current: currentDocIndex + 1, total: documentsToScan.length })}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {dataMethod === 'scan' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="w-32 h-32 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('wizard.documentScan.takePhoto')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('wizard.documentScan.noGlare')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentStep('scanning');
                  }}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {t('wizard.documentScan.openCamera')}
                </button>
              </div>
            )}

            {dataMethod === 'manual' && (
              <div className="space-y-4">
                {currentDocument.fields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t(`wizard.fields.${field}`)}
                    </label>
                    {field === 'photoConfirm' ? (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <input
                          type="checkbox"
                          checked={currentDocData[field] === 'true'}
                          onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.checked ? 'true' : ''})}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700">{t('wizard.documentScan.havePhoto')}</span>
                      </div>
                    ) : field === 'hostAddress' || field === 'inviterAddress' || field === 'hotelAddress' ? (
                      <textarea
                        value={currentDocData[field] || ''}
                        onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <input
                        type={field.includes('Date') ? 'date' : field === 'salary' || field === 'score' ? 'number' : 'text'}
                        value={currentDocData[field] || ''}
                        onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setCurrentStep('verification')}
              disabled={dataMethod === 'manual' && !currentDocument.fields.every(f => currentDocData[f])}
              className={`w-full font-bold py-4 rounded-xl transition-colors ${
                dataMethod === 'scan' || currentDocument.fields.every(f => currentDocData[f])
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('wizard.documentScan.continue')}
            </button>

            <button
              onClick={() => setDataMethod(null)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              ← {t('wizard.documentScan.backToChoice')}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDataIntake = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Шаг 1. Паспортные данные</h3>
        <p className="text-sm text-gray-600">
          Выберите способ ввода данных для генерации заявлений
        </p>
      </div>

      {!dataMethod ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Scan Option */}
          <button
            onClick={() => setDataMethod('scan')}
            className="relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all active:scale-98 text-left group"
          >
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Рекомендуется
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">📸 Сканировать камерой</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Автоматическое распознавание данных из паспорта. Быстро и без ошибок.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">OCR технология</span>
                </div>
              </div>
            </div>
          </button>

          {/* Manual Option */}
          <button
            onClick={() => setDataMethod('manual')}
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all active:scale-98 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Edit3 className="w-7 h-7 text-gray-600" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">✍️ Заполнить вручную</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Введите данные самостоятельно. Бесплатно, но требует внимательности.
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dataMethod === 'scan' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-32 h-32 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Сфотографируйте разворот с фото</h4>
                <p className="text-sm text-gray-600">
                  Убедитесь, что нет бликов и все данные читаемы
                </p>
              </div>

              <button 
                onClick={() => {
                  // Mock: Simulate OCR scanning
                  setCurrentStep('scanning');
                }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Открыть камеру
              </button>
            </div>
          )}

          {dataMethod === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={passportData.lastName}
                  onChange={(e) => setPassportData({...passportData, lastName: e.target.value})}
                  placeholder="УСМАНОВ"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={passportData.firstName}
                  onChange={(e) => setPassportData({...passportData, firstName: e.target.value})}
                  placeholder="АЛИШЕР"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Номер паспорта
                </label>
                <input
                  type="text"
                  value={passportData.passportNumber}
                  onChange={(e) => setPassportData({...passportData, passportNumber: e.target.value})}
                  placeholder="AA 1234567"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Дата выдачи
                </label>
                <input
                  type="date"
                  value={passportData.issueDate}
                  onChange={(e) => setPassportData({...passportData, issueDate: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Гражданство
                </label>
                <select
                  value={passportData.citizenship}
                  onChange={(e) => setPassportData({...passportData, citizenship: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Узбекистан">🇺🇿 Узбекистан</option>
                  <option value="Таджикистан">🇹🇯 Таджикистан</option>
                  <option value="Киргизия">🇰🇬 Киргизия</option>
                  <option value="Другая">Другая</option>
                </select>
              </div>
            </div>
          )}

          {/* Show verification button for manual entry */}
          {dataMethod === 'manual' && (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Проверьте данные</p>
                    <p className="text-xs text-yellow-800">
                      Ошибка в одной букве делает документ недействительным
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('verification')}
                disabled={!passportData.lastName || !passportData.firstName || !passportData.passportNumber || !passportData.issueDate}
                className={`w-full font-bold py-4 rounded-xl transition-colors ${
                  passportData.lastName && passportData.firstName && passportData.passportNumber && passportData.issueDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Продолжить
              </button>

              <button
                onClick={() => setDataMethod(null)}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ← Назад к выбору способа
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderScanning = () => {
    if (!currentDocument) return null;

    // Auto-advance after 2 seconds (simulating OCR)
    setTimeout(() => {
      // Pre-fill with mock OCR data based on document type
      const mockData: Record<string, any> = {};
      
      if (currentDocument.id === 'passport') {
        mockData.lastName = 'УСМАНОВ';
        mockData.firstName = 'АЛИШЕР';
        mockData.middleName = 'БАХТИЯРОВИЧ';
        mockData.passportNumber = 'AA 1234567';
        mockData.issueDate = '2020-03-15';
        mockData.birthDate = '1990-05-20';
        mockData.birthPlace = 'г. Ташкент';
      } else if (currentDocument.id === 'mig_card') {
        mockData.cardNumber = '1234567890123';
        mockData.entryDate = '2024-01-01';
        mockData.borderPoint = 'Аэропорт Домодедово';
        mockData.purpose = 'Работа';
      } else if (currentDocument.id === 'green_card') {
        mockData.cardNumber = 'ЗК-2024-001234';
        mockData.issueDate = '2024-01-15';
        mockData.expiryDate = '2025-01-15';
        mockData.medicalCenter = 'ММЦ Сахарово';
        mockData.doctorName = 'Иванов И.И.';
      } else if (currentDocument.id === 'exam') {
        mockData.certificateNumber = 'РЯ-2024-5678';
        mockData.issueDate = '2024-01-10';
        mockData.testCenter = 'Центр тестирования РУДН';
        mockData.score = '85';
      } else if (currentDocument.id === 'insurance') {
        mockData.policyNumber = 'ДМС-2024-9999';
        mockData.issueDate = '2024-01-01';
        mockData.expiryDate = '2025-01-01';
        mockData.insuranceCompany = 'СОГАЗ';
      } else if (currentDocument.id === 'contract') {
        mockData.employerName = 'ООО "Стройкомплекс"';
        mockData.employerINN = '7701234567';
        mockData.jobTitle = 'Строитель';
        mockData.salary = '50000';
        mockData.startDate = '2024-02-01';
      } else if (currentDocument.id === 'registration') {
        mockData.hostFullName = 'Петров Петр Петрович';
        mockData.hostAddress = 'г. Москва, ул. Ленина, д. 1, кв. 10';
        mockData.registrationDate = '2024-01-05';
        mockData.expiryDate = '2024-04-05';
      } else if (currentDocument.id === 'photo') {
        mockData.photoConfirm = 'true';
      } else if (currentDocument.id === 'invitation') {
        mockData.universityName = 'МГУ им. Ломоносова';
        mockData.invitationNumber = 'ПР-2024-001';
        mockData.issueDate = '2023-12-15';
        mockData.studyPeriod = '2024-2028';
      } else if (currentDocument.id === 'medical') {
        mockData.certificateNumber = '086-2024-123';
        mockData.issueDate = '2024-01-05';
        mockData.clinicName = 'Городская поликлиника №1';
      } else if (currentDocument.id === 'ticket') {
        mockData.ticketNumber = 'SU1234';
        mockData.departureDate = '2024-03-15';
        mockData.destination = 'Ташкент';
      } else if (currentDocument.id === 'hotel') {
        mockData.hotelName = 'Гостиница "Космос"';
        mockData.hotelAddress = 'г. Москва, пр-т Мира, д. 150';
        mockData.checkIn = '2024-01-01';
        mockData.checkOut = '2024-01-15';
      } else if (currentDocument.id === 'private_invitation') {
        mockData.inviterFullName = 'Сидоров Сидор Сидорович';
        mockData.inviterPassport = '4512 345678';
        mockData.inviterAddress = 'г. Москва, ул. Пушкина, д. 5, кв. 20';
        mockData.notaryName = 'Нотариус Смирнова А.А.';
      }
      
      setCurrentDocData(mockData);
      setCurrentStep('verification');
    }, 2000);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">{currentDocument.icon}</span>
        </div>

        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('wizard.scanning.recognizing', { title: currentDocument.title })}...</h3>
        <p className="text-sm text-gray-600 mb-6">{currentDocument.description}</p>

        <div className="space-y-3 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.scanning.processingImage')}...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.scanning.recognizingText')}...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.scanning.checkingFormat')}...</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
          <p className="text-xs text-blue-800 text-center">
            ⏱️ {t('wizard.scanning.ocrTime')}
          </p>
        </div>
      </div>
    );
  };

  const renderVerification = () => {
    if (!currentDocument) return null;

    const isValid = currentDocument.fields.every(field => currentDocData[field]);

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {documentsToScan.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentDocIndex
                    ? 'bg-green-500 text-white'
                    : index === currentDocIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentDocIndex ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {currentDocIndex + 1} {t('wizard.documentScan.of')} {documentsToScan.length}
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{currentDocument.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('wizard.verification.checkData')}</h3>
          <p className="text-sm text-gray-600">
            {dataMethod === 'scan'
              ? t('wizard.verification.autoRecognized')
              : t('wizard.verification.manualCheck')}
          </p>
        </div>

        {/* OCR Confidence Badge (only for scan) */}
        {dataMethod === 'scan' && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {t('wizard.verification.accuracy')}: 98%
            </span>
          </div>
        )}

        {/* Editable Form */}
        <div className="space-y-4">
          {currentDocument.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t(`wizard.fields.${field}`)}
              </label>
              <input
                type={field.includes('Date') ? 'date' : 'text'}
                value={currentDocData[field] || ''}
                onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  field.includes('Name') || field.includes('Number') ? 'font-mono uppercase' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">⚠️ {t('wizard.verification.critical')}</p>
              <p className="text-xs text-red-800 leading-relaxed">
                {t('wizard.verification.criticalNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
          <input
            type="checkbox"
            id="confirm-verification"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5"
          />
          <label htmlFor="confirm-verification" className="text-sm text-gray-700">
            <strong>{t('wizard.verification.personallyChecked')}</strong> {t('wizard.verification.confirmResponsibility')}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (isConfirmed && isValid) {
                // Save current document data
                setScannedDocuments({
                  ...scannedDocuments,
                  [currentDocument.id]: currentDocData,
                });

                // Move to next document or to additional docs selection
                if (currentDocIndex < documentsToScan.length - 1) {
                  // More documents in current batch
                  setCurrentDocIndex(currentDocIndex + 1);
                  setCurrentStep('document-scan');
                  setDataMethod(null);
                  setCurrentDocData({});
                  setIsConfirmed(false);
                } else if (scanMode === 'required') {
                  // Finished required docs, offer additional
                  setCurrentStep('additional-docs');
                } else {
                  // Finished all scanning
                  setCurrentStep('processing');
                }
              }
            }}
            disabled={!isConfirmed || !isValid}
            className={`w-full font-bold py-4 rounded-xl transition-colors ${
              isConfirmed && isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentDocIndex < documentsToScan.length - 1
              ? t('wizard.verification.nextDocument')
              : scanMode === 'required'
              ? t('wizard.verification.doneNext')
              : t('wizard.verification.allCorrectContinue')}
          </button>

          {dataMethod === 'scan' && (
            <button
              onClick={() => {
                setCurrentStep('document-scan');
                setDataMethod('scan');
                setIsConfirmed(false);
              }}
              className="w-full bg-orange-100 text-orange-700 font-semibold py-3 rounded-xl hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {t('wizard.verification.retakePhoto')}
            </button>
          )}

          <button
            onClick={() => {
              setDataMethod(null);
              setCurrentStep('document-scan');
              setIsConfirmed(false);
            }}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            ← {t('wizard.verification.backToChoice')}
          </button>
        </div>
      </div>
    );
  };

  const renderProcessing = () => {
    // Auto-advance after 3 seconds
    setTimeout(() => {
      setCurrentStep('action-plan');
    }, 3000);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />

        <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('wizard.processing.generating')}...</h3>

        <div className="space-y-3 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.processing.analyzingLaws')}...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.processing.selectingForms')}...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('wizard.processing.generatingApplications')}...</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
          <p className="text-xs text-blue-800 text-center">
            ⏱️ {t('wizard.processing.usuallyTakes')}
          </p>
        </div>
      </div>
    );
  };

  const renderActionPlan = () => (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">{t('wizard.actionPlan.documentsReady')}</h3>
        <p className="text-sm text-green-800">
          {t('wizard.actionPlan.preparedPackage')}
        </p>
      </div>

      {/* Generated Forms */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('wizard.actionPlan.generatedDocuments')}
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{t('wizard.actionPlan.patentApplication')}.pdf</p>
                <p className="text-xs text-gray-500">124 KB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Download className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => previewPDF({ formId: 'patent-initial', data: scannedDocuments, profileData: { ...profileData, ...scannedDocuments } })}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title={t('wizard.actionPlan.preview')}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{t('wizard.actionPlan.arrivalNotification')}.pdf</p>
                <p className="text-xs text-gray-500">98 KB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Download className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => previewPDF({ formId: 'notification-arrival', data: scannedDocuments, profileData: { ...profileData, ...scannedDocuments } })}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title={t('wizard.actionPlan.preview')}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
        <h4 className="font-bold text-gray-900 mb-4">{t('wizard.actionPlan.stepByStepPlan')}</h4>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                {t('wizard.actionPlan.whereToGo')}
              </h5>
              <p className="text-sm text-gray-700 mb-2">{t('wizard.actionPlan.mmcSakharovo')}</p>
              <button className="text-xs text-blue-600 font-medium hover:underline">
                {t('wizard.actionPlan.openOnMap')} →
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                {t('wizard.actionPlan.when')}
              </h5>
              <p className="text-sm text-gray-700">{t('wizard.actionPlan.tomorrowTime')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('wizard.actionPlan.comeEarly')}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {t('wizard.actionPlan.whatToTake')}
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('wizard.actionPlan.passportOriginal')}</li>
                <li>• {t('wizard.actionPlan.migrationCard')}</li>
                <li>• {t('wizard.actionPlan.printedApplications')}</li>
                <li>• {t('wizard.actionPlan.cashAmount')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Block */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-red-900 mb-2">⚠️ {t('wizard.actionPlan.whatIfNot')}</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• {t('wizard.actionPlan.fine')}</li>
              <li>• {t('wizard.actionPlan.stayRevoked')}</li>
              <li>• {t('wizard.actionPlan.entryBan')}</li>
              <li>• {t('wizard.actionPlan.deportation')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          const addedDocs = Object.keys(scannedDocuments);
          onComplete?.(addedDocs);
          onClose();
        }}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-98 shadow-xl"
      >
        {t('wizard.actionPlan.gotIt')}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('wizard.title')}</h2>
              <p className="text-xs text-blue-100">
                {currentStep === 'intro' && t('wizard.steps.intro')}
                {currentStep === 'required-docs' && t('wizard.steps.requiredDocs')}
                {currentStep === 'additional-docs' && t('wizard.steps.additionalDocs')}
                {currentStep === 'document-scan' && t('wizard.steps.documentScan', { current: currentDocIndex + 1, total: documentsToScan.length })}
                {currentStep === 'scanning' && t('wizard.steps.scanning')}
                {currentStep === 'verification' && t('wizard.steps.verification')}
                {currentStep === 'processing' && t('wizard.steps.processing')}
                {currentStep === 'action-plan' && t('wizard.steps.actionPlan')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'required-docs' && renderRequiredDocs()}
          {currentStep === 'additional-docs' && renderAdditionalDocs()}
          {currentStep === 'document-scan' && renderDocumentScan()}
          {currentStep === 'scanning' && renderScanning()}
          {currentStep === 'verification' && renderVerification()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'action-plan' && renderActionPlan()}
        </div>
      </div>
    </div>
  );
}
