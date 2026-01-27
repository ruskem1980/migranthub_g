'use client';

import {
  useEffect,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBackButtonHandler } from '@/hooks/useBackButton';

export type SheetSnapPoint = 'half' | 'full';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoint?: SheetSnapPoint;
  enableDrag?: boolean;
}

const snapPointStyles: Record<SheetSnapPoint, string> = {
  half: 'max-h-[50vh]',
  full: 'max-h-[90vh]',
};

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoint = 'full',
  enableDrag = true,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Close sheet on Android back button
  useBackButtonHandler(() => {
    if (isOpen) {
      onClose();
      return true;
    }
    return false;
  }, [isOpen, onClose]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleEscape]);

  // Handle overlay click
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    if (!enableDrag) return;
    setIsDragging(true);
    startY.current = clientY;
    currentY.current = clientY;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging || !enableDrag) return;
    currentY.current = clientY;
    const delta = clientY - startY.current;
    // Only allow dragging down
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging || !enableDrag) return;
    setIsDragging(false);
    // If dragged more than 100px or with velocity, close
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
  };

  // Touch handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse handlers (for desktop testing)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  if (!isOpen) return null;

  const sheetContent = (
    <div
      className="fixed inset-0 z-50 flex items-end animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className={[
          'relative w-full bg-card rounded-t-3xl shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          'overflow-hidden flex flex-col',
          snapPointStyles[snapPoint],
          isDragging ? '' : 'transition-transform duration-200',
        ].join(' ')}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        {/* Drag Handle */}
        {enableDrag && (
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
            <h2
              id="sheet-title"
              className="text-xl font-bold text-card-foreground"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );

  // Use portal to render sheet at document body level
  if (typeof window === 'undefined') return null;

  return createPortal(sheetContent, document.body);
}

export default Sheet;
