'use client';

import { X, Sparkles, ChevronRight } from 'lucide-react';

export type ConversionBannerVariant = 'subtle' | 'prominent';

export interface ConversionBannerProps {
  variant: ConversionBannerVariant;
  title: string;
  description?: string;
  ctaLabel?: string; // Now optional, whole banner is clickable
  onCtaClick: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ConversionBanner({
  variant,
  title,
  description,
  onCtaClick,
  onDismiss,
  className = '',
}: ConversionBannerProps) {
  if (variant === 'subtle') {
    return (
      <button
        onClick={onCtaClick}
        className={[
          'w-full flex items-center justify-between gap-3 px-4 py-4',
          'bg-primary/5 border border-primary/20 rounded-xl',
          'hover:bg-primary/10 hover:border-primary/30',
          'active:scale-[0.99]',
          'transition-all duration-200',
          'text-left',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-primary" />

          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
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
      </button>
    );
  }

  // Prominent variant - whole card is clickable
  return (
    <button
      onClick={onCtaClick}
      className={[
        'relative w-full overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'border border-primary/20',
        'p-5',
        'hover:from-primary/15 hover:via-primary/8',
        'hover:border-primary/30',
        'active:scale-[0.99]',
        'transition-all duration-200',
        'text-left',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

      {/* Dismiss button */}
      {onDismiss && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className={[
            'absolute top-3 right-3 p-1.5 rounded-full z-10',
            'hover:bg-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'transition-colors duration-200',
            'cursor-pointer',
          ].join(' ')}
          role="button"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-base font-bold text-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="w-6 h-6 text-primary flex-shrink-0 mt-3" />
      </div>
    </button>
  );
}

export default ConversionBanner;
