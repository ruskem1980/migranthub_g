'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export type QuickActionVariant = 'default' | 'primary' | 'warning' | 'danger';

export interface QuickActionCardProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: QuickActionVariant;
  disabled?: boolean;
  badge?: string;
}

const variantStyles: Record<QuickActionVariant, string> = {
  default: 'bg-card border border-border hover:border-primary/50',
  primary: 'bg-primary/10 border border-primary/20 hover:bg-primary/20',
  warning: 'bg-warning/10 border border-warning/20 hover:bg-warning/20',
  danger: 'bg-destructive/10 border border-destructive/20 hover:bg-destructive/20',
};

const iconVariantStyles: Record<QuickActionVariant, string> = {
  default: 'bg-muted text-foreground',
  primary: 'bg-primary/20 text-primary',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/20 text-destructive',
};

const badgeVariantStyles: Record<QuickActionVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
};

export const QuickActionCard = forwardRef<HTMLButtonElement, QuickActionCardProps>(
  (
    {
      icon: Icon,
      title,
      description,
      onClick,
      variant = 'default',
      disabled = false,
      badge,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={[
          'w-full flex items-center gap-4 p-4 rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variantStyles[variant],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {/* Icon container */}
        <div
          className={[
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
            iconVariantStyles[variant],
          ].join(' ')}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Text content */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-card-foreground truncate">
              {title}
            </span>
            {badge && (
              <span
                className={[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  badgeVariantStyles[variant],
                ].join(' ')}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </button>
    );
  }
);

QuickActionCard.displayName = 'QuickActionCard';

export default QuickActionCard;
