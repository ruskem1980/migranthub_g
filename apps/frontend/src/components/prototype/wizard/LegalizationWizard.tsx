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

type WizardStep = 'intro' | 'quick-select' | 'document-scan' | 'scanning' | 'verification' | 'processing' | 'action-plan';

interface DocumentToScan {
  id: string;
  title: string;
  icon: string;
  description: string;
  fields: string[];
}

export function LegalizationWizard({ onClose, profileData }: LegalizationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [scanMode, setScanMode] = useState<'step-by-step' | 'quick-select' | null>(null);
  const [selectedDocsToScan, setSelectedDocsToScan] = useState<string[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [dataMethod, setDataMethod] = useState<'scan' | 'manual' | null>(null);
  const [scannedDocuments, setScannedDocuments] = useState<Record<string, any>>({});
  const [currentDocData, setCurrentDocData] = useState<Record<string, string>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Calculate missing documents
  const allRequiredDocs = ['passport', 'mig_card', 'registration', 'green_card', 'patent', 'receipts'];
  const missingDocs = allRequiredDocs.filter(doc => !profileData.checkedDocs.includes(doc));

  // Define documents to scan based on purpose (Russian Federation legislation)
  const getDocumentsToScan = (purpose: string, citizenship: string): DocumentToScan[] => {
    const docs: DocumentToScan[] = [];
    const isEAEU = ['Армения', 'Беларусь', 'Казахстан', 'Киргизия'].includes(citizenship);

    // 1. ПАСПОРТ (Всегда обязателен)
    if (!profileData.checkedDocs.includes('passport')) {
      docs.push({
        id: 'passport',
        title: 'Паспорт',
        icon: '🛂',
        description: 'Разворот с фото и личными данными',
        fields: ['lastName', 'firstName', 'middleName', 'passportNumber', 'issueDate', 'birthDate', 'birthPlace'],
      });
    }

    // 2. МИГРАЦИОННАЯ КАРТА (Всегда обязательна для не-ЕАЭС)
    if (!isEAEU && !profileData.checkedDocs.includes('mig_card')) {
      docs.push({
        id: 'mig_card',
        title: 'Миграционная карта',
        icon: '🎫',
        description: 'Карта, выданная на границе при въезде',
        fields: ['cardNumber', 'entryDate', 'borderPoint', 'purpose'],
      });
    }

    // ДЛЯ ЦЕЛИ "РАБОТА"
    if (purpose === 'Работа') {
      // 3. МЕДИЦИНСКАЯ СПРАВКА + ДАКТИЛОСКОПИЯ (Зеленая карта)
      if (!profileData.checkedDocs.includes('green_card')) {
        docs.push({
          id: 'green_card',
          title: 'Зеленая карта (Медосмотр + Дактилоскопия)',
          icon: '💳',
          description: 'Карта из авторизованного медицинского центра',
          fields: ['cardNumber', 'issueDate', 'expiryDate', 'medicalCenter', 'doctorName'],
        });
      }

      // 4. СЕРТИФИКАТ О ВЛАДЕНИИ РУССКИМ ЯЗЫКОМ
      if (!profileData.checkedDocs.includes('exam')) {
        docs.push({
          id: 'exam',
          title: 'Сертификат (Экзамен по русскому языку)',
          icon: '🎓',
          description: 'Сертификат из центра тестирования',
          fields: ['certificateNumber', 'issueDate', 'testCenter', 'score'],
        });
      }

      // 5. ПОЛИС ДМС (Добровольное медицинское страхование)
      if (!profileData.checkedDocs.includes('insurance')) {
        docs.push({
          id: 'insurance',
          title: 'Полис ДМС',
          icon: '🩺',
          description: 'Договор медицинского страхования',
          fields: ['policyNumber', 'issueDate', 'expiryDate', 'insuranceCompany'],
        });
      }

      // 6. ТРУДОВОЙ ДОГОВОР (Если есть работодатель)
      if (!isEAEU && !profileData.checkedDocs.includes('contract')) {
        docs.push({
          id: 'contract',
          title: 'Трудовой договор',
          icon: '📝',
          description: 'Договор с работодателем',
          fields: ['employerName', 'employerINN', 'jobTitle', 'salary', 'startDate'],
        });
      }

      // 7. УВЕДОМЛЕНИЕ О ПРИБЫТИИ (Регистрация)
      if (!profileData.checkedDocs.includes('registration')) {
        docs.push({
          id: 'registration',
          title: 'Уведомление о прибытии (Регистрация)',
          icon: '📋',
          description: 'Подтверждение регистрации по месту пребывания',
          fields: ['hostFullName', 'hostAddress', 'registrationDate', 'expiryDate'],
        });
      }

      // 8. ФОТО 3x4 (Для патента)
      docs.push({
        id: 'photo',
        title: 'Фотография 3x4',
        icon: '📸',
        description: 'Цветное фото на белом фоне',
        fields: ['photoConfirm'],
      });
    }

    // ДЛЯ ЦЕЛИ "УЧЕБА"
    if (purpose === 'Учеба') {
      // Приглашение от учебного заведения
      if (!profileData.checkedDocs.includes('invitation')) {
        docs.push({
          id: 'invitation',
          title: 'Приглашение от ВУЗа',
          icon: '📨',
          description: 'Официальное приглашение на обучение',
          fields: ['universityName', 'invitationNumber', 'issueDate', 'studyPeriod'],
        });
      }

      // Медицинская справка
      if (!profileData.checkedDocs.includes('medical')) {
        docs.push({
          id: 'medical',
          title: 'Медицинская справка (форма 086/у)',
          icon: '🏥',
          description: 'Справка о состоянии здоровья',
          fields: ['certificateNumber', 'issueDate', 'clinicName'],
        });
      }
    }

    // ДЛЯ ЦЕЛИ "ТУРИЗМ"
    if (purpose === 'Туризм') {
      // Обратный билет
      docs.push({
        id: 'ticket',
        title: 'Обратный билет',
        icon: '✈️',
        description: 'Билет на выезд из РФ',
        fields: ['ticketNumber', 'departureDate', 'destination'],
      });

      // Бронь гостиницы
      docs.push({
        id: 'hotel',
        title: 'Бронь гостиницы',
        icon: '🏨',
        description: 'Подтверждение бронирования',
        fields: ['hotelName', 'hotelAddress', 'checkIn', 'checkOut'],
      });
    }

    // ДЛЯ ЦЕЛИ "ЧАСТНЫЙ"
    if (purpose === 'Частный') {
      // Приглашение от физлица
      if (!profileData.checkedDocs.includes('private_invitation')) {
        docs.push({
          id: 'private_invitation',
          title: 'Приглашение от гражданина РФ',
          icon: '💌',
          description: 'Нотариально заверенное приглашение',
          fields: ['inviterFullName', 'inviterPassport', 'inviterAddress', 'notaryName'],
        });
      }
    }

    return docs;
  };

  const documentsToScan = getDocumentsToScan(profileData.purpose, profileData.citizenship);
  const currentDocument = documentsToScan[currentDocIndex];
  
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
      <div className="space-y-3">
        <button
          onClick={() => setCurrentStep('quick-select')}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-5 px-6 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all active:scale-98 shadow-xl flex items-center justify-center gap-2"
        >
          <span className="text-lg">Начать оформление</span>
          <ChevronRight className="w-6 h-6" />
        </button>

        <p className="text-xs text-center text-gray-500">
          Мы проведём вас шаг за шагом через все необходимые документы
        </p>
      </div>

      <p className="text-xs text-center text-gray-500">
        Мы сгенерируем все необходимые заявления и покажем точный план действий
      </p>
    </div>
  );

  const renderDocumentScan = () => {
    if (!currentDocument) {
      setCurrentStep('processing');
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {documentsToScan.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentDocIndex
                    ? 'bg-green-500 text-white'
                    : index === currentDocIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentDocIndex ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {currentDocIndex + 1} из {documentsToScan.length}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{currentDocument.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentDocument.title}</h3>
          <p className="text-sm text-gray-600">
            {currentDocument.description}
          </p>
        </div>

        {!dataMethod ? (
          <div className="space-y-4">
            {/* Scan Option */}
            <button
              onClick={() => setDataMethod('scan')}
              className="relative w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all active:scale-98 text-left group"
            >
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Рекомендуется
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">📸 Сканировать</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Автоматическое распознавание данных. Быстро и без ошибок.
                  </p>
                </div>
              </div>
            </button>

            {/* Manual Option */}
            <button
              onClick={() => setDataMethod('manual')}
              className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all active:scale-98 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-7 h-7 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">✍️ Ввести вручную</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Введите данные самостоятельно.
                  </p>
                </div>
              </div>
            </button>

            {/* Skip Option - NEW */}
            <button
              onClick={() => {
                // Skip this document and move to next
                if (currentDocIndex < documentsToScan.length - 1) {
                  setCurrentDocIndex(currentDocIndex + 1);
                  setDataMethod(null);
                  setCurrentDocData({});
                  setIsConfirmed(false);
                } else {
                  setCurrentStep('processing');
                }
              }}
              className="w-full p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-all active:scale-98"
            >
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-700">Нет документа, пропустить</span>
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
                  <h4 className="font-bold text-gray-900 mb-2">Сфотографируйте документ</h4>
                  <p className="text-sm text-gray-600">
                    Убедитесь, что нет бликов и все данные читаемы
                  </p>
                </div>

                <button 
                  onClick={() => {
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
                {currentDocument.fields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field === 'lastName' && 'Фамилия'}
                      {field === 'firstName' && 'Имя'}
                      {field === 'middleName' && 'Отчество'}
                      {field === 'passportNumber' && 'Номер паспорта'}
                      {field === 'issueDate' && 'Дата выдачи'}
                      {field === 'birthDate' && 'Дата рождения'}
                      {field === 'birthPlace' && 'Место рождения'}
                      {field === 'citizenship' && 'Гражданство'}
                      {field === 'cardNumber' && 'Номер карты'}
                      {field === 'entryDate' && 'Дата въезда'}
                      {field === 'borderPoint' && 'Пункт пропуска'}
                      {field === 'purpose' && 'Цель визита'}
                      {field === 'medicalCenter' && 'Медицинский центр'}
                      {field === 'expiryDate' && 'Срок действия'}
                      {field === 'doctorName' && 'ФИО врача'}
                      {field === 'certificateNumber' && 'Номер сертификата'}
                      {field === 'testCenter' && 'Центр тестирования'}
                      {field === 'score' && 'Балл'}
                      {field === 'policyNumber' && 'Номер полиса'}
                      {field === 'insuranceCompany' && 'Страховая компания'}
                      {field === 'employerName' && 'Название работодателя'}
                      {field === 'employerINN' && 'ИНН работодателя'}
                      {field === 'jobTitle' && 'Должность'}
                      {field === 'salary' && 'Зарплата (руб/мес)'}
                      {field === 'startDate' && 'Дата начала работы'}
                      {field === 'hostFullName' && 'ФИО принимающего'}
                      {field === 'hostAddress' && 'Адрес регистрации'}
                      {field === 'registrationDate' && 'Дата регистрации'}
                      {field === 'universityName' && 'Название ВУЗа'}
                      {field === 'invitationNumber' && 'Номер приглашения'}
                      {field === 'studyPeriod' && 'Срок обучения'}
                      {field === 'clinicName' && 'Название клиники'}
                      {field === 'ticketNumber' && 'Номер билета'}
                      {field === 'departureDate' && 'Дата вылета'}
                      {field === 'destination' && 'Пункт назначения'}
                      {field === 'hotelName' && 'Название гостиницы'}
                      {field === 'hotelAddress' && 'Адрес гостиницы'}
                      {field === 'checkIn' && 'Дата заезда'}
                      {field === 'checkOut' && 'Дата выезда'}
                      {field === 'inviterFullName' && 'ФИО приглашающего'}
                      {field === 'inviterPassport' && 'Паспорт приглашающего'}
                      {field === 'inviterAddress' && 'Адрес приглашающего'}
                      {field === 'notaryName' && 'ФИО нотариуса'}
                      {field === 'photoConfirm' && 'Подтверждение фото'}
                    </label>
                    {field === 'photoConfirm' ? (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <input
                          type="checkbox"
                          checked={currentDocData[field] === 'true'}
                          onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.checked ? 'true' : ''})}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700">У меня есть фото 3x4 на белом фоне</span>
                      </div>
                    ) : field === 'hostAddress' || field === 'inviterAddress' || field === 'hotelAddress' ? (
                      <textarea
                        value={currentDocData[field] || ''}
                        onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <input
                        type={field.includes('Date') ? 'date' : field === 'salary' || field === 'score' ? 'number' : 'text'}
                        value={currentDocData[field] || ''}
                        onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setCurrentStep('verification')}
              disabled={dataMethod === 'manual' && !currentDocument.fields.every(f => currentDocData[f])}
              className={`w-full font-bold py-4 rounded-xl transition-colors ${
                dataMethod === 'scan' || currentDocument.fields.every(f => currentDocData[f])
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
          </div>
        )}
      </div>
    );
  };

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
    if (!currentDocument) return null;

    // Auto-advance after 2 seconds (simulating OCR)
    setTimeout(() => {
      // Pre-fill with mock OCR data based on document type
      const mockData: Record<string, any> = {};
      
      if (currentDocument.id === 'passport') {
        mockData.lastName = 'УСМАНОВ';
        mockData.firstName = 'АЛИШЕР';
        mockData.middleName = 'БАХТИЯРОВИЧ';
        mockData.passportNumber = 'AA 1234567';
        mockData.issueDate = '2020-03-15';
        mockData.birthDate = '1990-05-20';
        mockData.birthPlace = 'г. Ташкент';
      } else if (currentDocument.id === 'mig_card') {
        mockData.cardNumber = '1234567890123';
        mockData.entryDate = '2024-01-01';
        mockData.borderPoint = 'Аэропорт Домодедово';
        mockData.purpose = 'Работа';
      } else if (currentDocument.id === 'green_card') {
        mockData.cardNumber = 'ЗК-2024-001234';
        mockData.issueDate = '2024-01-15';
        mockData.expiryDate = '2025-01-15';
        mockData.medicalCenter = 'ММЦ Сахарово';
        mockData.doctorName = 'Иванов И.И.';
      } else if (currentDocument.id === 'exam') {
        mockData.certificateNumber = 'РЯ-2024-5678';
        mockData.issueDate = '2024-01-10';
        mockData.testCenter = 'Центр тестирования РУДН';
        mockData.score = '85';
      } else if (currentDocument.id === 'insurance') {
        mockData.policyNumber = 'ДМС-2024-9999';
        mockData.issueDate = '2024-01-01';
        mockData.expiryDate = '2025-01-01';
        mockData.insuranceCompany = 'СОГАЗ';
      } else if (currentDocument.id === 'contract') {
        mockData.employerName = 'ООО "Стройкомплекс"';
        mockData.employerINN = '7701234567';
        mockData.jobTitle = 'Строитель';
        mockData.salary = '50000';
        mockData.startDate = '2024-02-01';
      } else if (currentDocument.id === 'registration') {
        mockData.hostFullName = 'Петров Петр Петрович';
        mockData.hostAddress = 'г. Москва, ул. Ленина, д. 1, кв. 10';
        mockData.registrationDate = '2024-01-05';
        mockData.expiryDate = '2024-04-05';
      } else if (currentDocument.id === 'photo') {
        mockData.photoConfirm = 'true';
      } else if (currentDocument.id === 'invitation') {
        mockData.universityName = 'МГУ им. Ломоносова';
        mockData.invitationNumber = 'ПР-2024-001';
        mockData.issueDate = '2023-12-15';
        mockData.studyPeriod = '2024-2028';
      } else if (currentDocument.id === 'medical') {
        mockData.certificateNumber = '086-2024-123';
        mockData.issueDate = '2024-01-05';
        mockData.clinicName = 'Городская поликлиника №1';
      } else if (currentDocument.id === 'ticket') {
        mockData.ticketNumber = 'SU1234';
        mockData.departureDate = '2024-03-15';
        mockData.destination = 'Ташкент';
      } else if (currentDocument.id === 'hotel') {
        mockData.hotelName = 'Гостиница "Космос"';
        mockData.hotelAddress = 'г. Москва, пр-т Мира, д. 150';
        mockData.checkIn = '2024-01-01';
        mockData.checkOut = '2024-01-15';
      } else if (currentDocument.id === 'private_invitation') {
        mockData.inviterFullName = 'Сидоров Сидор Сидорович';
        mockData.inviterPassport = '4512 345678';
        mockData.inviterAddress = 'г. Москва, ул. Пушкина, д. 5, кв. 20';
        mockData.notaryName = 'Нотариус Смирнова А.А.';
      }
      
      setCurrentDocData(mockData);
      setCurrentStep('verification');
    }, 2000);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">{currentDocument.icon}</span>
        </div>
        
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Распознаем {currentDocument.title}...</h3>
        <p className="text-sm text-gray-600 mb-6">{currentDocument.description}</p>
        
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
    if (!currentDocument) return null;

    const isValid = currentDocument.fields.every(field => currentDocData[field]);

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {documentsToScan.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentDocIndex
                    ? 'bg-green-500 text-white'
                    : index === currentDocIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentDocIndex ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {currentDocIndex + 1} из {documentsToScan.length}
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{currentDocument.icon}</span>
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
          {currentDocument.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field === 'lastName' && 'Фамилия'}
                {field === 'firstName' && 'Имя'}
                {field === 'passportNumber' && 'Номер паспорта'}
                {field === 'issueDate' && 'Дата выдачи'}
                {field === 'citizenship' && 'Гражданство'}
                {field === 'cardNumber' && 'Номер карты'}
                {field === 'entryDate' && 'Дата въезда'}
                {field === 'borderPoint' && 'Пункт пропуска'}
                {field === 'medicalCenter' && 'Медицинский центр'}
              </label>
              <input
                type={field.includes('Date') ? 'date' : 'text'}
                value={currentDocData[field] || ''}
                onChange={(e) => setCurrentDocData({...currentDocData, [field]: e.target.value})}
                placeholder={field === 'lastName' ? 'УСМАНОВ' : field === 'firstName' ? 'АЛИШЕР' : ''}
                className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  field.includes('Name') || field.includes('Number') ? 'font-mono uppercase' : ''
                }`}
              />
            </div>
          ))}
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
              if (isConfirmed && isValid) {
                // Save current document data
                setScannedDocuments({
                  ...scannedDocuments,
                  [currentDocument.id]: currentDocData,
                });

                // Move to next document or processing
                if (currentDocIndex < documentsToScan.length - 1) {
                  setCurrentDocIndex(currentDocIndex + 1);
                  setCurrentStep('document-scan');
                  setDataMethod(null);
                  setCurrentDocData({});
                  setIsConfirmed(false);
                } else {
                  setCurrentStep('processing');
                }
              }
            }}
            disabled={!isConfirmed || !isValid}
            className={`w-full font-bold py-4 rounded-xl transition-colors ${
              isConfirmed && isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentDocIndex < documentsToScan.length - 1 
              ? 'Следующий документ →' 
              : 'Всё верно, продолжить'}
          </button>

          {dataMethod === 'scan' && (
            <button
              onClick={() => {
                setCurrentStep('document-scan');
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
              setCurrentStep('document-scan');
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
                {currentStep === 'document-scan' && `Документ ${currentDocIndex + 1} из ${documentsToScan.length}`}
                {currentStep === 'scanning' && 'Сканирование...'}
                {currentStep === 'verification' && 'Проверка данных'}
                {currentStep === 'processing' && 'Генерация...'}
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
          {currentStep === 'document-scan' && renderDocumentScan()}
          {currentStep === 'scanning' && renderScanning()}
          {currentStep === 'verification' && renderVerification()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'action-plan' && renderActionPlan()}
        </div>
      </div>
    </div>
  );
}
