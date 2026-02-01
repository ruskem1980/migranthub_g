'use client';

import { Shield, MapPin, Wand2, GraduationCap, ClipboardCheck, Hash, Calculator, FileCheck, CalendarDays, MessageSquare, LucideIcon, HelpCircle, Scale, Route, CreditCard, Gavel, Briefcase, Car } from 'lucide-react';
import { useState } from 'react';
import { DocumentGenerator } from '../services/DocumentGenerator';
import { PermitStatusModal } from '../services/PermitStatusModal';
import { InnCheckModal } from '../services/InnCheckModal';
import { PatentCalculatorModal } from '../services/PatentCalculatorModal';
import { PatentCheckModal } from '../services/PatentCheckModal';
import { PatentPaymentModal } from '../services/PatentPaymentModal';
import { FAQModal } from '../services/FAQModal';
import { RightsModal } from '../services/RightsModal';
import { FsspCheckModal } from '../services/FsspCheckModal';
import { PassportValidityModal } from '../services/PassportValidityModal';
import { WorkPermitCheckModal } from '../services/WorkPermitCheckModal';
import { GibddCheckModal } from '../services/GibddCheckModal';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useProfileStore } from '@/lib/stores';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { ExamTrainer } from '@/features/services';
import { RoadmapScreen } from './RoadmapScreen';

