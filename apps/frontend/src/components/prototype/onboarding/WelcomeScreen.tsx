'use client';

import { Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
          <span className="text-5xl">🛡️</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-center">MigrantHub</h1>
        
        <p className="text-lg text-center text-blue-100 mb-12 max-w-sm leading-relaxed">
          MigrantHub — твой личный защитник. Мы помогаем оформить документы быстро, избежать штрафов и контролируем весь процесс легализации.
        </p>

        <div className="w-full max-w-sm mb-8">
          <p className="text-sm text-blue-200 mb-3 text-center font-medium">
            Выберите язык:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-xl p-4 transition-all active:scale-95">
              <div className="text-3xl mb-2">🇷🇺</div>
              <div className="text-sm font-semibold">Русский</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 transition-all active:scale-95">
              <div className="text-3xl mb-2">🇺🇿</div>
              <div className="text-sm font-semibold">O'zbek</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 transition-all active:scale-95">
              <div className="text-3xl mb-2">🇹🇯</div>
              <div className="text-sm font-semibold">Тоҷикӣ</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 transition-all active:scale-95">
              <div className="text-3xl mb-2">🇰🇬</div>
              <div className="text-sm font-semibold">Кыргызча</div>
            </button>
          </div>
          
          <button className="w-full mt-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-semibold">Другой язык (AI)</span>
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm bg-white text-blue-600 font-bold py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all active:scale-98 shadow-xl"
      >
        Начать
      </button>
    </div>
  );
}
