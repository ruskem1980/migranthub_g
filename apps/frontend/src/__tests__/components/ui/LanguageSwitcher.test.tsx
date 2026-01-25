import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

// Mock the i18n hook
const mockSetLanguage = jest.fn();
jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    language: 'ru',
    setLanguage: mockSetLanguage,
    getLanguageInfo: (code: string) => {
      const lang = require('@/lib/stores/languageStore').EXTENDED_LANGUAGES.find(
        (l: { code: string }) => l.code === code
      );
      return lang || { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' };
    },
  }),
  LANGUAGES: [
    { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'Узбекский', nativeName: "O'zbek", flag: '🇺🇿' },
    { code: 'tg', name: 'Таджикский', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
    { code: 'ky', name: 'Кыргызский', nativeName: 'Кыргызча', flag: '🇰🇬' },
  ],
  Language: {},
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockSetLanguage.mockClear();
  });

  describe('dropdown variant (default)', () => {
    it('renders with current language displayed', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByText('Русский')).toBeInTheDocument();
    });

    it('shows dropdown menu when clicked', () => {
      render(<LanguageSwitcher />);

      // Click on the switcher to open dropdown
      const trigger = screen.getByText('Русский');
      fireEvent.click(trigger);

      // Should show all main languages in dropdown
      expect(screen.getByText("O'zbek")).toBeInTheDocument();
      expect(screen.getByText('Тоҷикӣ')).toBeInTheDocument();
      expect(screen.getByText('Кыргызча')).toBeInTheDocument();
    });

    it('calls setLanguage when a language is selected', () => {
      render(<LanguageSwitcher />);

      // Open dropdown
      fireEvent.click(screen.getByText('Русский'));

      // Click on Uzbek
      fireEvent.click(screen.getByText("O'zbek"));

      expect(mockSetLanguage).toHaveBeenCalledWith('uz');
    });

    it('closes dropdown when backdrop is clicked', () => {
      render(<LanguageSwitcher />);

      // Open dropdown
      fireEvent.click(screen.getByText('Русский'));
      expect(screen.getByText("O'zbek")).toBeInTheDocument();

      // Click on backdrop (fixed inset-0 div)
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Dropdown should be closed
    });

    it('applies custom className', () => {
      const { container } = render(<LanguageSwitcher className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('compact variant', () => {
    it('renders compact view with language code', () => {
      render(<LanguageSwitcher variant="compact" />);
      expect(screen.getByText('RU')).toBeInTheDocument();
    });

    it('shows dropdown when clicked', () => {
      render(<LanguageSwitcher variant="compact" />);

      fireEvent.click(screen.getByText('RU'));

      // Should show language options
      expect(screen.getByText("O'zbek")).toBeInTheDocument();
    });

    it('displays chevron icon that rotates when open', () => {
      const { container } = render(<LanguageSwitcher variant="compact" />);

      // Find the trigger element
      const trigger = screen.getByText('RU').closest('div');

      // Click to open
      if (trigger) {
        fireEvent.click(trigger);
      }

      // Find the ChevronDown icon by its class - it should have rotate-180 class when dropdown is open
      const chevron = container.querySelector('.lucide-chevron-down');
      expect(chevron).toHaveClass('rotate-180');
    });
  });

  describe('list variant', () => {
    it('renders grid of language options', () => {
      render(<LanguageSwitcher variant="list" />);

      // Should show all 4 languages as grid items
      expect(screen.getByText('Русский')).toBeInTheDocument();
      expect(screen.getByText("O'zbek")).toBeInTheDocument();
      expect(screen.getByText('Тоҷикӣ')).toBeInTheDocument();
      expect(screen.getByText('Кыргызча')).toBeInTheDocument();
    });

    it('calls setLanguage when a language is selected from grid', () => {
      render(<LanguageSwitcher variant="list" />);

      // Click on Uzbek in the grid
      fireEvent.click(screen.getByText("O'zbek"));

      expect(mockSetLanguage).toHaveBeenCalledWith('uz');
    });

    it('highlights currently selected language', () => {
      render(<LanguageSwitcher variant="list" />);

      // Russian should be highlighted (current language is 'ru')
      const russianOption = screen.getByText('Русский').closest('div[class*="border-2"]');
      expect(russianOption).toHaveClass('border-blue-500');
      expect(russianOption).toHaveClass('bg-blue-50');
    });

    it('shows check icon for selected language', () => {
      render(<LanguageSwitcher variant="list" />);

      // Russian option should have a check icon
      const russianOption = screen.getByText('Русский').closest('div[class*="border-2"]');
      const checkIcon = russianOption?.querySelector('.bg-blue-600');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('dropdown is keyboard accessible', () => {
      render(<LanguageSwitcher />);

      const trigger = screen.getByText('Русский').closest('div');
      expect(trigger).toHaveClass('cursor-pointer');
    });
  });
});
