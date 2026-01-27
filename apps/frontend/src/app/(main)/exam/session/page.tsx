'use client';

import { Suspense } from 'react';
import { ExamSessionView } from '@/features/exam/components/ExamSession';
import { ProgressBarSkeleton, QuestionCardSkeleton } from '@/features/exam';

function SessionPageContent() {
  return <ExamSessionView />;
}

function SessionLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBarSkeleton />
      <div className="px-4 py-6">
        <QuestionCardSkeleton />
      </div>
    </div>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<SessionLoading />}>
      <SessionPageContent />
    </Suspense>
  );
}