export function ServicesScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [showExamTrainer, setShowExamTrainer] = useState(false);
  const [showPermitStatus, setShowPermitStatus] = useState(false);
  const [showInnCheck, setShowInnCheck] = useState(false);
  const [showPatentCalculator, setShowPatentCalculator] = useState(false);
  const [showPatentCheck, setShowPatentCheck] = useState(false);
  const [showPatentPayment, setShowPatentPayment] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showRights, setShowRights] = useState(false);
  const [showFsspCheck, setShowFsspCheck] = useState(false);
  const [showPassportValidity, setShowPassportValidity] = useState(false);
  const [showWorkPermitCheck, setShowWorkPermitCheck] = useState(false);
  const [showGibddCheck, setShowGibddCheck] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Document Services
  const documentServices = [
    { id: 'autofill', icon: Wand2, title: t('services.items.autofill.title'), subtitle: t('services.items.autofill.subtitle'), color: 'purple', special: true },
    { id: 'check', icon: Shield, title: t('services.items.check.title'), subtitle: t('services.items.check.subtitle'), color: 'red' },
  ];

  // Verification Services
  const checkServices = [
    { id: 'permitStatus', icon: ClipboardCheck, title: t('services.items.permitStatus.title'), subtitle: t('services.items.permitStatus.subtitle'), color: 'blue' },
    { id: 'innCheck', icon: Hash, title: 'INN Check', subtitle: 'Find your tax ID', color: 'indigo' },
    { id: 'patentCheck', icon: FileCheck, title: language === 'ru' ? 'Проверка патента' : 'Patent Check', subtitle: language === 'ru' ? 'Действительность патента' : 'Check validity', color: 'cyan' },
    { id: 'fsspCheck', icon: Gavel, title: t('services.items.fsspCheck.title'), subtitle: t('services.items.fsspCheck.subtitle'), color: 'purple' },
    { id: 'passportValidity', icon: Shield, title: t('services.items.passportValidity.title'), subtitle: t('services.items.passportValidity.subtitle'), color: 'red' },
    { id: 'workPermitCheck', icon: Briefcase, title: t('services.items.workPermitCheck.title'), subtitle: t('services.items.workPermitCheck.subtitle'), color: 'teal' },
    { id: 'gibddCheck', icon: Car, title: t('services.items.gibddCheck.title'), subtitle: t('services.items.gibddCheck.subtitle'), color: 'orange' },
  ];

  // Calculator Services
  const calculatorServices = [
    { id: 'patentCalc', icon: Calculator, title: 'Patent Calculator', subtitle: 'Calculate cost', color: 'green' },
    { id: 'patentPayment', icon: CreditCard, title: language === 'ru' ? 'Оплата патента' : 'Patent Payment', subtitle: language === 'ru' ? 'Оплата через YooKassa' : 'Pay via YooKassa', color: 'blue', special: true },
    { id: 'days90180', icon: CalendarDays, title: language === 'ru' ? 'Калькулятор 90/180' : '90/180 Calculator', subtitle: language === 'ru' ? 'Дни пребывания' : 'Stay days', color: 'amber' },
    { id: 'roadmap', icon: Route, title: t('roadmap.title'), subtitle: t('roadmap.subtitle'), color: 'indigo', special: true },
    { id: 'map', icon: MapPin, title: t('services.items.map.title'), subtitle: t('services.items.map.subtitle'), color: 'pink', hasModal: true },
  ];

  // Training Services
  const trainingServices = [
    { id: 'exam', icon: GraduationCap, title: t('services.items.exam.title'), subtitle: t('services.items.exam.subtitle'), color: 'emerald' },
    { id: 'aiTrainer', icon: MessageSquare, title: language === 'ru' ? 'AI Тренажёр' : 'AI Trainer', subtitle: language === 'ru' ? 'Практика диалогов' : 'Practice dialogs', color: 'violet' },
  ];

  // Legal & FAQ Services
  const legalServices = [
    { id: 'faq', icon: HelpCircle, title: language === 'ru' ? 'Частые вопросы' : 'FAQ', subtitle: language === 'ru' ? 'Ответы на вопросы' : 'Common answers', color: 'sky' },
    { id: 'rights', icon: Scale, title: language === 'ru' ? 'Ваши права' : 'Your Rights', subtitle: language === 'ru' ? 'Правовая защита' : 'Legal protection', color: 'rose' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    pink: { bg: 'bg-pink-50', icon: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
    gray: { bg: 'bg-gray-50', icon: 'text-gray-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
  };

  const handleServiceClick = (serviceId: string) => {
    switch (serviceId) {
      case 'autofill':
        setShowDocGenerator(true);
        break;
      case 'permitStatus':
        setShowPermitStatus(true);
        break;
      case 'innCheck':
        setShowInnCheck(true);
        break;
      case 'patentCheck':
        setShowPatentCheck(true);
        break;
      case 'fsspCheck':
        setShowFsspCheck(true);
        break;
      case 'passportValidity':
        setShowPassportValidity(true);
        break;
      case 'patentCalc':
        setShowPatentCalculator(true);
        break;
      case 'patentPayment':
        setShowPatentPayment(true);
        break;
      case 'days90180':
        setToast({ message: language === 'ru' ? 'Скоро будет доступно' : 'Coming soon', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
        break;
      case 'roadmap':
        setShowRoadmap(true);
        break;
      case 'map':
        setShowMapModal(true);
        break;
      case 'exam':
        setShowExamTrainer(true);
        break;
      case 'aiTrainer':
        setToast({ message: language === 'ru' ? 'Перейдите на вкладку Ассистент' : 'Go to Assistant tab', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
        break;
      case 'faq':
        setShowFAQ(true);
        break;
      case 'rights':
        setShowRights(true);
        break;
      case 'workPermitCheck':
        setShowWorkPermitCheck(true);
        break;
      case 'gibddCheck':
        setShowGibddCheck(true);
        break;
      default:
        break;
    }
  };

  const renderServiceCard = (service: { id: string; icon: LucideIcon; title: string; subtitle: string; color: string; special?: boolean }, index: number) => {
    const Icon = service.icon;
    const colors = colorClasses[service.color];

    return (
      <button
        key={index}
        onClick={() => handleServiceClick(service.id)}
        className={`${colors.bg} border-2 ${service.special ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'} rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md hover:shadow-xl relative`}
      >
        {service.special && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {t('common.new')}
          </div>
        )}
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
          <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
          {service.title}
        </h3>
        <p className="text-xs text-gray-600 text-center">
          {service.subtitle}
        </p>
      </button>
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">{t('services.title')}</h1>
          <LanguageSwitcher variant="compact" />
        </div>
        <p className="text-sm text-gray-500">{t('services.subtitle')}</p>
      </div>

      {/* Services by Category */}
      <div className="px-4 py-6">
        {/* Documents */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {language === 'ru' ? 'Документы' : 'Documents'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {documentServices.map((service, index) => renderServiceCard(service, index))}
          </div>
        </div>

        {/* Verification */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {language === 'ru' ? 'Проверки' : 'Verification'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {checkServices.map((service, index) => renderServiceCard(service, index))}
          </div>
        </div>

        {/* Calculators */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {language === 'ru' ? 'Калькуляторы и карта' : 'Calculators & Map'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {calculatorServices.map((service, index) => renderServiceCard(service, index))}
          </div>
        </div>

        {/* Training */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {language === 'ru' ? 'Обучение' : 'Training'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {trainingServices.map((service, index) => renderServiceCard(service, index))}
          </div>
        </div>

        {/* Legal & FAQ */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {language === 'ru' ? 'Правовая информация' : 'Legal Info'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {legalServices.map((service, index) => renderServiceCard(service, index))}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('services.migrantMap.title')}</h3>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{t('services.migrantMap.selectCategory')}</p>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">👮‍♂️</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.mvd')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.migrationDepts')}</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.medCenters')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.authorizedOnly')}</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.examCenters')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.testingCenters')}</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowMapModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('services.migrantMap.openMap')}
            </button>
          </div>
        </div>
      )}

      {/* Document Generator */}
      {showDocGenerator && (
        <DocumentGenerator
          onClose={() => setShowDocGenerator(false)}
          onSaveProfileData={updateProfile}
          profileData={profile || {}}
        />
      )}

      {/* Exam Trainer */}
      {showExamTrainer && (
        <ExamTrainer onClose={() => setShowExamTrainer(false)} />
      )}

      {/* Permit Status Modal */}
      {showPermitStatus && (
        <PermitStatusModal onClose={() => setShowPermitStatus(false)} />
      )}

      {/* INN Check Modal */}
      {showInnCheck && (
        <InnCheckModal onClose={() => setShowInnCheck(false)} />
      )}

      {/* Patent Calculator Modal */}
      {showPatentCalculator && (
        <PatentCalculatorModal onClose={() => setShowPatentCalculator(false)} />
      )}

      {/* Patent Check Modal */}
      {showPatentCheck && (
        <PatentCheckModal onClose={() => setShowPatentCheck(false)} />
      )}

      {/* Patent Payment Modal */}
      {showPatentPayment && (
        <PatentPaymentModal onClose={() => setShowPatentPayment(false)} />
      )}

      {/* Roadmap Screen */}
      {showRoadmap && (
        <RoadmapScreen onClose={() => setShowRoadmap(false)} />
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <FAQModal onClose={() => setShowFAQ(false)} />
      )}

      {/* Rights Modal */}
      {showRights && (
        <RightsModal onClose={() => setShowRights(false)} />
      )}

      {/* FSSP Check Modal */}
      {showFsspCheck && (
        <FsspCheckModal onClose={() => setShowFsspCheck(false)} />
      )}

      {/* Passport Validity Modal */}
      {showPassportValidity && (
        <PassportValidityModal onClose={() => setShowPassportValidity(false)} />
      )}

      {/* Work Permit Check Modal */}
      {showWorkPermitCheck && (
        <WorkPermitCheckModal onClose={() => setShowWorkPermitCheck(false)} />
      )}

      {/* GIBDD Check Modal */}
      {showGibddCheck && (
        <GibddCheckModal onClose={() => setShowGibddCheck(false)} />
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
