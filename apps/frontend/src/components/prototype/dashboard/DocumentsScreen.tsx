'use client';

import { Camera, CheckCircle2, AlertTriangle, XCircle, Share2, Info } from 'lucide-react';

export function DocumentsScreen() {
  const documents = [
    {
      title: 'Паспорт',
      status: 'active',
      statusText: 'Активен',
      icon: '🛂',
      color: 'green',
    },
    {
      title: 'Патент',
      status: 'warning',
      statusText: 'Оплатить через 3 дня',
      icon: '📄',
      color: 'yellow',
      action: 'Продлить',
    },
    {
      title: 'Регистрация',
      status: 'error',
      statusText: 'Истекла',
      icon: '📋',
      color: 'red',
      action: 'Обновить',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Документы</h1>
        <p className="text-sm text-gray-500">Активный реестр</p>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-4 py-6 h-full">
          {documents.map((doc, index) => {
            const statusConfig = {
              green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: CheckCircle2,
                iconColor: 'text-green-600',
                textColor: 'text-green-700',
                button: 'bg-green-600 hover:bg-green-700',
              },
              yellow: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: AlertTriangle,
                iconColor: 'text-yellow-600',
                textColor: 'text-yellow-700',
                button: 'bg-yellow-600 hover:bg-yellow-700',
              },
              red: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: XCircle,
                iconColor: 'text-red-600',
                textColor: 'text-red-700',
                button: 'bg-red-600 hover:bg-red-700',
              },
            }[doc.color];

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={index}
                className={`flex-shrink-0 w-72 ${statusConfig.bg} border-2 ${statusConfig.border} rounded-3xl p-6 shadow-xl transition-transform hover:scale-105 active:scale-100`}
              >
                {/* Icon */}
                <div className="text-7xl text-center mb-4">{doc.icon}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  {doc.title}
                </h3>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                  <span className={`font-semibold ${statusConfig.textColor}`}>
                    {doc.statusText}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    className={`w-full ${statusConfig.button} text-white font-semibold py-3 px-4 rounded-xl transition-colors active:scale-98 shadow-lg`}
                  >
                    {doc.action}
                  </button>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-1 text-sm">
                      <Share2 className="w-4 h-4" />
                      Поделиться
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-1 text-sm">
                      <Info className="w-4 h-4" />
                      Инструкция
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center z-40"
        aria-label="Сканировать документ"
      >
        <Camera className="w-7 h-7" />
      </button>
    </div>
  );
}
