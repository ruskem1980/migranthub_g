'use client';

import { AlertTriangle, Phone, FileX, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface EmergencyAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

const secondaryActions: EmergencyAction[] = [
  {
    id: '1',
    title: 'Потерял документы',
    description: 'Инструкция по восстановлению',
    icon: FileX,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: '2',
    title: 'Звонок юристу',
    description: 'Платная консультация',
    icon: Phone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '3',
    title: 'Сообщить родным',
    description: 'Отправить геолокацию',
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const emergencyContacts = [
  { name: 'Полиция', number: '102', icon: '🚔' },
  { name: 'Скорая помощь', number: '103', icon: '🚑' },
  { name: 'МЧС', number: '112', icon: '🚨' },
];

export function SOSTab() {
  const handleEmergencyPress = () => {
    alert('ЭКСТРЕННЫЙ ВЫЗОВ: Отправка данных юристу и родственникам...');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Экстренная помощь</h1>
              <p className="text-sm text-red-100">Действуйте быстро и спокойно</p>
            </div>
          </div>
          <LanguageSwitcher variant="compact" className="bg-white/20 hover:bg-white/30 text-white" />
        </div>
      </div>

      {/* Main Emergency Button */}
      <div className="px-4 py-8">
        <button
          onClick={handleEmergencyPress}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-98 border-4 border-red-800"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-12 h-12" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold mb-2">МЕНЯ ЗАДЕРЖАЛИ</h2>
            <p className="text-sm text-red-100">
              Нажмите для экстренной помощи
            </p>
          </div>
        </button>

        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-medium">
            ⚠️ При задержании: сохраняйте спокойствие, не подписывайте документы без юриста, запомните номер отдела.
          </p>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Другие ситуации
        </h3>
        <div className="space-y-3">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-102 active:scale-98 shadow-sm',
                  action.bgColor,
                  'border-gray-200'
                )}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <Icon className={cn('w-6 h-6', action.color)} strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <div className={cn('text-2xl', action.color)}>→</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Экстренные службы
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {emergencyContacts.map((contact) => (
            <button
              key={contact.number}
              className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm active:scale-95"
            >
              <div className="text-3xl mb-2">{contact.icon}</div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                {contact.name}
              </div>
              <div className="text-lg font-bold text-red-600">
                {contact.number}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Important Info */}
      <div className="px-4 pb-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ваши права при задержании
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Право на адвоката</li>
            <li>• Право на звонок родным</li>
            <li>• Право на переводчика</li>
            <li>• Право знать причину задержания</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
