'use client';

import type { LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={[
        'flex items-center justify-between py-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="w-5 h-5 text-muted-foreground" />
        )}
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className={[
            'text-sm font-medium text-primary',
            'hover:text-primary/80 hover:underline',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded',
            'transition-colors duration-200',
          ].join(' ')}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default SectionHeader;
