'use client';

import { useState } from 'react';
import { X, Scale, Shield, Briefcase, Home, Heart, AlertTriangle, Phone, ChevronRight, CheckCircle, XCircle, ExternalLink, Users } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { LucideIcon } from 'lucide-react';

interface RightsModalProps {
  onClose: () => void;
}

interface RightsSection {
  id: string;
  icon: LucideIcon;
  title: { ru: string; en: string };
  color: string;
  lawRef?: { ru: string; en: string };
  rights: Array<{ ru: string; en: string }>;
  dos?: Array<{ ru: string; en: string }>;
  donts?: Array<{ ru: string; en: string }>;
}

type LocalizedText = { ru: string; en: string };

const getText = (obj: LocalizedText, lang: string): string => {
  if (lang === 'ru') return obj.ru;
  return obj.en;
};

const rightsSections: RightsSection[] = [
  {
    id: 'work',
    icon: Briefcase,
    title: { ru: 'Трудовые права', en: 'Labor Rights' },
    color: 'blue',
    lawRef: { ru: 'ТК РФ, ФЗ-115 ст. 13', en: 'Labor Code, FZ-115 Art. 13' },
    rights: [
      {
        ru: 'Право на своевременную оплату труда не реже 2 раз в месяц',
        en: 'Right to timely payment of wages at least twice a month',
      },
      {
        ru: 'Право на безопасные условия труда и охрану здоровья',
        en: 'Right to safe working conditions and health protection',
      },
      {
        ru: 'Право на отдых: выходные, отпуск, нормированный рабочий день',
        en: 'Right to rest: weekends, vacation, normalized working hours',
      },
      {
        ru: 'Право на получение трудового договора в письменной форме',
        en: 'Right to receive an employment contract in writing',
      },
      {
        ru: 'Право на возмещение вреда, причиненного на работе',
        en: 'Right to compensation for damage caused at work',
      },
      {
        ru: 'Право работать у любого работодателя в регионе действия патента',
        en: 'Right to work for any employer in the patent region',
      },
    ],
    dos: [
      { ru: 'Всегда требуйте письменный трудовой договор', en: 'Always demand a written employment contract' },
      { ru: 'Сохраняйте копии всех документов', en: 'Keep copies of all documents' },
      { ru: 'Фиксируйте факт работы (переписки, фото)', en: 'Document your work (messages, photos)' },
    ],
    donts: [
      { ru: 'Не работайте без договора — вы бесправны', en: 'Do not work without a contract — you have no protection' },
      { ru: 'Не отдавайте паспорт работодателю', en: 'Never give your passport to the employer' },
      { ru: 'Не соглашайтесь на «серую» зарплату', en: 'Do not agree to unofficial salary payments' },
    ],
  },
  {
    id: 'housing',
    icon: Home,
    title: { ru: 'Жилищные права', en: 'Housing Rights' },
    color: 'green',
    lawRef: { ru: 'ЖК РФ, ФЗ-109 о миграционном учёте', en: 'Housing Code, FZ-109 on Migration Registration' },
    rights: [
      {
        ru: 'Право арендовать жилье на основании договора',
        en: 'Right to rent housing based on a contract',
      },
      {
        ru: 'Право на неприкосновенность жилища (полиция входит только по решению суда или в экстренных случаях)',
        en: 'Right to inviolability of the home (police can only enter by court order or in emergencies)',
      },
      {
        ru: 'Право требовать постановку на миграционный учет от арендодателя',
        en: 'Right to require migration registration from the landlord',
      },
      {
        ru: 'Право не быть выселенным без судебного решения',
        en: 'Right not to be evicted without a court decision',
      },
    ],
    dos: [
      { ru: 'Заключайте договор аренды письменно', en: 'Sign a written rental agreement' },
      { ru: 'Требуйте постановку на миграционный учёт', en: 'Demand migration registration' },
      { ru: 'Сохраняйте квитанции об оплате', en: 'Keep payment receipts' },
    ],
    donts: [
      { ru: 'Не открывайте дверь без понимания кто там', en: 'Do not open the door without knowing who it is' },
      { ru: 'Не впускайте полицию без постановления суда', en: 'Do not let police in without a court order' },
    ],
  },
  {
    id: 'health',
    icon: Heart,
    title: { ru: 'Медицинские права', en: 'Medical Rights' },
    color: 'red',
    lawRef: { ru: 'ФЗ-323 об охране здоровья', en: 'FZ-323 on Health Protection' },
    rights: [
      {
        ru: 'Право на экстренную медицинскую помощь бесплатно',
        en: 'Right to free emergency medical care',
      },
      {
        ru: 'Право на медицинскую помощь по полису ДМС',
        en: 'Right to medical care under voluntary health insurance',
      },
      {
        ru: 'Право на конфиденциальность медицинской информации',
        en: 'Right to confidentiality of medical information',
      },
      {
        ru: 'Право отказаться от медицинского вмешательства',
        en: 'Right to refuse medical intervention',
      },
    ],
    dos: [
      { ru: 'Оформите полис ДМС — это обязательно для патента', en: 'Get voluntary health insurance — required for patent' },
      { ru: 'При экстренной ситуации вызывайте 103 — помогут бесплатно', en: 'Call 103 in emergency — free help' },
    ],
    donts: [
      { ru: 'Не бойтесь обращаться за экстренной помощью', en: 'Do not be afraid to seek emergency care' },
      { ru: 'Не платите за экстренную помощь — это незаконно', en: 'Do not pay for emergency care — it is illegal' },
    ],
  },
  {
    id: 'police',
    icon: Shield,
    title: { ru: 'При проверке документов', en: 'During Document Checks' },
    color: 'purple',
    lawRef: { ru: 'КоАП 18.8, ФЗ-115, ФЗ-3 о полиции', en: 'Administrative Code 18.8, FZ-115, FZ-3 on Police' },
    rights: [
      {
        ru: 'Право попросить сотрудника представиться и показать удостоверение',
        en: 'Right to ask the officer to introduce themselves and show ID',
      },
      {
        ru: 'Право узнать причину проверки',
        en: 'Right to know the reason for the check',
      },
      {
        ru: 'Право позвонить родственникам или адвокату',
        en: 'Right to call relatives or a lawyer',
      },
      {
        ru: 'Право получить копию протокола',
        en: 'Right to receive a copy of the protocol',
      },
      {
        ru: 'Право не подписывать документы без понимания их содержания',
        en: 'Right not to sign documents without understanding their content',
      },
      {
        ru: 'Право на переводчика при составлении протоколов',
        en: 'Right to an interpreter when drawing up protocols',
      },
    ],
    dos: [
      { ru: 'Сохраняйте спокойствие и вежливость', en: 'Stay calm and polite' },
      { ru: 'Попросите показать удостоверение', en: 'Ask to see their ID' },
      { ru: 'Запомните или запишите данные сотрудника', en: 'Remember or write down the officer\'s details' },
      { ru: 'Требуйте переводчика если не понимаете', en: 'Demand an interpreter if you don\'t understand' },
    ],
    donts: [
      { ru: 'Не грубите и не убегайте', en: 'Do not be rude or run away' },
      { ru: 'Не подписывайте документы без понимания', en: 'Do not sign documents you don\'t understand' },
      { ru: 'Не давайте взятки — это уголовное преступление', en: 'Do not give bribes — it is a criminal offense' },
      { ru: 'Не отдавайте оригиналы документов без протокола', en: 'Do not give original documents without a protocol' },
    ],
  },
];

