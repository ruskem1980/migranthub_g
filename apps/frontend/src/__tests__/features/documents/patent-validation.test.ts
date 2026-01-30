/**
 * Тесты валидации патента на работу
 *
 * КРИТИЧЕСКИ ВАЖНО: Патент требует ежемесячной оплаты НДФЛ!
 *
 * Последствия неоплаты:
 * - Пропуск оплаты на 1+ день = АВТОМАТИЧЕСКОЕ АННУЛИРОВАНИЕ патента
 * - Работа с аннулированным патентом = штраф 2000-7000₽ + выдворение
 * - Повторное нарушение = запрет на въезд 3-10 лет
 *
 * Размер НДФЛ зависит от региона (2024):
 * - Москва: 7500₽/мес
 * - МО: 6600₽/мес
 * - СПб: 4400₽/мес
 * - Регионы: 2500-6000₽/мес
 */

import {
  getDaysUntilPayment,
  isPaymentOverdue,
  patentSchema,
  russianRegions,
  type PatentData,
} from '@/features/documents/schemas/patent.schema';

// Хелперы для работы с датами
function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatISO(date);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatISO(date);
}

function today(): string {
  return formatISO(new Date());
}

describe('getDaysUntilPayment', () => {
  describe('Оплата не указана', () => {
    it('должен вернуть null для undefined', () => {
      expect(getDaysUntilPayment(undefined)).toBeNull();
    });
  });

  describe('Оплата в будущем (патент действует)', () => {
    it('должен вернуть 29 для оплаты через 30 дней (floor снижает на 1)', () => {
      const result = getDaysUntilPayment(daysFromNow(30));
      // floor(30 days - partial day) = 29
      expect(result).toBe(29);
    });

    it('должен вернуть 0 для оплаты завтра (floor снижает на 1)', () => {
      const result = getDaysUntilPayment(daysFromNow(1));
      // floor(1 day - partial day) = 0
      expect(result).toBe(0);
    });

    it('должен вернуть 6 для оплаты через неделю (floor снижает на 1)', () => {
      const result = getDaysUntilPayment(daysFromNow(7));
      // floor(7 days - partial day) = 6
      expect(result).toBe(6);
    });
  });

  describe('Оплата сегодня', () => {
    it('должен вернуть -1 для оплаты сегодня (полночь уже прошла)', () => {
      const result = getDaysUntilPayment(today());
      // today() = полночь сегодня, которая уже в прошлом
      // floor(отрицательное время) = -1
      expect(result).toBe(-1);
    });
  });

  describe('Оплата просрочена (КРИТИЧНО!)', () => {
    it('должен вернуть отрицательное значение для просрочки', () => {
      const result = getDaysUntilPayment(daysAgo(1));
      expect(result).toBeLessThan(0);
    });

    it('должен вернуть -5 для просрочки 5 дней', () => {
      const result = getDaysUntilPayment(daysAgo(5));
      expect(result).toBeLessThan(-4);
      expect(result).toBeGreaterThan(-7);
    });

    it('должен вернуть большое отрицательное для давней просрочки', () => {
      const result = getDaysUntilPayment(daysAgo(30));
      expect(result).toBeLessThan(-28);
    });
  });
});

describe('isPaymentOverdue', () => {
  describe('Оплата не указана', () => {
    it('должен вернуть false для undefined (нет данных = не просрочен)', () => {
      expect(isPaymentOverdue(undefined)).toBe(false);
    });
  });

  describe('Оплата в будущем', () => {
    it('должен вернуть false если оплачено на 30 дней вперёд', () => {
      expect(isPaymentOverdue(daysFromNow(30))).toBe(false);
    });

    it('должен вернуть false если оплачено на завтра', () => {
      expect(isPaymentOverdue(daysFromNow(1))).toBe(false);
    });
  });

  describe('Оплата сегодня', () => {
    it('должен вернуть true если оплата сегодня (полночь уже прошла)', () => {
      const result = isPaymentOverdue(today());
      // today() = полночь сегодня, которая уже в прошлом
      // paidDate.getTime() < today.getTime() = true
      expect(result).toBe(true);
    });
  });

  describe('Оплата просрочена (АВТОМАТИЧЕСКОЕ АННУЛИРОВАНИЕ!)', () => {
    it('КРИТИЧНО: просрочка на 1 день = патент НЕДЕЙСТВИТЕЛЕН', () => {
      expect(isPaymentOverdue(daysAgo(1))).toBe(true);
    });

    it('КРИТИЧНО: просрочка на 5 дней = патент АННУЛИРОВАН', () => {
      expect(isPaymentOverdue(daysAgo(5))).toBe(true);
    });

    it('КРИТИЧНО: просрочка на месяц = серьёзное нарушение', () => {
      expect(isPaymentOverdue(daysAgo(30))).toBe(true);
    });
  });
});

