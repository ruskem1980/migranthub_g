'use client';

import { useState, useCallback } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  X,
  Edit3,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useStayPeriods } from '../hooks/useStayPeriods';
import { formatDate, formatDateShort } from '../calculator/stay-calculator';

interface StayCalculatorProps {
  onClose: () => void;
}

/**
 * Круговой прогресс-индикатор
 */
function CircularProgress({
  percent,
  status,
  size = 160,
  strokeWidth = 12,
}: {
  percent: number;
  status: 'safe' | 'warning' | 'danger' | 'overstay';
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  const getColor = () => {
    switch (status) {
      case 'overstay':
      case 'danger':
        return '#ef4444'; // red-500
      case 'warning':
        return '#eab308'; // yellow-500
      case 'safe':
      default:
        return '#22c55e'; // green-500
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'overstay':
      case 'danger':
        return '#fecaca'; // red-200
      case 'warning':
        return '#fef08a'; // yellow-200
      case 'safe':
      default:
        return '#bbf7d0'; // green-200
    }
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getBgColor()}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

/**
 * Форма добавления/редактирования периода
 */
function PeriodForm({
  initialEntry = '',
  initialExit = '',
  onSave,
  onCancel,
}: {
  initialEntry?: string;
  initialExit?: string;
  onSave: (entry: string, exit?: string) => void;
  onCancel: () => void;
}) {
  const [entryDate, setEntryDate] = useState(initialEntry);
  const [exitDate, setExitDate] = useState(initialExit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryDate) {
      onSave(entryDate, exitDate || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-blue-50 rounded-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Дата въезда *
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Дата выезда
          </label>
          <input
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            min={entryDate}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Оставьте дату выезда пустой, если вы ещё в России
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!entryDate}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export function StayCalculator({ onClose }: StayCalculatorProps) {
  const {
    periods,
    isLoading,
    calculation,
    recommendation,
    addPeriod,
    updatePeriod,
    deletePeriod,
    refresh,
  } = useStayPeriods();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  const handleAddPeriod = useCallback(async (entry: string, exit?: string) => {
    await addPeriod(entry, exit);
    setShowAddForm(false);
  }, [addPeriod]);

  const handleUpdatePeriod = useCallback(async (id: string, entry: string, exit?: string) => {
    await updatePeriod(id, { entryDate: entry, exitDate: exit });
    setEditingPeriodId(null);
  }, [updatePeriod]);

  const handleDeletePeriod = useCallback(async (id: string) => {
    await deletePeriod(id);
  }, [deletePeriod]);

  const getStatusColors = () => {
    switch (calculation.status) {
      case 'overstay':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          subtext: 'text-yellow-700',
        };
      case 'safe':
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          subtext: 'text-green-700',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Калькулятор 90/180</h2>
              <p className="text-sm text-gray-500">Расчёт дней пребывания</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Обновить"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Circular progress card */}
          <div className={`p-6 rounded-xl mb-6 ${colors.bg} border-2 ${colors.border}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <CircularProgress
                  percent={calculation.usagePercent}
                  status={calculation.status}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${colors.text}`}>
                    {calculation.isOverstay ? '+' : ''}{calculation.isOverstay ? calculation.overstayDays : calculation.daysRemaining}
                  </span>
                  <span className={`text-sm ${colors.subtext}`}>
                    {calculation.isOverstay ? 'дн. сверх' : 'дн. осталось'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              {calculation.isOverstay ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className={`w-5 h-5 ${
                  calculation.status === 'safe' ? 'text-green-600' :
                  calculation.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              )}
              <span className={`font-semibold ${colors.text}`}>
                Использовано {calculation.totalDays} из 90 дней
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  calculation.status === 'overstay' || calculation.status === 'danger'
                    ? 'bg-red-500' :
                  calculation.status === 'warning'
                    ? 'bg-yellow-500' :
                    'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, calculation.usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Next reset date */}
          {calculation.nextResetDate && calculation.daysUntilReset !== null && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl mb-6">
              <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800">
                <strong>Следующий сброс:</strong> {formatDate(calculation.nextResetDate)}
                <br />
                <span className="text-purple-600">
                  Через {calculation.daysUntilReset} дн. часть лимита освободится
                </span>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
            recommendation.type === 'error' ? 'bg-red-50' :
            recommendation.type === 'warning' ? 'bg-yellow-50' :
            recommendation.type === 'success' ? 'bg-green-50' :
            'bg-blue-50'
          }`}>
            {recommendation.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : recommendation.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : recommendation.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className={`text-sm ${
              recommendation.type === 'error' ? 'text-red-800' :
              recommendation.type === 'warning' ? 'text-yellow-800' :
              recommendation.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>
              <strong>{recommendation.title}</strong>
              <br />
              {recommendation.message}
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <strong>Правило 90/180:</strong> Иностранные граждане могут находиться в России
              не более 90 дней в течение каждого 180-дневного периода без визы.
            </div>
          </div>

          {/* Periods header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Периоды пребывания</h3>
            <span className="text-sm text-gray-500">{periods.length} записей</span>
          </div>

          {/* Add period form */}
          {showAddForm ? (
            <div className="mb-4">
              <PeriodForm
                onSave={handleAddPeriod}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              Добавить въезд
            </button>
          )}

          {/* Periods list */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Нет записей о пребывании</p>
              <p className="text-sm">Добавьте даты въезда и выезда</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((period) => (
                <div key={period.id}>
                  {editingPeriodId === period.id ? (
                    <PeriodForm
                      initialEntry={period.entryDate}
                      initialExit={period.exitDate || ''}
                      onSave={(entry, exit) => handleUpdatePeriod(period.id, entry, exit)}
                      onCancel={() => setEditingPeriodId(null)}
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {formatDateShort(new Date(period.entryDate))}
                            </span>
                            <span className="text-gray-400">→</span>
                            {period.exitDate ? (
                              <span className="font-medium text-gray-900">
                                {formatDateShort(new Date(period.exitDate))}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                Сейчас в РФ
                              </span>
                            )}
                          </div>
                          {period.migrationCardId && (
                            <span className="text-xs text-gray-500">
                              Связано с миграционной картой
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPeriodId(period.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Редактировать"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
