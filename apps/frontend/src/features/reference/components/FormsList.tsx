'use client';

import { Download, FileText } from 'lucide-react';
import type { FormDto } from '@/lib/api/types';

interface FormsListProps {
  forms: FormDto[];
  loading?: boolean;
}

function getFormatColor(format: string): string {
  switch (format.toLowerCase()) {
    case 'pdf':
      return 'bg-red-100 text-red-700';
    case 'doc':
    case 'docx':
      return 'bg-blue-100 text-blue-700';
    case 'xls':
    case 'xlsx':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function FormsList({ forms, loading }: FormsListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-3" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Формы не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {forms.map((form) => (
        <div
          key={form.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1">{form.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{form.description}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${getFormatColor(form.format)}`}
                >
                  {form.format}
                </span>
                {form.size && <span className="text-xs text-gray-500">{form.size}</span>}
              </div>
              <a
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Скачать
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
