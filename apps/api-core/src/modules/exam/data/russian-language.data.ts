import {
  QuestionDto,
  QuestionCategory,
  QuestionDifficulty,
} from '../dto/question.dto';

/**
 * База вопросов по русскому языку для мигрантов
 * 100 вопросов: 40 easy, 40 medium, 20 hard
 *
 * Темы:
 * - Падежи и предлоги (30 вопросов)
 * - Глаголы и времена (25 вопросов)
 * - Числительные (15 вопросов)
 * - Диалоги/ситуации (30 вопросов)
 */
export const russianLanguageQuestions: Omit<QuestionDto, 'id'>[] = [
  // ============================================
  // ПАДЕЖИ И ПРЕДЛОГИ (30 вопросов)
  // ============================================

  // --- EASY (12 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я иду ___ магазин"',
    options: ['в', 'на', 'к', 'до'],
    correctIndex: 0,
    explanation:
      'С названиями закрытых помещений (магазин, школа, больница) используется предлог "в".',
    tags: ['падежи', 'предлоги', 'винительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Книга лежит ___ столе"',
    options: ['на', 'в', 'под', 'за'],
    correctIndex: 0,
    explanation:
      'Предлог "на" используется, когда предмет находится на поверхности чего-либо.',
    tags: ['падежи', 'предлоги', 'предложный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я живу ___ Москве"',
    options: ['в', 'на', 'к', 'из'],
    correctIndex: 0,
    explanation:
      'С названиями городов и стран используется предлог "в" (в Москве, в России).',
    tags: ['падежи', 'предлоги', 'предложный падеж', 'города'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я иду ___ работу"',
    options: ['на', 'в', 'к', 'до'],
    correctIndex: 0,
    explanation:
      'С словом "работа" используется предлог "на" (на работу, на работе).',
    tags: ['падежи', 'предлоги', 'винительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я приехал ___ России"',
    options: ['из', 'с', 'от', 'до'],
    correctIndex: 0,
    explanation:
      'Если место с предлогом "в", то откуда — с предлогом "из" (в России → из России).',
    tags: ['падежи', 'предлоги', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я вернулся ___ работы"',
    options: ['с', 'из', 'от', 'до'],
    correctIndex: 0,
    explanation:
      'Если место с предлогом "на", то откуда — с предлогом "с" (на работе → с работы).',
    tags: ['падежи', 'предлоги', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Это подарок ___ мамы"',
    options: ['от', 'из', 'с', 'для'],
    correctIndex: 0,
    explanation:
      'Предлог "от" используется для указания источника/дарителя (подарок от кого?).',
    tags: ['падежи', 'предлоги', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Я иду ___ врачу"',
    options: ['к', 'в', 'на', 'до'],
    correctIndex: 0,
    explanation:
      'Предлог "к" используется при движении к человеку (к врачу, к другу, к маме).',
    tags: ['падежи', 'предлоги', 'дательный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Кошка сидит ___ столом"',
    options: ['под', 'на', 'в', 'за'],
    correctIndex: 0,
    explanation:
      'Предлог "под" означает расположение ниже чего-либо (под столом = внизу стола).',
    tags: ['падежи', 'предлоги', 'творительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Дети играют ___ улице"',
    options: ['на', 'в', 'по', 'за'],
    correctIndex: 0,
    explanation:
      'С словом "улица" используется предлог "на" (на улице, на улицу).',
    tags: ['падежи', 'предлоги', 'предложный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Мы говорим ___ погоде"',
    options: ['о', 'про', 'за', 'на'],
    correctIndex: 0,
    explanation:
      'Предлог "о" используется с глаголом "говорить" в значении "о чём-либо".',
    tags: ['падежи', 'предлоги', 'предложный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Машина стоит ___ домом"',
    options: ['перед', 'до', 'к', 'в'],
    correctIndex: 0,
    explanation:
      'Предлог "перед" означает расположение впереди чего-либо (перед домом = спереди дома).',
    tags: ['падежи', 'предлоги', 'творительный падеж'],
  },

  // --- MEDIUM (12 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Я думаю ___ своей семье каждый день"',
    options: ['о', 'про', 'за', 'на'],
    correctIndex: 0,
    explanation:
      'Глагол "думать" требует предложного падежа с предлогом "о" (думать о ком/о чём).',
    tags: ['падежи', 'предлоги', 'предложный падеж', 'управление глаголов'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я скучаю ___ родине"',
    options: ['по', 'о', 'за', 'на'],
    correctIndex: 0,
    explanation:
      'Глагол "скучать" требует предлога "по" с дательным падежом (скучать по кому/чему).',
    tags: ['падежи', 'предлоги', 'дательный падеж', 'управление глаголов'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Я учусь ___ университете ___ Москве"',
    options: ['в, в', 'на, в', 'в, на', 'на, на'],
    correctIndex: 0,
    explanation:
      'С учебными заведениями (университет, школа) и городами используется предлог "в".',
    tags: ['падежи', 'предлоги', 'предложный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Поезд идёт ___ Москвы ___ Санкт-Петербург"',
    options: ['из, в', 'с, на', 'от, до', 'из, на'],
    correctIndex: 0,
    explanation: 'Пара предлогов "из — в" используется с названиями городов.',
    tags: ['падежи', 'предлоги', 'направление движения'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я работаю ___ заводе"',
    options: ['на', 'в', 'к', 'за'],
    correctIndex: 0,
    explanation:
      'С словами "завод", "фабрика", "предприятие" используется предлог "на".',
    tags: ['падежи', 'предлоги', 'предложный падеж', 'место работы'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Благодаря ___ помощи я сдал экзамен"',
    options: ['вашей', 'ваша', 'вашу', 'вашим'],
    correctIndex: 0,
    explanation:
      'Предлог "благодаря" требует дательного падежа (благодаря кому/чему).',
    tags: ['падежи', 'предлоги', 'дательный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Вопреки ___ прогнозу пошёл дождь"',
    options: ['плохому', 'плохой', 'плохого', 'плохим'],
    correctIndex: 0,
    explanation:
      'Предлог "вопреки" требует дательного падежа (вопреки чему).',
    tags: ['падежи', 'предлоги', 'дательный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Письмо написано ___ ручкой"',
    options: ['синей', 'синяя', 'синюю', 'синей'],
    correctIndex: 0,
    explanation:
      'Творительный падеж используется для указания инструмента действия (чем? — ручкой).',
    tags: ['падежи', 'творительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я горжусь ___ сыном"',
    options: ['своим', 'свой', 'своего', 'своему'],
    correctIndex: 0,
    explanation:
      'Глагол "гордиться" требует творительного падежа (гордиться кем/чем).',
    tags: ['падежи', 'творительный падеж', 'управление глаголов'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я интересуюсь ___ историей"',
    options: ['русской', 'русская', 'русскую', 'русской'],
    correctIndex: 0,
    explanation:
      'Глагол "интересоваться" требует творительного падежа (интересоваться чем).',
    tags: ['падежи', 'творительный падеж', 'управление глаголов'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Несмотря ___ дождь, мы пошли гулять"',
    options: ['на', 'о', 'за', 'в'],
    correctIndex: 0,
    explanation:
      'Выражение "несмотря на" требует винительного падежа (несмотря на что).',
    tags: ['падежи', 'предлоги', 'винительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я пришёл ___ полчаса ___ начала"',
    options: ['за, до', 'через, до', 'на, перед', 'в, к'],
    correctIndex: 0,
    explanation:
      'Выражение "за (время) до (события)" означает "раньше на указанное время".',
    tags: ['падежи', 'предлоги', 'время'],
  },

  // --- HARD (6 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Согласно ___ он должен явиться в суд"',
    options: ['закону', 'закона', 'законом', 'закон'],
    correctIndex: 0,
    explanation:
      'Предлог "согласно" требует дательного падежа (согласно чему — закону, правилу).',
    tags: ['падежи', 'предлоги', 'дательный падеж', 'официальный стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "По ___ в стране объявлен траур"',
    options: ['прибытии', 'прибытию', 'прибытия', 'прибытием'],
    correctIndex: 0,
    explanation:
      'Предлог "по" в значении "после" требует предложного падежа (по прибытии, по окончании).',
    tags: ['падежи', 'предлоги', 'предложный падеж', 'официальный стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Ввиду ___ обстоятельств рейс отменён"',
    options: ['непредвиденных', 'непредвиденным', 'непредвиденные', 'непредвиденными'],
    correctIndex: 0,
    explanation:
      'Предлог "ввиду" требует родительного падежа (ввиду чего — обстоятельств).',
    tags: ['падежи', 'предлоги', 'родительный падеж', 'официальный стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Касательно ___ вопроса сообщаю следующее"',
    options: ['данного', 'данному', 'данным', 'данный'],
    correctIndex: 0,
    explanation:
      'Предлог "касательно" требует родительного падежа (касательно чего).',
    tags: ['падежи', 'предлоги', 'родительный падеж', 'деловой стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "В отличие ___ брата, я люблю читать"',
    options: ['от', 'из', 'с', 'к'],
    correctIndex: 0,
    explanation:
      'Выражение "в отличие от" требует родительного падежа (в отличие от кого/чего).',
    tags: ['падежи', 'предлоги', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Наряду ___ основной работой он подрабатывает"',
    options: ['с', 'к', 'от', 'в'],
    correctIndex: 0,
    explanation:
      'Выражение "наряду с" требует творительного падежа (наряду с чем).',
    tags: ['падежи', 'предлоги', 'творительный падеж'],
  },

  // ============================================
  // ГЛАГОЛЫ И ВРЕМЕНА (25 вопросов)
  // ============================================

  // --- EASY (10 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Вчера я ___ в кино"',
    options: ['ходил', 'иду', 'пойду', 'хожу'],
    correctIndex: 0,
    explanation:
      'Слово "вчера" указывает на прошедшее время. "Ходил" — прошедшее время глагола "ходить".',
    tags: ['глаголы', 'времена', 'прошедшее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Завтра мы ___ на работу"',
    options: ['пойдём', 'идём', 'шли', 'ходили'],
    correctIndex: 0,
    explanation:
      'Слово "завтра" указывает на будущее время. "Пойдём" — будущее время от "пойти".',
    tags: ['глаголы', 'времена', 'будущее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Сейчас я ___ книгу"',
    options: ['читаю', 'читал', 'прочитаю', 'прочитал'],
    correctIndex: 0,
    explanation:
      'Слово "сейчас" указывает на настоящее время. "Читаю" — настоящее время.',
    tags: ['глаголы', 'времена', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Каждый день я ___ на работу"',
    options: ['хожу', 'иду', 'пошёл', 'пойду'],
    correctIndex: 0,
    explanation:
      '"Каждый день" указывает на регулярное действие. "Хожу" — глагол движения для регулярных действий.',
    tags: ['глаголы', 'глаголы движения', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Смотри! Мальчик ___ по улице"',
    options: ['идёт', 'ходит', 'пошёл', 'пойдёт'],
    correctIndex: 0,
    explanation:
      '"Идёт" используется для однонаправленного движения в данный момент.',
    tags: ['глаголы', 'глаголы движения', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Мама ___ обед каждый вечер"',
    options: ['готовит', 'приготовит', 'готовила', 'приготовила'],
    correctIndex: 0,
    explanation:
      '"Каждый вечер" указывает на регулярное действие в настоящем. "Готовит" — несовершенный вид.',
    tags: ['глаголы', 'вид глагола', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Вчера она ___ письмо"',
    options: ['написала', 'писала', 'пишет', 'напишет'],
    correctIndex: 0,
    explanation:
      '"Написала" — совершенный вид, указывает на завершённое действие в прошлом.',
    tags: ['глаголы', 'вид глагола', 'прошедшее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Дети ___ в парке сейчас"',
    options: ['играют', 'играли', 'сыграют', 'сыграли'],
    correctIndex: 0,
    explanation:
      '"Сейчас" указывает на настоящее время. "Играют" — настоящее время.',
    tags: ['глаголы', 'времена', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Он хорошо ___ по-русски"',
    options: ['говорит', 'сказал', 'скажет', 'говорил'],
    correctIndex: 0,
    explanation:
      'Для описания умений и навыков используется настоящее время: "говорит".',
    tags: ['глаголы', 'времена', 'настоящее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Поезд ___ через час"',
    options: ['придёт', 'приходит', 'пришёл', 'приходил'],
    correctIndex: 0,
    explanation:
      '"Через час" указывает на будущее. "Придёт" — совершенный вид в будущем времени.',
    tags: ['глаголы', 'времена', 'будущее время'],
  },

  // --- MEDIUM (10 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Когда я ___ домой, начался дождь"',
    options: ['шёл', 'ходил', 'пошёл', 'иду'],
    correctIndex: 0,
    explanation:
      '"Шёл" — прошедшее время однонаправленного движения, описывает процесс в момент другого действия.',
    tags: ['глаголы', 'глаголы движения', 'прошедшее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Он долго ___ эту книгу и наконец ___ "',
    options: ['читал, прочитал', 'прочитал, читал', 'читает, прочитает', 'прочитал, прочитал'],
    correctIndex: 0,
    explanation:
      'Несовершенный вид "читал" (процесс) + совершенный вид "прочитал" (результат).',
    tags: ['глаголы', 'вид глагола', 'прошедшее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Не ___ дверь, здесь холодно!"',
    options: ['открывай', 'открой', 'открываешь', 'откроешь'],
    correctIndex: 0,
    explanation:
      'В отрицательном повелительном наклонении обычно используется несовершенный вид: "не открывай".',
    tags: ['глаголы', 'повелительное наклонение', 'вид глагола'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "___ мне, пожалуйста, соль"',
    options: ['Передай', 'Передавай', 'Передаёшь', 'Передашь'],
    correctIndex: 0,
    explanation:
      'В просьбах часто используется совершенный вид повелительного наклонения: "передай".',
    tags: ['глаголы', 'повелительное наклонение', 'вид глагола'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Если завтра ___ дождь, мы не пойдём гулять"',
    options: ['пойдёт', 'идёт', 'шёл', 'ходил'],
    correctIndex: 0,
    explanation:
      'В условных предложениях о будущем используется будущее время: "если пойдёт дождь".',
    tags: ['глаголы', 'времена', 'условные предложения'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Раньше здесь ___ больница"',
    options: ['была', 'есть', 'будет', 'бывает'],
    correctIndex: 0,
    explanation:
      '"Раньше" указывает на прошлое. "Была" — прошедшее время глагола "быть".',
    tags: ['глаголы', 'глагол быть', 'прошедшее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Я ___ тебе, когда приеду"',
    options: ['позвоню', 'звоню', 'звонил', 'позвонил'],
    correctIndex: 0,
    explanation:
      'Действие произойдёт в будущем после другого действия. "Позвоню" — совершенный вид, будущее время.',
    tags: ['глаголы', 'времена', 'будущее время'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Пока ты ___, я приготовлю ужин"',
    options: ['отдыхаешь', 'отдохнёшь', 'отдыхал', 'отдохнул'],
    correctIndex: 0,
    explanation:
      '"Пока" указывает на одновременность действий. "Отдыхаешь" — настоящее время (в значении будущего).',
    tags: ['глаголы', 'времена', 'одновременность'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Самолёт ___ каждый день в 10 утра"',
    options: ['вылетает', 'вылетит', 'вылетел', 'вылетал'],
    correctIndex: 0,
    explanation:
      '"Каждый день" указывает на регулярное действие. Используется настоящее время: "вылетает".',
    tags: ['глаголы', 'времена', 'настоящее время', 'расписание'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Выберите правильный вариант: "Я хочу ___ русский язык"',
    options: ['выучить', 'учить', 'изучать', 'выучивать'],
    correctIndex: 0,
    explanation:
      '"Выучить" — совершенный вид, подчёркивает желание достичь результата (полностью овладеть языком).',
    tags: ['глаголы', 'вид глагола', 'инфинитив'],
  },

  // --- HARD (5 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Он ___ бы, если бы знал правду"',
    options: ['пришёл', 'приходил', 'придёт', 'приходит'],
    correctIndex: 0,
    explanation:
      'Сослагательное наклонение образуется: глагол в прошедшем времени + частица "бы".',
    tags: ['глаголы', 'сослагательное наклонение', 'условные предложения'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Документ ___ директором"',
    options: ['подписан', 'подписал', 'подписывает', 'подписали'],
    correctIndex: 0,
    explanation:
      'Краткое страдательное причастие "подписан" используется для указания на результат действия.',
    tags: ['глаголы', 'причастия', 'страдательный залог'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "___ домой, я встретил друга"',
    options: ['Возвращаясь', 'Возвращался', 'Вернувшись', 'Возвращаюсь'],
    correctIndex: 0,
    explanation:
      'Деепричастие несовершенного вида "возвращаясь" описывает одновременное действие.',
    tags: ['глаголы', 'деепричастия', 'одновременность'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "___ работу, он пошёл домой"',
    options: ['Закончив', 'Заканчивая', 'Закончил', 'Заканчивал'],
    correctIndex: 0,
    explanation:
      'Деепричастие совершенного вида "закончив" описывает действие, предшествующее главному.',
    tags: ['глаголы', 'деепричастия', 'предшествование'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Выберите правильный вариант: "Нельзя было не ___ его талант"',
    options: ['заметить', 'замечать', 'заметив', 'замечая'],
    correctIndex: 0,
    explanation:
      'После "нельзя было не" используется инфинитив совершенного вида: "заметить".',
    tags: ['глаголы', 'инфинитив', 'двойное отрицание'],
  },

  // ============================================
  // ЧИСЛИТЕЛЬНЫЕ (15 вопросов)
  // ============================================

  // --- EASY (6 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "У меня ___ рублей"',
    options: ['пять', 'пяти', 'пятью', 'пятеро'],
    correctIndex: 0,
    explanation:
      'После числительных 5-20 существительное стоит в родительном падеже множественного числа.',
    tags: ['числительные', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Сегодня ___ января"',
    options: ['двадцатое', 'двадцать', 'двадцати', 'двадцатого'],
    correctIndex: 0,
    explanation:
      'Для обозначения даты используется порядковое числительное в именительном падеже среднего рода.',
    tags: ['числительные', 'даты', 'порядковые числительные'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "В комнате ___ стула"',
    options: ['два', 'двое', 'две', 'двух'],
    correctIndex: 0,
    explanation:
      '"Два" используется с существительными мужского рода (стул — мужской род).',
    tags: ['числительные', 'род существительных'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Мне ___ лет"',
    options: ['двадцать один год', 'двадцать один лет', 'двадцать одна года', 'двадцать одно год'],
    correctIndex: 0,
    explanation:
      'После числительного "один" существительное стоит в единственном числе: "год".',
    tags: ['числительные', 'возраст'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "Это стоит ___ рублей"',
    options: ['сто', 'сто один', 'сотня', 'стом'],
    correctIndex: 0,
    explanation:
      'Числительное "сто" в именительном падеже не изменяется.',
    tags: ['числительные', 'именительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Выберите правильный вариант: "У неё ___ сестры"',
    options: ['две', 'два', 'двое', 'двух'],
    correctIndex: 0,
    explanation:
      '"Две" используется с существительными женского рода (сестра — женский род).',
    tags: ['числительные', 'род существительных'],
  },

  // --- MEDIUM (6 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я родился в ___ году"',
    options: ['тысяча девятьсот девяностом', 'тысяча девятьсот девяносто', 'тысячу девятьсот девяностый', 'тысяче девятьсот девяностом'],
    correctIndex: 0,
    explanation:
      'В датах "в каком году" используется предложный падеж порядкового числительного.',
    tags: ['числительные', 'даты', 'предложный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я получил ___ рублей"',
    options: ['пятьсот', 'пятьста', 'пятисот', 'пятистам'],
    correctIndex: 0,
    explanation:
      'Числительное "пятьсот" в винительном падеже совпадает с именительным.',
    tags: ['числительные', 'винительный падеж', 'сложные числительные'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "В городе живёт около ___ человек"',
    options: ['миллиона', 'миллион', 'миллионом', 'миллиону'],
    correctIndex: 0,
    explanation:
      'После "около" используется родительный падеж: "около миллиона".',
    tags: ['числительные', 'родительный падеж'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Я заплатил ___ рублями"',
    options: ['пятьюстами', 'пятьсот', 'пятисот', 'пятистами'],
    correctIndex: 0,
    explanation:
      'В творительном падеже: "пятьюстами" (пять + сто, оба склоняются).',
    tags: ['числительные', 'творительный падеж', 'склонение'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "___ студентов пришли на лекцию"',
    options: ['Трое', 'Три', 'Третьи', 'Трёх'],
    correctIndex: 0,
    explanation:
      'Собирательные числительные (двое, трое) используются с существительными, обозначающими лиц мужского пола.',
    tags: ['числительные', 'собирательные числительные'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question: 'Выберите правильный вариант: "Встреча назначена на ___ часов"',
    options: ['пятнадцать', 'пятнадцатый', 'пятнадцати', 'пятнадцатого'],
    correctIndex: 0,
    explanation:
      'Для указания времени используется количественное числительное: "на пятнадцать часов".',
    tags: ['числительные', 'время'],
  },

  // --- HARD (3 вопроса) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question: 'Выберите правильный вариант: "Не хватает ___ рублей"',
    options: ['двухсот пятидесяти трёх', 'двести пятьдесят три', 'двухста пятидесяти трёх', 'двумстам пятидесяти трём'],
    correctIndex: 0,
    explanation:
      'Все части составного числительного склоняются: "двухсот пятидесяти трёх" (родительный падеж).',
    tags: ['числительные', 'склонение', 'составные числительные'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question: 'Выберите правильный вариант: "Город основан в ___ году"',
    options: ['тысяча семьсот двадцать первом', 'тысяча семьсот двадцать один', 'тысячу семьсот двадцать первый', 'тысяче семьсот двадцать первом'],
    correctIndex: 0,
    explanation:
      'В датах склоняется только последнее слово порядкового числительного: "в тысяча семьсот двадцать первом году".',
    tags: ['числительные', 'даты', 'порядковые числительные', 'склонение'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question: 'Выберите правильный вариант: "Мы говорили о ___ кандидатах"',
    options: ['обоих', 'обеих', 'оба', 'обоим'],
    correctIndex: 0,
    explanation:
      '"Обоих" используется с существительными мужского рода в предложном падеже (о ком? — о кандидатах).',
    tags: ['числительные', 'собирательные числительные', 'склонение'],
  },

  // ============================================
  // ДИАЛОГИ И СИТУАЦИИ (30 вопросов)
  // ============================================

  // --- EASY (12 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как правильно спросить дорогу до метро?',
    options: [
      'Скажите, пожалуйста, как пройти к метро?',
      'Где метро тут?',
      'Метро где?',
      'Хочу метро найти',
    ],
    correctIndex: 0,
    explanation:
      'Вежливая форма вопроса включает "Скажите, пожалуйста" и правильную конструкцию "как пройти к".',
    tags: ['диалоги', 'вежливость', 'спросить дорогу'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Что правильно ответить на "Спасибо"?',
    options: ['Пожалуйста', 'Хорошо', 'Да', 'Ладно'],
    correctIndex: 0,
    explanation:
      '"Пожалуйста" — стандартный вежливый ответ на благодарность.',
    tags: ['диалоги', 'вежливость', 'благодарность'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как вежливо попросить повторить?',
    options: [
      'Повторите, пожалуйста',
      'Что?',
      'Не понял',
      'Ещё раз',
    ],
    correctIndex: 0,
    explanation:
      '"Повторите, пожалуйста" — вежливая форма просьбы повторить сказанное.',
    tags: ['диалоги', 'вежливость', 'просьба'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как поздороваться днём?',
    options: ['Добрый день', 'Доброй ночи', 'Привет всем', 'Здравствуй мир'],
    correctIndex: 0,
    explanation:
      '"Добрый день" — стандартное приветствие в дневное время.',
    tags: ['диалоги', 'приветствие', 'время суток'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как попрощаться вечером?',
    options: ['До свидания', 'Доброе утро', 'Привет', 'Здравствуйте'],
    correctIndex: 0,
    explanation:
      '"До свидания" — универсальная форма прощания, подходит для любого времени суток.',
    tags: ['диалоги', 'прощание'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как спросить цену в магазине?',
    options: [
      'Сколько это стоит?',
      'Дорого это?',
      'Какая цена тут?',
      'Это почём будет?',
    ],
    correctIndex: 0,
    explanation:
      '"Сколько это стоит?" — правильная и вежливая форма вопроса о цене.',
    tags: ['диалоги', 'магазин', 'покупки'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как представиться новому человеку?',
    options: [
      'Меня зовут...',
      'Я есть...',
      'Моё имя есть...',
      'Зовусь я...',
    ],
    correctIndex: 0,
    explanation:
      '"Меня зовут..." — стандартная форма представления в русском языке.',
    tags: ['диалоги', 'знакомство', 'представление'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как попросить воды в ресторане?',
    options: [
      'Принесите, пожалуйста, воду',
      'Воды хочу',
      'Дайте воду мне',
      'Вода нужна',
    ],
    correctIndex: 0,
    explanation:
      '"Принесите, пожалуйста" — вежливая форма просьбы в ресторане.',
    tags: ['диалоги', 'ресторан', 'просьба'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Что сказать, если вы опоздали?',
    options: [
      'Извините за опоздание',
      'Я опоздал',
      'Пришёл поздно',
      'Время было',
    ],
    correctIndex: 0,
    explanation:
      '"Извините за опоздание" — вежливая форма извинения за опоздание.',
    tags: ['диалоги', 'извинение', 'вежливость'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как спросить время?',
    options: [
      'Который час?',
      'Время какое?',
      'Сколько время?',
      'Час который?',
    ],
    correctIndex: 0,
    explanation:
      '"Который час?" — правильная форма вопроса о времени.',
    tags: ['диалоги', 'время', 'вопросы'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как ответить на "Как дела?"',
    options: [
      'Спасибо, хорошо. А у вас?',
      'Нормально живу',
      'Дела идут',
      'Всё есть',
    ],
    correctIndex: 0,
    explanation:
      'Вежливый ответ включает благодарность и встречный вопрос.',
    tags: ['диалоги', 'приветствие', 'вежливость'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    question: 'Как попросить помощь?',
    options: [
      'Помогите, пожалуйста',
      'Помощь давай',
      'Мне помощь',
      'Нужно помочь',
    ],
    correctIndex: 0,
    explanation:
      '"Помогите, пожалуйста" — вежливая форма просьбы о помощи.',
    tags: ['диалоги', 'просьба', 'помощь'],
  },

  // --- MEDIUM (12 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как вежливо отказаться от предложения?',
    options: [
      'Спасибо, но я не могу',
      'Нет, не хочу',
      'Не буду',
      'Отказываюсь',
    ],
    correctIndex: 0,
    explanation:
      'Вежливый отказ включает благодарность и объяснение причины.',
    tags: ['диалоги', 'отказ', 'вежливость'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как спросить, можно ли войти в кабинет?',
    options: [
      'Разрешите войти?',
      'Входить можно?',
      'Я войду?',
      'Вхожу?',
    ],
    correctIndex: 0,
    explanation:
      '"Разрешите войти?" — формальная вежливая форма для официальной обстановки.',
    tags: ['диалоги', 'разрешение', 'официальный стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как попросить перезвонить позже?',
    options: [
      'Не могли бы вы перезвонить позже?',
      'Звоните потом',
      'Позже звонить',
      'Перезвон нужен',
    ],
    correctIndex: 0,
    explanation:
      '"Не могли бы вы..." — вежливая форма просьбы с условным наклонением.',
    tags: ['диалоги', 'телефон', 'вежливость'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как узнать расписание в справочной?',
    options: [
      'Скажите, пожалуйста, во сколько отправляется поезд?',
      'Поезд когда?',
      'Расписание скажите',
      'Когда поезд идёт?',
    ],
    correctIndex: 0,
    explanation:
      'Вежливый вопрос включает "Скажите, пожалуйста" и правильную конструкцию.',
    tags: ['диалоги', 'справочная', 'расписание'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как предложить помощь незнакомому человеку?',
    options: [
      'Вам помочь?',
      'Помощь хотите?',
      'Помогаю вам',
      'Надо помочь?',
    ],
    correctIndex: 0,
    explanation:
      '"Вам помочь?" — краткая и вежливая форма предложения помощи.',
    tags: ['диалоги', 'помощь', 'предложение'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как выразить сочувствие?',
    options: [
      'Мне очень жаль',
      'Плохо это',
      'Жалко всё',
      'Сочувствую сильно',
    ],
    correctIndex: 0,
    explanation:
      '"Мне очень жаль" — стандартное выражение сочувствия.',
    tags: ['диалоги', 'сочувствие', 'эмоции'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как записаться к врачу по телефону?',
    options: [
      'Здравствуйте, я хотел бы записаться на приём к терапевту',
      'Мне к врачу надо',
      'Запишите к врачу',
      'Терапевт нужен',
    ],
    correctIndex: 0,
    explanation:
      'Формальная просьба включает приветствие и конструкцию "я хотел бы".',
    tags: ['диалоги', 'медицина', 'запись', 'телефон'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как попросить счёт в ресторане?',
    options: [
      'Принесите, пожалуйста, счёт',
      'Счёт давайте',
      'Хочу платить',
      'Деньги отдать хочу',
    ],
    correctIndex: 0,
    explanation:
      '"Принесите, пожалуйста, счёт" — стандартная вежливая форма в ресторане.',
    tags: ['диалоги', 'ресторан', 'оплата'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как спросить разрешения на собеседовании?',
    options: [
      'Можно задать вопрос?',
      'Вопрос хочу',
      'Спрошу?',
      'Вопрос будет',
    ],
    correctIndex: 0,
    explanation:
      '"Можно задать вопрос?" — вежливая форма в официальной обстановке.',
    tags: ['диалоги', 'работа', 'собеседование'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как извиниться за ошибку на работе?',
    options: [
      'Прошу прощения, я допустил ошибку',
      'Ошибся я',
      'Была ошибка',
      'Неправильно сделал',
    ],
    correctIndex: 0,
    explanation:
      '"Прошу прощения" — формальная форма извинения, уместная на работе.',
    tags: ['диалоги', 'работа', 'извинение'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как попросить подождать по телефону?',
    options: [
      'Подождите, пожалуйста, одну минуту',
      'Ждите',
      'Минуту надо',
      'Подождать нужно',
    ],
    correctIndex: 0,
    explanation:
      'Вежливая просьба включает "пожалуйста" и указание времени.',
    tags: ['диалоги', 'телефон', 'просьба'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    question:
      'Как поблагодарить за услугу?',
    options: [
      'Большое спасибо за помощь',
      'Спасибо',
      'Благодарен',
      'Хорошо сделали',
    ],
    correctIndex: 0,
    explanation:
      '"Большое спасибо за помощь" — развёрнутая благодарность с указанием причины.',
    tags: ['диалоги', 'благодарность', 'вежливость'],
  },

  // --- HARD (6 вопросов) ---
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как корректно выразить несогласие с начальником?',
    options: [
      'Позвольте не согласиться, на мой взгляд...',
      'Вы не правы',
      'Я не согласен',
      'Это неправильно',
    ],
    correctIndex: 0,
    explanation:
      '"Позвольте не согласиться" — вежливая форма выражения несогласия в официальной обстановке.',
    tags: ['диалоги', 'работа', 'несогласие', 'деловой стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как вежливо напомнить о невыполненной просьбе?',
    options: [
      'Простите, что беспокою, но хотел бы узнать о статусе моей просьбы',
      'Вы забыли сделать',
      'Почему не сделали?',
      'Когда сделаете?',
    ],
    correctIndex: 0,
    explanation:
      'Вежливое напоминание включает извинение за беспокойство и нейтральную формулировку.',
    tags: ['диалоги', 'напоминание', 'вежливость', 'деловой стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как правильно начать официальное письмо?',
    options: [
      'Уважаемый Иван Петрович!',
      'Здравствуйте, Иван!',
      'Привет, Иван Петрович!',
      'Дорогой Иван!',
    ],
    correctIndex: 0,
    explanation:
      '"Уважаемый" + имя и отчество — стандартное обращение в деловой переписке.',
    tags: ['диалоги', 'письмо', 'деловой стиль', 'обращение'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как завершить деловое письмо?',
    options: [
      'С уважением, [имя]',
      'Пока',
      'До свидания',
      'Всего хорошего',
    ],
    correctIndex: 0,
    explanation:
      '"С уважением" — стандартная формула завершения делового письма.',
    tags: ['диалоги', 'письмо', 'деловой стиль'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как вежливо прервать собеседника?',
    options: [
      'Извините, что прерываю, но хотел бы уточнить...',
      'Подождите',
      'Стоп',
      'Я хочу сказать',
    ],
    correctIndex: 0,
    explanation:
      'Вежливое прерывание включает извинение и объяснение причины.',
    tags: ['диалоги', 'прерывание', 'вежливость'],
  },
  {
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.HARD,
    question:
      'Как правильно обратиться к незнакомому человеку старшего возраста?',
    options: [
      'Извините, пожалуйста...',
      'Эй, вы!',
      'Послушайте',
      'Гражданин!',
    ],
    correctIndex: 0,
    explanation:
      '"Извините, пожалуйста" — нейтральное вежливое обращение к незнакомому человеку.',
    tags: ['диалоги', 'обращение', 'вежливость', 'возраст'],
  },
];
