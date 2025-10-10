import type { Guide, Section } from '../docs';
import { describe, expect, it } from 'vitest';
import {
  FRAMEWORK_STYLES,
  getAvailableStyles,
  getDefaultStyle,
  isSection,
  SUPPORTED_FRAMEWORKS,
} from '../docs';

describe('docs types and utilities', () => {
  describe('fRAMEWORK_STYLES', () => {
    it('should contain html framework with css and tailwind styles', () => {
      expect(FRAMEWORK_STYLES.html).toEqual(['css', 'tailwind']);
    });

    it('should contain react framework with css, tailwind, and styled-components', () => {
      expect(FRAMEWORK_STYLES.react).toEqual(['css', 'tailwind', 'styled-components']);
    });
  });

  describe('sUPPORTED_FRAMEWORKS', () => {
    it('should include html and react frameworks', () => {
      expect(SUPPORTED_FRAMEWORKS).toEqual(['html', 'react']);
    });

    it('should match keys of FRAMEWORK_STYLES', () => {
      const frameworkKeys = Object.keys(FRAMEWORK_STYLES);
      expect(SUPPORTED_FRAMEWORKS).toEqual(frameworkKeys);
    });
  });

  describe('getAvailableStyles', () => {
    it('should return styles for html framework', () => {
      const result = getAvailableStyles('html');

      expect(result).toEqual(['css', 'tailwind']);
    });

    it('should return styles for react framework', () => {
      const result = getAvailableStyles('react');

      expect(result).toEqual(['css', 'tailwind', 'styled-components']);
    });

    it('should return readonly array', () => {
      const result = getAvailableStyles('html');

      // TypeScript compile-time check: result should be readonly
      expect(Object.isFrozen(result)).toBe(false); // Arrays from const assertions aren't frozen at runtime
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getDefaultStyle', () => {
    it('should return first style for html framework', () => {
      const result = getDefaultStyle('html');

      expect(result).toBe('css');
    });

    it('should return first style for react framework', () => {
      const result = getDefaultStyle('react');

      expect(result).toBe('css');
    });
  });

  describe('isSection', () => {
    it('should return true for Section objects', () => {
      const section: Section = {
        sidebarLabel: 'Test Section',
        contents: [],
      };

      expect(isSection(section)).toBe(true);
    });

    it('should return false for Guide objects', () => {
      const guide: Guide = {
        slug: 'test-guide',
      };

      expect(isSection(guide)).toBe(false);
    });

    it('should distinguish sections with nested contents', () => {
      const section: Section = {
        sidebarLabel: 'Section',
        contents: [
          { slug: 'guide-1' },
          { slug: 'guide-2' },
        ],
      };

      expect(isSection(section)).toBe(true);
    });

    it('should handle section with framework/style restrictions', () => {
      const section: Section = {
        sidebarLabel: 'Restricted Section',
        frameworks: ['html'],
        styles: ['css'],
        contents: [],
      };

      expect(isSection(section)).toBe(true);
    });

    it('should handle guide with framework/style restrictions', () => {
      const guide: Guide = {
        slug: 'restricted-guide',
        frameworks: ['react'],
        styles: ['tailwind'],
      };

      expect(isSection(guide)).toBe(false);
    });
  });
});
