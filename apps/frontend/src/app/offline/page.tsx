'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-12 h-12 text-gray-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Нет подключения
      </h1>

      <p className="text-gray-600 text-center mb-8 max-w-sm">
        Проверьте подключение к интернету и попробуйте снова.
        Некоторые функции доступны офлайн.
      </p>

      <button
        onClick={handleRetry}
        className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
        Повторить
      </button>

      <div className="mt-12 p-4 bg-blue-50 rounded-xl max-w-sm">
        <h3 className="font-semibold text-blue-900 mb-2">
          Доступно офлайн:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Просмотр сохраненных документов</li>
          <li>• Заполнение форм (синхронизируются позже)</li>
          <li>• Калькулятор 90/180 дней</li>
          <li>• Справочная информация</li>
        </ul>
      </div>
    </div>
  );
}