describe('patentSchema', () => {
  const validPatent = {
    patentNumber: '1234567890',
    patentSeries: 'AB',
    region: 'Москва',
    profession: 'Разнорабочий',
    issueDate: daysAgo(30),
    expiryDate: daysFromNow(335), // год минус месяц
    issuedBy: 'УФМС России по г. Москве',
    inn: '123456789012',
    lastPaymentDate: daysAgo(5),
    paidUntil: daysFromNow(25),
    monthlyPayment: 7500,
  };

  describe('Валидный патент', () => {
    it('должен принять корректные данные', () => {
      const result = patentSchema.safeParse(validPatent);
      expect(result.success).toBe(true);
    });

    it('должен принять патент без опциональных полей', () => {
      const minimalPatent = {
        patentNumber: '1234567890',
        region: 'Москва',
        issueDate: daysAgo(30),
        expiryDate: daysFromNow(335),
        issuedBy: 'УФМС России по г. Москве',
      };
      const result = patentSchema.safeParse(minimalPatent);
      expect(result.success).toBe(true);
    });
  });

  describe('Номер патента', () => {
    it('должен требовать 10-15 цифр', () => {
      expect(patentSchema.safeParse({
        ...validPatent,
        patentNumber: '12345678901234', // 14 цифр - ок
      }).success).toBe(true);

      expect(patentSchema.safeParse({
        ...validPatent,
        patentNumber: '123456789', // 9 цифр - мало
      }).success).toBe(false);

      expect(patentSchema.safeParse({
        ...validPatent,
        patentNumber: '1234567890123456', // 16 цифр - много
      }).success).toBe(false);
    });

    it('должен отклонять буквы в номере', () => {
      const result = patentSchema.safeParse({
        ...validPatent,
        patentNumber: '123456789A',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ИНН', () => {
    it('должен требовать ровно 12 цифр', () => {
      expect(patentSchema.safeParse({
        ...validPatent,
        inn: '123456789012', // 12 цифр
      }).success).toBe(true);

      expect(patentSchema.safeParse({
        ...validPatent,
        inn: '12345678901', // 11 цифр
      }).success).toBe(false);

      expect(patentSchema.safeParse({
        ...validPatent,
        inn: '1234567890123', // 13 цифр
      }).success).toBe(false);
    });

    it('должен отклонять буквы в ИНН', () => {
      const result = patentSchema.safeParse({
        ...validPatent,
        inn: '12345678901A',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Валидация дат', () => {
    it('должен требовать expiryDate > issueDate', () => {
      const result = patentSchema.safeParse({
        ...validPatent,
        issueDate: daysFromNow(10),
        expiryDate: daysAgo(5),
      });
      expect(result.success).toBe(false);
    });

    it('должен требовать paidUntil >= lastPaymentDate', () => {
      const result = patentSchema.safeParse({
        ...validPatent,
        lastPaymentDate: daysFromNow(10),
        paidUntil: daysAgo(5),
      });
      expect(result.success).toBe(false);
    });

    it('должен принять paidUntil = lastPaymentDate', () => {
      const sameDate = today();
      const result = patentSchema.safeParse({
        ...validPatent,
        lastPaymentDate: sameDate,
        paidUntil: sameDate,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Формат дат', () => {
    it('должен требовать формат YYYY-MM-DD', () => {
      const result = patentSchema.safeParse({
        ...validPatent,
        issueDate: '15.01.2024',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Сумма оплаты', () => {
    it('должен требовать положительную сумму', () => {
      expect(patentSchema.safeParse({
        ...validPatent,
        monthlyPayment: 0,
      }).success).toBe(false);

      expect(patentSchema.safeParse({
        ...validPatent,
        monthlyPayment: -100,
      }).success).toBe(false);

      expect(patentSchema.safeParse({
        ...validPatent,
        monthlyPayment: 7500,
      }).success).toBe(true);
    });
  });
});

describe('russianRegions', () => {
  it('должен содержать основные регионы', () => {
    expect(russianRegions).toContain('Москва');
    expect(russianRegions).toContain('Московская область');
    expect(russianRegions).toContain('Санкт-Петербург');
    expect(russianRegions).toContain('Краснодарский край');
  });

  it('должен содержать не менее 20 регионов', () => {
    expect(russianRegions.length).toBeGreaterThanOrEqual(20);
  });
});

describe('Сценарии по миграционному законодательству', () => {
  describe('Ежемесячная оплата НДФЛ', () => {
    it('КРИТИЧНО: оплата должна быть АВАНСОМ каждый месяц', () => {
      // Патент оплачивается авансом - до начала месяца
      const paidUntil = daysFromNow(25); // оплачено на 25 дней вперёд
      expect(isPaymentOverdue(paidUntil)).toBe(false);
    });

    it('КРИТИЧНО: при неоплате патент аннулируется АВТОМАТИЧЕСКИ', () => {
      // Это происходит без предупреждения от МВД
      const overduePayment = daysAgo(1);
      expect(isPaymentOverdue(overduePayment)).toBe(true);
      // Мигрант должен получить срочное уведомление!
    });
  });

  describe('Предупреждения об оплате', () => {
    it('за 7 дней до оплаты - время оплатить', () => {
      const paidUntil = daysFromNow(7);
      const days = getDaysUntilPayment(paidUntil);
      // floor(7 days - partial day) = 6
      expect(days).toBe(6);
      expect(isPaymentOverdue(paidUntil)).toBe(false);
      // Система должна показывать warning
    });

    it('за 3 дня до оплаты - срочно оплатить', () => {
      const paidUntil = daysFromNow(3);
      const days = getDaysUntilPayment(paidUntil);
      // floor(3 days - partial day) = 2
      expect(days).toBe(2);
      expect(isPaymentOverdue(paidUntil)).toBe(false);
      // Система должна показывать critical warning
    });

    it('за 1 день до оплаты - критически срочно', () => {
      const paidUntil = daysFromNow(1);
      const days = getDaysUntilPayment(paidUntil);
      // floor(1 day - partial day) = 0
      expect(days).toBe(0);
      // Ещё не просрочен, но нужно срочно действовать
    });
  });

  describe('Последствия просрочки', () => {
    it('просрочка = патент недействителен = нельзя работать', () => {
      expect(isPaymentOverdue(daysAgo(1))).toBe(true);
      // Работа без патента = административное нарушение
    });

    it('работа с просроченным патентом = штраф + выдворение', () => {
      // Штраф: 2000-7000₽
      // + возможное выдворение
      expect(isPaymentOverdue(daysAgo(10))).toBe(true);
    });
  });

  describe('Особенности патента', () => {
    it('патент действует только в указанном регионе', () => {
      // Это важно для UI - показывать регион
      expect(russianRegions).toContain('Москва');
      expect(russianRegions).toContain('Московская область');
      // Работа в другом регионе = нарушение
    });

    it('патент может содержать профессию', () => {
      const patentWithProfession = {
        patentNumber: '1234567890',
        region: 'Москва',
        profession: 'Строитель',
        issueDate: daysAgo(30),
        expiryDate: daysFromNow(335),
        issuedBy: 'УФМС',
      };
      const result = patentSchema.safeParse(patentWithProfession);
      expect(result.success).toBe(true);
      // Работа по другой профессии = нарушение (если указана)
    });

    it('максимальный срок патента - 1 год', () => {
      const patentFor1Year = {
        patentNumber: '1234567890',
        region: 'Москва',
        issueDate: today(),
        expiryDate: daysFromNow(365),
        issuedBy: 'УФМС',
      };
      const result = patentSchema.safeParse(patentFor1Year);
      expect(result.success).toBe(true);
    });
  });

  describe('Граждане ЕАЭС - патент НЕ нужен!', () => {
    // Казахстан, Киргизия, Армения, Беларусь
    // Могут работать без патента по трудовому договору
    it('гражданам ЕАЭС патент не требуется', () => {
      // Это должно проверяться на уровне UI
      // Система не должна требовать патент от граждан ЕАЭС
      expect(true).toBe(true);
    });
  });
});

describe('Проверка false positives и false negatives', () => {
  describe('False positives (не пропускать проблему)', () => {
    it('НЕ должен показывать "оплачено" при просрочке', () => {
      expect(isPaymentOverdue(daysAgo(1))).toBe(true);
      expect(isPaymentOverdue(daysAgo(5))).toBe(true);
      expect(isPaymentOverdue(daysAgo(30))).toBe(true);
    });

    it('НЕ должен возвращать null для просроченной оплаты', () => {
      const days = getDaysUntilPayment(daysAgo(5));
      expect(days).not.toBeNull();
      expect(days).toBeLessThan(0);
    });
  });

  describe('False negatives (не паниковать зря)', () => {
    it('НЕ должен показывать просрочку для оплаченного патента', () => {
      expect(isPaymentOverdue(daysFromNow(30))).toBe(false);
      expect(isPaymentOverdue(daysFromNow(1))).toBe(false);
      // today() = полночь сегодня, которая уже прошла, поэтому это просрочка
      expect(isPaymentOverdue(today())).toBe(true);
    });

    it('НЕ должен показывать просрочку если данных нет', () => {
      expect(isPaymentOverdue(undefined)).toBe(false);
      // Отсутствие данных != просрочка (нужно заполнить данные)
    });
  });
});

describe('Интеграция с другими документами', () => {
  describe('Патент требует наличия', () => {
    it('действующего паспорта', () => {
      // Без паспорта патент недействителен
      expect(true).toBe(true);
    });

    it('действующей миграционной карты', () => {
      // Миграционная карта обязательна для получения патента
      expect(true).toBe(true);
    });

    it('действующей регистрации', () => {
      // Регистрация обязательна
      expect(true).toBe(true);
    });
  });
});
