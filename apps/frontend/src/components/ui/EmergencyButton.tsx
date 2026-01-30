'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Phone } from 'lucide-react';

export type EmergencyButtonSize = 'sm' | 'md' | 'lg';

export interface EmergencyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClick: () => void;
  size?: EmergencyButtonSize;
}

const sizeStyles: Record<EmergencyButtonSize, string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const iconSizeStyles: Record<EmergencyButtonSize, string> = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

const labelSizeStyles: Record<EmergencyButtonSize, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/**
 * EmergencyButton - A prominent SOS button for emergency situations
 *
 * Designed to be highly visible and always accessible.
 * Uses red color scheme to indicate urgency.
 *
 * @example
 * ```tsx
 * <EmergencyButton onClick={() => openEmergencyModal()} size="lg" />
 * ```
 */
export const EmergencyButton = forwardRef<HTMLButtonElement, EmergencyButtonProps>(
  ({ onClick, size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={[
          // Base styles
          'relative flex flex-col items-center justify-center rounded-full',
          'font-bold text-white',
          // Colors - emergency red
          'bg-red-600 hover:bg-red-700',
          // Shadow for prominence
          'shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40',
          // Focus states
          'focus:outline-none focus:ring-4 focus:ring-red-500/50',
          // Animation
          'active:scale-95 transition-all duration-200',
          // Pulsing animation for attention
          'animate-pulse hover:animate-none',
          // Size
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="SOS Emergency"
        {...props}
      >
        <Phone className={iconSizeStyles[size]} />
        <span className={[labelSizeStyles[size], 'font-bold mt-0.5'].join(' ')}>
          SOS
        </span>
      </button>
    );
  }
);

EmergencyButton.displayName = 'EmergencyButton';

export default EmergencyButton;
