'use client';

import { X, Sparkles } from 'lucide-react';

export type ConversionBannerVariant = 'subtle' | 'prominent';

export interface ConversionBannerProps {
  variant: ConversionBannerVariant;
  title: string;
  description?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ConversionBanner({
  variant,
  title,
  description,
  ctaLabel,
  onCtaClick,
  onDismiss,
  className = '',
}: ConversionBannerProps) {
  if (variant === 'subtle') {
    return (
      <div
        className={[
          'flex items-center justify-between gap-3 px-4 py-3',
          'bg-primary/5 border border-primary/20 rounded-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onCtaClick}
            className={[
              'px-4 py-1.5 text-sm font-medium rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'transition-colors duration-200',
            ].join(' ')}
          >
            {ctaLabel}
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={[
                'p-1 rounded-full',
                'hover:bg-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'transition-colors duration-200',
              ].join(' ')}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Prominent variant
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'border border-primary/20',
        'p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={[
            'absolute top-3 right-3 p-1.5 rounded-full',
            'hover:bg-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'transition-colors duration-200',
          ].join(' ')}
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onCtaClick}
          className={[
            'px-6 py-2.5 text-sm font-semibold rounded-xl',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
            'active:scale-[0.98]',
            'transition-all duration-200',
          ].join(' ')}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export default ConversionBanner;
