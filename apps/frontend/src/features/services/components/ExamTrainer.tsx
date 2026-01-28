'use client';

import { useState } from 'react';
import { GraduationCap, X, ChevronRight, CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, Clock, Target, Play, Scale } from 'lucide-react';
import {
  useExamStore,
  selectCurrentQuestion,
  selectCurrentAnswer,
  selectSessionProgress,
  selectIsLastQuestion,
} from '@/features/exam/stores/examStore';
import {
  QuestionCategory,
  QuestionDifficulty,
  ExamMode,
  ExamResult,
  Question,
} from '@/features/exam/types';

interface ExamTrainerProps {
  onClose: () => void;
}

type CategoryFilter = 'all' | QuestionCategory;

const SAMPLE_QUESTIONS: Question[] = [
  // История России
  {
    id: 'history-1',
    question: 'Столица России:',
    options: ['Санкт-Петербург', 'Москва', 'Новосибирск', 'Казань'],
    correctIndex: 1,
    explanation: 'Москва — столица Российской Федерации с 1918 года.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.EASY,
    tags: ['география', 'столица'],
  },
  {
    id: 'history-2',
    question: 'Как называется глава государства в России?',
    options: ['Премьер-министр', 'Канцлер', 'Президент', 'Король'],
    correctIndex: 2,
    explanation: 'Президент — высшее должностное лицо в России.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.EASY,
    tags: ['политика', 'власть'],
  },
  {
    id: 'history-3',
    question: 'Сколько субъектов в Российской Федерации?',
    options: ['85', '89', '83', '91'],
    correctIndex: 0,
    explanation: 'В состав РФ входят 85 субъектов.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['политика', 'федерация'],
  },
  {
    id: 'history-4',
    question: 'Государственный флаг России состоит из полос:',
    options: ['Красной, синей, белой', 'Белой, синей, красной', 'Синей, белой, красной', 'Красной, белой, синей'],
    correctIndex: 1,
    explanation: 'Флаг России — белая, синяя и красная горизонтальные полосы.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.EASY,
    tags: ['символика', 'флаг'],
  },
  {
    id: 'history-5',
    question: 'В каком году была принята Конституция РФ?',
    options: ['1991', '1993', '1995', '2000'],
    correctIndex: 1,
    explanation: 'Конституция РФ была принята 12 декабря 1993 года.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['конституция', 'право'],
  },
  {
    id: 'history-6',
    question: 'День России отмечается:',
    options: ['1 января', '9 мая', '12 июня', '4 ноября'],
    correctIndex: 2,
    explanation: 'День России — государственный праздник, отмечается 12 июня.',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.EASY,
    tags: ['праздники'],
  },
  {
    id: 'history-7',
    question: 'Какая река самая длинная в России?',
    options: ['Волга', 'Обь', 'Лена', 'Енисей'],
    correctIndex: 2,
    explanation: 'Лена — самая длинная река России (4400 км).',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['география', 'реки'],
  },
  {
    id: 'history-8',
    question: 'Кто написал "Войну и мир"?',
    options: ['Достоевский', 'Пушкин', 'Толстой', 'Чехов'],
    correctIndex: 2,
    explanation: 'Лев Толстой — автор романа "Война и мир".',
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.EASY,
    tags: ['культура', 'литература'],
  },
  // Русский язык
  {
    id: 'russian-1',
    question: 'Выберите правильное продолжение: "Я живу _____ Москве."',
    options: ['на', 'в', 'к', 'у'],
    correctIndex: 1,
    explanation: '"В" используется с названиями городов: в Москве, в Петербурге.',
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    tags: ['предлоги', 'грамматика'],
  },
  {
    id: 'russian-2',
    question: 'Какой падеж отвечает на вопрос "Кого? Чего?"',
    options: ['Именительный', 'Родительный', 'Дательный', 'Винительный'],
    correctIndex: 1,
    explanation: 'Родительный падеж отвечает на вопросы "Кого? Чего?"',
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['падежи', 'грамматика'],
  },
  {
    id: 'russian-3',
    question: 'Выберите правильный вариант: "Мне нравится _____ музыка."',
    options: ['этот', 'эта', 'это', 'эти'],
    correctIndex: 1,
    explanation: '"Музыка" — женский род, поэтому "эта музыка".',
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    tags: ['род', 'грамматика'],
  },
  {
    id: 'russian-4',
    question: 'Какое слово написано правильно?',
    options: ['здраствуйте', 'здравствуйте', 'здраствуйти', 'здравствуйти'],
    correctIndex: 1,
    explanation: 'Правильно: "здравствуйте" — от слова "здравие".',
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    tags: ['орфография'],
  },
  {
    id: 'russian-5',
    question: 'Выберите правильное окончание: "Я иду _____ работу."',
    options: ['в', 'на', 'к', 'до'],
    correctIndex: 1,
    explanation: 'С существительным "работа" используется предлог "на": на работу.',
    category: QuestionCategory.RUSSIAN_LANGUAGE,
    difficulty: QuestionDifficulty.EASY,
    tags: ['предлоги', 'грамматика'],
  },
  // Основы законодательства
  {
    id: 'law-1',
    question: 'Какой документ необходим иностранному гражданину для легальной работы в России?',
    options: ['Только паспорт', 'Патент или разрешение на работу', 'Водительские права', 'Диплом об образовании'],
    correctIndex: 1,
    explanation: 'Для работы иностранным гражданам необходим патент или разрешение на работу.',
    category: QuestionCategory.LAW,
    difficulty: QuestionDifficulty.EASY,
    tags: ['трудовое право', 'миграция'],
  },
  {
    id: 'law-2',
    question: 'В течение какого времени иностранный гражданин должен встать на миграционный учёт?',
    options: ['3 дня', '7 рабочих дней', '30 дней', '90 дней'],
    correctIndex: 1,
    explanation: 'Иностранный гражданин должен встать на миграционный учёт в течение 7 рабочих дней.',
    category: QuestionCategory.LAW,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['миграционный учёт', 'сроки'],
  },
  {
    id: 'law-3',
    question: 'Какое максимальное время пребывания в России по визе для большинства иностранцев?',
    options: ['30 дней', '60 дней', '90 дней в течение 180 дней', '1 год'],
    correctIndex: 2,
    explanation: 'Стандартный срок пребывания — до 90 дней в течение каждого периода в 180 дней.',
    category: QuestionCategory.LAW,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ['виза', 'сроки пребывания'],
  },
  {
    id: 'law-4',
    question: 'Что такое РВП?',
    options: ['Разрешение на временное проживание', 'Регистрация временного пребывания', 'Российский вид на проживание', 'Разовый въездной пропуск'],
    correctIndex: 0,
    explanation: 'РВП — разрешение на временное проживание, выдаётся сроком на 3 года.',
    category: QuestionCategory.LAW,
    difficulty: QuestionDifficulty.EASY,
    tags: ['РВП', 'документы'],
  },
];