const emergencyContacts = [
  {
    title: { ru: 'Полиция', en: 'Police' },
    number: '102',
  },
  {
    title: { ru: 'Скорая помощь', en: 'Ambulance' },
    number: '103',
  },
  {
    title: { ru: 'Единый номер', en: 'Emergency' },
    number: '112',
  },
  {
    title: { ru: 'Горячая линия МВД по миграции', en: 'Migration Hotline' },
    number: '8-800-222-74-47',
  },
];

const helpOrganizations = [
  {
    name: { ru: 'Комитет «Гражданское содействие»', en: 'Civic Assistance Committee' },
    description: { ru: 'Бесплатная юридическая помощь мигрантам', en: 'Free legal aid for migrants' },
    phone: '+7 (495) 973-59-57',
    website: 'refugee.ru',
  },
  {
    name: { ru: 'ПЦ «Мемориал»', en: 'Memorial Human Rights Center' },
    description: { ru: 'Правовая защита и консультации', en: 'Legal protection and consultations' },
    phone: '+7 (495) 225-31-18',
    website: 'memohrc.org',
  },
  {
    name: { ru: 'Уполномоченный по правам человека', en: 'Human Rights Ombudsman' },
    description: { ru: 'Федеральный омбудсмен РФ', en: 'Federal Ombudsman of Russia' },
    phone: '+7 (495) 607-19-22',
    website: 'ombudsmanrf.org',
  },
];

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
};

