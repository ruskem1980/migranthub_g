'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

interface AuditScreenProps {
  onNext: (checkedItems: string[]) => void;
}

export function AuditScreen({ onNext }: AuditScreenProps) {
  const [checked, setChecked] = useState<string[]>([]);

  const items = [
    { id: 'passport', label: '🛂 Паспорт' },
    { id: 'migration_card', label: '🎫 Миграционная карта' },
    { id: 'receipts', label: '🧾 Чеки' },
    { id: 'patent', label: '📄 Патент' },
    { id: 'registration', label: '📋 Регистрация' },
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
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all active:scale-98 ${
                  isChecked
                    ? 'bg-green-50 border-green-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}>
                  {isChecked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-lg font-semibold ${
                  isChecked ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

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
