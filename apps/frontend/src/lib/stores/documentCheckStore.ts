'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { utilitiesApi } from '@/lib/api/client';
import { useProfileStore } from './profileStore';
import type {
  PatentCheckResponse,
  BanCheckResponse,
  InnCheckResponse,
  PermitStatusResponse,
} from '@/lib/api/types';

export type CheckType = 'patent' | 'entryBan' | 'inn' | 'days90180' | 'rvpVnj';
export type CheckStatus = 'idle' | 'loading' | 'success' | 'warning' | 'error';

export interface CheckResult {
  type: CheckType;
  status: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  details?: string[];
  rawData?: unknown;
}

interface CachedCheckResult {
  result: CheckResult;
  timestamp: string;
}

interface CachedResults {
  patent?: CachedCheckResult;
  entryBan?: CachedCheckResult;
  inn?: CachedCheckResult;
  rvpVnj?: CachedCheckResult;
}

interface ChecksState {
  patent: CheckStatus;
  entryBan: CheckStatus;
  inn: CheckStatus;
  days90180: CheckStatus;
  rvpVnj: CheckStatus;
}

interface DocumentCheckState {
  checks: ChecksState;
  lastCheckDate: string | null;
  isLoading: boolean;
  currentCheckType: CheckType | null;
  checkResult: CheckResult | null;
  isModalOpen: boolean;
  cachedResults: CachedResults;

  runCheck: (type: CheckType) => Promise<void>;
  runAllChecks: () => Promise<void>;
  resetCheck: () => void;
  setCheckResult: (result: CheckResult | null) => void;
  openModal: () => void;
  closeModal: () => void;
  reset: () => void;
}

const initialChecks: ChecksState = {
  patent: 'idle',
  entryBan: 'idle',
  inn: 'idle',
  days90180: 'idle',
  rvpVnj: 'idle',
};

const initialState = {
  checks: initialChecks,
  lastCheckDate: null as string | null,
  isLoading: false,
  currentCheckType: null as CheckType | null,
  checkResult: null as CheckResult | null,
  isModalOpen: false,
  cachedResults: {} as CachedResults,
};

// Helper: Check if online
const isOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

// Helper: Parse profile name to firstName/lastName (Latin)
const parseProfileName = (profile: { fullNameLatin?: string; fullName?: string }) => {
  const name = profile.fullNameLatin || profile.fullName || '';
  const parts = name.trim().split(/\s+/);
  return {
    lastName: parts[0] || '',
    firstName: parts[1] || '',
    middleName: parts.slice(2).join(' ') || undefined,
  };
};

// Transform API responses to CheckResult
const transformPatentResult = (response: PatentCheckResponse): CheckResult => {
  const isValid = response.isValid;
  return {
    type: 'patent',
    status: isValid ? 'success' : response.status === 'not_found' ? 'warning' : 'error',
    title: isValid
      ? 'Патент действителен'
      : response.status === 'not_found'
        ? 'Патент не найден'
        : response.status === 'expired'
          ? 'Патент просрочен'
          : 'Патент недействителен',
    message:
      response.message ||
      (isValid
        ? `Патент ${response.series} ${response.number} действителен`
        : 'Проверьте данные патента'),
    details: [
      response.region && `Регион: ${response.region}`,
      response.expirationDate &&
        `Действителен до: ${new Date(response.expirationDate).toLocaleDateString('ru-RU')}`,
      response.ownerName && `Владелец: ${response.ownerName}`,
      `Проверено: ${new Date(response.checkedAt).toLocaleString('ru-RU')}`,
    ].filter(Boolean) as string[],
    rawData: response,
  };
};

