'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { LawDto } from '@/lib/api/types';

interface LawCardProps {
  law: LawDto;
}

export function LawCard({ law }: LawCardProps) {
  const formattedDate = new Date(law.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {law.number}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{law.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{law.summary}</p>
          <a
            href={law.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Открыть документ
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface LawsListProps {
  laws: LawDto[];
  loading?: boolean;
}

export function LawsList({ laws, loading }: LawsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (laws.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Законы не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {laws.map((law) => (
        <LawCard key={law.id} law={law} />
      ))}
    </div>
  );
}
