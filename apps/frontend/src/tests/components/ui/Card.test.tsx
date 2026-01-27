import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-border');
  });

  it('applies elevated variant classes', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('shadow-lg');
  });

  it('applies outlined variant classes', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-transparent');
    expect(card).toHaveClass('border-2');
    expect(card).toHaveClass('border-border');
  });

  it('applies default medium padding', () => {
    render(<Card>Content</Card>);
    const contentWrapper = screen.getByText('Content');
    expect(contentWrapper).toHaveClass('p-4');
  });

  it('applies small padding', () => {
    render(<Card padding="sm">Content</Card>);
    const contentWrapper = screen.getByText('Content');
    expect(contentWrapper).toHaveClass('p-3');
  });

  it('applies large padding', () => {
    render(<Card padding="lg">Content</Card>);
    const contentWrapper = screen.getByText('Content');
    expect(contentWrapper).toHaveClass('p-6');
  });

  it('applies no padding', () => {
    const { container } = render(<Card padding="none">Content</Card>);
    const contentWrapper = screen.getByText('Content');
    expect(contentWrapper).not.toHaveClass('p-3');
    expect(contentWrapper).not.toHaveClass('p-4');
    expect(contentWrapper).not.toHaveClass('p-6');
  });

  it('renders header when provided', () => {
    render(<Card header={<div>Card Header</div>}>Content</Card>);
    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<Card footer={<div>Card Footer</div>}>Content</Card>);
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders header and footer with borders', () => {
    const { container } = render(
      <Card header={<div>Header</div>} footer={<div>Footer</div>}>
        Content
      </Card>
    );
    const header = screen.getByText('Header').parentElement;
    const footer = screen.getByText('Footer').parentElement;

    expect(header).toHaveClass('border-b');
    expect(footer).toHaveClass('border-t');
  });

  it('applies hoverable styles when hoverable is true', () => {
    const { container } = render(<Card hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('applies clickable styles when onClick is provided', () => {
    const onClick = jest.fn();
    const { container } = render(<Card onClick={onClick}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Content</Card>);

    fireEvent.click(screen.getByText('Content').parentElement!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref to div element', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to div element', () => {
    render(<Card data-testid="card-test">Content</Card>);
    expect(screen.getByTestId('card-test')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
  });

  it('applies custom className', () => {
    const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom-header');
  });

  it('forwards ref to div element', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('renders children correctly', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H3');
  });

  it('applies default classes', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('applies custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('custom-title');
  });

  it('forwards ref to h3 element', () => {
    const ref = { current: null };
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription', () => {
  it('renders children correctly', () => {
    render(<CardDescription>Card Description</CardDescription>);
    expect(screen.getByText('Card Description')).toBeInTheDocument();
  });

  it('renders as p element', () => {
    render(<CardDescription>Description</CardDescription>);
    const description = screen.getByText('Description');
    expect(description.tagName).toBe('P');
  });

  it('applies default classes', () => {
    render(<CardDescription>Description</CardDescription>);
    const description = screen.getByText('Description');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('applies custom className', () => {
    render(<CardDescription className="custom-desc">Description</CardDescription>);
    const description = screen.getByText('Description');
    expect(description).toHaveClass('custom-desc');
  });

  it('forwards ref to p element', () => {
    const ref = { current: null };
    render(<CardDescription ref={ref}>Description</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardContent className="custom-content">Content</CardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('custom-content');
  });

  it('forwards ref to div element', () => {
    const ref = { current: null };
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
  });

  it('applies custom className', () => {
    const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('custom-footer');
  });

  it('forwards ref to div element', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card - Complex Usage', () => {
  it('renders complete card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Main content goes here</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
