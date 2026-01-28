'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CheckType = 'patent' | 'entryBan' | 'inn' | 'days90180' | 'rvpVnj';
export type CheckStatus = 'idle' | 'loading' | 'success' | 'warning' | 'error';

export interface CheckResult {
  type: CheckType;
  status: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  details?: string[];
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

  // Actions
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
};

// Mock check results for demo purposes
const getMockResult = (type: CheckType): CheckResult => {
  const results: Record<CheckType, CheckResult> = {
    patent: {
      type: 'patent',
      status: 'success',
      title: 'Патент действителен',
      message: 'Ваш патент на работу действителен до 15.06.2025',
      details: [
        'Регион: Москва',
        'Профессия: Разнорабочий',
        'Следующий платеж: 01.02.2025',
      ],
    },
    entryBan: {
      type: 'entryBan',
      status: 'success',
      title: 'Запретов не обнаружено',
      message: 'В базах МВД, ФССП и ФМС запретов на въезд не найдено',
      details: [
        'База МВД: чисто',
        'База ФССП: задолженностей нет',
        'Миграционные нарушения: не обнаружены',
      ],
    },
    inn: {
      type: 'inn',
      status: 'warning',
      title: 'ИНН не найден',
      message: 'ИНН по вашим данным не найден в базе ФНС',
      details: [
        'Рекомендуем подать заявление на получение ИНН',
        'Это можно сделать в любой налоговой инспекции',
      ],
    },
    days90180: {
      type: 'days90180',
      status: 'success',
      title: 'Лимит пребывания в норме',
      message: 'Использовано 45 из 90 дней в текущем периоде',
      details: [
        'Осталось дней: 45',
        'Период заканчивается: 15.04.2025',
        'Рекомендация: следите за датами въезда/выезда',
      ],
    },
    rvpVnj: {
      type: 'rvpVnj',
      status: 'warning',
      title: 'Заявление на рассмотрении',
      message: 'Ваше заявление на РВП находится на рассмотрении',
      details: [
        'Дата подачи: 01.11.2024',
        'Ожидаемый срок: до 4 месяцев',
        'Статус: На рассмотрении в УВМ МВД',
      ],
    },
  };
  return results[type];
};

export const useDocumentCheckStore = create<DocumentCheckState>()(
  persist(
    (set, get) => ({
      ...initialState,

      runCheck: async (type: CheckType) => {
        set({
          isLoading: true,
          currentCheckType: type,
          checks: { ...get().checks, [type]: 'loading' },
        });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const result = getMockResult(type);
          const checkStatus: CheckStatus = result.status === 'error' ? 'error' :
            result.status === 'warning' ? 'warning' : 'success';

          set({
            isLoading: false,
            checkResult: result,
            isModalOpen: true,
            lastCheckDate: new Date().toISOString(),
            checks: { ...get().checks, [type]: checkStatus },
          });
        } catch (error) {
          console.error('Check error:', error);
          set({
            isLoading: false,
            checks: { ...get().checks, [type]: 'error' },
            checkResult: {
              type,
              status: 'error',
              title: 'Ошибка проверки',
              message: 'Не удалось выполнить проверку. Попробуйте позже.',
            },
            isModalOpen: true,
          });
        }
      },

      runAllChecks: async () => {
        const types: CheckType[] = ['patent', 'entryBan', 'inn', 'days90180', 'rvpVnj'];

        set({ isLoading: true });

        // Set all to loading
        const loadingChecks = types.reduce(
          (acc, type) => ({ ...acc, [type]: 'loading' as CheckStatus }),
          {} as ChecksState
        );
        set({ checks: loadingChecks });

        // Run all checks sequentially with small delays
        const results: CheckResult[] = [];
        for (const type of types) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const result = getMockResult(type);
          results.push(result);

          const checkStatus: CheckStatus = result.status === 'error' ? 'error' :
            result.status === 'warning' ? 'warning' : 'success';

          set((state) => ({
            checks: { ...state.checks, [type]: checkStatus },
          }));
        }

        // Show summary result
        const hasErrors = results.some((r) => r.status === 'error');
        const hasWarnings = results.some((r) => r.status === 'warning');

        const summaryResult: CheckResult = {
          type: 'patent', // placeholder
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
      }),
    }
  )
);

// Helper function for check labels
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

// Helper function for check icons
export function getCheckIcon(type: CheckType): string {
  const icons: Record<CheckType, string> = {
    patent: '📋',
    entryBan: '🚫',
    inn: '🔢',
    days90180: '📅',
    rvpVnj: '📄',
  };
  return icons[type];
}
