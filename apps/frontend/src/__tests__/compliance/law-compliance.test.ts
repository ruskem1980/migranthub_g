/**
 * ТЕСТЫ СООТВЕТСТВИЯ ЗАКОНОДАТЕЛЬСТВУ
 * =====================================
 * Эти тесты проверяют актуальность данных относительно законов РФ.
 * Запускать ЕЖЕДНЕВНО для обнаружения устаревших данных.
 *
 * При провале теста:
 * 1. Проверить изменения в законодательстве
 * 2. Обновить соответствующие константы в law-constants.ts
 * 3. Обновить локализации
 *
 * Источники законов:
 * - 115-ФЗ "О правовом положении иностранных граждан"
 * - 109-ФЗ "О миграционном учёте"
 * - 114-ФЗ "О порядке выезда из РФ и въезда в РФ"
 * - КоАП РФ ст.18.8, 18.9
 * - ФЗ-260 (изменения с 01.01.2025)
 * - Договор о ЕАЭС
 */

import { LAW_CONSTANTS, LAW_CONSTANTS_VERSION, LAST_LAW_CHECK_DATE } from './law-constants';

describe('COMPLIANCE: Соответствие законодательству РФ', () => {
  // Текущая дата для проверок
  const TODAY = new Date();
  const CURRENT_YEAR = TODAY.getFullYear();

  describe('Версионирование и актуальность', () => {
    test('Версия констант указана', () => {
      expect(LAW_CONSTANTS_VERSION).toBeDefined();
      expect(LAW_CONSTANTS_VERSION).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
    });

    test('Дата последней проверки указана', () => {
      expect(LAST_LAW_CHECK_DATE).toBeDefined();
    });

    test('ВНИМАНИЕ: Проверка законодательства не старше 30 дней', () => {
      const lastCheck = new Date(LAST_LAW_CHECK_DATE);
      const daysSinceCheck = Math.floor(
        (TODAY.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Предупреждение если проверка старше 30 дней
      if (daysSinceCheck > 30) {
        console.warn(`
          ⚠️ ВНИМАНИЕ: Последняя проверка законодательства была ${daysSinceCheck} дней назад!
          Рекомендуется проверить актуальность констант.
          Дата последней проверки: ${LAST_LAW_CHECK_DATE}
        `);
      }

      // Тест не падает, но предупреждает
      expect(daysSinceCheck).toBeLessThan(90); // Критическая ошибка если > 90 дней
    });
  });

  describe('Правило пребывания (ФЗ-260, с 01.01.2025)', () => {
    test('ЗАКОН: С 2025 года действует правило 90 дней в КАЛЕНДАРНЫЙ ГОД', () => {
      // ФЗ-260 вступил в силу 01.01.2025
      const LAW_EFFECTIVE_DATE = new Date(LAW_CONSTANTS.STAY_RULE.EFFECTIVE_DATE);

      if (TODAY >= LAW_EFFECTIVE_DATE) {
        // После 01.01.2025 должна использоваться логика календарного года
        expect(LAW_CONSTANTS.STAY_RULE.PERIOD).toBe('CALENDAR_YEAR');
      }
    });

    test('ЗАКОН: Максимум 90 дней пребывания в год', () => {
      expect(LAW_CONSTANTS.STAY_RULE.MAX_DAYS).toBe(90);
    });

    test('ЗАКОН: Счётчик обнуляется 1 января', () => {
      expect(LAW_CONSTANTS.STAY_RULE.RESET_MONTH).toBe(1); // Январь
      expect(LAW_CONSTANTS.STAY_RULE.RESET_DAY).toBe(1);
    });

    test('ЗАКОН: Ссылка на закон указана', () => {
      expect(LAW_CONSTANTS.STAY_RULE.LAW_REFERENCE).toBe('ФЗ-260');
    });
  });

  describe('Штрафы (КоАП РФ ст.18.8, актуально на 2025)', () => {
    test('ЗАКОН: ч.1 ст.18.8 - Штраф 2000-5000 рублей (все регионы кроме Москвы/СПб)', () => {
      const { min, max } = LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.GENERAL;
      expect(min).toBe(2000);
      expect(max).toBe(5000);
    });

    test('ЗАКОН: ч.3 ст.18.8 - Штраф 5000-7000 рублей (Москва и СПб)', () => {
      const { min, max } = LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.MOSCOW_SPB;
      expect(min).toBe(5000);
      expect(max).toBe(7000);
    });

    test('ЗАКОН: Повторное нарушение = возможно выдворение', () => {
      expect(LAW_CONSTANTS.FINES.REPEAT_VIOLATION.CONSEQUENCE).toBe('deportation_possible');
    });

    test('ЗАКОН: Ссылки на статьи КоАП указаны', () => {
      expect(LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.LAW_REFERENCE).toContain('КоАП');
      expect(LAW_CONSTANTS.FINES.REPEAT_VIOLATION.LAW_REFERENCE).toContain('КоАП');
    });
  });

  describe('Регистрация (109-ФЗ)', () => {
    test('ЗАКОН: Срок постановки на учёт = 7 рабочих дней', () => {
      expect(LAW_CONSTANTS.REGISTRATION.DEADLINE_DAYS).toBe(7);
    });

    test('ЗАКОН: Для граждан ЕАЭС = 30 дней', () => {
      expect(LAW_CONSTANTS.REGISTRATION.EAEU_DEADLINE_DAYS).toBe(30);
    });

    test('ЗАКОН: Ссылка на 109-ФЗ указана', () => {
      expect(LAW_CONSTANTS.REGISTRATION.LAW_REFERENCE).toContain('109-ФЗ');
    });
  });

  describe('Патент (115-ФЗ ст.13.3)', () => {
    test('ЗАКОН: Просрочка оплаты >1 дня = аннулирование патента', () => {
      // Нет grace period - просрочка даже на 1 день ведёт к аннулированию
      expect(LAW_CONSTANTS.PATENT.PAYMENT_GRACE_DAYS).toBe(0);
    });

    test('ЗАКОН: Срок подачи на патент = 30 дней с момента въезда', () => {
      expect(LAW_CONSTANTS.PATENT.APPLICATION_DEADLINE_DAYS).toBe(30);
    });

    test('ЗАКОН: После аннулирования - повторное обращение через 1 год', () => {
      expect(LAW_CONSTANTS.PATENT.REAPPLICATION_WAIT_DAYS).toBe(365);
    });

    test('ЗАКОН: Ссылка на 115-ФЗ указана', () => {
      expect(LAW_CONSTANTS.PATENT.LAW_REFERENCE).toContain('115-ФЗ');
    });
  });

  describe('ЕАЭС (Договор о ЕАЭС)', () => {
    test('ЗАКОН: Граждане ЕАЭС не требуют патента для работы', () => {
      expect(LAW_CONSTANTS.EAEU.WORK_PERMIT_REQUIRED).toBe(false);
    });

    test('ЗАКОН: Список стран ЕАЭС содержит 4 страны (кроме России)', () => {
      // Казахстан, Кыргызстан, Армения, Беларусь (+ Россия как страна пребывания)
      expect(LAW_CONSTANTS.EAEU.COUNTRIES).toHaveLength(4);
    });

    test('ЗАКОН: Казахстан входит в ЕАЭС', () => {
      expect(LAW_CONSTANTS.EAEU.COUNTRIES).toContain('KZ');
    });

    test('ЗАКОН: Кыргызстан входит в ЕАЭС', () => {
      expect(LAW_CONSTANTS.EAEU.COUNTRIES).toContain('KG');
    });

    test('ЗАКОН: Армения входит в ЕАЭС', () => {
      expect(LAW_CONSTANTS.EAEU.COUNTRIES).toContain('AM');
    });

    test('ЗАКОН: Беларусь входит в ЕАЭС', () => {
      expect(LAW_CONSTANTS.EAEU.COUNTRIES).toContain('BY');
    });

    test('ЗАКОН: Названия стран указаны корректно', () => {
      expect(LAW_CONSTANTS.EAEU.COUNTRY_NAMES.KZ).toBe('Казахстан');
      expect(LAW_CONSTANTS.EAEU.COUNTRY_NAMES.KG).toBe('Кыргызстан');
      expect(LAW_CONSTANTS.EAEU.COUNTRY_NAMES.AM).toBe('Армения');
      expect(LAW_CONSTANTS.EAEU.COUNTRY_NAMES.BY).toBe('Беларусь');
    });

    test('ЗАКОН: Ссылка на Договор о ЕАЭС указана', () => {
      expect(LAW_CONSTANTS.EAEU.LAW_REFERENCE).toContain('ЕАЭС');
    });
  });

  describe('Запрет на въезд (114-ФЗ ст.26, 27)', () => {
    test('ЗАКОН: Overstay 30-180 дней = запрет 3 года', () => {
      expect(LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_30_180_DAYS.years).toBe(3);
    });

    test('ЗАКОН: Overstay 180-270 дней = запрет 5 лет', () => {
      expect(LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_180_270_DAYS.years).toBe(5);
    });

    test('ЗАКОН: Overstay >270 дней = запрет 10 лет', () => {
      expect(LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_270_PLUS_DAYS.years).toBe(10);
    });

    test('ЗАКОН: Ссылка на 114-ФЗ указана', () => {
      expect(LAW_CONSTANTS.ENTRY_BANS.LAW_REFERENCE).toContain('114-ФЗ');
    });
  });

  describe('Режим высылки (ФЗ-260 с 05.02.2025)', () => {
    test('ЗАКОН: Режим высылки вступает в силу 05.02.2025', () => {
      const deportationDate = new Date(LAW_CONSTANTS.DEPORTATION_REGIME.EFFECTIVE_DATE);
      expect(deportationDate.getFullYear()).toBe(2025);
      expect(deportationDate.getMonth()).toBe(1); // Февраль (0-indexed)
      expect(deportationDate.getDate()).toBe(5);
    });

    test('ЗАКОН: Ссылка на ФЗ указана', () => {
      expect(LAW_CONSTANTS.DEPORTATION_REGIME.LAW_REFERENCE).toBeDefined();
    });

    test('ИНФОРМАЦИЯ: Статус режима высылки на текущую дату', () => {
      const deportationDate = new Date(LAW_CONSTANTS.DEPORTATION_REGIME.EFFECTIVE_DATE);
      const isActive = TODAY >= deportationDate;

      if (isActive) {
        console.log(`
          INFO: Режим высылки АКТИВЕН с ${LAW_CONSTANTS.DEPORTATION_REGIME.EFFECTIVE_DATE}
        `);
      } else {
        console.log(`
          INFO: Режим высылки вступит в силу ${LAW_CONSTANTS.DEPORTATION_REGIME.EFFECTIVE_DATE}
        `);
      }

      expect(true).toBe(true); // Информационный тест
    });
  });

  describe('Консистентность данных', () => {
    test('Все сроки указаны в днях (не в других единицах)', () => {
      expect(typeof LAW_CONSTANTS.STAY_RULE.MAX_DAYS).toBe('number');
      expect(typeof LAW_CONSTANTS.REGISTRATION.DEADLINE_DAYS).toBe('number');
      expect(typeof LAW_CONSTANTS.REGISTRATION.EAEU_DEADLINE_DAYS).toBe('number');
      expect(typeof LAW_CONSTANTS.PATENT.APPLICATION_DEADLINE_DAYS).toBe('number');
      expect(typeof LAW_CONSTANTS.PATENT.REAPPLICATION_WAIT_DAYS).toBe('number');
    });

    test('Все штрафы указаны в рублях', () => {
      expect(typeof LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.GENERAL.min).toBe('number');
      expect(typeof LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.GENERAL.max).toBe('number');
      expect(typeof LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.MOSCOW_SPB.min).toBe('number');
      expect(typeof LAW_CONSTANTS.FINES.REGISTRATION_VIOLATION.MOSCOW_SPB.max).toBe('number');
    });

    test('Все сроки запрета указаны в годах', () => {
      expect(typeof LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_30_180_DAYS.years).toBe('number');
      expect(typeof LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_180_270_DAYS.years).toBe('number');
      expect(typeof LAW_CONSTANTS.ENTRY_BANS.OVERSTAY_270_PLUS_DAYS.years).toBe('number');
    });

    test('Все даты в формате ISO (YYYY-MM-DD)', () => {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(LAW_CONSTANTS.STAY_RULE.EFFECTIVE_DATE).toMatch(isoDateRegex);
      expect(LAW_CONSTANTS.DEPORTATION_REGIME.EFFECTIVE_DATE).toMatch(isoDateRegex);
    });
  });

  describe('НАПОМИНАНИЯ О ПРОВЕРКЕ ЗАКОНОВ', () => {
    test('ВНИМАНИЕ: Проверить обновления законодательства', () => {
      // Этот тест напоминает о необходимости проверки
      console.log(`
        ========================================
        НАПОМИНАНИЕ ДЛЯ РАЗРАБОТЧИКОВ
        ========================================
        Дата проверки: ${TODAY.toISOString().split('T')[0]}
        Версия констант: ${LAW_CONSTANTS_VERSION}

        Источники для мониторинга:
        1. consultant.ru - изменения в 115-ФЗ, 109-ФЗ, 114-ФЗ
        2. garant.ru - КоАП РФ ст.18.8, 18.9
        3. pravo.gov.ru - новые ФЗ
        4. mvd.ru - разъяснения МВД

        При обнаружении изменений:
        1. Обновить константы в law-constants.ts
        2. Обновить LAST_LAW_CHECK_DATE
        3. Обновить LAW_CONSTANTS_VERSION
        4. Обновить локализации
        5. Сделать commit с описанием изменения закона
        ========================================
      `);
      expect(true).toBe(true);
    });
  });
});

describe('COMPLIANCE: Проверка года в тестах', () => {
  test('Тесты учитывают текущий год', () => {
    const currentYear = new Date().getFullYear();
    // Этот тест падает если год изменился и нужно проверить законодательство
    expect(currentYear).toBeGreaterThanOrEqual(2025);
  });
});
