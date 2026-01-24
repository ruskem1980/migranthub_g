'use client';

import { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Info, Plus, Trash2, X } from 'lucide-react';

interface StayPeriod {
  id: string;
  entryDate: string;
  exitDate: string;
}

interface StayCalculatorProps {
  onClose: () => void;
}

export function StayCalculator({ onClose }: StayCalculatorProps) {
  const [periods, setPeriods] = useState<StayPeriod[]>([
    { id: '1', entryDate: '', exitDate: '' },
  ]);

  const addPeriod = () => {
    setPeriods([...periods, { id: crypto.randomUUID(), entryDate: '', exitDate: '' }]);
  };

  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((p) => p.id !== id));
    }
  };

  const updatePeriod = (id: string, field: 'entryDate' | 'exitDate', value: string) => {
    setPeriods(
      periods.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const calculation = useMemo(() => {
    // Calculate days in 180-day period
    const today = new Date();
    const period180Start = new Date(today);
    period180Start.setDate(period180Start.getDate() - 180);

    let totalDays = 0;
    const validPeriods: { entry: Date; exit: Date; days: number }[] = [];

    for (const period of periods) {
      if (!period.entryDate) continue;

      const entry = new Date(period.entryDate);
      const exit = period.exitDate ? new Date(period.exitDate) : today;

      // Adjust to 180-day window
      const effectiveEntry = entry < period180Start ? period180Start : entry;
      const effectiveExit = exit > today ? today : exit;

      if (effectiveEntry <= effectiveExit) {
        const days = Math.ceil((effectiveExit.getTime() - effectiveEntry.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += days;
        validPeriods.push({ entry, exit, days });
      }
    }

    const daysRemaining = Math.max(0, 90 - totalDays);
    const isOverstay = totalDays > 90;
    const overstayDays = isOverstay ? totalDays - 90 : 0;

    return {
      totalDays,
      daysRemaining,
      isOverstay,
      overstayDays,
      validPeriods,
    };
  }, [periods]);

  const getStatusColor = () => {
    if (calculation.isOverstay) return 'red';
    if (calculation.daysRemaining <= 7) return 'orange';
    if (calculation.daysRemaining <= 14) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();

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
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Result card */}
          <div className={`p-4 rounded-xl mb-6 ${
            statusColor === 'red' ? 'bg-red-50 border-2 border-red-200' :
            statusColor === 'orange' ? 'bg-orange-50 border-2 border-orange-200' :
            statusColor === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-green-50 border-2 border-green-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {calculation.isOverstay ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className={`w-8 h-8 ${
                  statusColor === 'green' ? 'text-green-600' :
                  statusColor === 'yellow' ? 'text-yellow-600' :
                  'text-orange-600'
                }`} />
              )}
              <div>
                <div className={`text-2xl font-bold ${
                  statusColor === 'red' ? 'text-red-900' :
                  statusColor === 'green' ? 'text-green-900' :
                  'text-orange-900'
                }`}>
                  {calculation.isOverstay ? (
                    <>Превышение на {calculation.overstayDays} дн.</>
                  ) : (
                    <>Осталось {calculation.daysRemaining} дн.</>
                  )}
                </div>
                <div className={`text-sm ${
                  statusColor === 'red' ? 'text-red-700' :
                  statusColor === 'green' ? 'text-green-700' :
                  'text-orange-700'
                }`}>
                  Использовано {calculation.totalDays} из 90 дней
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  statusColor === 'red' ? 'bg-red-500' :
                  statusColor === 'green' ? 'bg-green-500' :
                  'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, (calculation.totalDays / 90) * 100)}%` }}
              />
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-6">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Правило 90/180:</strong> Иностранные граждане могут находиться в России
              не более 90 дней в течение каждого 180-дневного периода без визы.
            </div>
          </div>

          {/* Periods */}
          <h3 className="font-semibold text-gray-900 mb-3">Периоды пребывания</h3>

          <div className="space-y-4">
            {periods.map((period, index) => (
              <div key={period.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">
                    Период {index + 1}
                  </span>
                  {periods.length > 1 && (
                    <button
                      onClick={() => removePeriod(period.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Дата въезда
                    </label>
                    <input
                      type="date"
                      value={period.entryDate}
                      onChange={(e) => updatePeriod(period.id, 'entryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Дата выезда
                    </label>
                    <input
                      type="date"
                      value={period.exitDate}
                      onChange={(e) => updatePeriod(period.id, 'exitDate', e.target.value)}
                      placeholder="Сегодня"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add period button */}
          <button
            onClick={addPeriod}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors mt-4"
          >
            <Plus className="w-5 h-5" />
            Добавить период
          </button>

          {/* Warning for overstay */}
          {calculation.isOverstay && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">
                    Внимание! Превышение срока
                  </h4>
                  <p className="text-sm text-red-800">
                    При превышении 90 дней возможен запрет на въезд в РФ.
                    Рекомендуем обратиться к юристу.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