const transformBanResult = (response: BanCheckResponse): CheckResult => {
  const hasBan = response.status === 'has_ban';
  const failed = response.status === 'check_failed' || response.status === 'unknown';
  return {
    type: 'entryBan',
    status: hasBan ? 'error' : failed ? 'warning' : 'success',
    title: hasBan
      ? 'Обнаружен запрет на въезд'
      : failed
        ? 'Не удалось проверить'
        : 'Запретов не обнаружено',
    message: hasBan
      ? response.reason || 'Обнаружен запрет на въезд в РФ'
      : failed
        ? response.error || 'Попробуйте позже'
        : 'В базах МВД запретов на въезд не найдено',
    details: [
      response.source && `Источник: ${response.source.toUpperCase()}`,
      response.banType && `Тип: ${response.banType}`,
      response.expiresAt && `До: ${new Date(response.expiresAt).toLocaleDateString('ru-RU')}`,
      `Проверено: ${new Date(response.checkedAt).toLocaleString('ru-RU')}`,
    ].filter(Boolean) as string[],
    rawData: response,
  };
};

const transformInnResult = (response: InnCheckResponse): CheckResult => {
  return {
    type: 'inn',
    status: response.found ? 'success' : 'warning',
    title: response.found ? 'ИНН найден' : 'ИНН не найден',
    message: response.found
      ? `Ваш ИНН: ${response.inn}`
      : response.message || 'ИНН по вашим данным не найден в базе ФНС',
    details: [
      response.found && response.inn && `ИНН: ${response.inn}`,
      !response.found && 'Рекомендуем подать заявление на получение ИНН',
      !response.found && 'Это можно сделать в любой налоговой инспекции',
      `Проверено: ${new Date(response.checkedAt).toLocaleString('ru-RU')}`,
    ].filter(Boolean) as string[],
    rawData: response,
  };
};

const transformPermitResult = (response: PermitStatusResponse): CheckResult => {
  const statusMap: Record<string, { status: CheckResult['status']; title: string }> = {
    PENDING: { status: 'warning', title: 'Заявление на рассмотрении' },
    APPROVED: { status: 'success', title: 'Заявление одобрено' },
    REJECTED: { status: 'error', title: 'Заявление отклонено' },
    READY_FOR_PICKUP: { status: 'success', title: 'Готово к получению' },
    ADDITIONAL_DOCS_REQUIRED: { status: 'warning', title: 'Требуются документы' },
    NOT_FOUND: { status: 'warning', title: 'Заявление не найдено' },
    UNKNOWN: { status: 'warning', title: 'Статус неизвестен' },
  };

  const mapped = statusMap[response.status] || { status: 'warning', title: 'Статус неизвестен' };

  return {
    type: 'rvpVnj',
    status: mapped.status,
    title: mapped.title,
    message: response.message,
    details: [
      response.estimatedDate &&
        `Ожидаемая дата: ${new Date(response.estimatedDate).toLocaleDateString('ru-RU')}`,
      `Проверено: ${new Date(response.checkedAt).toLocaleString('ru-RU')}`,
    ].filter(Boolean) as string[],
    rawData: response,
  };
};

// Get cached result if offline
const getCachedResult = (type: CheckType, cachedResults: CachedResults): CheckResult | null => {
  const cached = cachedResults[type as keyof CachedResults];
  if (cached) {
    return {
      ...cached.result,
      details: [
        ...(cached.result.details || []),
        `Данные из кэша от ${new Date(cached.timestamp).toLocaleString('ru-RU')}`,
      ],
    };
  }
  return null;
};

