'use client';

import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import type { Language } from '@/lib/i18n';

export type SpeakButtonVariant = 'default' | 'ghost' | 'outline';
export type SpeakButtonSize = 'sm' | 'md' | 'lg';

export interface SpeakButtonProps {
  /** Text to speak when button is pressed */
  text: string;
  /** Language for TTS (defaults to current app language) */
  lang?: Language;
  /** Button variant */
  variant?: SpeakButtonVariant;
  /** Button size */
  size?: SpeakButtonSize;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Show text label next to icon */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
}

const variantStyles: Record<SpeakButtonVariant, string> = {
  default:
    'bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300',
  ghost:
    'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200',
  outline:
    'bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400',
};

const sizeStyles: Record<SpeakButtonSize, { button: string; icon: string; text: string }> = {
  sm: {
    button: 'p-1.5 rounded-md gap-1',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    button: 'p-2 rounded-lg gap-1.5',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  lg: {
    button: 'p-2.5 rounded-xl gap-2',
    icon: 'w-6 h-6',
    text: 'text-base',
  },
};

/**
 * SpeakButton - A button that reads text aloud using Text-to-Speech.
 *
 * Shows a speaker icon by default. When speaking, shows a stop icon.
 * Works on both web (Web Speech API) and mobile (Capacitor TTS).
 *
 * @example
 * ```tsx
 * <SpeakButton text="Hello, this will be read aloud" />
 *
 * // With custom language
 * <SpeakButton text="Привет" lang="ru" />
 *
 * // With label
 * <SpeakButton text="Some text" showLabel label="Listen" />
 * ```
 */
export function SpeakButton({
  text,
  lang,
  variant = 'default',
  size = 'md',
  className = '',
  ariaLabel,
  showLabel = false,
  label,
}: SpeakButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useTTS();

  // Don't render if TTS is not supported
  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (isSpeaking) {
      stop();
    } else {
      await speak(text, lang);
    }
  };

  const styles = sizeStyles[size];
  const defaultAriaLabel = isSpeaking ? 'Stop speaking' : 'Read aloud';
  const defaultLabel = isSpeaking ? 'Stop' : 'Listen';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel || defaultAriaLabel}
      className={[
        'inline-flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        styles.button,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isSpeaking ? (
        <VolumeX className={styles.icon} />
      ) : (
        <Volume2 className={styles.icon} />
      )}
      {showLabel && (
        <span className={`font-medium ${styles.text}`}>
          {label || defaultLabel}
        </span>
      )}
    </button>
  );
}

/**
 * SpeakButtonLoading - A loading state placeholder for SpeakButton.
 * Use this when the text to speak is being loaded asynchronously.
 */
export function SpeakButtonLoading({
  size = 'md',
  className = '',
}: {
  size?: SpeakButtonSize;
  className?: string;
}) {
  const styles = sizeStyles[size];

  return (
    <div
      className={[
        'inline-flex items-center justify-center',
        'bg-gray-100 text-gray-400',
        styles.button,
        className,
      ].join(' ')}
    >
      <Loader2 className={`${styles.icon} animate-spin`} />
    </div>
  );
}

export default SpeakButton;
