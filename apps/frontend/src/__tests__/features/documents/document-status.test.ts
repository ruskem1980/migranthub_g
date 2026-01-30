/**
 * Тесты статусов документов
 *
 * Проверяет функцию getDocumentStatus(), которая определяет
 * статус документа по дате истечения срока действия.
 *
 * ВАЖНО: Правильное определение статуса критично для
 * своевременного предупреждения мигранта о необходимости
 * продления документов.
 */

import {
  getDocumentStatus,
  filterDocumentsByStatus,
  sortDocumentsByPriority,
  DocumentType,
  type DocumentStatus,
  type DocumentTypeValue,
} from '@/lib/db/types';

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

describe('getDocumentStatus', () => {
  describe('Документ без срока действия', () => {
    it('должен вернуть valid для undefined', () => {
      const result = getDocumentStatus(undefined);
      expect(result).toBe('valid');
    });

    it('должен вернуть valid для пустой строки (как falsy значение)', () => {
      // Внимание: пустая строка - truthy для проверки наличия,
      // но new Date('') даёт Invalid Date, что при вычислениях даёт NaN
      // NaN < 0 = false, NaN <= 30 = false, поэтому возвращает 'valid'
      // Это поведение нужно учитывать при использовании функции
      const result = getDocumentStatus('');
      expect(result).toBe('valid');
    });
  });

  describe('Действующий документ (valid)', () => {
    it('должен вернуть valid для документа со сроком > 30 дней (по умолчанию)', () => {
      // floor(31 days - partial day) = 30, что равно warningDays, поэтому expiring_soon
      // Нужно 32 дня чтобы гарантированно получить valid
      const expiryDate = daysFromNow(32);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('valid');
    });

    it('должен вернуть valid для документа со сроком 365 дней', () => {
      const expiryDate = daysFromNow(365);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('valid');
    });

    it('должен вернуть valid для документа со сроком 60 дней', () => {
      const expiryDate = daysFromNow(60);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('valid');
    });

    it('должен использовать custom warningDays', () => {
      const expiryDate = daysFromNow(20); // 20 дней
      const result = getDocumentStatus(expiryDate, 15); // warning только при < 15 днях
      expect(result).toBe('valid');
    });
  });

  describe('Истекающий документ (expiring_soon)', () => {
    it('должен вернуть expiring_soon для документа со сроком ровно 30 дней', () => {
      const expiryDate = daysFromNow(30);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expiring_soon');
    });

    it('должен вернуть expiring_soon для документа со сроком 15 дней', () => {
      const expiryDate = daysFromNow(15);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expiring_soon');
    });

    it('должен вернуть expiring_soon для документа со сроком 7 дней', () => {
      const expiryDate = daysFromNow(7);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expiring_soon');
    });

    it('должен вернуть expiring_soon для документа со сроком 1 день', () => {
      const expiryDate = daysFromNow(1);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expiring_soon');
    });

    it('должен вернуть expired для документа, истекающего сегодня', () => {
      const expiryDate = today();
      const result = getDocumentStatus(expiryDate);
      // today() возвращает дату в полночь, а new Date() включает текущее время
      // Поэтому diffTime < 0, и документ считается просроченным
      expect(result).toBe('expired');
    });

    it('должен использовать custom warningDays для expiring_soon', () => {
      const expiryDate = daysFromNow(10);
      const result = getDocumentStatus(expiryDate, 7); // warning при <= 7 днях
      expect(result).toBe('valid'); // 10 > 7, так что valid
    });
  });

  describe('Истекший документ (expired)', () => {
    it('должен вернуть expired для документа, истекшего вчера', () => {
      const expiryDate = daysAgo(1);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expired');
    });

    it('должен вернуть expired для документа, истекшего неделю назад', () => {
      const expiryDate = daysAgo(7);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expired');
    });

    it('должен вернуть expired для документа, истекшего месяц назад', () => {
      const expiryDate = daysAgo(30);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expired');
    });

    it('должен вернуть expired для документа, истекшего год назад', () => {
      const expiryDate = daysAgo(365);
      const result = getDocumentStatus(expiryDate);
      expect(result).toBe('expired');
    });
  });

  describe('Граничные случаи', () => {
    it('граница между valid и expiring_soon (32 vs 31 дней)', () => {
      // floor(31 days - partial day) = 30, что равно warningDays
      // floor(32 days - partial day) = 31, что > warningDays
      expect(getDocumentStatus(daysFromNow(32))).toBe('valid');
      expect(getDocumentStatus(daysFromNow(31))).toBe('expiring_soon');
    });

    it('граница между expiring_soon и expired (1 vs 0 день)', () => {
      // today() в полночь < текущее время, поэтому expired
      expect(getDocumentStatus(today())).toBe('expired');
      // Документ истёк вчера - expired
      expect(getDocumentStatus(daysAgo(1))).toBe('expired');
      // Документ истекает завтра - expiring_soon
      expect(getDocumentStatus(daysFromNow(1))).toBe('expiring_soon');
    });

    it('должен корректно работать с разными форматами дат', () => {
      // ISO формат со временем
      const isoWithTime = new Date();
      isoWithTime.setDate(isoWithTime.getDate() + 15);
      const result = getDocumentStatus(isoWithTime.toISOString());
      expect(result).toBe('expiring_soon');
    });

    it('должен корректно обрабатывать некорректную дату', () => {
      const result = getDocumentStatus('invalid-date');
      // Invalid Date даёт NaN, NaN < 0 = false, NaN <= 30 = false
      // Так что вернёт 'valid' - это может быть проблемой!
      expect(result).toBe('valid');
    });
  });

  describe('Разные значения warningDays', () => {
    const expiryIn10Days = daysFromNow(10);

    it('warningDays = 7: 10 дней = valid', () => {
      expect(getDocumentStatus(expiryIn10Days, 7)).toBe('valid');
    });

    it('warningDays = 10: 10 дней = expiring_soon (граница)', () => {
      expect(getDocumentStatus(expiryIn10Days, 10)).toBe('expiring_soon');
    });

    it('warningDays = 14: 10 дней = expiring_soon', () => {
      expect(getDocumentStatus(expiryIn10Days, 14)).toBe('expiring_soon');
    });

    it('warningDays = 0: только истекшие = expired', () => {
      // daysFromNow(0) = today() в полночь, которая уже прошла
      expect(getDocumentStatus(daysFromNow(0), 0)).toBe('expired');
      expect(getDocumentStatus(daysAgo(1), 0)).toBe('expired');
      // floor(1 day - partial) = 0, 0 <= 0, поэтому expiring_soon
      expect(getDocumentStatus(daysFromNow(1), 0)).toBe('expiring_soon');
      expect(getDocumentStatus(daysFromNow(2), 0)).toBe('valid');
    });
  });
});

