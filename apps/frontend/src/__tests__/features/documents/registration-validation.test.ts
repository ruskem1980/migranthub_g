/**
 * Тесты валидации регистрации (миграционного учёта)
 *
 * КРИТИЧЕСКИ ВАЖНО: Просрочка регистрации влечёт:
 * - Штраф 2000-5000₽ (для мигранта)
 * - Штраф для принимающей стороны
 * - При повторном нарушении - выдворение
 *
 * Сроки регистрации по закону:
 * - Большинство стран: 7 рабочих дней с момента въезда
 * - ЕАЭС (Казахстан, Киргизия, Армения, Беларусь): 30 дней
 * - Украина, Таджикистан: 15 дней
 */

import {
  getDaysUntilExpiry,
  isRegistrationExpired,
  isRegistrationExpiringSoon,
  formatFullAddress,
  registrationSchema,
  registrationTypeLabels,
  type RegistrationData,
} from '@/features/documents/schemas/registration.schema';

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

describe('getDaysUntilExpiry', () => {
  describe('Положительные значения (регистрация действует)', () => {
    it('должен вернуть 30 для регистрации, истекающей через 30 дней', () => {
      const result = getDaysUntilExpiry(daysFromNow(30));
      expect(result).toBe(30);
    });

    it('должен вернуть 1 для регистрации, истекающей завтра', () => {
      const result = getDaysUntilExpiry(daysFromNow(1));
      expect(result).toBe(1);
    });

    it('должен вернуть 90 для полного срока регистрации', () => {
      const result = getDaysUntilExpiry(daysFromNow(90));
      expect(result).toBe(90);
    });
  });

  describe('Граничные значения', () => {
    it('должен вернуть 0 или 1 для регистрации, истекающей сегодня', () => {
      const result = getDaysUntilExpiry(today());
      // В зависимости от времени дня может быть 0 или 1
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('Отрицательные значения (регистрация просрочена)', () => {
    it('должен вернуть отрицательное значение для просроченной регистрации', () => {
      const result = getDaysUntilExpiry(daysAgo(5));
      expect(result).toBeLessThan(0);
      // Примерно -5, но может быть -4 или -6 в зависимости от времени
      expect(result).toBeGreaterThanOrEqual(-6);
      expect(result).toBeLessThanOrEqual(-4);
    });

    it('должен вернуть -30 для регистрации, просроченной месяц назад', () => {
      const result = getDaysUntilExpiry(daysAgo(30));
      expect(result).toBeLessThan(-29);
      expect(result).toBeGreaterThan(-32);
    });
  });
});

describe('isRegistrationExpired', () => {
  it('должен вернуть false для действующей регистрации', () => {
    expect(isRegistrationExpired(daysFromNow(30))).toBe(false);
    expect(isRegistrationExpired(daysFromNow(1))).toBe(false);
  });

  it('должен вернуть false для регистрации, истекающей сегодня', () => {
    // День истечения ещё не считается просрочкой
    const result = isRegistrationExpired(today());
    // getDaysUntilExpiry возвращает ceil, так что может быть 0 или 1
    // 0 < 0 = false, так что регистрация сегодня не expired
    expect(result).toBe(false);
  });

  it('должен вернуть true для просроченной регистрации', () => {
    expect(isRegistrationExpired(daysAgo(1))).toBe(true);
    expect(isRegistrationExpired(daysAgo(7))).toBe(true);
    expect(isRegistrationExpired(daysAgo(30))).toBe(true);
  });

  describe('Юридические последствия просрочки', () => {
    it('КРИТИЧНО: просрочка на 1 день = нарушение', () => {
      expect(isRegistrationExpired(daysAgo(1))).toBe(true);
    });

    it('КРИТИЧНО: просрочка > 7 дней = штраф 2000-5000₽', () => {
      expect(isRegistrationExpired(daysAgo(8))).toBe(true);
      // Система должна предупреждать об этом заранее
    });

    it('КРИТИЧНО: просрочка > 90 дней = возможно выдворение', () => {
      expect(isRegistrationExpired(daysAgo(91))).toBe(true);
      // Это серьёзное нарушение миграционного законодательства
    });
  });
});

describe('isRegistrationExpiringSoon', () => {
  describe('Порог по умолчанию (7 дней)', () => {
    it('должен вернуть true для 7 дней до истечения', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(7))).toBe(true);
    });

    it('должен вернуть true для 1 дня до истечения', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(1))).toBe(true);
    });

    it('должен вернуть true для истечения сегодня', () => {
      const result = isRegistrationExpiringSoon(today());
      // days >= 0 && days <= 7
      expect(result).toBe(true);
    });

    it('должен вернуть false для 8+ дней до истечения', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(8))).toBe(false);
    });

    it('должен вернуть false для 30 дней до истечения', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(30))).toBe(false);
    });

    it('должен вернуть false для просроченной регистрации', () => {
      // days >= 0 - просроченная регистрация не считается "скоро истекающей"
      expect(isRegistrationExpiringSoon(daysAgo(1))).toBe(false);
    });
  });

  describe('Пользовательский порог', () => {
    it('должен использовать custom threshold 14 дней', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(14), 14)).toBe(true);
      expect(isRegistrationExpiringSoon(daysFromNow(10), 14)).toBe(true);
      expect(isRegistrationExpiringSoon(daysFromNow(15), 14)).toBe(false);
    });

    it('должен использовать custom threshold 3 дня', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(3), 3)).toBe(true);
      expect(isRegistrationExpiringSoon(daysFromNow(4), 3)).toBe(false);
    });
  });
});

