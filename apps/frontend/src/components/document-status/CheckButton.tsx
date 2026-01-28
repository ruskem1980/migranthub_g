'use client';

import { Loader2 } from 'lucide-react';
import { type CheckStatus, type CheckType, getCheckIcon, getCheckLabel } from '@/lib/stores/documentCheckStore';
import Link from 'next/link';

interface CheckButtonProps {
  type: CheckType;
  status: CheckStatus;
  onClick: () => void;
  isLink?: boolean;
  href?: string;
}

export function CheckButton({ type, status, onClick, isLink, href }: CheckButtonProps) {
  const icon = getCheckIcon(type);
  const label = getCheckLabel(type);

  const getStatusStyles = (): string => {
    switch (status) {
      case 'loading':
        return 'bg-gray-100 border-gray-300';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      case 'success':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'warning':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      default:
        return null;
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {getStatusIndicator()}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </>
  );

  const baseStyles = `flex flex-col items-start p-4 rounded-xl border-2 transition-all ${getStatusStyles()}`;

  if (isLink && href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={status === 'loading'}
      className={`${baseStyles} disabled:cursor-not-allowed`}
    >
      {content}
    </button>
  );
}
