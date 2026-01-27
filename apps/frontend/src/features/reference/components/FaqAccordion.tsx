'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FaqItemDto } from '@/lib/api/types';

interface FaqAccordionProps {
  items: FaqItemDto[];
  loading?: boolean;
}

function FaqItem({ item }: { item: FaqItemDto }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <span className="flex-1 font-medium text-gray-900">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          <div className="pl-8 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export function FaqAccordion({ items, loading }: FaqAccordionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded-full" />
              <div className="flex-1 h-5 bg-gray-200 rounded" />
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Вопросы не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FaqItem key={item.id} item={item} />
      ))}
    </div>
  );
}
