/**
 * Russian Cities Reference Data
 * All cities with population > 50,000 people (~170 cities)
 * Data source: Russian Federal State Statistics Service (Rosstat)
 */

export interface RussianCity {
  id: string; // slug: "moscow", "saint-petersburg"
  name: {
    ru: string;
    en: string;
  };
  regionCode: string; // Russian region code: "77", "78", "50"
  population?: number; // approximate population
}

/**
 * All Russian cities with population > 50,000
 * Sorted by population (descending)
 */
export const RUSSIAN_CITIES: RussianCity[] = [
  // Cities with population > 1,000,000
  { id: 'moscow', name: { ru: 'Москва', en: 'Moscow' }, regionCode: '77', population: 12600000 },
  { id: 'saint-petersburg', name: { ru: 'Санкт-Петербург', en: 'Saint Petersburg' }, regionCode: '78', population: 5400000 },
  { id: 'novosibirsk', name: { ru: 'Новосибирск', en: 'Novosibirsk' }, regionCode: '54', population: 1625000 },
  { id: 'yekaterinburg', name: { ru: 'Екатеринбург', en: 'Yekaterinburg' }, regionCode: '66', population: 1495000 },
  { id: 'kazan', name: { ru: 'Казань', en: 'Kazan' }, regionCode: '16', population: 1260000 },
  { id: 'nizhny-novgorod', name: { ru: 'Нижний Новгород', en: 'Nizhny Novgorod' }, regionCode: '52', population: 1230000 },
  { id: 'chelyabinsk', name: { ru: 'Челябинск', en: 'Chelyabinsk' }, regionCode: '74', population: 1190000 },
  { id: 'samara', name: { ru: 'Самара', en: 'Samara' }, regionCode: '63', population: 1170000 },
  { id: 'omsk', name: { ru: 'Омск', en: 'Omsk' }, regionCode: '55', population: 1140000 },
  { id: 'rostov-on-don', name: { ru: 'Ростов-на-Дону', en: 'Rostov-on-Don' }, regionCode: '61', population: 1135000 },
  { id: 'ufa', name: { ru: 'Уфа', en: 'Ufa' }, regionCode: '02', population: 1125000 },
  { id: 'krasnoyarsk', name: { ru: 'Красноярск', en: 'Krasnoyarsk' }, regionCode: '24', population: 1095000 },
  { id: 'voronezh', name: { ru: 'Воронеж', en: 'Voronezh' }, regionCode: '36', population: 1050000 },
  { id: 'perm', name: { ru: 'Пермь', en: 'Perm' }, regionCode: '59', population: 1055000 },
  { id: 'volgograd', name: { ru: 'Волгоград', en: 'Volgograd' }, regionCode: '34', population: 1005000 },

  // Cities with population 500,000 - 1,000,000
  { id: 'krasnodar', name: { ru: 'Краснодар', en: 'Krasnodar' }, regionCode: '23', population: 974000 },
  { id: 'saratov', name: { ru: 'Саратов', en: 'Saratov' }, regionCode: '64', population: 830000 },
  { id: 'tyumen', name: { ru: 'Тюмень', en: 'Tyumen' }, regionCode: '72', population: 816000 },
  { id: 'tolyatti', name: { ru: 'Тольятти', en: 'Tolyatti' }, regionCode: '63', population: 690000 },
  { id: 'izhevsk', name: { ru: 'Ижевск', en: 'Izhevsk' }, regionCode: '18', population: 650000 },
  { id: 'barnaul', name: { ru: 'Барнаул', en: 'Barnaul' }, regionCode: '22', population: 630000 },
  { id: 'ulyanovsk', name: { ru: 'Ульяновск', en: 'Ulyanovsk' }, regionCode: '73', population: 625000 },
  { id: 'irkutsk', name: { ru: 'Иркутск', en: 'Irkutsk' }, regionCode: '38', population: 620000 },
  { id: 'khabarovsk', name: { ru: 'Хабаровск', en: 'Khabarovsk' }, regionCode: '27', population: 610000 },
  { id: 'yaroslavl', name: { ru: 'Ярославль', en: 'Yaroslavl' }, regionCode: '76', population: 600000 },
  { id: 'vladivostok', name: { ru: 'Владивосток', en: 'Vladivostok' }, regionCode: '25', population: 600000 },
  { id: 'makhachkala', name: { ru: 'Махачкала', en: 'Makhachkala' }, regionCode: '05', population: 596000 },
  { id: 'tomsk', name: { ru: 'Томск', en: 'Tomsk' }, regionCode: '70', population: 575000 },
  { id: 'orenburg', name: { ru: 'Оренбург', en: 'Orenburg' }, regionCode: '56', population: 565000 },
  { id: 'kemerovo', name: { ru: 'Кемерово', en: 'Kemerovo' }, regionCode: '42', population: 555000 },
  { id: 'novokuznetsk', name: { ru: 'Новокузнецк', en: 'Novokuznetsk' }, regionCode: '42', population: 550000 },
  { id: 'ryazan', name: { ru: 'Рязань', en: 'Ryazan' }, regionCode: '62', population: 540000 },
  { id: 'astrakhan', name: { ru: 'Астрахань', en: 'Astrakhan' }, regionCode: '30', population: 530000 },
  { id: 'naberezhnye-chelny', name: { ru: 'Набережные Челны', en: 'Naberezhnye Chelny' }, regionCode: '16', population: 530000 },
  { id: 'penza', name: { ru: 'Пенза', en: 'Penza' }, regionCode: '58', population: 520000 },
  { id: 'lipetsk', name: { ru: 'Липецк', en: 'Lipetsk' }, regionCode: '48', population: 510000 },
  { id: 'kirov', name: { ru: 'Киров', en: 'Kirov' }, regionCode: '43', population: 500000 },

  // Cities with population 300,000 - 500,000
  { id: 'cheboksary', name: { ru: 'Чебоксары', en: 'Cheboksary' }, regionCode: '21', population: 490000 },
  { id: 'balashikha', name: { ru: 'Балашиха', en: 'Balashikha' }, regionCode: '50', population: 485000 },
  { id: 'kaliningrad', name: { ru: 'Калининград', en: 'Kaliningrad' }, regionCode: '39', population: 480000 },
  { id: 'tula', name: { ru: 'Тула', en: 'Tula' }, regionCode: '71', population: 475000 },
  { id: 'kursk', name: { ru: 'Курск', en: 'Kursk' }, regionCode: '46', population: 450000 },
  { id: 'sevastopol', name: { ru: 'Севастополь', en: 'Sevastopol' }, regionCode: '92', population: 443000 },
  { id: 'sochi', name: { ru: 'Сочи', en: 'Sochi' }, regionCode: '23', population: 440000 },
  { id: 'stavropol', name: { ru: 'Ставрополь', en: 'Stavropol' }, regionCode: '26', population: 435000 },
  { id: 'ulan-ude', name: { ru: 'Улан-Удэ', en: 'Ulan-Ude' }, regionCode: '03', population: 430000 },
  { id: 'tver', name: { ru: 'Тверь', en: 'Tver' }, regionCode: '69', population: 425000 },
  { id: 'magnitogorsk', name: { ru: 'Магнитогорск', en: 'Magnitogorsk' }, regionCode: '74', population: 415000 },
  { id: 'ivanovo', name: { ru: 'Иваново', en: 'Ivanovo' }, regionCode: '37', population: 405000 },
  { id: 'bryansk', name: { ru: 'Брянск', en: 'Bryansk' }, regionCode: '32', population: 400000 },
  { id: 'belgorod', name: { ru: 'Белгород', en: 'Belgorod' }, regionCode: '31', population: 395000 },
  { id: 'surgut', name: { ru: 'Сургут', en: 'Surgut' }, regionCode: '86', population: 390000 },
  { id: 'vladimir', name: { ru: 'Владимир', en: 'Vladimir' }, regionCode: '33', population: 355000 },
  { id: 'nizhny-tagil', name: { ru: 'Нижний Тагил', en: 'Nizhny Tagil' }, regionCode: '66', population: 350000 },
  { id: 'arkhangelsk', name: { ru: 'Архангельск', en: 'Arkhangelsk' }, regionCode: '29', population: 350000 },
  { id: 'chita', name: { ru: 'Чита', en: 'Chita' }, regionCode: '75', population: 350000 },
  { id: 'kaluga', name: { ru: 'Калуга', en: 'Kaluga' }, regionCode: '40', population: 340000 },
  { id: 'smolensk', name: { ru: 'Смоленск', en: 'Smolensk' }, regionCode: '67', population: 330000 },
  { id: 'volzhsky', name: { ru: 'Волжский', en: 'Volzhsky' }, regionCode: '34', population: 325000 },
  { id: 'kurgan', name: { ru: 'Курган', en: 'Kurgan' }, regionCode: '45', population: 320000 },
  { id: 'cherepovets', name: { ru: 'Череповец', en: 'Cherepovets' }, regionCode: '35', population: 315000 },
  { id: 'orel', name: { ru: 'Орёл', en: 'Oryol' }, regionCode: '57', population: 310000 },
  { id: 'saransk', name: { ru: 'Саранск', en: 'Saransk' }, regionCode: '13', population: 305000 },
  { id: 'vologda', name: { ru: 'Вологда', en: 'Vologda' }, regionCode: '35', population: 305000 },
  { id: 'yakutsk', name: { ru: 'Якутск', en: 'Yakutsk' }, regionCode: '14', population: 300000 },

  // Cities with population 200,000 - 300,000
  { id: 'vladikavkaz', name: { ru: 'Владикавказ', en: 'Vladikavkaz' }, regionCode: '15', population: 300000 },
  { id: 'podolsk', name: { ru: 'Подольск', en: 'Podolsk' }, regionCode: '50', population: 295000 },
  { id: 'grozny', name: { ru: 'Грозный', en: 'Grozny' }, regionCode: '20', population: 290000 },
  { id: 'murmansk', name: { ru: 'Мурманск', en: 'Murmansk' }, regionCode: '51', population: 285000 },
  { id: 'tambov', name: { ru: 'Тамбов', en: 'Tambov' }, regionCode: '68', population: 280000 },
  { id: 'sterlitamak', name: { ru: 'Стерлитамак', en: 'Sterlitamak' }, regionCode: '02', population: 275000 },
  { id: 'petrozavodsk', name: { ru: 'Петрозаводск', en: 'Petrozavodsk' }, regionCode: '10', population: 270000 },
  { id: 'kostroma', name: { ru: 'Кострома', en: 'Kostroma' }, regionCode: '44', population: 270000 },
  { id: 'nizhnevartovsk', name: { ru: 'Нижневартовск', en: 'Nizhnevartovsk' }, regionCode: '86', population: 270000 },
  { id: 'novorossiysk', name: { ru: 'Новороссийск', en: 'Novorossiysk' }, regionCode: '23', population: 265000 },
  { id: 'yoshkar-ola', name: { ru: 'Йошкар-Ола', en: 'Yoshkar-Ola' }, regionCode: '12', population: 265000 },
  { id: 'taganrog', name: { ru: 'Таганрог', en: 'Taganrog' }, regionCode: '61', population: 260000 },
  { id: 'komsomolsk-on-amur', name: { ru: 'Комсомольск-на-Амуре', en: 'Komsomolsk-on-Amur' }, regionCode: '27', population: 250000 },
  { id: 'khimki', name: { ru: 'Химки', en: 'Khimki' }, regionCode: '50', population: 250000 },
  { id: 'syktyvkar', name: { ru: 'Сыктывкар', en: 'Syktyvkar' }, regionCode: '11', population: 245000 },
  { id: 'nalchik', name: { ru: 'Нальчик', en: 'Nalchik' }, regionCode: '07', population: 240000 },
  { id: 'nizhnekamsk', name: { ru: 'Нижнекамск', en: 'Nizhnekamsk' }, regionCode: '16', population: 235000 },
  { id: 'shakhty', name: { ru: 'Шахты', en: 'Shakhty' }, regionCode: '61', population: 235000 },
  { id: 'dzerzhinsk', name: { ru: 'Дзержинск', en: 'Dzerzhinsk' }, regionCode: '52', population: 230000 },
  { id: 'bratsk', name: { ru: 'Братск', en: 'Bratsk' }, regionCode: '38', population: 230000 },
  { id: 'orsk', name: { ru: 'Орск', en: 'Orsk' }, regionCode: '56', population: 225000 },
  { id: 'angarsk', name: { ru: 'Ангарск', en: 'Angarsk' }, regionCode: '38', population: 225000 },
  { id: 'stary-oskol', name: { ru: 'Старый Оскол', en: 'Stary Oskol' }, regionCode: '31', population: 225000 },
  { id: 'mytishchi', name: { ru: 'Мытищи', en: 'Mytishchi' }, regionCode: '50', population: 222000 },
  { id: 'biysk', name: { ru: 'Бийск', en: 'Biysk' }, regionCode: '22', population: 220000 },
  { id: 'prokopyevsk', name: { ru: 'Прокопьевск', en: 'Prokopyevsk' }, regionCode: '42', population: 220000 },
  { id: 'engels', name: { ru: 'Энгельс', en: 'Engels' }, regionCode: '64', population: 215000 },
  { id: 'rybinsk', name: { ru: 'Рыбинск', en: 'Rybinsk' }, regionCode: '76', population: 215000 },
  { id: 'pskov', name: { ru: 'Псков', en: 'Pskov' }, regionCode: '60', population: 210000 },
  { id: 'lyubertsy', name: { ru: 'Люберцы', en: 'Lyubertsy' }, regionCode: '50', population: 210000 },
  { id: 'blagoveshchensk', name: { ru: 'Благовещенск', en: 'Blagoveshchensk' }, regionCode: '28', population: 210000 },
  { id: 'yuzhno-sakhalinsk', name: { ru: 'Южно-Сахалинск', en: 'Yuzhno-Sakhalinsk' }, regionCode: '65', population: 200000 },
  { id: 'armavir', name: { ru: 'Армавир', en: 'Armavir' }, regionCode: '23', population: 190000 },

  // Cities with population 100,000 - 200,000
  { id: 'korolev', name: { ru: 'Королёв', en: 'Korolyov' }, regionCode: '50', population: 185000 },
  { id: 'abakan', name: { ru: 'Абакан', en: 'Abakan' }, regionCode: '19', population: 185000 },
  { id: 'syzran', name: { ru: 'Сызрань', en: 'Syzran' }, regionCode: '63', population: 180000 },
  { id: 'norilsk', name: { ru: 'Норильск', en: 'Norilsk' }, regionCode: '24', population: 175000 },
  { id: 'volgodonsk', name: { ru: 'Волгодонск', en: 'Volgodonsk' }, regionCode: '61', population: 175000 },
  { id: 'ussuriysk', name: { ru: 'Уссурийск', en: 'Ussuriysk' }, regionCode: '25', population: 170000 },
  { id: 'kamensk-uralsky', name: { ru: 'Каменск-Уральский', en: 'Kamensk-Uralsky' }, regionCode: '66', population: 170000 },
  { id: 'krasnogorsk', name: { ru: 'Красногорск', en: 'Krasnogorsk' }, regionCode: '50', population: 170000 },
  { id: 'petropavlovsk-kamchatsky', name: { ru: 'Петропавловск-Камчатский', en: 'Petropavlovsk-Kamchatsky' }, regionCode: '41', population: 165000 },
  { id: 'zlatoust', name: { ru: 'Златоуст', en: 'Zlatoust' }, regionCode: '74', population: 165000 },
  { id: 'elektrostal', name: { ru: 'Электросталь', en: 'Elektrostal' }, regionCode: '50', population: 160000 },
  { id: 'almetyevsk', name: { ru: 'Альметьевск', en: 'Almetyevsk' }, regionCode: '16', population: 155000 },
  { id: 'salavat', name: { ru: 'Салават', en: 'Salavat' }, regionCode: '02', population: 155000 },
  { id: 'miass', name: { ru: 'Миасс', en: 'Miass' }, regionCode: '74', population: 155000 },
  { id: 'kerch', name: { ru: 'Керчь', en: 'Kerch' }, regionCode: '91', population: 150000 },
  { id: 'kopeysk', name: { ru: 'Копейск', en: 'Kopeysk' }, regionCode: '74', population: 150000 },
  { id: 'pyatigorsk', name: { ru: 'Пятигорск', en: 'Pyatigorsk' }, regionCode: '26', population: 145000 },
  { id: 'odintsovo', name: { ru: 'Одинцово', en: 'Odintsovo' }, regionCode: '50', population: 145000 },
  { id: 'khasavyurt', name: { ru: 'Хасавюрт', en: 'Khasavyurt' }, regionCode: '05', population: 140000 },
  { id: 'novocherkassk', name: { ru: 'Новочеркасск', en: 'Novocherkassk' }, regionCode: '61', population: 140000 },
  { id: 'rubtsovsk', name: { ru: 'Рубцовск', en: 'Rubtsovsk' }, regionCode: '22', population: 140000 },
  { id: 'kolomna', name: { ru: 'Коломна', en: 'Kolomna' }, regionCode: '50', population: 140000 },
  { id: 'maykop', name: { ru: 'Майкоп', en: 'Maykop' }, regionCode: '01', population: 140000 },
  { id: 'berezniki', name: { ru: 'Березники', en: 'Berezniki' }, regionCode: '59', population: 140000 },
  { id: 'neftekamsk', name: { ru: 'Нефтекамск', en: 'Neftekamsk' }, regionCode: '02', population: 135000 },
  { id: 'nefteyugansk', name: { ru: 'Нефтеюганск', en: 'Nefteyugansk' }, regionCode: '86', population: 130000 },
  { id: 'pervouralsk', name: { ru: 'Первоуральск', en: 'Pervouralsk' }, regionCode: '66', population: 130000 },
  { id: 'domodedovo', name: { ru: 'Домодедово', en: 'Domodedovo' }, regionCode: '50', population: 130000 },
  { id: 'derbent', name: { ru: 'Дербент', en: 'Derbent' }, regionCode: '05', population: 125000 },
  { id: 'bataysk', name: { ru: 'Батайск', en: 'Bataysk' }, regionCode: '61', population: 125000 },
  { id: 'oktyabrsky', name: { ru: 'Октябрьский', en: 'Oktyabrsky' }, regionCode: '02', population: 115000 },
  { id: 'novomoskovsk', name: { ru: 'Новомосковск', en: 'Novomoskovsk' }, regionCode: '71', population: 115000 },
  { id: 'serpukhov', name: { ru: 'Серпухов', en: 'Serpukhov' }, regionCode: '50', population: 115000 },
  { id: 'novocheboksarsk', name: { ru: 'Новочебоксарск', en: 'Novocheboksarsk' }, regionCode: '21', population: 115000 },
  { id: 'kamyshin', name: { ru: 'Камышин', en: 'Kamyshin' }, regionCode: '34', population: 110000 },
  { id: 'leninsk-kuznetsky', name: { ru: 'Ленинск-Кузнецкий', en: 'Leninsk-Kuznetsky' }, regionCode: '42', population: 110000 },
  { id: 'murom', name: { ru: 'Муром', en: 'Murom' }, regionCode: '33', population: 110000 },
  { id: 'novyy-urengoy', name: { ru: 'Новый Уренгой', en: 'Novy Urengoy' }, regionCode: '89', population: 110000 },
  { id: 'serov', name: { ru: 'Серов', en: 'Serov' }, regionCode: '66', population: 100000 },
  { id: 'severodvinsk', name: { ru: 'Северодвинск', en: 'Severodvinsk' }, regionCode: '29', population: 185000 },
  { id: 'obninsk', name: { ru: 'Обнинск', en: 'Obninsk' }, regionCode: '40', population: 115000 },
  { id: 'achinsk', name: { ru: 'Ачинск', en: 'Achinsk' }, regionCode: '24', population: 105000 },
  { id: 'kiselevsk', name: { ru: 'Киселёвск', en: 'Kiselyovsk' }, regionCode: '42', population: 100000 },
  { id: 'novotroitsk', name: { ru: 'Новотроицк', en: 'Novotroitsk' }, regionCode: '56', population: 100000 },
  { id: 'noyabrsk', name: { ru: 'Ноябрьск', en: 'Noyabrsk' }, regionCode: '89', population: 110000 },
  { id: 'elista', name: { ru: 'Элиста', en: 'Elista' }, regionCode: '08', population: 105000 },
  { id: 'arzamas', name: { ru: 'Арзамас', en: 'Arzamas' }, regionCode: '52', population: 105000 },
  { id: 'shchyolkovo', name: { ru: 'Щёлково', en: 'Shchyolkovo' }, regionCode: '50', population: 130000 },
  { id: 'kislovodsk', name: { ru: 'Кисловодск', en: 'Kislovodsk' }, regionCode: '26', population: 130000 },
  { id: 'novokuibyshevsk', name: { ru: 'Новокуйбышевск', en: 'Novokuybyshevsk' }, regionCode: '63', population: 100000 },
  { id: 'zhukovsky', name: { ru: 'Жуковский', en: 'Zhukovsky' }, regionCode: '50', population: 110000 },
  { id: 'yevpatoriya', name: { ru: 'Евпатория', en: 'Yevpatoriya' }, regionCode: '91', population: 105000 },

  // Cities with population 50,000 - 100,000
  { id: 'ramenskoye', name: { ru: 'Раменское', en: 'Ramenskoye' }, regionCode: '50', population: 95000 },
  { id: 'zheleznogorsk', name: { ru: 'Железногорск', en: 'Zheleznogorsk' }, regionCode: '46', population: 95000 },
  { id: 'dolgoprudny', name: { ru: 'Долгопрудный', en: 'Dolgoprudny' }, regionCode: '50', population: 95000 },
  { id: 'novoshakhtinsk', name: { ru: 'Новошахтинск', en: 'Novoshakhtinsk' }, regionCode: '61', population: 95000 },
  { id: 'magadan', name: { ru: 'Магадан', en: 'Magadan' }, regionCode: '49', population: 92000 },
  { id: 'pushkino', name: { ru: 'Пушкино', en: 'Pushkino' }, regionCode: '50', population: 90000 },
  { id: 'reutov', name: { ru: 'Реутов', en: 'Reutov' }, regionCode: '50', population: 90000 },
  { id: 'kyzyl', name: { ru: 'Кызыл', en: 'Kyzyl' }, regionCode: '17', population: 120000 },
  { id: 'mezhdurechensk', name: { ru: 'Междуреченск', en: 'Mezhdurechensk' }, regionCode: '42', population: 95000 },
  { id: 'essentuki', name: { ru: 'Ессентуки', en: 'Essentuki' }, regionCode: '26', population: 85000 },
  { id: 'tobolsk', name: { ru: 'Тобольск', en: 'Tobolsk' }, regionCode: '72', population: 100000 },
  { id: 'sarapul', name: { ru: 'Сарапул', en: 'Sarapul' }, regionCode: '18', population: 95000 },
  { id: 'votkinsk', name: { ru: 'Воткинск', en: 'Votkinsk' }, regionCode: '18', population: 95000 },
  { id: 'nazran', name: { ru: 'Назрань', en: 'Nazran' }, regionCode: '06', population: 130000 },
  { id: 'kaspiysk', name: { ru: 'Каспийск', en: 'Kaspiysk' }, regionCode: '05', population: 120000 },
  { id: 'glazov', name: { ru: 'Глазов', en: 'Glazov' }, regionCode: '18', population: 90000 },
  { id: 'vorkuta', name: { ru: 'Воркута', en: 'Vorkuta' }, regionCode: '11', population: 55000 },
  { id: 'ukhta', name: { ru: 'Ухта', en: 'Ukhta' }, regionCode: '11', population: 95000 },
  { id: 'solikamsk', name: { ru: 'Соликамск', en: 'Solikamsk' }, regionCode: '59', population: 90000 },
  { id: 'chapaevsk', name: { ru: 'Чапаевск', en: 'Chapayevsk' }, regionCode: '63', population: 70000 },
  { id: 'mikhaylovsk', name: { ru: 'Михайловск', en: 'Mikhaylovsk' }, regionCode: '26', population: 85000 },
  { id: 'zhigulevsk', name: { ru: 'Жигулёвск', en: 'Zhigulyovsk' }, regionCode: '63', population: 55000 },
  { id: 'nevinnomyssk', name: { ru: 'Невинномысск', en: 'Nevinnomyssk' }, regionCode: '26', population: 115000 },
  { id: 'dimitrovgrad', name: { ru: 'Димитровград', en: 'Dimitrovgrad' }, regionCode: '73', population: 115000 },
  { id: 'bor', name: { ru: 'Бор', en: 'Bor' }, regionCode: '52', population: 75000 },
  { id: 'kineshma', name: { ru: 'Кинешма', en: 'Kineshma' }, regionCode: '37', population: 80000 },
  { id: 'buzuluk', name: { ru: 'Бузулук', en: 'Buzuluk' }, regionCode: '56', population: 85000 },
  { id: 'neryungri', name: { ru: 'Нерюнгри', en: 'Neryungri' }, regionCode: '14', population: 55000 },
  { id: 'kstovo', name: { ru: 'Кстово', en: 'Kstovo' }, regionCode: '52', population: 65000 },
  { id: 'troitsk', name: { ru: 'Троицк', en: 'Troitsk' }, regionCode: '74', population: 75000 },
  { id: 'zelenodolsk', name: { ru: 'Зеленодольск', en: 'Zelenodolsk' }, regionCode: '16', population: 95000 },
  { id: 'buynaksk', name: { ru: 'Буйнакск', en: 'Buynaksk' }, regionCode: '05', population: 65000 },
  { id: 'minusinsk', name: { ru: 'Минусинск', en: 'Minusinsk' }, regionCode: '24', population: 65000 },
  { id: 'tuapse', name: { ru: 'Туапсе', en: 'Tuapse' }, regionCode: '23', population: 60000 },
  { id: 'apatity', name: { ru: 'Апатиты', en: 'Apatity' }, regionCode: '51', population: 55000 },
  { id: 'birobidzhan', name: { ru: 'Биробиджан', en: 'Birobidzhan' }, regionCode: '79', population: 70000 },
  { id: 'yelabuga', name: { ru: 'Елабуга', en: 'Yelabuga' }, regionCode: '16', population: 75000 },
  { id: 'gukovo', name: { ru: 'Гуково', en: 'Gukovo' }, regionCode: '61', population: 60000 },
  { id: 'georgievsk', name: { ru: 'Георгиевск', en: 'Georgievsk' }, regionCode: '26', population: 65000 },
  { id: 'kansk', name: { ru: 'Канск', en: 'Kansk' }, regionCode: '24', population: 90000 },
  { id: 'svobodny', name: { ru: 'Свободный', en: 'Svobodny' }, regionCode: '28', population: 55000 },
  { id: 'belogorsk', name: { ru: 'Белогорск', en: 'Belogorsk' }, regionCode: '28', population: 65000 },
  { id: 'gorno-altaysk', name: { ru: 'Горно-Алтайск', en: 'Gorno-Altaysk' }, regionCode: '04', population: 65000 },
  { id: 'shadrinsk', name: { ru: 'Шадринск', en: 'Shadrinsk' }, regionCode: '45', population: 75000 },
  { id: 'ishim', name: { ru: 'Ишим', en: 'Ishim' }, regionCode: '72', population: 65000 },
  { id: 'kuznetsk', name: { ru: 'Кузнецк', en: 'Kuznetsk' }, regionCode: '58', population: 80000 },
  { id: 'kungur', name: { ru: 'Кунгур', en: 'Kungur' }, regionCode: '59', population: 65000 },
  { id: 'balakovo', name: { ru: 'Балаково', en: 'Balakovo' }, regionCode: '64', population: 185000 },
  { id: 'anapa', name: { ru: 'Анапа', en: 'Anapa' }, regionCode: '23', population: 80000 },
  { id: 'gelendzhik', name: { ru: 'Геленджик', en: 'Gelendzhik' }, regionCode: '23', population: 75000 },
  { id: 'leninogorsk', name: { ru: 'Лениногорск', en: 'Leninogorsk' }, regionCode: '16', population: 60000 },
  { id: 'chaykovskiy', name: { ru: 'Чайковский', en: 'Chaykovsky' }, regionCode: '59', population: 80000 },
  { id: 'novouralsk', name: { ru: 'Новоуральск', en: 'Novouralsk' }, regionCode: '66', population: 80000 },
  { id: 'azov', name: { ru: 'Азов', en: 'Azov' }, regionCode: '61', population: 80000 },
  { id: 'tikhvin', name: { ru: 'Тихвин', en: 'Tikhvin' }, regionCode: '47', population: 55000 },
  { id: 'tikhоretsk', name: { ru: 'Тихорецк', en: 'Tikhoretsk' }, regionCode: '23', population: 60000 },
  { id: 'verkhnyaya-pyshma', name: { ru: 'Верхняя Пышма', en: 'Verkhnyaya Pyshma' }, regionCode: '66', population: 70000 },
  { id: 'elets', name: { ru: 'Елец', en: 'Yelets' }, regionCode: '48', population: 105000 },
  { id: 'gatchina', name: { ru: 'Гатчина', en: 'Gatchina' }, regionCode: '47', population: 95000 },
  { id: 'vyborg', name: { ru: 'Выборг', en: 'Vyborg' }, regionCode: '47', population: 80000 },
  { id: 'vsevolozhsk', name: { ru: 'Всеволожск', en: 'Vsevolozhsk' }, regionCode: '47', population: 70000 },
  { id: 'sosnovy-bor', name: { ru: 'Сосновый Бор', en: 'Sosnovy Bor' }, regionCode: '47', population: 70000 },
  { id: 'velikiy-novgorod', name: { ru: 'Великий Новгород', en: 'Veliky Novgorod' }, regionCode: '53', population: 225000 },
  { id: 'borovichi', name: { ru: 'Боровичи', en: 'Borovichi' }, regionCode: '53', population: 50000 },
  { id: 'velikiye-luki', name: { ru: 'Великие Луки', en: 'Velikiye Luki' }, regionCode: '60', population: 90000 },
  { id: 'asbest', name: { ru: 'Асбест', en: 'Asbest' }, regionCode: '66', population: 65000 },
  { id: 'revda', name: { ru: 'Ревда', en: 'Revda' }, regionCode: '66', population: 60000 },
  { id: 'polevskoy', name: { ru: 'Полевской', en: 'Polevskoy' }, regionCode: '66', population: 65000 },
  { id: 'lesnoy', name: { ru: 'Лесной', en: 'Lesnoy' }, regionCode: '66', population: 50000 },
  { id: 'nizhnyaya-tura', name: { ru: 'Нижняя Тура', en: 'Nizhnyaya Tura' }, regionCode: '66', population: 55000 },
  { id: 'zarechny', name: { ru: 'Заречный', en: 'Zarechny' }, regionCode: '66', population: 65000 },
  { id: 'verkhnyaya-salda', name: { ru: 'Верхняя Салда', en: 'Verkhnyaya Salda' }, regionCode: '66', population: 55000 },
  { id: 'kachkanar', name: { ru: 'Качканар', en: 'Kachkanar' }, regionCode: '66', population: 50000 },
  { id: 'krasnouralsk', name: { ru: 'Красноуральск', en: 'Krasnouralsk' }, regionCode: '66', population: 50000 },
];