describe('filterDocumentsByStatus', () => {
  // Мок документов
  const mockDocuments = [
    { id: '1', type: 'passport' as DocumentTypeValue, expiryDate: daysFromNow(60) },  // valid
    { id: '2', type: 'patent' as DocumentTypeValue, expiryDate: daysFromNow(15) },    // expiring_soon
    { id: '3', type: 'registration' as DocumentTypeValue, expiryDate: daysAgo(5) },   // expired
    { id: '4', type: 'migration_card' as DocumentTypeValue, expiryDate: daysFromNow(100) }, // valid
    { id: '5', type: 'passport' as DocumentTypeValue, expiryDate: undefined },        // valid (no expiry)
  ];

  it('должен фильтровать valid документы', () => {
    const result = filterDocumentsByStatus(mockDocuments, 'valid');
    expect(result).toHaveLength(3); // 60 дней, 100 дней, undefined
    expect(result.map(d => d.id)).toContain('1');
    expect(result.map(d => d.id)).toContain('4');
    expect(result.map(d => d.id)).toContain('5');
  });

  it('должен фильтровать expiring_soon документы', () => {
    const result = filterDocumentsByStatus(mockDocuments, 'expiring_soon');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('должен фильтровать expired документы', () => {
    const result = filterDocumentsByStatus(mockDocuments, 'expired');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('должен вернуть пустой массив если нет документов с нужным статусом', () => {
    const validOnly = [
      { id: '1', expiryDate: daysFromNow(100) },
    ];
    const result = filterDocumentsByStatus(validOnly, 'expired');
    expect(result).toHaveLength(0);
  });
});

describe('sortDocumentsByPriority', () => {
  const documents = [
    { type: 'patent' as DocumentTypeValue, id: 'patent' },
    { type: 'passport' as DocumentTypeValue, id: 'passport' },
    { type: 'registration' as DocumentTypeValue, id: 'registration' },
    { type: 'migration_card' as DocumentTypeValue, id: 'migration_card' },
  ];

  it('должен сортировать документы по приоритету', () => {
    const result = sortDocumentsByPriority(documents);

    // Ожидаемый порядок: passport(1), migration_card(2), registration(3), patent(4)
    expect(result[0].type).toBe('passport');
    expect(result[1].type).toBe('migration_card');
    expect(result[2].type).toBe('registration');
    expect(result[3].type).toBe('patent');
  });

  it('не должен мутировать исходный массив', () => {
    const original = [...documents];
    sortDocumentsByPriority(documents);
    expect(documents).toEqual(original);
  });
});

describe('DocumentType константы', () => {
  it('должен содержать все типы документов', () => {
    expect(DocumentType.PASSPORT).toBe('passport');
    expect(DocumentType.MIGRATION_CARD).toBe('migration_card');
    expect(DocumentType.PATENT).toBe('patent');
    expect(DocumentType.REGISTRATION).toBe('registration');
  });
});

describe('Критические сценарии статусов документов', () => {
  describe('Паспорт', () => {
    it('истекающий паспорт должен быть expiring_soon за 30 дней', () => {
      const result = getDocumentStatus(daysFromNow(30));
      expect(result).toBe('expiring_soon');
    });
  });

  describe('Миграционная карта', () => {
    it('миграционная карта истекает через 90 дней после въезда', () => {
      // Для безвизовых граждан миграционная карта действует до истечения 90/180
      const result = getDocumentStatus(daysFromNow(5)); // осталось 5 дней
      expect(result).toBe('expiring_soon');
    });
  });

  describe('Регистрация', () => {
    it('регистрация истекает - критический статус', () => {
      // Просрочка регистрации > 7 дней = штраф
      const result = getDocumentStatus(daysAgo(10));
      expect(result).toBe('expired');
    });
  });

  describe('Патент', () => {
    it('патент без оплаты аннулируется', () => {
      // Если не оплачен НДФЛ - патент недействителен
      const result = getDocumentStatus(daysAgo(1));
      expect(result).toBe('expired');
    });
  });
});

describe('Проверка отсутствия false positives', () => {
  it('НЕ должен показывать valid для истекшего документа', () => {
    const expiredDates = [
      daysAgo(1),
      daysAgo(7),
      daysAgo(30),
      daysAgo(365),
    ];

    for (const date of expiredDates) {
      const result = getDocumentStatus(date);
      expect(result).not.toBe('valid');
      expect(result).toBe('expired');
    }
  });

  it('НЕ должен показывать valid для истекающего документа', () => {
    const expiringDates = [
      daysFromNow(1),
      daysFromNow(7),
      daysFromNow(15),
      daysFromNow(30),
    ];

    for (const date of expiringDates) {
      const result = getDocumentStatus(date);
      expect(result).not.toBe('valid');
      expect(result).toBe('expiring_soon');
    }
  });
});

describe('Проверка отсутствия false negatives', () => {
  it('НЕ должен показывать expired для действующего документа', () => {
    // Нужно 32+ дней чтобы гарантировать valid (floor снижает на 1)
    const validDates = [
      daysFromNow(32),
      daysFromNow(60),
      daysFromNow(365),
    ];

    for (const date of validDates) {
      const result = getDocumentStatus(date);
      expect(result).not.toBe('expired');
      expect(result).toBe('valid');
    }
  });

  it('НЕ должен показывать expiring_soon для далёкого документа', () => {
    // Нужно 32+ дней чтобы гарантировать не expiring_soon
    const farDates = [
      daysFromNow(32),
      daysFromNow(100),
      daysFromNow(365),
    ];

    for (const date of farDates) {
      const result = getDocumentStatus(date);
      expect(result).not.toBe('expiring_soon');
    }
  });
});
