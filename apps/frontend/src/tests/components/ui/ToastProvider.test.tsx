import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToastContext } from '@/components/ui/ToastProvider';
import { act } from 'react';

// Test component that uses the toast context
function TestComponent() {
  const { success, error, warning, info, addToast, toasts } = useToastContext();

  return (
    <div>
      <button onClick={() => success('Success message')}>Show Success</button>
      <button onClick={() => error('Error message')}>Show Error</button>
      <button onClick={() => warning('Warning message')}>Show Warning</button>
      <button onClick={() => info('Info message')}>Show Info</button>
      <button onClick={() => addToast('success', 'Custom toast', 3000)}>
        Add Custom Toast
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Test Content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('provides toast context to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
  });

  it('shows success toast when success method is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('shows error toast when error method is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const errorButton = screen.getByText('Show Error');
    fireEvent.click(errorButton);

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows warning toast when warning method is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const warningButton = screen.getByText('Show Warning');
    fireEvent.click(warningButton);

    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('shows info toast when info method is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const infoButton = screen.getByText('Show Info');
    fireEvent.click(infoButton);

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('allows adding custom toast with addToast method', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const customButton = screen.getByText('Add Custom Toast');
    fireEvent.click(customButton);

    expect(screen.getByText('Custom toast')).toBeInTheDocument();
  });

  it('updates toast count when toasts are added', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
  });

  it('limits maximum number of toasts to 3', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add 4 toasts
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));

    // Should only have 3 toasts
    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });

  it('removes oldest toast when exceeding max limit', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add 3 toasts
    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Show Error'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Show Warning'));
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();

    // Add one more (should remove the oldest - Success message)
    act(() => {
      fireEvent.click(screen.getByText('Show Info'));
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('removes toast when dismiss button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    // Wait for animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('auto-removes toast after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Fast-forward past the default 5000ms duration
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Wait for animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('renders toast container with correct attributes', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    const container = document.querySelector('[aria-live="polite"]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Notifications');
  });

  it('positions toast container at top-right', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    const container = document.querySelector('.fixed.top-4.right-4');
    expect(container).toBeInTheDocument();
  });

  it('generates unique IDs for each toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    const toasts = document.querySelectorAll('[role="alert"]');
    expect(toasts).toHaveLength(2);
  });

  it('throws error when useToastContext is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    function ComponentWithoutProvider() {
      useToastContext();
      return <div>Test</div>;
    }

    expect(() => {
      render(<ComponentWithoutProvider />);
    }).toThrow('useToastContext must be used within a ToastProvider');

    console.error = originalError;
  });

  it('handles multiple rapid toast additions', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add multiple toasts rapidly
    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      fireEvent.click(screen.getByText('Show Warning'));
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });

  it('preserves toast order (newest at bottom)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Show Error'));
    });

    const toasts = screen.getAllByRole('alert');
    expect(toasts[0]).toHaveTextContent('Success message');
    expect(toasts[1]).toHaveTextContent('Error message');
  });

  it('renders in a portal attached to document.body', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    // The toast should be rendered in document.body via portal
    const toastInBody = document.body.querySelector('[role="alert"]');
    expect(toastInBody).toBeInTheDocument();
  });

  it('respects custom duration for individual toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Custom Toast'));
    expect(screen.getByText('Custom toast')).toBeInTheDocument();

    // Custom duration is 3000ms
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Wait for animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Custom toast')).not.toBeInTheDocument();
  });
});
