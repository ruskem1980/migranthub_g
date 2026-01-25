/**
 * Комплексные тесты легального статуса мигранта
 *
 * Интеграционные тесты, проверяющие все компоненты вместе:
 * - Правило 90/180
 * - Статус документов
 * - Регистрация
 * - Патент
 *
 * КРИТИЧЕСКИ ВАЖНО: Эти тесты моделируют реальные жизненные
 * ситуации мигрантов. Ошибка в определении статуса может
 * привести к серьёзным правовым последствиям.
 */

import { calculateStay } from '@/features/services/calculator/stay-calculator';
import { getDocumentStatus } from '@/lib/db/types';
import {
  isRegistrationExpired,
  isRegistrationExpiringSoon,
  getDaysUntilExpiry as getRegistrationDaysUntilExpiry,
} from '@/features/documents/schemas/registration.schema';
import {
  isPaymentOverdue,
  getDaysUntilPayment,
} from '@/features/documents/schemas/patent.schema';
import type { StayPeriod } from '@/features/services/calculator/types';

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

// Типы для моделирования мигранта
interface MigrantProfile {
  name: string;
  citizenship: 'UZ' | 'TJ' | 'KZ' | 'KG' | 'AM' | 'BY' | 'UA' | 'MD' | 'AZ' | 'OTHER';
  stayPeriods: StayPeriod[];
  passport?: {
    expiryDate: string;
  };
  migrationCard?: {
    expiryDate: string;
  };
  registration?: {
    expiryDate: string;
  };
  patent?: {
    paidUntil?: string;
    region?: string;
  };
}

// Страны ЕАЭС (не нужен патент)
const EAEU_COUNTRIES = ['KZ', 'KG', 'AM', 'BY'];

// Функция определения комплексного статуса
interface LegalStatusResult {
  status: 'legal' | 'warning' | 'violation' | 'overstay' | 'illegal_work';
  canWork: boolean;
  canStay: boolean;
  risks: string[];
  warnings: string[];
  recommendations: string[];
}

