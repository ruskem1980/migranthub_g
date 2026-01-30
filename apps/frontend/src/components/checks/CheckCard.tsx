'use client';

import { type LucideIcon, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useLanguageStore, type Language } from '@/lib/stores/languageStore';

interface CheckCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  free?: boolean;
  requiresSubscription?: 'plus' | 'pro';
  disabled?: boolean;
}

const labels: Record<string, Record<Language, string>> = {
  free: {
    ru: 'Бесплатно',
    en: 'Free',
    uz: 'Bepul',
    tg: 'Ройгон',
    ky: 'Акысыз',
  },
  plus: {
    ru: 'Plus',
    en: 'Plus',
    uz: 'Plus',
    tg: 'Plus',
    ky: 'Plus',
  },
};

export function CheckCard({
  id,
  icon: Icon,
  title,
  description,
  onClick,
  free = true,
  requiresSubscription,
  disabled,
}: CheckCardProps) {
  const canAccess = useAuthStore((state) => state.canAccess);
  const { language } = useLanguageStore();

  // Check if feature is locked based on subscription
  const isLocked = requiresSubscription
    ? !canAccess('checks_premium')
    : false;

  const handleClick = () => {
    if (!isLocked && !disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLocked}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
        flex items-start gap-4
        ${
          isLocked
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'
            : disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]'
        }
      `}
    >
      <div
        className={`
          p-3 rounded-xl shrink-0
          ${isLocked ? 'bg-gray-100' : 'bg-primary/10'}
        `}
      >
        <Icon
          className={`
            w-6 h-6
            ${isLocked ? 'text-gray-400' : 'text-primary'}
          `}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
            {title}
          </h3>
          {free && !requiresSubscription && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {labels.free[language]}
            </span>
          )}
          {isLocked && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {labels.plus[language]}
            </span>
          )}
        </div>
        <p className={`text-sm mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </button>
  );
}

export default CheckCard;
