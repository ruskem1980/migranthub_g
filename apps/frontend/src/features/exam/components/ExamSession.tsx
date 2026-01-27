'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Pause, Play, AlertCircle } from 'lucide-react';
import { useExamSession } from '../hooks';
import { ExamMode, ExamResult, QuestionCategory } from '../types';
import { ProgressBar, ProgressBarSkeleton } from './ProgressBar';
import { QuestionCard, QuestionCardSkeleton } from './QuestionCard';
import { ResultsScreen } from './ResultsScreen';
import { useTranslation } from '@/lib/i18n';

interface ExamSessionViewProps {
  mode?: ExamMode;
  category?: QuestionCategory;
  questionCount?: number;
}

export function ExamSessionView({ mode, category, questionCount }: ExamSessionViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<ExamResult | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Get params from URL if not provided as props
  const sessionMode = mode || (searchParams.get('mode') as ExamMode) || ExamMode.PRACTICE;
  const sessionCategory = category || (searchParams.get('category') as QuestionCategory) || undefined;
  const sessionCount = questionCount || Number(searchParams.get('count')) || undefined;

  const {
    isActive,
    isLoading,
    isPaused,
    error,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    isFirstQuestion,
    isLastQuestion,
    hasAnswer,
    currentAnswer,
    timeRemaining,
    timeSpent,
    startSession,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    pauseSession,
    resumeSession,
    finishSession,
    cancelSession,
  } = useExamSession();

  // Start session on mount
  useEffect(() => {
    if (!isActive && !result) {
      startSession(sessionMode, sessionCategory, sessionCount);
    }
  }, [isActive, result, sessionMode, sessionCategory, sessionCount, startSession]);

  // Handle answer
  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      answerQuestion(selectedIndex);
    },
    [answerQuestion]
  );

  // Handle next/finish
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const examResult = finishSession();
      if (examResult) {
        setResult(examResult);
      }
    } else {
      nextQuestion();
    }
  }, [isLastQuestion, finishSession, nextQuestion]);

  // Handle exit
  const handleExit = useCallback(() => {
    if (progress && progress.answered > 0 && !result) {
      setShowExitConfirm(true);
    } else {
      cancelSession();
      router.push('/exam');
    }
  }, [progress, result, cancelSession, router]);

  // Confirm exit
  const confirmExit = useCallback(() => {
    cancelSession();
    router.push('/exam');
  }, [cancelSession, router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setResult(null);
    startSession(sessionMode, sessionCategory, sessionCount);
  }, [sessionMode, sessionCategory, sessionCount, startSession]);

  // Handle home
  const handleHome = useCallback(() => {
    router.push('/exam');
  }, [router]);

  // Show results
  if (result) {
    return <ResultsScreen result={result} onRetry={handleRetry} onHome={handleHome} />;
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('exam.session.error')}</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            {t('exam.session.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Show loading
  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProgressBarSkeleton />
        <div className="px-4 py-6">
          <QuestionCardSkeleton />
        </div>
      </div>
    );
  }

  const showTimer = sessionMode === ExamMode.EXAM;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with progress */}
      <ProgressBar
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions}
        answeredCount={progress?.answered ?? 0}
        correctCount={progress?.correct ?? 0}
        timeRemaining={timeRemaining}
        timeSpent={timeSpent}
        showTimer={showTimer}
        category={sessionCategory}
        onPrevious={prevQuestion}
        onNext={hasAnswer ? handleNext : undefined}
        canGoPrevious={!isFirstQuestion}
        canGoNext={hasAnswer && !isLastQuestion}
      />

      {/* Control buttons */}
      <div className="px-4 py-2 flex items-center justify-between bg-white border-b">
        <button
          onClick={handleExit}
          className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
          aria-label={t('exam.session.exit')}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {showTimer && (
          <button
            onClick={isPaused ? resumeSession : pauseSession}
            className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            aria-label={isPaused ? t('exam.session.resume') : t('exam.session.pause')}
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-gray-600" />
            ) : (
              <Pause className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
            <Pause className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('exam.session.pause')}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('exam.session.testPaused')}
            </p>
            <button
              onClick={resumeSession}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              {t('exam.session.resume')}
            </button>
          </div>
        </div>
      )}

      {/* Question content */}
      <div className="flex-1 px-4 py-6 overflow-auto">
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={currentAnswer?.selectedIndex}
          onAnswer={handleAnswer}
          onNext={handleNext}
          showExplanation={sessionMode !== ExamMode.EXAM}
          isLastQuestion={isLastQuestion}
        />
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t('exam.session.exitConfirm')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('exam.session.exitWarning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
              >
                {t('exam.session.cancel')}
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                {t('exam.session.exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
