'use client';

import { AlertTriangle, Phone, FileX, MapPin, X } from 'lucide-react';
import { useState } from 'react';

export function SOSScreen() {
  const [showPoliceModal, setShowPoliceModal] = useState(false);
  const [showLostDocsModal, setShowLostDocsModal] = useState(false);
  const [policeReason, setPoliceReason] = useState('');
  const [lostDocType, setLostDocType] = useState('');

  return (
    <div className="h-full overflow-y-auto pb-4 bg-gradient-to-b from-red-50 to-white relative">
      {/* Header */}
      <div className="px-4 py-4 bg-red-600 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">🚨 SOS</h1>
            <p className="text-sm text-red-100">Экстренная помощь</p>
          </div>
        </div>
      </div>

      {/* Main Emergency Button */}
      <div className="px-4 py-8">
        <button 
          onClick={() => setShowPoliceModal(true)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-98 border-4 border-red-800"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-12 h-12" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold mb-2">ЗАДЕРЖАЛА ПОЛИЦИЯ</h2>
            <p className="text-sm text-red-100">
              Нажмите для получения инструкций
            </p>
          </div>
        </button>

        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-medium text-center">
            ⚠️ При задержании: сохраняйте спокойствие, не подписывайте документы без юриста
          </p>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Другие ситуации
        </h3>
        <div className="space-y-3 mb-6">
          <button 
            onClick={() => setShowLostDocsModal(true)}
            className="w-full flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl transition-all hover:scale-102 active:scale-98 shadow-md"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <FileX className="w-6 h-6 text-orange-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">ПОТЕРЯЛ ДОКУМЕНТЫ</h4>
              <p className="text-sm text-gray-600">Генерация заявления</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl transition-all hover:scale-102 active:scale-98 shadow-md">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-6 h-6 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">Я в беде</h4>
              <p className="text-sm text-gray-600">Отправить гео родным</p>
            </div>
          </button>
        </div>

        {/* Quick Calls */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Экстренные контакты
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm active:scale-95">
            <Phone className="w-6 h-6 text-red-600 mb-2" />
            <div className="text-xs font-medium text-gray-600 mb-1">Полиция</div>
            <div className="text-lg font-bold text-red-600">102</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm active:scale-95">
            <Phone className="w-6 h-6 text-red-600 mb-2" />
            <div className="text-xs font-medium text-gray-600 mb-1">Экстренная</div>
            <div className="text-lg font-bold text-red-600">112</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm active:scale-95">
            <span className="text-2xl mb-2">🏛</span>
            <div className="text-xs font-medium text-gray-600 mb-1">Консульство</div>
            <div className="text-xs font-bold text-blue-600">Связаться</div>
          </button>
          <button className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm active:scale-95">
            <span className="text-2xl mb-2">👨‍⚖️</span>
            <div className="text-xs font-medium text-gray-600 mb-1">Юрист</div>
            <div className="text-xs font-bold text-blue-600">Позвонить</div>
          </button>
        </div>
      </div>

      {/* Police Modal */}
      {showPoliceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Задержала полиция</h3>
              <button onClick={() => setShowPoliceModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Выберите причину задержания:</p>

            <div className="space-y-3 mb-6">
              {['Проверка документов', 'Нет документов', 'Нарушение ПДД', 'Другое'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setPoliceReason(reason)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    policeReason === reason
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {policeReason && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
                <h4 className="font-bold text-blue-900 mb-2">⚖️ Ваши права и алгоритм действий:</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  {policeReason === 'Проверка документов' && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ Что делать:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Предъявите паспорт и регистрацию спокойно</li>
                          <li>Вы имеете право снимать на видео (ст. 29 Конституции РФ)</li>
                          <li>Требуйте составить протокол на понятном языке</li>
                        </ul>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg">
                        <p className="font-bold text-red-900 mb-1">❌ Чего НЕ делать:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Не грубите и не сопротивляйтесь</li>
                          <li>Не давайте взятки (уголовная статья)</li>
                        </ul>
                      </div>
                    </>
                  )}
                  {policeReason === 'Нет документов' && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ Ваши права:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Право на переводчика (ст. 25.10 КоАП РФ)</li>
                          <li>Право на звонок юристу/родным</li>
                          <li>Право не подписывать протокол без понимания</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <p className="font-bold text-yellow-900 mb-1">⚠️ Важно:</p>
                        <p>Скажите: "Я требую переводчика и юриста. Протокол не подписываю."</p>
                      </div>
                    </>
                  )}
                  {(policeReason === 'Нарушение ПДД' || policeReason === 'Другое') && (
                    <>
                      <div className="bg-white p-3 rounded-lg mb-2">
                        <p className="font-bold text-blue-900 mb-1">✅ Немедленно:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Требуйте связи с консульством (Венская конвенция)</li>
                          <li>Ничего не подписывайте без переводчика</li>
                          <li>Запишите ФИО сотрудников и номер отдела</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="bg-purple-100 p-3 rounded-lg mt-2">
                    <p className="font-bold text-purple-900 mb-1">📞 Контакты:</p>
                    <ul className="space-y-1">
                      <li>Юрист 24/7: <span className="font-mono">+7 (495) 123-45-67</span></li>
                      <li>Консульство: <span className="font-mono">+7 (495) 234-56-78</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowPoliceModal(false)}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Lost Documents Modal */}
      {showLostDocsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Потерял документы</h3>
              <button onClick={() => setShowLostDocsModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Что потеряли?</p>

            <div className="space-y-3 mb-6">
              {['Паспорт', 'Миграционная карта', 'Патент', 'Регистрация'].map((doc) => (
                <button
                  key={doc}
                  onClick={() => setLostDocType(doc)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    lostDocType === doc
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {doc}
                </button>
              ))}
            </div>

            {lostDocType && (
              <div className="space-y-3 mb-4">
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <h4 className="font-bold text-yellow-900 mb-2">Шаги восстановления:</h4>
                  <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                    <li>Обратитесь в полицию (заявление о потере)</li>
                    <li>Получите справку</li>
                    <li>Обратитесь в консульство</li>
                    <li>Подготовьте документы</li>
                  </ol>
                </div>

                <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors">
                  Сгенерировать заявление
                </button>
              </div>
            )}

            <button
              onClick={() => setShowLostDocsModal(false)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
