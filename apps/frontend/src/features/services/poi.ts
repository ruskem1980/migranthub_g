export type POIType = 'mvd' | 'mmc' | 'medical' | 'exam' | 'mosque';

export interface POI {
  id: string;
  type: POIType;
  name: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  phone?: string;
  workingHours?: string;
  metro?: string;
  region: string;
}

export const POI_TYPE_LABELS: Record<POIType, string> = {
  mvd: 'Отделы МВД',
  mmc: 'Миграционные центры',
  medical: 'Медицинские центры',
  exam: 'Центры экзаменов',
  mosque: 'Мечети',
};

export const POI_TYPE_ICONS: Record<POIType, string> = {
  mvd: '👮‍♂️',
  mmc: '🏛️',
  medical: '🏥',
  exam: '🎓',
  mosque: '🕌',
};

// Sample POI data for Moscow
export const POI_DATA: POI[] = [
  // MVD
  {
    id: 'mvd-1',
    type: 'mvd',
    name: 'УВМ ГУ МВД России по г. Москве',
    address: 'ул. Большая Ордынка, д. 16/4, стр. 4',
    coordinates: [55.7396, 37.6283],
    phone: '+7 (495) 587-07-87',
    workingHours: 'Пн-Чт: 9:00-18:00, Пт: 9:00-16:45',
    metro: 'Третьяковская',
    region: 'Москва',
  },
  {
    id: 'mvd-2',
    type: 'mvd',
    name: 'Отдел по вопросам миграции УВД по ЦАО',
    address: 'ул. Средняя Калитниковская, д. 31',
    coordinates: [55.7312, 37.6756],
    phone: '+7 (495) 951-29-31',
    workingHours: 'Пн-Чт: 9:00-18:00, Пт: 9:00-16:45',
    metro: 'Таганская',
    region: 'Москва',
  },

  // MMC
  {
    id: 'mmc-1',
    type: 'mmc',
    name: 'ММЦ Сахарово',
    address: 'п. Вороновское, пос. ЛМС, владение 1',
    coordinates: [55.3472, 37.1989],
    phone: '+7 (495) 777-77-77',
    workingHours: 'Пн-Сб: 8:00-20:00',
    region: 'Москва',
  },
  {
    id: 'mmc-2',
    type: 'mmc',
    name: 'Многофункциональный миграционный центр',
    address: 'ул. Корнейчука, д. 37',
    coordinates: [55.8832, 37.5961],
    phone: '+7 (495) 777-77-77',
    workingHours: 'Пн-Пт: 9:00-18:00',
    metro: 'Бибирево',
    region: 'Москва',
  },

  // Medical
  {
    id: 'med-1',
    type: 'medical',
    name: 'Медицинский центр при ММЦ Сахарово',
    address: 'п. Вороновское, пос. ЛМС, владение 1',
    coordinates: [55.3472, 37.1989],
    phone: '+7 (495) 777-77-77',
    workingHours: 'Пн-Сб: 8:00-18:00',
    region: 'Москва',
  },
  {
    id: 'med-2',
    type: 'medical',
    name: 'Центр медицинских осмотров "Мигрант"',
    address: 'ул. Люблинская, д. 151',
    coordinates: [55.6567, 37.7617],
    phone: '+7 (495) 123-45-67',
    workingHours: 'Пн-Пт: 8:00-17:00',
    metro: 'Марьино',
    region: 'Москва',
  },

  // Exam centers
  {
    id: 'exam-1',
    type: 'exam',
    name: 'Центр тестирования РУДН',
    address: 'ул. Миклухо-Маклая, д. 10/2',
    coordinates: [55.6549, 37.5361],
    phone: '+7 (495) 434-52-00',
    workingHours: 'Пн-Пт: 9:00-18:00',
    metro: 'Юго-Западная',
    region: 'Москва',
  },
  {
    id: 'exam-2',
    type: 'exam',
    name: 'Центр тестирования МГУ',
    address: 'Ленинские горы, д. 1, стр. 52',
    coordinates: [55.7033, 37.5294],
    phone: '+7 (495) 939-10-00',
    workingHours: 'Пн-Пт: 10:00-17:00',
    metro: 'Университет',
    region: 'Москва',
  },

  // Mosques
  {
    id: 'mosque-1',
    type: 'mosque',
    name: 'Московская Соборная мечеть',
    address: 'Выползов пер., д. 7',
    coordinates: [55.7874, 37.5883],
    phone: '+7 (495) 681-46-22',
    workingHours: 'Ежедневно: 5:00-22:00',
    metro: 'Проспект Мира',
    region: 'Москва',
  },
  {
    id: 'mosque-2',
    type: 'mosque',
    name: 'Историческая мечеть',
    address: 'Большая Татарская ул., д. 28, стр. 1',
    coordinates: [55.7378, 37.6303],
    phone: '+7 (495) 951-69-04',
    workingHours: 'Ежедневно: 5:00-21:00',
    metro: 'Новокузнецкая',
    region: 'Москва',
  },
  {
    id: 'mosque-3',
    type: 'mosque',
    name: 'Мемориальная мечеть на Поклонной горе',
    address: 'ул. Минская, владение 2А',
    coordinates: [55.7306, 37.5062],
    phone: '+7 (499) 148-09-82',
    workingHours: 'Ежедневно: 6:00-21:00',
    metro: 'Парк Победы',
    region: 'Москва',
  },
];

export function getPOIByType(type: POIType): POI[] {
  return POI_DATA.filter((poi) => poi.type === type);
}

export function getPOIByRegion(region: string): POI[] {
  return POI_DATA.filter((poi) => poi.region === region);
}

export function openInYandexMaps(poi: POI): void {
  const [lat, lng] = poi.coordinates;
  const url = `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`;
  window.open(url, '_blank');
}

export function openRouteInYandexMaps(poi: POI, userLocation?: [number, number]): void {
  const [lat, lng] = poi.coordinates;
  if (userLocation) {
    const [userLat, userLng] = userLocation;
    const url = `https://yandex.ru/maps/?rtext=${userLat},${userLng}~${lat},${lng}&rtt=mt`;
    window.open(url, '_blank');
  } else {
    const url = `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=mt`;
    window.open(url, '_blank');
  }
}

export function openIn2GIS(poi: POI): void {
  const [lat, lng] = poi.coordinates;
  const url = `https://2gis.ru/search/${encodeURIComponent(poi.address)}`;
  window.open(url, '_blank');
}
