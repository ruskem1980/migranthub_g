/**
 * Константы законодательства РФ
 * Обновлять при изменении законов!
 *
 * Последнее обновление: 2026-01-25
 * Ответственный: MigrantHub Team
 *
 * Источники:
 * - 115-ФЗ "О правовом положении иностранных граждан в РФ"
 * - 109-ФЗ "О миграционном учёте иностранных граждан"
 * - 114-ФЗ "О порядке выезда из РФ и въезда в РФ"
 * - КоАП РФ ст.18.8, 18.9
 * - ФЗ-260 (изменения с 01.01.2025)
 * - Договор о ЕАЭС
 */

export const LAW_CONSTANTS = {
  // ФЗ-260 (с 01.01.2025)
  STAY_RULE: {
    MAX_DAYS: 90,
    PERIOD: 'CALENDAR_YEAR' as const, // Изменено с 'ROLLING_180_DAYS'
    EFFECTIVE_DATE: '2025-01-01',
    RESET_MONTH: 1, // Январь
    RESET_DAY: 1,
    LAW_REFERENCE: 'ФЗ-260',
    DESCRIPTION:
      'С 01.01.2025 действует правило 90 дней в КАЛЕНДАРНЫЙ ГОД (ранее было 90/180)',
  },

  // КоАП РФ ст.18.8
  FINES: {
    REGISTRATION_VIOLATION: {
      GENERAL: { min: 2000, max: 5000 },
      MOSCOW_SPB: { min: 5000, max: 7000 },
      LAW_REFERENCE: 'КоАП РФ ст.18.8 ч.1, ч.3',
    },
    REPEAT_VIOLATION: {
      CONSEQUENCE: 'deportation_possible' as const,
      LAW_REFERENCE: 'КоАП РФ ст.18.8 ч.4',
    },
  },

  // 109-ФЗ
  REGISTRATION: {
    DEADLINE_DAYS: 7, // Рабочих дней для постановки на учёт
    EAEU_DEADLINE_DAYS: 30, // Для граждан ЕАЭС
    LAW_REFERENCE: '109-ФЗ ст.20',
  },

  // 115-ФЗ ст.13.3
  PATENT: {
    APPLICATION_DEADLINE_DAYS: 30, // Дней с момента въезда для подачи на патент
    PAYMENT_GRACE_DAYS: 0, // Нет grace period! Просрочка >1 дня = аннулирование
    REAPPLICATION_WAIT_DAYS: 365, // После аннулирования ждать 1 год
    LAW_REFERENCE: '115-ФЗ ст.13.3',
  },

  // 114-ФЗ ст.26, 27
  ENTRY_BANS: {
    OVERSTAY_30_180_DAYS: { years: 3 },
    OVERSTAY_180_270_DAYS: { years: 5 },
    OVERSTAY_270_PLUS_DAYS: { years: 10 },
    LAW_REFERENCE: '114-ФЗ ст.26, 27',
  },

  // Договор о ЕАЭС
  EAEU: {
    COUNTRIES: ['KZ', 'KG', 'AM', 'BY'] as const, // Казахстан, Кыргызстан, Армения, Беларусь
    COUNTRY_NAMES: {
      KZ: 'Казахстан',
      KG: 'Кыргызстан',
      AM: 'Армения',
      BY: 'Беларусь',
    },
    WORK_PERMIT_REQUIRED: false, // Патент не требуется для работы
    LAW_REFERENCE: 'Договор о ЕАЭС от 29.05.2014',
  },

  // Режим высылки (с 05.02.2025)
  DEPORTATION_REGIME: {
    EFFECTIVE_DATE: '2025-02-05',
    LAW_REFERENCE: 'ФЗ от 08.08.2024 № 260-ФЗ',
  },
};

// Версия констант для отслеживания изменений
export const LAW_CONSTANTS_VERSION = '2026.01.25';

// Дата последней проверки законодательства
export const LAST_LAW_CHECK_DATE = '2026-01-25';

// Типы для TypeScript
export type StayPeriodType = 'CALENDAR_YEAR' | 'ROLLING_180_DAYS';
export type ViolationConsequence = 'deportation_possible' | 'deportation' | 'fine_only';
export type EAEUCountryCode = (typeof LAW_CONSTANTS.EAEU.COUNTRIES)[number];
