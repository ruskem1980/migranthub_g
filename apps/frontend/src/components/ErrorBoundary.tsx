'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ReactNode } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Functional component for the error fallback UI (can use hooks)
function ErrorFallbackUI({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {t('errors.boundary.title')}
      </h2>
      <p className="text-gray-600 mb-4">
        {t('errors.boundary.description')}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {t('errors.tryAgain')}
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { errorInfo } });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallbackUI onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