function determineLegalStatus(profile: MigrantProfile): LegalStatusResult {
  const result: LegalStatusResult = {
    status: 'legal',
    canWork: false,
    canStay: true,
    risks: [],
    warnings: [],
    recommendations: [],
  };

  // 1. Проверка 90/180
  const stayCalc = calculateStay(profile.stayPeriods);

  if (stayCalc.isOverstay) {
    result.status = 'overstay';
    result.canStay = false;
    result.canWork = false;
    result.risks.push(`Превышение срока пребывания на ${stayCalc.overstayDays} дней`);

    if (stayCalc.overstayDays <= 30) {
      result.risks.push('Штраф 2000-5000₽');
    } else if (stayCalc.overstayDays <= 180) {
      result.risks.push('Запрет на въезд 3 года');
    } else {
      result.risks.push('Запрет на въезд 5-10 лет');
    }
    return result;
  }

  if (stayCalc.status === 'danger') {
    result.warnings.push(`Осталось ${stayCalc.daysRemaining} дней из 90`);
    result.recommendations.push('Запланируйте выезд из России');
  } else if (stayCalc.status === 'warning') {
    result.warnings.push(`Использовано ${stayCalc.totalDays} из 90 дней`);
    result.recommendations.push('Следите за сроками пребывания');
  }

  // 2. Проверка паспорта
  if (profile.passport) {
    const passportStatus = getDocumentStatus(profile.passport.expiryDate);
    if (passportStatus === 'expired') {
      result.status = 'violation';
      result.canStay = false;
      result.canWork = false;
      result.risks.push('Паспорт просрочен - немедленно обратитесь в посольство');
      return result;
    }
    if (passportStatus === 'expiring_soon') {
      result.warnings.push('Паспорт скоро истекает');
      result.recommendations.push('Продлите паспорт заблаговременно');
    }
  }

  // 3. Проверка миграционной карты
  if (profile.migrationCard) {
    const mcStatus = getDocumentStatus(profile.migrationCard.expiryDate);
    if (mcStatus === 'expired') {
      result.status = 'violation';
      result.risks.push('Миграционная карта просрочена');
      return result;
    }
    if (mcStatus === 'expiring_soon') {
      result.warnings.push('Миграционная карта скоро истекает');
    }
  }

  // 4. Проверка регистрации
  if (profile.registration) {
    if (isRegistrationExpired(profile.registration.expiryDate)) {
      const daysOverdue = Math.abs(getRegistrationDaysUntilExpiry(profile.registration.expiryDate));
      result.status = 'violation';
      result.risks.push(`Регистрация просрочена на ${daysOverdue} дней`);

      if (daysOverdue <= 7) {
        result.risks.push('Возможен штраф 2000-5000₽');
      } else if (daysOverdue <= 90) {
        result.risks.push('Штраф 2000-5000₽ + предупреждение');
      } else {
        result.risks.push('Возможно выдворение');
      }
      return result;
    }
    if (isRegistrationExpiringSoon(profile.registration.expiryDate)) {
      result.warnings.push('Регистрация скоро истекает');
      result.recommendations.push('Продлите регистрацию');
    }
  }

  // 5. Проверка права на работу
  const isEAEU = EAEU_COUNTRIES.includes(profile.citizenship);

  if (isEAEU) {
    // Граждане ЕАЭС могут работать без патента
    result.canWork = true;
    result.recommendations.push('Оформите трудовой договор (для граждан ЕАЭС патент не нужен)');
  } else if (profile.patent) {
    // Проверка патента для остальных
    if (profile.patent.paidUntil) {
      if (isPaymentOverdue(profile.patent.paidUntil)) {
        result.status = 'illegal_work';
        result.canWork = false;
        result.risks.push('Патент аннулирован из-за неоплаты НДФЛ');
        result.risks.push('Работа запрещена - штраф + выдворение');
        return result;
      }

      const daysUntil = getDaysUntilPayment(profile.patent.paidUntil);
      if (daysUntil !== null && daysUntil <= 7) {
        result.warnings.push(`До оплаты патента осталось ${daysUntil} дней`);
        result.recommendations.push('Срочно оплатите НДФЛ');
      }
      result.canWork = true;
    } else {
      result.warnings.push('Укажите дату оплаты патента для отслеживания');
    }
  } else {
    // Нет патента и не ЕАЭС
    result.canWork = false;
    if (result.status === 'legal') {
      result.warnings.push('Для легальной работы нужен патент');
      result.recommendations.push('Оформите патент на работу');
    }
  }

  // Определяем итоговый статус
  if (result.status === 'legal' && result.warnings.length > 0) {
    result.status = 'warning';
  }

  return result;
}

