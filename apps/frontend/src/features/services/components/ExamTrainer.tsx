'use client';

import { useState } from 'react';
import { GraduationCap, X, ChevronRight, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface ExamTrainerProps {
  onClose: () => void;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Столица России:',
    options: ['Санкт-Петербург', 'Москва', 'Новосибирск', 'Казань'],
    correctIndex: 1,
    explanation: 'Москва — столица Российской Федерации с 1918 года.',
  },
  {
    id: 2,
    question: 'Как называется глава государства в России?',
    options: ['Премьер-министр', 'Канцлер', 'Президент', 'Король'],
    correctIndex: 2,
    explanation: 'Президент — высшее должностное лицо в России.',
  },
  {
    id: 3,
    question: 'Сколько субъектов в Российской Федерации?',
    options: ['85', '89', '83', '91'],
    correctIndex: 0,
    explanation: 'В состав РФ входят 85 субъектов.',
  },
  {
    id: 4,
    question: 'Государственный флаг России состоит из полос:',
    options: ['Красной, синей, белой', 'Белой, синей, красной', 'Синей, белой, красной', 'Красной, белой, синей'],
    correctIndex: 1,
    explanation: 'Флаг России — белая, синяя и красная горизонтальные полосы.',
  },
  {
    id: 5,
    question: 'В каком году была принята Конституция РФ?',
    options: ['1991', '1993', '1995', '2000'],
    correctIndex: 1,
    explanation: 'Конституция РФ была принята 12 декабря 1993 года.',
  },
  {
    id: 6,
    question: 'Выберите правильное продолжение: "Я живу _____ Москве."',
    options: ['на', 'в', 'к', 'у'],
    correctIndex: 1,
    explanation: '"В" используется с названиями городов: в Москве, в Петербурге.',
  },
  {
    id: 7,
    question: 'Какой падеж отвечает на вопрос "Кого? Чего?"',
    options: ['Именительный', 'Родительный', 'Дательный', 'Винительный'],
    correctIndex: 1,
    explanation: 'Родительный падеж отвечает на вопросы "Кого? Чего?"',
  },
  {
    id: 8,
    question: 'День России отмечается:',
    options: ['1 января', '9 мая', '12 июня', '4 ноября'],
    correctIndex: 2,
    explanation: 'День России — государственный праздник, отмечается 12 июня.',
  },
  {
    id: 9,
    question: 'Какая река самая длинная в России?',
    options: ['Волга', 'Обь', 'Лена', 'Енисей'],
    correctIndex: 2,
    explanation: 'Лена — самая длинная река России (4400 км).',
  },
  {
    id: 10,
    question: 'Кто написал "Войну и мир"?',
    options: ['Достоевский', 'Пушкин', 'Толстой', 'Чехов'],
    correctIndex: 2,
    explanation: 'Лев Толстой — автор романа "Война и мир".',
  },
];

export function ExamTrainer({ onClose }: ExamTrainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  };

  const getOptionStyle = (index: number) => {
    if (!isAnswered) {
      return selectedOption === index
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300';
    }

    if (index === currentQuestion.correctIndex) {
      return 'border-green-500 bg-green-50';
    }

    if (index === selectedOption) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 opacity-50';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Тренажёр экзамена</h2>
              <p className="text-sm text-gray-500">Русский язык и история</p>
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
          {!isComplete ? (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Вопрос {currentIndex + 1} из {SAMPLE_QUESTIONS.length}</span>
                  <span>Баллов: {score}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
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
                          : isAnswered && index === selectedOption
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAnswered && index === currentQuestion.correctIndex ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isAnswered && index === selectedOption ? (
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
                <div className={`p-4 rounded-xl mb-6 ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'text-green-800'
                      : 'text-blue-800'
                  }`}>
                    <strong>
                      {selectedOption === currentQuestion.correctIndex ? 'Правильно! ' : 'Объяснение: '}
                    </strong>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Next button */}
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {currentIndex < SAMPLE_QUESTIONS.length - 1 ? (
                    <>
                      Следующий вопрос
                      <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    'Завершить тест'
                  )}
                </button>
              )}
            </>
          ) : (
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
                  {score} из {SAMPLE_QUESTIONS.length}
                </p>

                <p className="text-gray-500 mb-6">
                  {score === SAMPLE_QUESTIONS.length
                    ? 'Отлично! Все ответы правильные!'
                    : score >= SAMPLE_QUESTIONS.length * 0.7
                    ? 'Хороший результат!'
                    : score >= SAMPLE_QUESTIONS.length * 0.5
                    ? 'Неплохо, но есть над чем работать'
                    : 'Нужно больше практики'}
                </p>

                {/* Progress bar */}
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
                  <div
                    className={`h-full transition-all ${
                      score === SAMPLE_QUESTIONS.length
                        ? 'bg-emerald-500'
                        : score >= SAMPLE_QUESTIONS.length * 0.7
                        ? 'bg-green-500'
                        : score >= SAMPLE_QUESTIONS.length * 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(score / SAMPLE_QUESTIONS.length) * 100}%` }}
                  />
                </div>

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
          )}
        </div>
      </div>
    </div>
  );
}
