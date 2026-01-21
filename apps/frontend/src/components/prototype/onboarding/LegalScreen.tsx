'use client';

import { Shield } from 'lucide-react';
import { useState } from 'react';

interface LegalScreenProps {
  onNext: () => void;
}

export function LegalScreen({ onNext }: LegalScreenProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <Shield className="w-16 h-16 text-yellow-600" strokeWidth={2} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Юридическая чистота
        </h2>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6 max-w-sm">
          <p className="text-yellow-900 font-semibold text-center leading-relaxed">
            ⚠️ Мы не делаем фальшивые регистрации. Работаем только по закону РФ.
          </p>
        </div>

        <div className="max-w-sm space-y-2 mb-6">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">
            📄 Пользовательское соглашение
          </button>
          <br />
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">
            🔒 Политика конфиденциальности
          </button>
        </div>

        <button
          onClick={() => setAgreed(!agreed)}
          className="flex items-start gap-3 max-w-sm bg-white border-2 border-gray-200 rounded-xl p-4 mb-8 hover:border-blue-300 transition-all active:scale-98"
        >
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            agreed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
          }`}>
            {agreed && <span className="text-white text-sm">✓</span>}
          </div>
          <span className="text-left text-gray-700 font-medium">
            Ознакомлен, согласен, действую законно
          </span>
        </button>
      </div>

      <button
        onClick={onNext}
        disabled={!agreed}
        className={`w-full font-bold py-4 px-6 rounded-2xl transition-all ${
          agreed
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Далее
      </button>
    </div>
  );
}