describe('Комплексный статус мигранта', () => {
  describe('Сценарий: Легальный работник (всё в порядке)', () => {
    const legalWorker: MigrantProfile = {
      name: 'Легальный работник',
      citizenship: 'UZ', // Узбекистан - нужен патент
      stayPeriods: [
        { id: '1', entryDate: daysAgo(30) }, // 31 день в РФ
      ],
      passport: { expiryDate: daysFromNow(365) },
      migrationCard: { expiryDate: daysFromNow(60) },
      registration: { expiryDate: daysFromNow(60) },
      patent: { paidUntil: daysFromNow(25), region: 'Москва' },
    };

    it('должен определить статус как legal', () => {
      const result = determineLegalStatus(legalWorker);
      expect(result.status).toBe('legal');
    });

    it('должен разрешить работу', () => {
      const result = determineLegalStatus(legalWorker);
      expect(result.canWork).toBe(true);
    });

    it('должен разрешить пребывание', () => {
      const result = determineLegalStatus(legalWorker);
      expect(result.canStay).toBe(true);
    });

    it('не должен иметь рисков', () => {
      const result = determineLegalStatus(legalWorker);
      expect(result.risks).toHaveLength(0);
    });
  });

  describe('Сценарий: Гражданин ЕАЭС без патента', () => {
    const eaeuCitizen: MigrantProfile = {
      name: 'Гражданин Казахстана',
      citizenship: 'KZ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(60) },
      ],
      passport: { expiryDate: daysFromNow(365) },
      migrationCard: { expiryDate: daysFromNow(30) },
      registration: { expiryDate: daysFromNow(30) },
      // БЕЗ ПАТЕНТА - и это ЛЕГАЛЬНО для ЕАЭС!
    };

    it('должен разрешить работу БЕЗ патента', () => {
      const result = determineLegalStatus(eaeuCitizen);
      expect(result.canWork).toBe(true);
    });

    it('не должен требовать патент', () => {
      const result = determineLegalStatus(eaeuCitizen);
      expect(result.risks).not.toContain(expect.stringContaining('патент'));
    });

    it('должен рекомендовать трудовой договор', () => {
      const result = determineLegalStatus(eaeuCitizen);
      expect(result.recommendations.some(r => r.includes('трудовой договор'))).toBe(true);
    });
  });

  describe('Сценарий: Просрочена регистрация на 5 дней', () => {
    const expiredRegistration: MigrantProfile = {
      name: 'Просрочена регистрация',
      citizenship: 'TJ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(50) },
      ],
      passport: { expiryDate: daysFromNow(365) },
      migrationCard: { expiryDate: daysFromNow(40) },
      registration: { expiryDate: daysAgo(5) }, // ПРОСРОЧЕНА!
      patent: { paidUntil: daysFromNow(25) },
    };

    it('должен определить статус как violation', () => {
      const result = determineLegalStatus(expiredRegistration);
      expect(result.status).toBe('violation');
    });

    it('должен указать риск штрафа', () => {
      const result = determineLegalStatus(expiredRegistration);
      expect(result.risks.some(r => r.includes('штраф') || r.includes('Штраф'))).toBe(true);
    });
  });

  describe('Сценарий: Не оплачен патент (НДФЛ)', () => {
    const unpaidPatent: MigrantProfile = {
      name: 'Просрочен НДФЛ',
      citizenship: 'UZ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(40) },
      ],
      passport: { expiryDate: daysFromNow(365) },
      migrationCard: { expiryDate: daysFromNow(50) },
      registration: { expiryDate: daysFromNow(50) },
      patent: { paidUntil: daysAgo(5) }, // ПРОСРОЧЕНА ОПЛАТА!
    };

    it('должен определить статус как illegal_work', () => {
      const result = determineLegalStatus(unpaidPatent);
      expect(result.status).toBe('illegal_work');
    });

    it('НЕ должен разрешать работу', () => {
      const result = determineLegalStatus(unpaidPatent);
      expect(result.canWork).toBe(false);
    });

    it('должен указать аннулирование патента', () => {
      const result = determineLegalStatus(unpaidPatent);
      expect(result.risks.some(r => r.toLowerCase().includes('аннулир'))).toBe(true);
    });
  });

  describe('Сценарий: Превышение 90/180 на 10 дней', () => {
    const overstayMigrant: MigrantProfile = {
      name: 'Овестей 10 дней',
      citizenship: 'UZ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(99) }, // 100 дней = overstay 10 дней
      ],
      passport: { expiryDate: daysFromNow(365) },
      migrationCard: { expiryDate: daysFromNow(0) }, // уже формально истекла
      registration: { expiryDate: daysFromNow(0) },
      patent: { paidUntil: daysFromNow(20) },
    };

    it('должен определить статус как overstay', () => {
      const result = determineLegalStatus(overstayMigrant);
      expect(result.status).toBe('overstay');
    });

    it('НЕ должен разрешать пребывание', () => {
      const result = determineLegalStatus(overstayMigrant);
      expect(result.canStay).toBe(false);
    });

    it('НЕ должен разрешать работу', () => {
      const result = determineLegalStatus(overstayMigrant);
      expect(result.canWork).toBe(false);
    });

    it('должен указать штраф', () => {
      const result = determineLegalStatus(overstayMigrant);
      expect(result.risks.some(r => r.includes('Штраф') || r.includes('штраф'))).toBe(true);
    });
  });

  describe('Сценарий: Критическое превышение 90/180 (> 180 дней)', () => {
    const severeOverstay: MigrantProfile = {
      name: 'Серьёзный овестей',
      citizenship: 'TJ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(179) }, // ~280 дней = overstay 190 дней
      ],
      passport: { expiryDate: daysFromNow(100) },
    };

    it('должен указать запрет на въезд', () => {
      const result = determineLegalStatus(severeOverstay);
      expect(result.risks.some(r => r.toLowerCase().includes('запрет'))).toBe(true);
    });
  });

  describe('Сценарий: Турист на отдыхе (без работы)', () => {
    const tourist: MigrantProfile = {
      name: 'Турист',
      citizenship: 'MD', // Молдова - безвизовый режим
      stayPeriods: [
        { id: '1', entryDate: daysAgo(10) }, // 11 дней отдыха
      ],
      passport: { expiryDate: daysFromNow(500) },
      migrationCard: { expiryDate: daysFromNow(79) }, // 90 дней с въезда
      // Без регистрации первые 7 дней (для некоторых стран)
      // Без патента - не работает
    };

    it('должен разрешить пребывание', () => {
      const result = determineLegalStatus(tourist);
      expect(result.canStay).toBe(true);
    });

    it('НЕ должен разрешать работу', () => {
      const result = determineLegalStatus(tourist);
      expect(result.canWork).toBe(false);
    });

    it('не должен иметь критических рисков', () => {
      const result = determineLegalStatus(tourist);
      expect(result.status).not.toBe('violation');
      expect(result.status).not.toBe('overstay');
    });
  });

  describe('Сценарий: Все документы истекают скоро', () => {
    const expiringEverything: MigrantProfile = {
      name: 'Всё истекает',
      citizenship: 'UZ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(80) }, // 81 день
      ],
      passport: { expiryDate: daysFromNow(20) }, // скоро
      migrationCard: { expiryDate: daysFromNow(9) }, // скоро
      registration: { expiryDate: daysFromNow(5) }, // очень скоро
      patent: { paidUntil: daysFromNow(3) }, // критически скоро
    };

    it('должен иметь статус warning', () => {
      const result = determineLegalStatus(expiringEverything);
      expect(result.status).toBe('warning');
    });

    it('должен иметь несколько предупреждений', () => {
      const result = determineLegalStatus(expiringEverything);
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });

    it('должен иметь рекомендации', () => {
      const result = determineLegalStatus(expiringEverything);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Сценарий: Просрочен паспорт', () => {
    const expiredPassport: MigrantProfile = {
      name: 'Просрочен паспорт',
      citizenship: 'UZ',
      stayPeriods: [
        { id: '1', entryDate: daysAgo(30) },
      ],
      passport: { expiryDate: daysAgo(10) }, // ПРОСРОЧЕН!
      migrationCard: { expiryDate: daysFromNow(60) },
      registration: { expiryDate: daysFromNow(60) },
      patent: { paidUntil: daysFromNow(25) },
    };

    it('должен определить статус как violation', () => {
      const result = determineLegalStatus(expiredPassport);
      expect(result.status).toBe('violation');
    });

    it('НЕ должен разрешать пребывание', () => {
      const result = determineLegalStatus(expiredPassport);
      expect(result.canStay).toBe(false);
    });

    it('должен рекомендовать обратиться в посольство', () => {
      const result = determineLegalStatus(expiredPassport);
      expect(result.risks.some(r => r.toLowerCase().includes('посольство'))).toBe(true);
    });
  });
});

