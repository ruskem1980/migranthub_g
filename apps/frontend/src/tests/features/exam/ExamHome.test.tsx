import { render, screen, fireEvent } from '@testing-library/react';
import { ExamHome, ExamHomeSkeleton } from '@/features/exam/components/ExamHome';
import { QuestionCategory, ExamMode } from '@/features/exam/types';

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock exam store
const mockProgress = {
  totalAnswered: 50,
  correctAnswers: 40,
  streak: 5,
  lastActivityDate: '2024-01-15',
  byCategory: {
    [QuestionCategory.RUSSIAN_LANGUAGE]: { answered: 20, correct: 18 },
    [QuestionCategory.HISTORY]: { answered: 15, correct: 12 },
    [QuestionCategory.LAW]: { answered: 15, correct: 10 },
  },
  achievements: ['first_correct', 'streak_3'],
};

jest.mock('@/features/exam/stores', () => ({
  useExamStore: (selector: (state: { progress: typeof mockProgress }) => unknown) =>
    selector({ progress: mockProgress }),
}));

describe('ExamHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ExamHome />);
    expect(screen.getByText('Подготовка к экзамену')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<ExamHome />);

    // Total answered
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Вопросов')).toBeInTheDocument();

    // Percentage (40/50 = 80%)
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Успешность')).toBeInTheDocument();

    // Streak
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Дней подряд')).toBeInTheDocument();
  });

  it('renders all exam modes', () => {
    render(<ExamHome />);

    expect(screen.getByText('Обучение')).toBeInTheDocument();
    expect(screen.getByText('Практика')).toBeInTheDocument();
    expect(screen.getByText('Экзамен')).toBeInTheDocument();
  });

  it('renders all categories', () => {
    render(<ExamHome />);

    expect(screen.getByText('Категории')).toBeInTheDocument();
  });

  it('calls onSelectMode callback when mode is clicked', () => {
    const onSelectMode = jest.fn();
    render(<ExamHome onSelectMode={onSelectMode} />);

    const learningButton = screen.getByText('Обучение').closest('button');
    if (learningButton) {
      fireEvent.click(learningButton);
    }

    expect(onSelectMode).toHaveBeenCalledWith(ExamMode.LEARNING);
  });

  it('navigates via router when no onSelectMode callback', () => {
    render(<ExamHome />);

    const practiceButton = screen.getByText('Практика').closest('button');
    if (practiceButton) {
      fireEvent.click(practiceButton);
    }

    expect(mockPush).toHaveBeenCalledWith(`/exam/start?mode=${ExamMode.PRACTICE}`);
  });

  it('navigates back when back button is clicked', () => {
    render(<ExamHome />);

    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('displays tip section', () => {
    render(<ExamHome />);

    expect(screen.getByText('Совет для подготовки')).toBeInTheDocument();
  });
});

describe('ExamHomeSkeleton', () => {
  it('renders skeleton without crashing', () => {
    render(<ExamHomeSkeleton />);
    // Skeleton has animate-pulse elements
    const container = document.querySelector('.animate-pulse');
    expect(container).toBeInTheDocument();
  });
});
