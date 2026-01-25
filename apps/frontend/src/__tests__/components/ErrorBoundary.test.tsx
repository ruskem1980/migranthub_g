import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Content rendered successfully</div>;
};

// Suppress console.error for expected errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders default fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(screen.getByText('Произошла непредвиденная ошибка')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Попробовать снова' })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Что-то пошло не так')).not.toBeInTheDocument();
  });

  it('calls Sentry.captureException when an error occurs', () => {
    const Sentry = require('@sentry/nextjs');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          errorInfo: expect.any(Object),
        }),
      })
    );
  });

  it('resets error state when "Try again" button is clicked', () => {
    // Use a component that can toggle error state
    let shouldThrow = true;
    const ToggleError = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Content rendered successfully</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>
    );

    // Error should be shown
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();

    // Update the flag so component won't throw on next render
    shouldThrow = false;

    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }));

    // After clicking retry, the component should re-render children
    // Since we changed shouldThrow to false, it should render successfully
    expect(screen.getByText('Content rendered successfully')).toBeInTheDocument();
    expect(screen.queryByText('Что-то пошло не так')).not.toBeInTheDocument();
  });

  it('catches errors from nested components', () => {
    const NestedComponent = () => {
      return (
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
  });

  it('styles are applied correctly to fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const container = screen.getByText('Что-то пошло не так').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');

    const button = screen.getByRole('button', { name: 'Попробовать снова' });
    expect(button).toHaveClass('bg-blue-600', 'text-white', 'rounded-lg');
  });
});
