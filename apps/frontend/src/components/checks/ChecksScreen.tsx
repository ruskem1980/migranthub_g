'use client';

import { useState } from 'react';
import { Ban, CreditCard, FileText, Hash, Scale, Search } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import { CheckCard } from './CheckCard';
import { useLanguageStore, type Language } from '@/lib/stores/languageStore';

// Import existing modals
import { BanChecker } from '@/features/services/components/BanChecker';
import { PassportValidityModal } from '@/components/prototype/services/PassportValidityModal';
import { PatentCheckModal } from '@/components/prototype/services/PatentCheckModal';
import { InnCheckModal } from '@/components/prototype/services/InnCheckModal';
import { FsspCheckModal } from '@/components/prototype/services/FsspCheckModal';

type CheckId = 'ban' | 'passport' | 'patent' | 'inn' | 'fssp';

interface CheckItem {
  id: CheckId;
  icon: typeof Ban;
  titleKey: string;
  descriptionKey: string;
  free: boolean;
  requiresSubscription?: 'plus' | 'pro';
}

const checks: CheckItem[] = [
  {
    id: 'ban',
    icon: Ban,
    titleKey: 'banTitle',
    descriptionKey: 'banDescription',
    free: true,
  },
  {
    id: 'passport',
    icon: CreditCard,
    titleKey: 'passportTitle',
    descriptionKey: 'passportDescription',
    free: true,
  },
  {
    id: 'patent',
    icon: FileText,
    titleKey: 'patentTitle',
    descriptionKey: 'patentDescription',
    free: true,
  },
  {
    id: 'inn',
    icon: Hash,
    titleKey: 'innTitle',
    descriptionKey: 'innDescription',
    free: true,
  },
  {
    id: 'fssp',
    icon: Scale,
    titleKey: 'fsspTitle',
    descriptionKey: 'fsspDescription',
    free: false,
    requiresSubscription: 'plus',
  },
];

const labels: Record<string, Record<Language, string>> = {
  screenTitle: {
    ru: 'Проверки',
    en: 'Checks',
    uz: 'Tekshiruvlar',
    tg: 'Санҷишҳо',
    ky: 'Текшеруулор',
  },
  screenSubtitle: {
    ru: 'Проверьте свои документы и статусы онлайн',
    en: 'Check your documents and statuses online',
    uz: 'Hujjatlaringiz va holatlaringizni onlayn tekshiring',
    tg: 'Ҳуҷҷатҳо ва вазъиятҳои худро онлайн санҷед',
    ky: 'Документтериниз менен статустарынызды онлайн текшеринез',
  },
  banTitle: {
    ru: 'Запрет на въезд',
    en: 'Entry Ban',
    uz: 'Kirish taqiqi',
    tg: 'Манъи воридот',
    ky: 'Кирууго тыюу',
  },
  banDescription: {
    ru: 'Проверьте, нет ли ограничений на въезд в РФ',
    en: 'Check if there are any restrictions on entry to Russia',
    uz: 'Rossiyaga kirish cheklovlari borligini tekshiring',
    tg: 'Санҷед, ки оё маҳдудият барои воридот ба Русия нест',
    ky: 'Россияга кирууго чектоо бар же жогун текшеринез',
  },
  passportTitle: {
    ru: 'Действительность паспорта',
    en: 'Passport Validity',
    uz: 'Pasportning haqiqiyligi',
    tg: 'Эътибори шиноснома',
    ky: 'Паспорттун жарактуулугу',
  },
  passportDescription: {
    ru: 'Проверка по базе МВД России',
    en: 'Check against the Russian MVD database',
    uz: 'Rossiya IIV bazasi bo\'yicha tekshirish',
    tg: 'Санҷиш аз рӯи базаи ВКД Русия',
    ky: 'Россия ИИМ базасы боюнча текшеруу',
  },
  patentTitle: {
    ru: 'Статус патента',
    en: 'Patent Status',
    uz: 'Patent holati',
    tg: 'Вазъияти патент',
    ky: 'Патент статусу',
  },
  patentDescription: {
    ru: 'Проверка действительности патента на работу',
    en: 'Check work patent validity',
    uz: 'Ish patentining haqiqiyligini tekshirish',
    tg: 'Санҷиши эътибори патенти корӣ',
    ky: 'Жумуш патентинин жарактуулугун текшеруу',
  },
  innTitle: {
    ru: 'ИНН',
    en: 'INN',
    uz: 'INN',
    tg: 'ИНН',
    ky: 'ИНН',
  },
  innDescription: {
    ru: 'Проверка индивидуального номера налогоплательщика',
    en: 'Check individual taxpayer number',
    uz: 'Soliq to\'lovchining individual raqamini tekshirish',
    tg: 'Санҷиши рақами инфиродии андозсупоранда',
    ky: 'Салык толоочунун жеке номерин текшеруу',
  },
  fsspTitle: {
    ru: 'Долги ФССП',
    en: 'FSSP Debts',
    uz: 'FSSP qarzdorliklari',
    tg: 'Қарзҳои ФССП',
    ky: 'ФССП карыздары',
  },
  fsspDescription: {
    ru: 'Проверка задолженностей по исполнительным производствам',
    en: 'Check enforcement proceedings debts',
    uz: 'Ijro ishlari bo\'yicha qarzdorliklarni tekshirish',
    tg: 'Санҷиши қарздориҳо аз рӯи парвандаҳои иҷроӣ',
    ky: 'Аткаруу иштери боюнча карыздарды текшеруу',
  },
};

export function ChecksScreen() {
  const [activeCheck, setActiveCheck] = useState<CheckId | null>(null);
  const { language } = useLanguageStore();

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.ru || key;
  };

  const openCheck = (id: CheckId) => {
    setActiveCheck(id);
  };

  const closeCheck = () => {
    setActiveCheck(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <SectionHeader title={t('screenTitle')} icon={Search} />

        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {t('screenSubtitle')}
        </p>

        <div className="space-y-3">
          {checks.map((check) => (
            <CheckCard
              key={check.id}
              id={check.id}
              icon={check.icon}
              title={t(check.titleKey)}
              description={t(check.descriptionKey)}
              onClick={() => openCheck(check.id)}
              free={check.free}
              requiresSubscription={check.requiresSubscription}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeCheck === 'ban' && <BanChecker onClose={closeCheck} />}
      {activeCheck === 'passport' && <PassportValidityModal onClose={closeCheck} />}
      {activeCheck === 'patent' && <PatentCheckModal onClose={closeCheck} />}
      {activeCheck === 'inn' && <InnCheckModal onClose={closeCheck} />}
      {activeCheck === 'fssp' && <FsspCheckModal onClose={closeCheck} />}
    </div>
  );
}

export default ChecksScreen;