export function ExamTrainer({ onClose }: ExamTrainerProps) {
  // Локальный state для выбора категории (до начала теста)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  // Локальный state для хранения результата (после завершения)
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Store state и actions
  const currentSession = useExamStore((state) => state.currentSession);
  const startSession = useExamStore((state) => state.startSession);
  const answerQuestion = useExamStore((state) => state.answerQuestion);
  const nextQuestion = useExamStore((state) => state.nextQuestion);
  const finishSession = useExamStore((state) => state.finishSession);
  const updateProgress = useExamStore((state) => state.updateProgress);
  const reset = useExamStore((state) => state.reset);

  // Селекторы
  const currentQuestion = useExamStore(selectCurrentQuestion);
  const currentAnswer = useExamStore(selectCurrentAnswer);
  const sessionProgress = useExamStore(selectSessionProgress);
  const isLastQuestion = useExamStore(selectIsLastQuestion);

  // Вычисляемые значения
  const isStarted = currentSession !== null;
  const isComplete = examResult !== null;
  const isAnswered = currentAnswer !== null;

  const handleStart = () => {
    const questions = selectedCategory === 'all'
      ? SAMPLE_QUESTIONS
      : SAMPLE_QUESTIONS.filter((q) => q.category === selectedCategory);

    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    startSession(ExamMode.PRACTICE, questions, category);
    setExamResult(null);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;
    answerQuestion(currentQuestion.id, index);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const result = finishSession();
      if (result) {
        setExamResult(result);
        updateProgress(result);
      }
    } else {
      nextQuestion();
    }
  };

  const handleRestart = () => {
    reset();
    setExamResult(null);
  };

  const getCategoryInfo = (cat: CategoryFilter) => {
    switch (cat) {
      case QuestionCategory.RUSSIAN_LANGUAGE:
        return { label: 'Русский язык', count: SAMPLE_QUESTIONS.filter((q) => q.category === QuestionCategory.RUSSIAN_LANGUAGE).length };
      case QuestionCategory.HISTORY:
        return { label: 'История России', count: SAMPLE_QUESTIONS.filter((q) => q.category === QuestionCategory.HISTORY).length };
      case QuestionCategory.LAW:
        return { label: 'Основы законодательства', count: SAMPLE_QUESTIONS.filter((q) => q.category === QuestionCategory.LAW).length };
      default:
        return { label: 'Все вопросы', count: SAMPLE_QUESTIONS.length };
    }
  };

  const getCategoryLabel = (category: QuestionCategory) => {
    switch (category) {
      case QuestionCategory.RUSSIAN_LANGUAGE:
        return 'Русский язык';
      case QuestionCategory.HISTORY:
        return 'История';
      case QuestionCategory.LAW:
        return 'Законодательство';
      default:
        return category;
    }
  };

  const getCategoryStyle = (category: QuestionCategory) => {
    switch (category) {
      case QuestionCategory.RUSSIAN_LANGUAGE:
        return 'bg-blue-100 text-blue-700';
      case QuestionCategory.HISTORY:
        return 'bg-orange-100 text-orange-700';
      case QuestionCategory.LAW:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOptionStyle = (index: number) => {
    if (!isAnswered || !currentQuestion) {
      return currentAnswer?.selectedIndex === index
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300';
    }

    if (index === currentQuestion.correctIndex) {
      return 'border-green-500 bg-green-50';
    }

    if (index === currentAnswer?.selectedIndex) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 opacity-50';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-exam-trainer"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 id="modal-title-exam-trainer" className="text-lg font-bold text-gray-900">Тренажёр экзамена</h2>
              <p className="text-sm text-gray-500">Русский язык, история и право</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {!isStarted && !isComplete ? (
            /* Начальный экран */
            <div className="py-4">
              {/* Иконка и описание */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="text-gray-600">
                  Подготовьтесь к экзамену для получения патента или РВП. Проверьте свои знания русского языка, истории России и основ законодательства.
                </p>
              </div>

              {/* Информация о тесте */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Проходной балл</p>
                    <p className="font-bold text-gray-900">70%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Время</p>
                    <p className="font-bold text-gray-900">~5 мин</p>
                  </div>
                </div>
              </div>

              {/* Выбор категории */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Выберите категорию:</p>
                <div className="space-y-2">
                  {(['all', QuestionCategory.RUSSIAN_LANGUAGE, QuestionCategory.HISTORY, QuestionCategory.LAW] as CategoryFilter[]).map((cat) => {
                    const info = getCategoryInfo(cat);
                    const isSelected = selectedCategory === cat;
                    const isLaw = cat === QuestionCategory.LAW;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isLaw && <Scale className="w-4 h-4 text-purple-600" />}
                          <span className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {info.label}
                          </span>
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {info.count} вопросов
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Кнопка начать */}
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Начать тест
              </button>
            </div>
          ) : isStarted && !isComplete && currentQuestion && sessionProgress ? (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Вопрос {sessionProgress.current} из {sessionProgress.total}</span>
                  <span>Баллов: {sessionProgress.correct}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(sessionProgress.current / sessionProgress.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryStyle(currentQuestion.category)}`}>
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={isAnswered}
                      className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${getOptionStyle(index)}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isAnswered && index === currentQuestion.correctIndex
                          ? 'bg-green-500 text-white'
                          : isAnswered && index === currentAnswer?.selectedIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAnswered && index === currentQuestion.correctIndex ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isAnswered && index === currentAnswer?.selectedIndex ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="flex-1 font-medium text-gray-900">
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {isAnswered && currentQuestion.explanation && (
                <div className={`p-4 rounded-xl ${
                  currentAnswer?.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    currentAnswer?.isCorrect
                      ? 'text-green-800'
                      : 'text-blue-800'
                  }`}>
                    <strong>
                      {currentAnswer?.isCorrect ? 'Правильно! ' : 'Объяснение: '}
                    </strong>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </>
          ) : isComplete && examResult ? (
            <>
              {/* Results */}
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-emerald-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Тест завершён!
                </h3>

                <p className="text-4xl font-bold text-emerald-600 mb-2">
                  {examResult.correctAnswers} из {examResult.totalQuestions}
                </p>

                <p className="text-gray-500 mb-6">
                  {examResult.passed
                    ? examResult.percentage === 100
                      ? 'Отлично! Все ответы правильные!'
                      : 'Хороший результат! Вы сдали тест.'
                    : examResult.percentage >= 50
                    ? 'Неплохо, но для сдачи нужно 70%'
                    : 'Нужно больше практики. Для сдачи нужно 70%'}
                </p>

                {/* Progress bar */}
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all ${
                      examResult.passed
                        ? 'bg-emerald-500'
                        : examResult.percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${examResult.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  Проходной балл: 70% ({Math.ceil(examResult.totalQuestions * 0.7)} из {examResult.totalQuestions})
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleRestart}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Пройти ещё раз
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 text-gray-600 font-medium hover:text-gray-800"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer with next button */}
        {isStarted && !isComplete && isAnswered && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {!isLastQuestion ? (
                <>
                  Следующий вопрос
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                'Завершить тест'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
