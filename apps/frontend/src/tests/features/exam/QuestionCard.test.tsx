import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionCard, QuestionCardSkeleton } from '@/features/exam/components/QuestionCard';
import { Question, QuestionCategory, QuestionDifficulty } from '@/features/exam/types';

const mockQuestion: Question = {
  id: 'q1',
  category: QuestionCategory.RUSSIAN_LANGUAGE,
  difficulty: QuestionDifficulty.MEDIUM,
  question: 'Какой падеж отвечает на вопросы "кого?" или "чего?"?',
  options: ['Именительный', 'Родительный', 'Дательный', 'Винительный'],
  correctIndex: 1,
  explanation: 'Родительный падеж отвечает на вопросы "кого?" или "чего?".',
  tags: ['grammar', 'cases'],
};

const mockHistoryQuestion: Question = {
  id: 'q2',
  category: QuestionCategory.HISTORY,
  difficulty: QuestionDifficulty.HARD,
  question: 'В каком году произошла Октябрьская революция?',
  options: ['1914', '1917', '1918', '1921'],
  correctIndex: 1,
  explanation: 'Октябрьская революция произошла в 1917 году.',
  tags: ['revolution', '20th century'],
};

describe('QuestionCard', () => {
  it('renders question text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />);

    expect(
      screen.getByText('Какой падеж отвечает на вопросы "кого?" или "чего?"?')
    ).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />);

    expect(screen.getByText('Именительный')).toBeInTheDocument();
    expect(screen.getByText('Родительный')).toBeInTheDocument();
    expect(screen.getByText('Дательный')).toBeInTheDocument();
    expect(screen.getByText('Винительный')).toBeInTheDocument();
  });

  it('displays category badge', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />);

    expect(screen.getByText('Русский язык')).toBeInTheDocument();
  });

  it('displays difficulty label', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />);

    expect(screen.getByText('Средний')).toBeInTheDocument();
  });

  it('displays hard difficulty for hard questions', () => {
    render(<QuestionCard question={mockHistoryQuestion} onAnswer={jest.fn()} />);

    expect(screen.getByText('Сложный')).toBeInTheDocument();
  });

  it('calls onAnswer when option is clicked', () => {
    const onAnswer = jest.fn();
    render(<QuestionCard question={mockQuestion} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText('Родительный'));

    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('disables options after answering', () => {
    const onAnswer = jest.fn();
    render(
      <QuestionCard question={mockQuestion} selectedAnswer={1} onAnswer={onAnswer} />
    );

    fireEvent.click(screen.getByText('Именительный'));

    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('shows correct answer styling when answered correctly', () => {
    render(
      <QuestionCard question={mockQuestion} selectedAnswer={1} onAnswer={jest.fn()} />
    );

    const correctButton = screen.getByText('Родительный').closest('button');
    expect(correctButton).toHaveClass('border-green-500');
    expect(correctButton).toHaveClass('bg-green-50');
  });

  it('shows incorrect answer styling when answered wrong', () => {
    render(
      <QuestionCard question={mockQuestion} selectedAnswer={0} onAnswer={jest.fn()} />
    );

    const incorrectButton = screen.getByText('Именительный').closest('button');
    expect(incorrectButton).toHaveClass('border-red-500');
    expect(incorrectButton).toHaveClass('bg-red-50');

    // Correct answer should still be highlighted
    const correctButton = screen.getByText('Родительный').closest('button');
    expect(correctButton).toHaveClass('border-green-500');
  });

  it('shows explanation after answering when showExplanation is true', async () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswer={jest.fn()}
        showExplanation={true}
      />
    );

    await waitFor(
      () => {
        expect(
          screen.getByText('Родительный падеж отвечает на вопросы "кого?" или "чего?".')
        ).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('shows "Правильно!" message when answer is correct', async () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswer={jest.fn()}
        showExplanation={true}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Правильно!')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('shows "Неправильно" message when answer is wrong', async () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={0}
        onAnswer={jest.fn()}
        showExplanation={true}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Неправильно')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('shows next button after answering', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswer={jest.fn()}
        onNext={jest.fn()}
      />
    );

    expect(screen.getByText('Следующий вопрос')).toBeInTheDocument();
  });

  it('shows "Завершить тест" on last question', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswer={jest.fn()}
        onNext={jest.fn()}
        isLastQuestion={true}
      />
    );

    expect(screen.getByText('Завершить тест')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswer={jest.fn()}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByText('Следующий вопрос'));

    expect(onNext).toHaveBeenCalled();
  });

  it('does not show next button when onNext is not provided', () => {
    render(
      <QuestionCard question={mockQuestion} selectedAnswer={1} onAnswer={jest.fn()} />
    );

    expect(screen.queryByText('Следующий вопрос')).not.toBeInTheDocument();
  });

  it('renders option letters A, B, C, D before answering', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});

describe('QuestionCardSkeleton', () => {
  it('renders skeleton without crashing', () => {
    render(<QuestionCardSkeleton />);

    const container = document.querySelector('.animate-pulse');
    expect(container).toBeInTheDocument();
  });

  it('renders four option placeholders', () => {
    render(<QuestionCardSkeleton />);

    const optionSkeletons = document.querySelectorAll('.h-16.bg-gray-200.rounded-xl');
    expect(optionSkeletons).toHaveLength(4);
  });
});
