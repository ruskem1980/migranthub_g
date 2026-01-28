'use client';

import { DocumentStatusSection } from '@/components/document-status';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">MigrantHub</h1>
        <p className="text-sm text-gray-500">Ваш помощник в миграционных вопросах</p>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Document Status Section */}
        <DocumentStatusSection />

        {/* Additional sections can be added here */}
      </main>
    </div>
  );
}
