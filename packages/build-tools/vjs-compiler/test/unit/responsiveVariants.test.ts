import { describe, expect, it } from 'vitest';
import {
  CONTAINER_BREAKPOINTS,
  extractAllResponsiveVariants,
  extractResponsiveVariants,
  getUniqueBaseUtilities,
  parseResponsiveVariant,
  removeResponsiveVariants,
} from '../../src/core/css/responsiveVariants';

describe('responsiveVariants', () => {
  describe('parseResponsiveVariant', () => {
    it('parses simple responsive variant', () => {
      const result = parseResponsiveVariant('sm:p-6');
      expect(result).toEqual({
        originalClass: 'sm:p-6',
        breakpoint: 'sm',
        utility: 'p-6',
        hasPseudoClass: false,
      });
    });

    it('parses responsive variant with pseudo-class', () => {
      const result = parseResponsiveVariant('md:hover:bg-blue-500');
      expect(result).toEqual({
        originalClass: 'md:hover:bg-blue-500',
        breakpoint: 'md',
        utility: 'hover:bg-blue-500',
        hasPseudoClass: true,
        pseudoClass: 'hover',
      });
    });

    it('parses multiple breakpoint sizes', () => {
      expect(parseResponsiveVariant('xs:p-2')?.breakpoint).toBe('xs');
      expect(parseResponsiveVariant('sm:p-4')?.breakpoint).toBe('sm');
      expect(parseResponsiveVariant('md:p-6')?.breakpoint).toBe('md');
      expect(parseResponsiveVariant('lg:p-8')?.breakpoint).toBe('lg');
      expect(parseResponsiveVariant('xl:p-10')?.breakpoint).toBe('xl');
      expect(parseResponsiveVariant('2xl:p-12')?.breakpoint).toBe('2xl');
    });

    it('parses arbitrary values in utilities', () => {
      const result = parseResponsiveVariant('md:bg-[#1da1f2]');
      expect(result).toEqual({
        originalClass: 'md:bg-[#1da1f2]',
        breakpoint: 'md',
        utility: 'bg-[#1da1f2]',
        hasPseudoClass: false,
      });
    });

    it('returns null for non-responsive classes', () => {
      expect(parseResponsiveVariant('p-6')).toBeNull();
      expect(parseResponsiveVariant('hover:bg-blue-500')).toBeNull();
      expect(parseResponsiveVariant('bg-[#1da1f2]')).toBeNull();
    });

    it('returns null for unknown breakpoints', () => {
      expect(parseResponsiveVariant('mobile:p-6')).toBeNull();
      expect(parseResponsiveVariant('desktop:p-8')).toBeNull();
    });
  });

  describe('extractResponsiveVariants', () => {
    it('extracts multiple responsive variants from class string', () => {
      const classString = 'p-4 sm:p-6 md:p-8 lg:p-12 bg-white';
      const result = extractResponsiveVariants(classString);

      expect(result).toHaveLength(3);
      expect(result[0]?.breakpoint).toBe('sm');
      expect(result[0]?.utility).toBe('p-6');
      expect(result[1]?.breakpoint).toBe('md');
      expect(result[1]?.utility).toBe('p-8');
      expect(result[2]?.breakpoint).toBe('lg');
      expect(result[2]?.utility).toBe('p-12');
    });

    it('handles class strings with only non-responsive classes', () => {
      const classString = 'p-4 bg-white rounded-lg';
      const result = extractResponsiveVariants(classString);

      expect(result).toHaveLength(0);
    });

    it('handles empty class string', () => {
      const result = extractResponsiveVariants('');
      expect(result).toHaveLength(0);
    });

    it('extracts variants with pseudo-classes', () => {
      const classString = 'sm:hover:scale-110 md:focus:ring-2';
      const result = extractResponsiveVariants(classString);

      expect(result).toHaveLength(2);
      expect(result[0]?.pseudoClass).toBe('hover');
      expect(result[1]?.pseudoClass).toBe('focus');
    });
  });

  describe('extractAllResponsiveVariants', () => {
    it('extracts variants from styles object', () => {
      const styles = {
        Wrapper: 'p-4 sm:p-6 md:p-8',
        Button: 'bg-blue-500 lg:bg-blue-600',
        Text: 'text-base', // No responsive variants
      };

      const result = extractAllResponsiveVariants(styles);

      expect(result.size).toBe(2);
      expect(result.get('Wrapper')).toHaveLength(2);
      expect(result.get('Button')).toHaveLength(1);
      expect(result.has('Text')).toBe(false);
    });

    it('handles empty styles object', () => {
      const result = extractAllResponsiveVariants({});
      expect(result.size).toBe(0);
    });
  });

  describe('getUniqueBaseUtilities', () => {
    it('extracts unique utilities from variants', () => {
      const variants = [
        { originalClass: 'sm:p-6', breakpoint: 'sm', utility: 'p-6', hasPseudoClass: false },
        { originalClass: 'md:p-6', breakpoint: 'md', utility: 'p-6', hasPseudoClass: false },
        { originalClass: 'lg:p-8', breakpoint: 'lg', utility: 'p-8', hasPseudoClass: false },
      ];

      const result = getUniqueBaseUtilities(variants);

      expect(result.size).toBe(2);
      expect(result.has('p-6')).toBe(true);
      expect(result.has('p-8')).toBe(true);
    });

    it('handles empty variants array', () => {
      const result = getUniqueBaseUtilities([]);
      expect(result.size).toBe(0);
    });
  });

  describe('removeResponsiveVariants', () => {
    it('removes responsive variants from class string', () => {
      const classString = 'p-4 sm:p-6 md:p-8 bg-white hover:bg-gray-100';
      const result = removeResponsiveVariants(classString);

      expect(result).toBe('p-4 bg-white hover:bg-gray-100');
    });

    it('handles class string with only responsive variants', () => {
      const classString = 'sm:p-6 md:p-8 lg:p-12';
      const result = removeResponsiveVariants(classString);

      expect(result).toBe('');
    });

    it('handles class string with no responsive variants', () => {
      const classString = 'p-4 bg-white rounded-lg';
      const result = removeResponsiveVariants(classString);

      expect(result).toBe('p-4 bg-white rounded-lg');
    });

    it('handles empty class string', () => {
      const result = removeResponsiveVariants('');
      expect(result).toBe('');
    });
  });

  describe('CONTAINER_BREAKPOINTS', () => {
    it('has expected breakpoint values', () => {
      expect(CONTAINER_BREAKPOINTS.sm).toBe('24rem');
      expect(CONTAINER_BREAKPOINTS.md).toBe('28rem');
      expect(CONTAINER_BREAKPOINTS.lg).toBe('32rem');
      expect(CONTAINER_BREAKPOINTS.xl).toBe('36rem');
    });

    it('includes all standard and extended breakpoints', () => {
      const breakpoints = Object.keys(CONTAINER_BREAKPOINTS);
      expect(breakpoints).toContain('xs');
      expect(breakpoints).toContain('sm');
      expect(breakpoints).toContain('md');
      expect(breakpoints).toContain('lg');
      expect(breakpoints).toContain('xl');
      expect(breakpoints).toContain('2xl');
      expect(breakpoints).toContain('3xl');
      expect(breakpoints).toContain('4xl');
      expect(breakpoints).toContain('5xl');
      expect(breakpoints).toContain('6xl');
      expect(breakpoints).toContain('7xl');
    });
  });
});
