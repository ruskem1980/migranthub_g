'use client';

import { useState } from 'react';
import { Shield, Search, CheckCircle, AlertTriangle, X, ExternalLink, Loader2 } from 'lucide-react';

interface BanCheckerProps {
  onClose: () => void;
}

type CheckStatus = 'idle' | 'checking' | 'clean' | 'found';

interface CheckResult {
  status: CheckStatus;
  mvd?: { clean: boolean; message: string };
  fssp?: { clean: boolean; message: string; debts?: number };
  fms?: { clean: boolean; message: string };
}

export function BanChecker({ onClose }: BanCheckerProps) {
  const [passportNumber, setPassportNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async () => {
    if (!passportNumber || !birthDate) return;

    setIsChecking(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Demo result - in production, call actual API
      const mockResult: CheckResult = {
        status: 'clean',
        mvd: {
          clean: true,
          message: 'Запретов на въезд не обнаружено',
        },
        fssp: {
          clean: true,
          message: 'Задолженностей не обнаружено',
          debts: 0,
        },
        fms: {
          clean: true,
          message: 'Нарушений миграционного законодательства не обнаружено',
        },
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const isFormValid = passportNumber.length >= 5 && birthDate;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-ban-checker"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 id="modal-title-ban-checker" className="text-lg font-bold text-gray-900">Проверка запретов</h2>
              <p className="text-sm text-gray-500">МВД / ФССП / ФМС</p>
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
          {!result ? (
            <>
              {/* Input form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Серия и номер паспорта
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    placeholder="AA 1234567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Check button */}
              <button
                onClick={handleCheck}
                disabled={!isFormValid || isChecking}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-4 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Проверить
                  </>
                )}
              </button>

              {/* Info */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Важно:</strong> Это демонстрационная версия.
                  Для официальной проверки используйте государственные сервисы.
                </p>
              </div>

              {/* External links */}
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Официальные источники:</h3>
                <a
                  href="https://services.fms.gov.ru/info-service.htm?sid=2000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-900">Проверка запрета въезда</div>
                    <div className="text-sm text-gray-500">МВД России</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
                <a
                  href="https://fssp.gov.ru/iss/ip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-900">Банк исполнительных производств</div>
                    <div className="text-sm text-gray-500">ФССП России</div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className={`p-4 rounded-xl mb-6 ${
                result.status === 'clean' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {result.status === 'clean' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <div className={`text-xl font-bold ${
                    result.status === 'clean' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.status === 'clean' ? 'Проблем не обнаружено' : 'Обнаружены проблемы'}
                  </div>
                </div>
              </div>

              {/* Detailed results */}
              <div className="space-y-3">
                {result.mvd && (
                  <div className={`p-4 rounded-xl ${
                    result.mvd.clean ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.mvd.clean ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold text-gray-900">База МВД</span>
                    </div>
                    <p className={`text-sm ${result.mvd.clean ? 'text-green-800' : 'text-red-800'}`}>
                      {result.mvd.message}
                    </p>
                  </div>
                )}

                {result.fssp && (
                  <div className={`p-4 rounded-xl ${
                    result.fssp.clean ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.fssp.clean ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold text-gray-900">База ФССП</span>
                    </div>
                    <p className={`text-sm ${result.fssp.clean ? 'text-green-800' : 'text-red-800'}`}>
                      {result.fssp.message}
                    </p>
                  </div>
                )}

                {result.fms && (
                  <div className={`p-4 rounded-xl ${
                    result.fms.clean ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.fms.clean ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold text-gray-900">Миграционные нарушения</span>
                    </div>
                    <p className={`text-sm ${result.fms.clean ? 'text-green-800' : 'text-red-800'}`}>
                      {result.fms.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Check again button */}
              <button
                onClick={() => setResult(null)}
                className="w-full mt-6 py-3 text-blue-600 font-semibold hover:text-blue-700"
              >
                Проверить ещё раз
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
