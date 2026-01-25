import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn (classnames utility)', () => {
    it('merges multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles single class name', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles conditional classes with false', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('handles conditional classes with true', () => {
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
    });

    it('handles undefined and null values', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('handles empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar');
    });

    describe('Tailwind CSS merging', () => {
      it('merges conflicting padding classes (last wins)', () => {
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
      });

      it('merges conflicting margin classes', () => {
        expect(cn('m-2', 'm-4')).toBe('m-4');
      });

      it('merges conflicting text color classes', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      });

      it('merges conflicting background color classes', () => {
        expect(cn('bg-white', 'bg-gray-100')).toBe('bg-gray-100');
      });

      it('keeps non-conflicting classes', () => {
        expect(cn('px-2', 'py-4', 'mt-2')).toBe('px-2 py-4 mt-2');
      });

      it('handles responsive variants correctly', () => {
        expect(cn('px-2', 'md:px-4', 'px-6')).toBe('md:px-4 px-6');
      });

      it('handles hover states correctly', () => {
        expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe(
          'hover:bg-blue-500'
        );
      });

      it('merges flex classes correctly', () => {
        expect(cn('flex flex-col', 'flex-row')).toBe('flex flex-row');
      });

      it('handles display classes', () => {
        expect(cn('block', 'hidden')).toBe('hidden');
      });
    });

    describe('complex scenarios', () => {
      it('handles object syntax from clsx', () => {
        expect(cn('base', { active: true, disabled: false })).toBe('base active');
      });

      it('handles array syntax from clsx', () => {
        expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
      });

      it('handles mixed syntax', () => {
        expect(
          cn('base', ['array-class'], { 'object-class': true }, 'final')
        ).toBe('base array-class object-class final');
      });
    });
  });
});