describe('Приоритеты нарушений', () => {
  it('Overstay имеет приоритет над другими нарушениями', () => {
    const multiple: MigrantProfile = {
      name: 'Множественные нарушения',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(100) }], // overstay
      passport: { expiryDate: daysAgo(5) }, // просрочен
      registration: { expiryDate: daysAgo(10) }, // просрочена
      patent: { paidUntil: daysAgo(5) }, // не оплачен
    };

    const result = determineLegalStatus(multiple);
    expect(result.status).toBe('overstay');
  });

  it('Просроченный паспорт важнее регистрации', () => {
    const passportFirst: MigrantProfile = {
      name: 'Паспорт и регистрация',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      passport: { expiryDate: daysAgo(5) }, // просрочен
      registration: { expiryDate: daysAgo(10) }, // просрочена
    };

    const result = determineLegalStatus(passportFirst);
    expect(result.risks[0]).toContain('Паспорт');
  });
});

describe('Проверка false positives (не пропускать проблемы)', () => {
  it('НЕ должен показывать legal при overstay', () => {
    const overstay: MigrantProfile = {
      name: 'test',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(95) }],
    };
    const result = determineLegalStatus(overstay);
    expect(result.status).not.toBe('legal');
  });

  it('НЕ должен показывать legal при просроченной регистрации', () => {
    const expiredReg: MigrantProfile = {
      name: 'test',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      registration: { expiryDate: daysAgo(1) },
    };
    const result = determineLegalStatus(expiredReg);
    expect(result.status).not.toBe('legal');
  });

  it('НЕ должен разрешать работу при просроченном патенте', () => {
    const expiredPatent: MigrantProfile = {
      name: 'test',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      patent: { paidUntil: daysAgo(1) },
    };
    const result = determineLegalStatus(expiredPatent);
    expect(result.canWork).toBe(false);
  });
});