export function RightsModal({ onClose }: RightsModalProps) {
  const { language } = useLanguageStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('work');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-rose-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'ru' ? 'Ваши права' : 'Your Rights'}
              </h2>
              <p className="text-xs text-rose-100">
                {language === 'ru' ? 'Правовая защита мигрантов' : 'Legal protection for migrants'}
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
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Warning Banner */}
          <div className="mx-4 mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                {language === 'ru'
                  ? 'Это справочная информация. В сложных ситуациях обращайтесь к юристу.'
                  : 'This is reference information. In difficult situations, consult a lawyer.'}
              </p>
            </div>
          </div>

          {/* Rights Sections */}
          <div className="p-4 space-y-3">
            {rightsSections.map((section) => {
              const Icon = section.icon;
              const colors = colorClasses[section.color];
              const isExpanded = expandedSection === section.id;

              return (
                <div
                  key={section.id}
                  className={`${colors.bg} border-2 ${colors.border} rounded-xl overflow-hidden`}
                >
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <span className="flex-1 font-bold text-gray-900 text-left">
                      {getText(section.title, language)}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Law Reference */}
                      {section.lawRef && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ExternalLink className="w-3 h-3" />
                          <span>{getText(section.lawRef, language)}</span>
                        </div>
                      )}

                      {/* Rights List */}
                      <ul className="space-y-2">
                        {section.rights.map((right, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className={`w-2 h-2 rounded-full ${colors.icon.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                            <span className="text-sm text-gray-700">{getText(right, language)}</span>
                          </li>
                        ))}
                      </ul>

                      {/* DO / DON'T Cards */}
                      {(section.dos || section.donts) && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {section.dos && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-bold text-green-700">
                                  {language === 'ru' ? 'ДЕЛАЙТЕ' : 'DO'}
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {section.dos.map((item, idx) => (
                                  <li key={idx} className="text-xs text-green-800">
                                    • {getText(item, language)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.donts && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-bold text-red-700">
                                  {language === 'ru' ? 'НЕ ДЕЛАЙТЕ' : 'DON\'T'}
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {section.donts.map((item, idx) => (
                                  <li key={idx} className="text-xs text-red-800">
                                    • {getText(item, language)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Emergency Contacts */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {language === 'ru' ? 'Экстренные номера' : 'Emergency Numbers'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((contact, index) => (
                <a
                  key={index}
                  href={`tel:${contact.number}`}
                  className="flex items-center gap-2 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{getText(contact.title, language)}</p>
                    <p className="font-bold text-gray-900 text-sm">{contact.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Help Organizations */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {language === 'ru' ? 'Правозащитные организации' : 'Human Rights Organizations'}
            </h3>
            <div className="space-y-2">
              {helpOrganizations.map((org, index) => (
                <div
                  key={index}
                  className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{getText(org.name, language)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{getText(org.description, language)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href={`tel:${org.phone.replace(/\s/g, '')}`}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {org.phone}
                        </a>
                        <a
                          href={`https://${org.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {org.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-colors"
          >
            {language === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