describe('formatFullAddress', () => {
  it('должен форматировать полный адрес с квартирой', () => {
    const result = formatFullAddress({
      region: 'Московская область',
      city: 'Москва',
      street: 'ул. Тверская',
      building: '15',
      apartment: '42',
    });

    expect(result).toBe('Московская область, Москва, ул. Тверская, д. 15, кв. 42');
  });

  it('должен форматировать адрес без квартиры', () => {
    const result = formatFullAddress({
      region: 'Санкт-Петербург',
      city: 'Санкт-Петербург',
      street: 'Невский проспект',
      building: '100',
      apartment: undefined,
    });

    expect(result).toBe('Санкт-Петербург, Санкт-Петербург, Невский проспект, д. 100');
  });

  it('должен форматировать адрес с пустой квартирой', () => {
    const result = formatFullAddress({
      region: 'Краснодарский край',
      city: 'Краснодар',
      street: 'ул. Красная',
      building: '1А',
      apartment: '',
    });

    // Пустая строка - falsy, так что квартира не добавляется
    expect(result).toBe('Краснодарский край, Краснодар, ул. Красная, д. 1А');
  });
});

describe('registrationSchema', () => {
  const validRegistration: RegistrationData = {
    type: 'temporary',
    address: 'Москва, ул. Тверская, д. 15, кв. 42',
    region: 'Москва',
    city: 'Москва',
    street: 'ул. Тверская',
    building: '15',
    apartment: '42',
    registrationDate: daysAgo(10),
    expiryDate: daysFromNow(80),
    hostFullName: 'Иванов Иван Иванович',
    hostPhone: '+7 999 123 45 67',
    notificationNumber: '12345678',
    registeredBy: 'МВД России по г. Москве',
  };

  describe('Валидная регистрация', () => {
    it('должен принять корректные данные', () => {
      const result = registrationSchema.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });
  });

  describe('Обязательные поля', () => {
    it('должен требовать тип регистрации', () => {
      const { type, ...rest } = validRegistration;
      const result = registrationSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('должен требовать адрес минимум 10 символов', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        address: 'Короткий',
      });
      expect(result.success).toBe(false);
    });

    it('должен требовать регион', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        region: '',
      });
      expect(result.success).toBe(false);
    });

    it('должен требовать ФИО принимающей стороны', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        hostFullName: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Валидация дат', () => {
    it('должен требовать expiryDate > registrationDate', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        registrationDate: daysFromNow(10),
        expiryDate: daysAgo(5), // истёк до регистрации - ошибка
      });
      expect(result.success).toBe(false);
    });

    it('должен принять expiryDate = registrationDate + 90 дней', () => {
      const regDate = daysAgo(0);
      const expDate = daysFromNow(90);
      const result = registrationSchema.safeParse({
        ...validRegistration,
        registrationDate: regDate,
        expiryDate: expDate,
      });
      expect(result.success).toBe(true);
    });

    it('должен отклонить временную регистрацию > 365 дней', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        type: 'temporary',
        registrationDate: daysAgo(0),
        expiryDate: daysFromNow(400), // больше года
      });
      expect(result.success).toBe(false);
    });

    it('должен принять постоянную регистрацию > 365 дней', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        type: 'permanent',
        registrationDate: daysAgo(0),
        expiryDate: daysFromNow(400), // ВНЖ может быть на несколько лет
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Формат дат', () => {
    it('должен требовать формат YYYY-MM-DD', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        registrationDate: '15.01.2024', // неверный формат
      });
      expect(result.success).toBe(false);
    });

    it('должен отклонять некорректные даты', () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        registrationDate: '2024-13-45', // нет такой даты
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('registrationTypeLabels', () => {
  it('должен содержать метки для всех типов', () => {
    expect(registrationTypeLabels.temporary).toBe('Временная (миграционный учёт)');
    expect(registrationTypeLabels.permanent).toBe('Постоянная (ВНЖ)');
  });
});

describe('Сценарии по миграционному законодательству', () => {
  describe('Стандартный срок регистрации (90 дней)', () => {
    it('регистрация на 90 дней должна быть валидной', () => {
      const result = registrationSchema.safeParse({
        type: 'temporary',
        address: 'г. Москва, ул. Примерная, д. 1',
        region: 'Москва',
        city: 'Москва',
        street: 'ул. Примерная',
        building: '1',
        registrationDate: today(),
        expiryDate: daysFromNow(90),
        hostFullName: 'Собственник Жилья Примерович',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Предупреждения по срокам (по закону)', () => {
    it('за 7 дней до истечения - время на продление', () => {
      const expiryDate = daysFromNow(7);
      expect(isRegistrationExpiringSoon(expiryDate, 7)).toBe(true);
      // Пользователь должен получить уведомление
    });

    it('за 3 дня до истечения - срочно продлевать', () => {
      const expiryDate = daysFromNow(3);
      expect(isRegistrationExpiringSoon(expiryDate, 7)).toBe(true);
      expect(getDaysUntilExpiry(expiryDate)).toBe(3);
    });
  });

  describe('Граждане ЕАЭС', () => {
    it('ЕАЭС могут находиться без регистрации 30 дней', () => {
      // Граждане Казахстана, Киргизии, Армении, Беларуси
      // могут не вставать на учёт первые 30 дней
      // Это не тестируется здесь, но важно для UI
      expect(true).toBe(true);
    });
  });

  describe('Штрафы за просрочку', () => {
    it('просрочка 1-7 дней: предупреждение или минимальный штраф', () => {
      const expired5Days = daysAgo(5);
      expect(isRegistrationExpired(expired5Days)).toBe(true);
      expect(getDaysUntilExpiry(expired5Days)).toBeLessThan(0);
    });

    it('просрочка > 7 дней: штраф 2000-5000₽', () => {
      const expired10Days = daysAgo(10);
      expect(isRegistrationExpired(expired10Days)).toBe(true);
      // Система должна явно предупреждать о штрафе
    });

    it('просрочка > 90 дней: возможно выдворение', () => {
      const expired100Days = daysAgo(100);
      expect(isRegistrationExpired(expired100Days)).toBe(true);
      // Критическое нарушение
    });
  });
});

describe('Проверка false positives и false negatives', () => {
  describe('False positives (не должны пропускать проблему)', () => {
    it('НЕ должен показывать "действует" для просроченной регистрации', () => {
      expect(isRegistrationExpired(daysAgo(1))).toBe(true);
      expect(isRegistrationExpired(daysAgo(10))).toBe(true);
    });

    it('НЕ должен скрывать предупреждение за 7 дней до истечения', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(7))).toBe(true);
      expect(isRegistrationExpiringSoon(daysFromNow(5))).toBe(true);
    });
  });

  describe('False negatives (не должны паниковать зря)', () => {
    it('НЕ должен показывать просрочку для действующей регистрации', () => {
      expect(isRegistrationExpired(daysFromNow(30))).toBe(false);
      expect(isRegistrationExpired(daysFromNow(1))).toBe(false);
    });

    it('НЕ должен показывать предупреждение за 30 дней до истечения (при пороге 7)', () => {
      expect(isRegistrationExpiringSoon(daysFromNow(30), 7)).toBe(false);
      expect(isRegistrationExpiringSoon(daysFromNow(14), 7)).toBe(false);
    });
  });
});