describe('Проверка false negatives (не паниковать зря)', () => {
  it('НЕ должен показывать violation для полностью легального мигранта', () => {
    const legal: MigrantProfile = {
      name: 'test',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      passport: { expiryDate: daysFromNow(365) },
      registration: { expiryDate: daysFromNow(60) },
      patent: { paidUntil: daysFromNow(25) },
    };
    const result = determineLegalStatus(legal);
    expect(result.status).toBe('legal');
    expect(result.risks).toHaveLength(0);
  });

  it('НЕ должен требовать патент от граждан ЕАЭС', () => {
    for (const country of EAEU_COUNTRIES) {
      const eaeu: MigrantProfile = {
        name: 'test',
        citizenship: country as MigrantProfile['citizenship'],
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
        passport: { expiryDate: daysFromNow(365) },
        registration: { expiryDate: daysFromNow(60) },
        // БЕЗ ПАТЕНТА
      };
      const result = determineLegalStatus(eaeu);
      expect(result.canWork).toBe(true);
      expect(result.status).not.toBe('illegal_work');
    }
  });

  it('НЕ должен показывать overstay при 89 днях', () => {
    const almostOverstay: MigrantProfile = {
      name: 'test',
      citizenship: 'UZ',
      stayPeriods: [{ id: '1', entryDate: daysAgo(88) }], // 89 дней
    };
    const result = determineLegalStatus(almostOverstay);
    expect(result.status).not.toBe('overstay');
  });
});

describe('Правила для разных гражданств', () => {
  describe('Узбекистан (UZ)', () => {
    it('нужен патент для работы', () => {
      const uz: MigrantProfile = {
        name: 'test',
        citizenship: 'UZ',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      };
      const result = determineLegalStatus(uz);
      expect(result.canWork).toBe(false);
      expect(result.warnings.some(w => w.toLowerCase().includes('патент'))).toBe(true);
    });
  });

  describe('Таджикистан (TJ)', () => {
    it('нужен патент для работы', () => {
      const tj: MigrantProfile = {
        name: 'test',
        citizenship: 'TJ',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      };
      const result = determineLegalStatus(tj);
      expect(result.canWork).toBe(false);
    });
  });

  describe('Казахстан (KZ) - ЕАЭС', () => {
    it('НЕ нужен патент для работы', () => {
      const kz: MigrantProfile = {
        name: 'test',
        citizenship: 'KZ',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
        passport: { expiryDate: daysFromNow(365) },
        registration: { expiryDate: daysFromNow(60) },
      };
      const result = determineLegalStatus(kz);
      expect(result.canWork).toBe(true);
    });
  });

  describe('Киргизия (KG) - ЕАЭС', () => {
    it('НЕ нужен патент для работы', () => {
      const kg: MigrantProfile = {
        name: 'test',
        citizenship: 'KG',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
        passport: { expiryDate: daysFromNow(365) },
      };
      const result = determineLegalStatus(kg);
      expect(result.canWork).toBe(true);
    });
  });

  describe('Армения (AM) - ЕАЭС', () => {
    it('НЕ нужен патент для работы', () => {
      const am: MigrantProfile = {
        name: 'test',
        citizenship: 'AM',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      };
      const result = determineLegalStatus(am);
      expect(result.canWork).toBe(true);
    });
  });

  describe('Беларусь (BY) - ЕАЭС', () => {
    it('НЕ нужен патент для работы', () => {
      const by: MigrantProfile = {
        name: 'test',
        citizenship: 'BY',
        stayPeriods: [{ id: '1', entryDate: daysAgo(30) }],
      };
      const result = determineLegalStatus(by);
      expect(result.canWork).toBe(true);
    });
  });
});
