'use client';

import { useState } from 'react';
import { X, Camera, Edit3, FileText, MapPin, Calendar, AlertTriangle, Download, Printer, ChevronRight, Check, Loader2 } from 'lucide-react';

interface LegalizationWizardProps {
  onClose: () => void;
  profileData: {
    citizenship: string;
    entryDate: string;
    purpose: string;
    checkedDocs: string[];
  };
}

type WizardStep = 'intro' | 'data-intake' | 'scanning' | 'verification' | 'processing' | 'action-plan';

export function LegalizationWizard({ onClose, profileData }: LegalizationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [dataMethod, setDataMethod] = useState<'scan' | 'manual' | null>(null);
  const [passportData, setPassportData] = useState({
    lastName: '',
    firstName: '',
    passportNumber: '',
    issueDate: '',
    citizenship: 'Узбекистан',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Calculate missing documents
  const allRequiredDocs = ['passport', 'mig_card', 'registration', 'green_card', 'patent', 'receipts'];
  const missingDocs = allRequiredDocs.filter(doc => !profileData.checkedDocs.includes(doc));
  
  // Calculate deadline (mock - 90 days from entry)
  const entryDate = new Date(profileData.entryDate);
  const deadline = new Date(entryDate);
  deadline.setDate(deadline.getDate() + 90);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const renderIntro = () => (
    <div className="space-y-6">
      {/* Current Situation */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Ваша текущая ситуация</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Гражданство</p>
              <p className="font-semibold text-gray-900">🇺🇿 {profileData.citizenship}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Дата въезда</p>
              <p className="font-semibold text-gray-900">{profileData.entryDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Цель визита</p>
              <p className="font-semibold text-gray-900">💼 {profileData.purpose}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-300">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-orange-900 mb-2">Вердикт системы</h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              Вам необходимо оформить <strong>{missingDocs.length} документов</strong> до{' '}
              <strong>{deadline.toLocaleDateString('ru-RU')}</strong> ({daysLeft} дней).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mt-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Недостающие документы:</p>
          <div className="flex flex-wrap gap-2">
            {missingDocs.map(doc => (
              <span key={doc} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {doc === 'green_card' && '💳 Зеленая карта'}
                {doc === 'patent' && '📄 Патент'}
                {doc === 'registration' && '📋 Регистрация'}
                {doc === 'receipts' && '🧾 Чеки'}
                {doc === 'mig_card' && '🎫 Миграционная карта'}
                {doc === 'passport' && '🛂 Паспорт'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => setCurrentStep('data-intake')}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-5 px-6 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all active:scale-98 shadow-xl flex items-center justify-center gap-2"
      >
        <span className="text-lg">Начать оформление</span>
        <ChevronRight className="w-6 h-6" />
      </button>

      <p className="text-xs text-center text-gray-500">
        Мы сгенерируем все необходимые заявления и покажем точный план действий
      </p>
    </div>
  );

  const renderDataIntake = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Шаг 1. Паспортные данные</h3>
        <p className="text-sm text-gray-600">
          Выберите способ ввода данных для генерации заявлений
        </p>
      </div>

      {!dataMethod ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Scan Option */}
          <button
            onClick={() => setDataMethod('scan')}
            className="relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all active:scale-98 text-left group"
          >
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Рекомендуется
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">📸 Сканировать камерой</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Автоматическое распознавание данных из паспорта. Быстро и без ошибок.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">OCR технология</span>
                </div>
              </div>
            </div>
          </button>

          {/* Manual Option */}
          <button
            onClick={() => setDataMethod('manual')}
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all active:scale-98 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Edit3 className="w-7 h-7 text-gray-600" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">✍️ Заполнить вручную</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Введите данные самостоятельно. Бесплатно, но требует внимательности.
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dataMethod === 'scan' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-32 h-32 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Сфотографируйте разворот с фото</h4>
                <p className="text-sm text-gray-600">
                  Убедитесь, что нет бликов и все данные читаемы
                </p>
              </div>

              <button 
                onClick={() => {
                  // Mock: Simulate OCR scanning
                  setCurrentStep('scanning');
                }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Открыть камеру
              </button>
            </div>
          )}

          {dataMethod === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={passportData.lastName}
                  onChange={(e) => setPassportData({...passportData, lastName: e.target.value})}
                  placeholder="УСМАНОВ"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={passportData.firstName}
                  onChange={(e) => setPassportData({...passportData, firstName: e.target.value})}
                  placeholder="АЛИШЕР"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Номер паспорта
                </label>
                <input
                  type="text"
                  value={passportData.passportNumber}
                  onChange={(e) => setPassportData({...passportData, passportNumber: e.target.value})}
                  placeholder="AA 1234567"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Дата выдачи
                </label>
                <input
                  type="date"
                  value={passportData.issueDate}
                  onChange={(e) => setPassportData({...passportData, issueDate: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Гражданство
                </label>
                <select
                  value={passportData.citizenship}
                  onChange={(e) => setPassportData({...passportData, citizenship: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Узбекистан">🇺🇿 Узбекистан</option>
                  <option value="Таджикистан">🇹🇯 Таджикистан</option>
                  <option value="Киргизия">🇰🇬 Киргизия</option>
                  <option value="Другая">Другая</option>
                </select>
              </div>
            </div>
          )}

          {/* Show verification button for manual entry */}
          {dataMethod === 'manual' && (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Проверьте данные</p>
                    <p className="text-xs text-yellow-800">
                      Ошибка в одной букве делает документ недействительным
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('verification')}
                disabled={!passportData.lastName || !passportData.firstName || !passportData.passportNumber || !passportData.issueDate}
                className={`w-full font-bold py-4 rounded-xl transition-colors ${
                  passportData.lastName && passportData.firstName && passportData.passportNumber && passportData.issueDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Продолжить
              </button>

              <button
                onClick={() => setDataMethod(null)}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ← Назад к выбору способа
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderScanning = () => {
    // Auto-advance after 2 seconds (simulating OCR)
    setTimeout(() => {
      // Pre-fill with mock OCR data
      setPassportData({
        lastName: 'УСМАНОВ',
        firstName: 'АЛИШЕР',
        passportNumber: 'AA 1234567',
        issueDate: '2020-03-15',
        citizenship: 'Узбекистан',
      });
      setCurrentStep('verification');
    }, 2000);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Распознаем данные...</h3>
        
        <div className="space-y-3 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Обрабатываем изображение...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Распознаем текст (OCR)...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Проверяем формат данных...</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
          <p className="text-xs text-blue-800 text-center">
            ⏱️ OCR обычно занимает 5-10 секунд
          </p>
        </div>
      </div>
    );
  };

  const renderVerification = () => {
    const isValid = passportData.lastName && passportData.firstName && passportData.passportNumber && passportData.issueDate;

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Проверьте данные</h3>
          <p className="text-sm text-gray-600">
            {dataMethod === 'scan' 
              ? 'Мы распознали данные автоматически. Исправьте ошибки, если они есть.'
              : 'Убедитесь, что все данные введены правильно.'}
          </p>
        </div>

        {/* OCR Confidence Badge (only for scan) */}
        {dataMethod === 'scan' && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              Точность распознавания: 98%
            </span>
          </div>
        )}

        {/* Editable Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Фамилия
            </label>
            <input
              type="text"
              value={passportData.lastName}
              onChange={(e) => setPassportData({...passportData, lastName: e.target.value})}
              placeholder="УСМАНОВ"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Имя
            </label>
            <input
              type="text"
              value={passportData.firstName}
              onChange={(e) => setPassportData({...passportData, firstName: e.target.value})}
              placeholder="АЛИШЕР"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Номер паспорта
            </label>
            <input
              type="text"
              value={passportData.passportNumber}
              onChange={(e) => setPassportData({...passportData, passportNumber: e.target.value})}
              placeholder="AA 1234567"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Дата выдачи
            </label>
            <input
              type="date"
              value={passportData.issueDate}
              onChange={(e) => setPassportData({...passportData, issueDate: e.target.value})}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Гражданство
            </label>
            <select
              value={passportData.citizenship}
              onChange={(e) => setPassportData({...passportData, citizenship: e.target.value})}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Узбекистан">🇺🇿 Узбекистан</option>
              <option value="Таджикистан">🇹🇯 Таджикистан</option>
              <option value="Киргизия">🇰🇬 Киргизия</option>
              <option value="Другая">Другая</option>
            </select>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Критически важно</p>
              <p className="text-xs text-red-800 leading-relaxed">
                Ошибка в одной букве делает документ недействительным. Проверьте каждое поле внимательно.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
          <input
            type="checkbox"
            id="confirm-verification"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5"
          />
          <label htmlFor="confirm-verification" className="text-sm text-gray-700">
            <strong>Я лично проверил данные.</strong> Подтверждаю правильность. Ответственность беру на себя.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (isConfirmed) {
                setCurrentStep('processing');
              }
            }}
            disabled={!isConfirmed || !isValid}
            className={`w-full font-bold py-4 rounded-xl transition-colors ${
              isConfirmed && isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Всё верно, продолжить
          </button>

          {dataMethod === 'scan' && (
            <button
              onClick={() => {
                setCurrentStep('data-intake');
                setDataMethod('scan');
                setIsConfirmed(false);
              }}
              className="w-full bg-orange-100 text-orange-700 font-semibold py-3 rounded-xl hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Переснять фото
            </button>
          )}

          <button
            onClick={() => {
              setDataMethod(null);
              setCurrentStep('data-intake');
              setIsConfirmed(false);
            }}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            ← Назад к выбору способа
          </button>
        </div>
      </div>
    );
  };

  const renderProcessing = () => {
    // Auto-advance after 3 seconds
    setTimeout(() => {
      setCurrentStep('action-plan');
    }, 3000);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Генерируем документы...</h3>
        
        <div className="space-y-3 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Анализируем законы РФ...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Подбираем бланки МВД...</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Генерируем заявления...</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
          <p className="text-xs text-blue-800 text-center">
            ⏱️ Обычно это занимает 10-15 секунд
          </p>
        </div>
      </div>
    );
  };

  const renderActionPlan = () => (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Документы готовы!</h3>
        <p className="text-sm text-green-800">
          Мы подготовили полный пакет для легализации
        </p>
      </div>

      {/* Generated Forms */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Сгенерированные документы
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Заявление на патент.pdf</p>
                <p className="text-xs text-gray-500">124 KB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Download className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Printer className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Уведомление о прибытии.pdf</p>
                <p className="text-xs text-gray-500">98 KB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Download className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Printer className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
        <h4 className="font-bold text-gray-900 mb-4">Пошаговый план действий</h4>
        
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Куда идти
              </h5>
              <p className="text-sm text-gray-700 mb-2">ММЦ Сахарово (Медицинский центр)</p>
              <button className="text-xs text-blue-600 font-medium hover:underline">
                Открыть на карте →
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Когда
              </h5>
              <p className="text-sm text-gray-700">Завтра, с 08:00 до 12:00</p>
              <p className="text-xs text-gray-500 mt-1">Приходите с утра, меньше очередь</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Что взять
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Паспорт (оригинал)</li>
                <li>• Миграционную карту</li>
                <li>• Распечатанные заявления (выше)</li>
                <li>• 3,500₽ наличными</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Block */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-red-900 mb-2">⚠️ Что будет, если не сделать?</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Штраф до <strong>7,000₽</strong></li>
              <li>• Аннулирование сроков пребывания</li>
              <li>• Запрет на въезд в РФ на <strong>3-5 лет</strong></li>
              <li>• Депортация за счет нарушителя</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-98 shadow-xl"
      >
        Отлично, я понял!
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Мастер легализации</h2>
              <p className="text-xs text-blue-100">
                {currentStep === 'intro' && 'Анализ ситуации'}
                {currentStep === 'data-intake' && 'Шаг 1: Выбор способа'}
                {currentStep === 'scanning' && 'Шаг 2: Сканирование...'}
                {currentStep === 'verification' && 'Шаг 3: Проверка данных'}
                {currentStep === 'processing' && 'Шаг 4: Генерация...'}
                {currentStep === 'action-plan' && 'Готово!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'data-intake' && renderDataIntake()}
          {currentStep === 'scanning' && renderScanning()}
          {currentStep === 'verification' && renderVerification()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'action-plan' && renderActionPlan()}
        </div>
      </div>
    </div>
  );
}
