/**
 * Региональные штрафы согласно КоАП РФ ст.18.8
 * Актуально на: 2025
 *
 * Часть 1: Общий штраф 2000-5000₽ (все регионы кроме Москвы/СПб)
 * Часть 3: Повышенный штраф 5000-7000₽ (Москва и Санкт-Петербург)
 */

export const PENALTY_REGIONS = {
  MOSCOW_SPB: [
    'Москва',
    'Санкт-Петербург',
    'Moscow',
    'Saint Petersburg',
    'СПб',
    'Мск',
    'St. Petersburg',
    'St Petersburg',
    'Питер',
    'Петербург',
  ],
};

export interface RegistrationPenaltyInfo {
  min: number;
  max: number;
  formatted: string;
  lawReference: string;
}

/**
 * Получить информацию о штрафе за нарушение регистрации в зависимости от региона
 *
 * @param region - Название региона (опционально)
 * @returns Информация о штрафе с суммами и ссылкой на закон
 */
export function getRegistrationPenalty(region?: string): RegistrationPenaltyInfo {
  const isMoscowSpb =
    region &&
    PENALTY_REGIONS.MOSCOW_SPB.some((r) =>
      region.toLowerCase().includes(r.toLowerCase())
    );

  if (isMoscowSpb) {
    return {
      min: 5000,
      max: 7000,
      formatted: '5000-7000₽',
      lawReference: 'ч.3 ст.18.8 КоАП РФ',
    };
  }

  return {
    min: 2000,
    max: 5000,
    formatted: '2000-5000₽',
    lawReference: 'ч.1 ст.18.8 КоАП РФ',
  };
}

export interface OverstayConsequences {
  penalty: string;
  ban: string;
  lawReference: string;
}

/**
 * Получить последствия за превышение срока пребывания
 *
 * Градация последствий:
 * - До 30 дней: штраф 2000-5000₽, без запрета
 * - 31-180 дней: штраф + выдворение, запрет 3 года
 * - Более 180 дней: режим высылки, запрет 5-10 лет (ФЗ от 08.08.2024)
 *
 * @param overstayDays - Количество дней превышения
 * @returns Информация о последствиях
 */
export function getOverstayConsequences(overstayDays: number): OverstayConsequences {
  if (overstayDays <= 30) {
    return {
      penalty: '2000-5000₽',
      ban: 'Нет',
      lawReference: 'ч.1 ст.18.8 КоАП РФ',
    };
  } else if (overstayDays <= 180) {
    return {
      penalty: 'Штраф + выдворение',
      ban: '3 года',
      lawReference: 'ч.1.1 ст.18.8, ст.26 114-ФЗ',
    };
  } else {
    return {
      penalty: 'Режим высылки',
      ban: '5-10 лет',
      lawReference: 'ФЗ от 08.08.2024, с 05.02.2025',
    };
  }
}

/**
 * Получить штраф за превышение срока с учётом региона
 *
 * @param overstayDays - Количество дней превышения
 * @param region - Название региона (опционально)
 * @returns Информация о штрафе
 */
export function getOverstayPenalty(overstayDays: number, region?: string): RegistrationPenaltyInfo {
  // Для любого overstay применяется региональная логика штрафов
  const basePenalty = getRegistrationPenalty(region);

  // Для серьёзных нарушений штраф не применим - идёт выдворение/режим высылки
  if (overstayDays > 30) {
    const consequences = getOverstayConsequences(overstayDays);
    return {
      min: 0,
      max: 0,
      formatted: consequences.penalty,
      lawReference: consequences.lawReference,
    };
  }

  return basePenalty;
}
