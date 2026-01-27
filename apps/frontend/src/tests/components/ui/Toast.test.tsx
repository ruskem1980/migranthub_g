import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Toast } from '@/components/ui/Toast';

describe('Toast', () => {
  const defaultProps = {
    id: 'toast-1',
    type: 'success' as const,
    message: 'Test message',
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders toast message', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with success type styling', () => {
    const { container } = render(<Toast {...defaultProps} type="success" />);
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-green-50');
    expect(toast).toHaveClass('border-green-200');
  });

  it('renders with error type styling', () => {
    const { container } = render(<Toast {...defaultProps} type="error" />);
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-red-50');
    expect(toast).toHaveClass('border-red-200');
  });

  it('renders with warning type styling', () => {
    const { container } = render(<Toast {...defaultProps} type="warning" />);
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-yellow-50');
    expect(toast).toHaveClass('border-yellow-200');
  });

  it('renders with info type styling', () => {
    const { container } = render(<Toast {...defaultProps} type="info" />);
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-blue-50');
    expect(toast).toHaveClass('border-blue-200');
  });

  it('renders success icon for success type', () => {
    const { container } = render(<Toast {...defaultProps} type="success" />);
    const icon = container.querySelector('.text-green-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders error icon for error type', () => {
    const { container } = render(<Toast {...defaultProps} type="error" />);
    const icon = container.querySelector('.text-red-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders warning icon for warning type', () => {
    const { container } = render(<Toast {...defaultProps} type="warning" />);
    const icon = container.querySelector('.text-yellow-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders info icon for info type', () => {
    const { container } = render(<Toast {...defaultProps} type="info" />);
    const icon = container.querySelector('.text-blue-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders dismiss button', () => {
    render(<Toast {...defaultProps} />);
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    // Should wait for animation before calling onDismiss
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('auto-dismisses after default duration (5000ms)', () => {
    const onDismiss = jest.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should wait for animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('auto-dismisses after custom duration', () => {
    const onDismiss = jest.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} duration={3000} />);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should wait for animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onDismiss = jest.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} duration={0} />);

    // Fast-forward time beyond default duration
    jest.advanceTimersByTime(10000);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('has role="alert" for accessibility', () => {
    const { container } = render(<Toast {...defaultProps} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('cleans up timer on unmount', () => {
    const onDismiss = jest.fn();
    const { unmount } = render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    unmount();

    // Fast-forward time
    jest.advanceTimersByTime(6000);

    // onDismiss should not be called after unmount
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('applies fade-in animation initially', () => {
    const { container } = render(<Toast {...defaultProps} />);
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('animate-in');
    expect(toast).toHaveClass('fade-in');
    expect(toast).toHaveClass('slide-in-from-right');
  });

  it('applies fade-out animation when leaving', async () => {
    const onDismiss = jest.fn();
    const { container } = render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    // The toast should have leaving state applied
    await waitFor(() => {
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('animate-out');
    });
  });

  it('renders multiple toasts with different types', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" message="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="error" message="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="warning" message="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="info" message="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});
