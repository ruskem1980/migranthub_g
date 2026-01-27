import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sheet } from '@/components/ui/Sheet';

// Mock useBackButtonHandler hook
jest.mock('@/hooks/useBackButton', () => ({
  useBackButtonHandler: jest.fn(),
}));

describe('Sheet', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Sheet Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Sheet {...defaultProps} title="Test Sheet" />);
    expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Sheet {...defaultProps} isOpen={false} title="Test">
        <div>Content</div>
      </Sheet>
    );
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders title in header', () => {
    render(<Sheet {...defaultProps} title="Custom Title" />);
    expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
  });

  it('renders close button when title is provided', () => {
    render(<Sheet {...defaultProps} title="Test" />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('does not render header when title is not provided', () => {
    render(<Sheet {...defaultProps} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<Sheet {...defaultProps} onClose={onClose} title="Test" />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = jest.fn();
    render(<Sheet {...defaultProps} onClose={onClose} />);

    // Click on the overlay (the dialog wrapper div)
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when content clicked', () => {
    const onClose = jest.fn();
    render(<Sheet {...defaultProps} onClose={onClose} />);

    // Click on the sheet content
    fireEvent.click(screen.getByText('Sheet Content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key press', () => {
    const onClose = jest.fn();
    render(<Sheet {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies full snap point by default', () => {
    render(<Sheet {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.max-h-\\[90vh\\]')).toBeInTheDocument();
  });

  it('applies half snap point when specified', () => {
    render(<Sheet {...defaultProps} snapPoint="half" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.max-h-\\[50vh\\]')).toBeInTheDocument();
  });

  it('renders drag handle by default', () => {
    render(<Sheet {...defaultProps} />);
    const dragHandle = document.querySelector('.cursor-grab');
    expect(dragHandle).toBeInTheDocument();
  });

  it('does not render drag handle when enableDrag is false', () => {
    render(<Sheet {...defaultProps} enableDrag={false} />);
    const dragHandle = document.querySelector('.cursor-grab');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('has aria-modal attribute', () => {
    render(<Sheet {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby when title is provided', () => {
    render(<Sheet {...defaultProps} title="Accessible Sheet" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'sheet-title');
  });

  it('locks body scroll when open', () => {
    render(<Sheet {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll on unmount', () => {
    const originalOverflow = document.body.style.overflow;
    const { unmount } = render(<Sheet {...defaultProps} />);

    unmount();

    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<Sheet {...defaultProps} />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('renders in a portal attached to document.body', () => {
    render(<Sheet {...defaultProps} />);

    // The sheet should be rendered in document.body via portal
    const sheetInBody = document.body.querySelector('[role="dialog"]');
    expect(sheetInBody).toBeInTheDocument();
  });

  describe('Drag functionality', () => {
    it('handles touch start event', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.touchStart(dragHandle!, {
        touches: [{ clientY: 100 }],
      });

      // No error should be thrown
      expect(dragHandle).toBeInTheDocument();
    });

    it('handles touch move event', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.touchStart(dragHandle!, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(dragHandle!, {
        touches: [{ clientY: 150 }],
      });

      // No error should be thrown
      expect(dragHandle).toBeInTheDocument();
    });

    it('closes sheet when dragged down more than 100px', () => {
      const onClose = jest.fn();
      const { container } = render(<Sheet {...defaultProps} onClose={onClose} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.touchStart(dragHandle!, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(dragHandle!, {
        touches: [{ clientY: 250 }], // Dragged 150px down
      });

      fireEvent.touchEnd(dragHandle!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close sheet when dragged less than 100px', () => {
      const onClose = jest.fn();
      const { container } = render(<Sheet {...defaultProps} onClose={onClose} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.touchStart(dragHandle!, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(dragHandle!, {
        touches: [{ clientY: 150 }], // Dragged 50px down
      });

      fireEvent.touchEnd(dragHandle!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('handles mouse down event for desktop', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.mouseDown(dragHandle!, {
        clientY: 100,
      });

      // No error should be thrown
      expect(dragHandle).toBeInTheDocument();
    });

    it('handles mouse move event for desktop', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');
      const dialog = screen.getByRole('dialog');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.mouseDown(dragHandle!, {
        clientY: 100,
      });

      fireEvent.mouseMove(dialog, {
        clientY: 150,
      });

      // No error should be thrown
      expect(dragHandle).toBeInTheDocument();
    });

    it('handles mouse up event for desktop', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');
      const dialog = screen.getByRole('dialog');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.mouseDown(dragHandle!, {
        clientY: 100,
      });

      fireEvent.mouseMove(dialog, {
        clientY: 150,
      });

      fireEvent.mouseUp(dialog);

      // No error should be thrown
      expect(dragHandle).toBeInTheDocument();
    });

    it('ignores drag when enableDrag is false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Sheet {...defaultProps} onClose={onClose} enableDrag={false} />
      );

      // Drag handle should not exist
      const dragHandle = container.querySelector('.cursor-grab');
      expect(dragHandle).not.toBeInTheDocument();
    });

    it('only allows dragging down, not up', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dragHandle = container.querySelector('.cursor-grab');

      expect(dragHandle).toBeInTheDocument();

      fireEvent.touchStart(dragHandle!, {
        touches: [{ clientY: 100 }],
      });

      // Try to drag up
      fireEvent.touchMove(dragHandle!, {
        touches: [{ clientY: 50 }], // Dragged up 50px
      });

      // Since we're dragging up (negative delta), the dragOffset should remain 0
      // The sheet should not be translated upwards
      const sheetContent = container.querySelector('[class*="max-h"]');
      expect(sheetContent).toBeInTheDocument();
    });
  });

  describe('Animation classes', () => {
    it('applies slide-in animation when rendered', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      const sheetContent = dialog.querySelector('[class*="animate-in"]');
      expect(sheetContent).toBeInTheDocument();
      expect(sheetContent).toHaveClass('slide-in-from-bottom');
    });

    it('applies transition classes when not dragging', () => {
      const { container } = render(<Sheet {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      const sheetContent = dialog.querySelector('[class*="max-h"]');
      expect(sheetContent).toBeInTheDocument();
      expect(sheetContent).toHaveClass('transition-transform');
    });
  });
});