export const useDocumentCheckStore = create<DocumentCheckState>()(
  persist(
    (set, get) => ({
      ...initialState,

      runCheck: async (type: CheckType) => {
        // days90180 is handled as a link, not an API call
        if (type === 'days90180') return;

        const profile = useProfileStore.getState().profile;

        set({
          isLoading: true,
          currentCheckType: type,
          checks: { ...get().checks, [type]: 'loading' },
        });

        // Check offline - return cached result
        if (!isOnline()) {
          const cached = getCachedResult(type, get().cachedResults);
          if (cached) {
            set({
              isLoading: false,
              checkResult: cached,
              isModalOpen: true,
              checks: {
                ...get().checks,
                [type]:
                  cached.status === 'error'
                    ? 'error'
                    : cached.status === 'warning'
                      ? 'warning'
                      : 'success',
              },
            });
            return;
          }

          set({
            isLoading: false,
            checks: { ...get().checks, [type]: 'error' },
            checkResult: {
              type,
              status: 'error',
              title: 'Нет соединения',
              message: 'Для проверки требуется подключение к интернету',
            },
            isModalOpen: true,
          });
          return;
        }

        try {
          let result: CheckResult;

          switch (type) {
            case 'patent': {
              // Need patent data from profile
              if (!profile?.patentRegion) {
                result = {
                  type: 'patent',
                  status: 'warning',
                  title: 'Данные не заполнены',
                  message: 'Заполните данные патента в профиле для проверки',
                };
                break;
              }

              // Extract series from region code (first 2 digits)
              const series = profile.patentRegion.substring(0, 2);
              // For demo, use a placeholder number - in real app this would come from profile
              const response = await utilitiesApi.checkPatent({
                series,
                number: '12345678', // TODO: Add patent number to profile
                lastName: parseProfileName(profile).lastName,
                firstName: parseProfileName(profile).firstName,
              });
              result = transformPatentResult(response);
              break;
            }

            case 'entryBan': {
              if (!profile?.fullNameLatin || !profile?.birthDate) {
                result = {
                  type: 'entryBan',
                  status: 'warning',
                  title: 'Данные не заполнены',
                  message: 'Заполните ФИО (латиницей) и дату рождения в профиле',
                };
                break;
              }

              const { lastName, firstName, middleName } = parseProfileName(profile);
              const response = await utilitiesApi.checkBan({
                lastName,
                firstName,
                middleName,
                birthDate: profile.birthDate,
                citizenship: profile.citizenship,
              });
              result = transformBanResult(response);
              break;
            }

            case 'inn': {
              if (!profile?.fullNameLatin || !profile?.birthDate || !profile?.passportNumber) {
                result = {
                  type: 'inn',
                  status: 'warning',
                  title: 'Данные не заполнены',
                  message: 'Заполните ФИО, дату рождения и паспортные данные в профиле',
                };
                break;
              }

              const { lastName, firstName, middleName } = parseProfileName(profile);
              const response = await utilitiesApi.checkInn({
                lastName,
                firstName,
                middleName,
                birthDate: profile.birthDate,
                documentType: 'FOREIGN_PASSPORT',
                documentSeries: profile.passportNumber.substring(0, 2),
                documentNumber: profile.passportNumber.substring(2),
                documentDate: profile.passportIssueDate || profile.birthDate,
              });
              result = transformInnResult(response);
              break;
            }

            case 'rvpVnj': {
              if (!profile?.fullNameLatin || !profile?.birthDate) {
                result = {
                  type: 'rvpVnj',
                  status: 'warning',
                  title: 'Данные не заполнены',
                  message: 'Заполните ФИО и дату рождения в профиле',
                };
                break;
              }

              const { lastName, firstName, middleName } = parseProfileName(profile);
              const response = await utilitiesApi.checkPermitStatus({
                permitType: 'RVP', // TODO: Add permit type to profile
                region: profile.patentRegion || '77',
                applicationDate: new Date().toISOString().split('T')[0], // TODO: Add application date to profile
                lastName,
                firstName,
                middleName,
                birthDate: profile.birthDate,
              });
              result = transformPermitResult(response);
              break;
            }

            default:
              result = {
                type,
                status: 'error',
                title: 'Неизвестный тип проверки',
                message: 'Данный тип проверки не поддерживается',
              };
          }

          const checkStatus: CheckStatus =
            result.status === 'error' ? 'error' : result.status === 'warning' ? 'warning' : 'success';

          // Cache successful result
          const newCachedResults = { ...get().cachedResults };
          // Cache result for patent, entryBan, inn, rvpVnj (days90180 excluded from this function at the start)
          newCachedResults[type as keyof CachedResults] = {
            result,
            timestamp: new Date().toISOString(),
          };

          set({
            isLoading: false,
            checkResult: result,
            isModalOpen: true,
            lastCheckDate: new Date().toISOString(),
            checks: { ...get().checks, [type]: checkStatus },
            cachedResults: newCachedResults,
          });
        } catch (error) {
          console.error('Check error:', error);

          // Try to use cached result on error
          const cached = getCachedResult(type, get().cachedResults);
          if (cached) {
            set({
              isLoading: false,
              checkResult: {
                ...cached,
                details: [
                  ...(cached.details || []),
                  'Не удалось обновить данные, показаны результаты из кэша',
                ],
              },
              isModalOpen: true,
              checks: {
                ...get().checks,
                [type]:
                  cached.status === 'error'
                    ? 'error'
                    : cached.status === 'warning'
                      ? 'warning'
                      : 'success',
              },
            });
            return;
          }

          set({
            isLoading: false,
            checks: { ...get().checks, [type]: 'error' },
            checkResult: {
              type,
              status: 'error',
              title: 'Ошибка проверки',
              message:
                error instanceof Error ? error.message : 'Не удалось выполнить проверку. Попробуйте позже.',
            },
            isModalOpen: true,
          });
        }
      },

      runAllChecks: async () => {
        const types: CheckType[] = ['patent', 'entryBan', 'inn', 'rvpVnj'];
        // Note: days90180 excluded - it's a link to calculator page

        set({ isLoading: true });

        // Set all to loading
        const loadingChecks = { ...initialChecks };
        types.forEach((type) => {
          loadingChecks[type] = 'loading';
        });
        set({ checks: loadingChecks });

        // Run all checks in parallel
        const results: CheckResult[] = [];
        const promises = types.map(async (type) => {
          try {
            await get().runCheck(type);
            const result = get().checkResult;
            if (result) results.push(result);
          } catch {
            // Error already handled in runCheck
          }
        });

        await Promise.allSettled(promises);

        // Show summary result
        const hasErrors = results.some((r) => r.status === 'error');
        const hasWarnings = results.some((r) => r.status === 'warning');

        const summaryResult: CheckResult = {
          type: 'patent', // placeholder for summary
          status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
          title: hasErrors
            ? 'Обнаружены проблемы'
            : hasWarnings
              ? 'Требуется внимание'
              : 'Все проверки пройдены',
          message: hasErrors
            ? 'Некоторые проверки выявили проблемы. Проверьте детали.'
            : hasWarnings
              ? 'Некоторые проверки требуют вашего внимания.'
              : 'Все документы в порядке. Проблем не обнаружено.',
          details: results.map((r) => `${getCheckLabel(r.type)}: ${r.title}`),
        };

        set({
          isLoading: false,
          checkResult: summaryResult,
          isModalOpen: true,
          lastCheckDate: new Date().toISOString(),
        });
      },

      resetCheck: () => {
        set({
          currentCheckType: null,
          checkResult: null,
        });
      },

      setCheckResult: (result) => {
        set({ checkResult: result });
      },

      openModal: () => {
        set({ isModalOpen: true });
      },

      closeModal: () => {
        set({ isModalOpen: false, checkResult: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'migranthub-document-checks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        checks: state.checks,
        lastCheckDate: state.lastCheckDate,
        cachedResults: state.cachedResults,
      }),
    }
  )
);

// Helper functions
export function getCheckLabel(type: CheckType): string {
  const labels: Record<CheckType, string> = {
    patent: 'Патент',
    entryBan: 'Запрет въезда',
    inn: 'ИНН',
    days90180: '90/180',
    rvpVnj: 'РВП/ВНЖ',
  };
  return labels[type];
}

export function getCheckIcon(type: CheckType): string {
  const icons: Record<CheckType, string> = {
    patent: '📄',
    entryBan: '🚫',
    inn: '🔢',
    days90180: '📅',
    rvpVnj: '📋',
  };
  return icons[type];
}
