'use client';

import type { CategoryDto } from '@/lib/api/types';

interface CategoryListProps {
  categories: CategoryDto[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
          selectedId === null
            ? 'bg-blue-50 border-2 border-blue-500'
            : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}
      >
        <span className="text-xl">📚</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">Все категории</p>
        </div>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
            selectedId === category.id
              ? 'bg-blue-50 border-2 border-blue-500'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="text-xl">{category.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{category.name}</p>
            <p className="text-sm text-gray-500 truncate">{category.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