/**
 * Get city by ID
 */
export function getCityById(id: string): RussianCity | undefined {
  return RUSSIAN_CITIES.find(city => city.id === id);
}

/**
 * Get all cities in a region by region code
 */
export function getCitiesByRegion(regionCode: string): RussianCity[] {
  return RUSSIAN_CITIES.filter(city => city.regionCode === regionCode);
}

/**
 * Search cities by name (supports both Russian and English)
 */
export function searchCities(query: string, lang: 'ru' | 'en' = 'ru'): RussianCity[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return [];
  }

  return RUSSIAN_CITIES.filter(city => {
    const cityName = city.name[lang].toLowerCase();
    return cityName.includes(normalizedQuery);
  });
}

/**
 * Get all cities sorted by name in specified language
 */
export function getCitiesSortedByName(lang: 'ru' | 'en' = 'ru'): RussianCity[] {
  return [...RUSSIAN_CITIES].sort((a, b) =>
    a.name[lang].localeCompare(b.name[lang], lang === 'ru' ? 'ru' : 'en')
  );
}

/**
 * Get cities with population above threshold
 */
export function getCitiesByPopulation(minPopulation: number): RussianCity[] {
  return RUSSIAN_CITIES.filter(city => (city.population ?? 0) >= minPopulation);
}

/**
 * Get millionaire cities (population > 1,000,000)
 */
export function getMillionaireCities(): RussianCity[] {
  return getCitiesByPopulation(1000000);
}

/**
 * Total count of cities in the reference
 */
export const CITIES_COUNT = RUSSIAN_CITIES.length;
