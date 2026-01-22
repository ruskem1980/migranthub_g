'use client';

import { Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col p-6 text-white safe-area-inset">
      {/* Header Section - Compact */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <span className="text-4xl">🛡️</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-3 text-center">MigrantHub</h1>
        
        <p className="text-sm text-center text-blue-100 mb-6 max-w-sm leading-relaxed">
          Твой личный защитник. Помогаем оформить документы быстро, избежать штрафов и контролируем процесс легализации.
        </p>
      </div>

      {/* Language Selection - Compact */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto">
          <p className="text-sm text-blue-200 mb-3 text-center font-medium">
            Выберите язык:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-xl p-3 transition-all active:scale-95">
              <div className="text-2xl mb-1">🇷🇺</div>
              <div className="text-xs font-semibold">Русский</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 transition-all active:scale-95">
              <div className="text-2xl mb-1">🇺🇿</div>
              <div className="text-xs font-semibold">O'zbek</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 transition-all active:scale-95">
              <div className="text-2xl mb-1">🇹🇯</div>
              <div className="text-xs font-semibold">Тоҷикӣ</div>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 transition-all active:scale-95">
              <div className="text-2xl mb-1">🇰🇬</div>
              <div className="text-xs font-semibold">Кыргызча</div>
            </button>
          </div>
          
          <button className="w-full mt-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 rounded-xl p-2.5 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">Другой язык (AI)</span>
          </button>
        </div>
      </div>

      {/* Button Section - Fixed at bottom with padding */}
      <div className="pb-safe">
        <button
          onClick={onNext}
          className="w-full max-w-sm mx-auto bg-white text-blue-600 font-bold py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all active:scale-98 shadow-xl block"
        >
          Начать
        </button>
      </div>
    </div>
  );
}
