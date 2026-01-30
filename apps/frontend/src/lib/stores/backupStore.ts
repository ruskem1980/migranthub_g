'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  createEncryptedBackup,
  restoreFromBackup,
  validateBackup,
  getBackupDataSize,
} from '@/lib/backup/backup-service';
import { generateRecoveryCode } from '@/lib/crypto/backup-crypto';
import { backupApi, type BackupInfo } from '@/lib/api/client';

// Re-export BackupInfo для удобства
export type { BackupInfo };

/**
 * Состояние store бэкапов
 */
interface BackupState {
  // State
  backups: BackupInfo[];
  isLoading: boolean;
  lastBackupAt: string | null;
  recoveryCode: string | null;
  error: string | null;
  progress: number | null; // 0-100 для индикации прогресса

  // Actions
  createBackup: (password: string) => Promise<string>; // возвращает recovery code
  restoreBackup: (backupId: string, password: string) => Promise<void>;
  deleteBackup: (backupId: string) => Promise<void>;
  fetchBackups: () => Promise<void>;
  downloadBackup: (backupId: string) => Promise<Blob>;
  validateBackupFile: (
    blob: Blob,
    password: string,
    salt: string,
    iv: string
  ) => Promise<{ valid: boolean; version?: number; exportedAt?: string; error?: string }>;
  getLocalDataSize: () => Promise<number>;
  clearError: () => void;
  clearRecoveryCode: () => void;
  reset: () => void;
}

const initialState = {
  backups: [] as BackupInfo[],
  isLoading: false,
  lastBackupAt: null as string | null,
  recoveryCode: null as string | null,
  error: null as string | null,
  progress: null as number | null,
};

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      ...initialState,

      createBackup: async (password: string) => {
        set({ isLoading: true, error: null, progress: 0 });
        try {
          // Создаем зашифрованный бэкап
          set({ progress: 20 });
          const { blob, salt, iv } = await createEncryptedBackup(password);

          // Формируем данные для отправки
          set({ progress: 50 });
          const formData = new FormData();
          formData.append('file', blob, 'backup.enc');
          formData.append('salt', salt);
          formData.append('iv', iv);

          // Загружаем на сервер
          set({ progress: 70 });
          await backupApi.upload(formData);

          // Генерируем код восстановления
          const recoveryCode = generateRecoveryCode();
          const now = new Date().toISOString();

          set({
            isLoading: false,
            lastBackupAt: now,
            recoveryCode,
            progress: 100,
          });

          // Обновляем список бэкапов
          await get().fetchBackups();

          // Сбрасываем прогресс через секунду
          setTimeout(() => set({ progress: null }), 1000);

          return recoveryCode;
        } catch (error) {
          set({
            isLoading: false,
            progress: null,
            error: error instanceof Error ? error.message : 'Ошибка создания бэкапа',
          });
          throw error;
        }
      },

      restoreBackup: async (backupId: string, password: string) => {
        set({ isLoading: true, error: null, progress: 0 });
        try {
          // Получаем информацию о бэкапе
          const backupInfo = get().backups.find((b) => b.id === backupId);
          if (!backupInfo || !backupInfo.salt || !backupInfo.iv) {
            throw new Error('Бэкап не найден или повреждены метаданные');
          }

          // Скачиваем бэкап
          set({ progress: 30 });
          const blob = await backupApi.download(backupId);

          // Валидируем перед восстановлением
          set({ progress: 50 });
          const validation = await validateBackup(blob, password, backupInfo.salt, backupInfo.iv);
          if (!validation.valid) {
            throw new Error(validation.error || 'Неверный пароль');
          }

          // Восстанавливаем данные
          set({ progress: 70 });
          await restoreFromBackup(blob, password, backupInfo.salt, backupInfo.iv);

          set({ isLoading: false, progress: 100 });

          // Сбрасываем прогресс через секунду
          setTimeout(() => set({ progress: null }), 1000);
        } catch (error) {
          set({
            isLoading: false,
            progress: null,
            error: error instanceof Error ? error.message : 'Ошибка восстановления',
          });
          throw error;
        }
      },

      deleteBackup: async (backupId: string) => {
        set({ isLoading: true, error: null });
        try {
          await backupApi.delete(backupId);

          set((state) => ({
            isLoading: false,
            backups: state.backups.filter((b) => b.id !== backupId),
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка удаления бэкапа',
          });
          throw error;
        }
      },

      fetchBackups: async () => {
        set({ isLoading: true, error: null });
        try {
          const backups = await backupApi.list();

          set({ isLoading: false, backups });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка загрузки списка бэкапов',
          });
        }
      },

      downloadBackup: async (backupId: string) => {
        set({ isLoading: true, error: null });
        try {
          const blob = await backupApi.download(backupId);
          set({ isLoading: false });
          return blob;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка скачивания бэкапа',
          });
          throw error;
        }
      },

      validateBackupFile: async (blob, password, salt, iv) => {
        return validateBackup(blob, password, salt, iv);
      },

      getLocalDataSize: async () => {
        return getBackupDataSize();
      },

      clearError: () => set({ error: null }),

      clearRecoveryCode: () => set({ recoveryCode: null }),

      reset: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: 'migranthub-backup',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastBackupAt: state.lastBackupAt,
      }),
    }
  )
);
