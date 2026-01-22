'use client';

import { Check, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AuditScreenProps {
  onNext: (checkedItems: string[]) => void;
}

interface DocumentItem {
  id: string;
  label: string;
  subtitle?: string;
  isNew?: boolean;
}

export function AuditScreen({ onNext }: AuditScreenProps) {
  const [checked, setChecked] = useState<string[]>([]);

  const items: DocumentItem[] = [
    { 
      id: 'passport', 
      label: '🛂 Паспорт',
    },
    { 
      id: 'mig_card', 
      label: '🎫 Миграционная карта',
    },
    { 
      id: 'registration', 
      label: '📋 Регистрация (Уведомление)',
    },
    { 
      id: 'green_card', 
      label: '💳 Зеленая карта (Дактилоскопия)',
      subtitle: 'Карта дактилоскопии и медицины',
      isNew: true,
    },
    { 
      id: 'patent', 
      label: '📄 Патент',
    },
    { 
      id: 'receipts', 
      label: '🧾 Чеки (НДФЛ)',
    },
    { 
      id: 'contract', 
      label: '📝 Трудовой договор',
      subtitle: 'Критично для граждан ЕАЭС',
      isNew: true,
    },
  ];

  const toggleItem = (id: string) => {
    setChecked(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Что у вас УЖЕ есть?
        </h2>
        <p className="text-gray-600">
          Отметьте документы, которые у вас есть
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = checked.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all active:scale-98 relative ${
                  isChecked
                    ? 'bg-green-50 border-green-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* New Badge */}
                {item.isNew && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                    NEW
                  </div>
                )}

                {/* Checkbox */}
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}>
                  {isChecked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                </div>

                {/* Label and Subtitle */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${
                      isChecked ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </span>
                    {item.subtitle && (
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional Logic Hint */}
        {checked.includes('receipts') && !checked.includes('patent') && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Подсказка:</strong> Чеки (НДФЛ) обычно бывают только при наличии Патента. Проверьте, есть ли у вас патент.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>Совет:</strong> Чем больше документов у вас есть, тем проще будет процесс легализации.
          </p>
        </div>
      </div>

      <button
        onClick={() => onNext(checked)}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all active:scale-98 shadow-lg"
      >
        Продолжить
      </button>
    </div>
  );
}
