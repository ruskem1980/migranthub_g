import Link from 'next/link';

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛡️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MigrantHub
            </h1>
            <p className="text-gray-600">
              Экосистема для мигрантов в России
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/prototype"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-98 text-center shadow-lg"
            >
              🎨 Интерактивный Прототип
            </Link>

            <Link
              href="/dashboard"
              className="block w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-98 text-center"
            >
              📱 Основной Дашборд
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">Целевая аудитория:</p>
              <div className="flex justify-center gap-2 text-2xl">
                🇺🇿 🇹🇯 🇰🇬
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            Version 1.0.0 • Январь 2024
          </p>
        </div>
      </div>
    </div>
  );
}
