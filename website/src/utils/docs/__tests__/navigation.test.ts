import type { Guide } from '../../../types/docs';
import type { BrowserNavigator } from '../navigation';
import { describe, expect, it, vi } from 'vitest';
import {
  buildDocsUrl,
  getCurrentGuideSlug,
  getFrameworkChangeTarget,
  getStyleChangeTarget,
  navigateToUrl,
} from '../navigation';

describe('navigation utilities', () => {
  describe('buildDocsUrl', () => {
    it('should build a correct docs URL', () => {
      const result = buildDocsUrl('html', 'css', 'getting-started');

      expect(result).toBe('/docs/framework/html/style/css/getting-started/');
    });

    it('should handle nested guide slugs', () => {
      const result = buildDocsUrl('react', 'tailwind', 'advanced/state-management');

      expect(result).toBe('/docs/framework/react/style/tailwind/advanced/state-management/');
    });
  });

  describe('navigateToUrl', () => {
    it('should navigate without replacing history', () => {
      const mockNavigator: BrowserNavigator = {
        getCurrentPath: vi.fn(),
        navigate: vi.fn(),
      };

      navigateToUrl('/new-url', false, mockNavigator);

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/new-url', false);
    });

    it('should navigate with replacing history', () => {
      const mockNavigator: BrowserNavigator = {
        getCurrentPath: vi.fn(),
        navigate: vi.fn(),
      };

      navigateToUrl('/new-url', true, mockNavigator);

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/new-url', true);
    });
  });

  describe('getCurrentGuideSlug', () => {
    it('should extract guide slug from URL', () => {
      const mockNavigator: BrowserNavigator = {
        getCurrentPath: () => '/docs/framework/html/style/css/getting-started/',
        navigate: vi.fn(),
      };

      const result = getCurrentGuideSlug(mockNavigator);

      expect(result).toBe('getting-started');
    });

    it('should handle nested guide slugs', () => {
      const mockNavigator: BrowserNavigator = {
        getCurrentPath: () => '/docs/framework/react/style/tailwind/advanced/state-management/',
        navigate: vi.fn(),
      };

      const result = getCurrentGuideSlug(mockNavigator);

      expect(result).toBe('advanced/state-management');
    });

    it('should handle URLs without trailing slash', () => {
      const mockNavigator: BrowserNavigator = {
        getCurrentPath: () => '/docs/framework/html/style/css/guide',
        navigate: vi.fn(),
      };

      const result = getCurrentGuideSlug(mockNavigator);

      expect(result).toBe('guide');
    });
  });

  describe('getFrameworkChangeTarget', () => {
    const mockGuide: Guide = {
      slug: 'getting-started',
      frameworks: ['html', 'react'],
      styles: ['css', 'tailwind'],
    };

    it('should navigate to first guide when no current guide', () => {
      const result = getFrameworkChangeTarget(null, 'css', 'react');

      expect(result.url).toContain('/docs/framework/react/style/css/');
      expect(result.replaceHistory).toBe(false);
    });

    it('should keep current guide when framework supports it', () => {
      const result = getFrameworkChangeTarget(mockGuide, 'css', 'react');

      expect(result.url).toBe('/docs/framework/react/style/css/getting-started/');
      expect(result.replaceHistory).toBe(true);
    });

    it('should go to first guide when guide does not support new framework', () => {
      const htmlOnlyGuide: Guide = {
        slug: 'html-only',
        frameworks: ['html'],
      };
      const result = getFrameworkChangeTarget(htmlOnlyGuide, 'css', 'react');

      expect(result.url).toContain('/docs/framework/react/');
      expect(result.replaceHistory).toBe(false);
    });

    it('should pick default style when current style not supported', () => {
      const cssOnlyGuide: Guide = {
        slug: 'css-only',
        frameworks: ['html', 'react'],
        styles: ['css'],
      };
      const result = getFrameworkChangeTarget(cssOnlyGuide, 'tailwind', 'react');

      expect(result.url).toBe('/docs/framework/react/style/css/css-only/');
      expect(result.replaceHistory).toBe(true);
    });

    it('should maintain current style when new framework supports it', () => {
      const result = getFrameworkChangeTarget(mockGuide, 'tailwind', 'react');

      expect(result.url).toBe('/docs/framework/react/style/tailwind/getting-started/');
      expect(result.replaceHistory).toBe(true);
    });

    it('should use first valid style when current style not valid', () => {
      const guide: Guide = {
        slug: 'test',
        frameworks: ['html', 'react'],
        styles: ['css'],
      };
      const result = getFrameworkChangeTarget(guide, 'tailwind', 'html');

      expect(result.url).toBe('/docs/framework/html/style/css/test/');
      expect(result.replaceHistory).toBe(true);
    });
  });

  describe('getStyleChangeTarget', () => {
    const mockGuide: Guide = {
      slug: 'getting-started',
      frameworks: ['html', 'react'],
      styles: ['css', 'tailwind'],
    };

    it('should navigate to first guide when no current guide', () => {
      const result = getStyleChangeTarget(null, 'react', 'tailwind');

      expect(result.url).toContain('/docs/framework/react/style/tailwind/');
      expect(result.replaceHistory).toBe(false);
    });

    it('should keep current guide when it supports new style', () => {
      const result = getStyleChangeTarget(mockGuide, 'html', 'tailwind');

      expect(result.url).toBe('/docs/framework/html/style/tailwind/getting-started/');
      expect(result.replaceHistory).toBe(true);
    });

    it('should go to first guide when current guide does not support new style', () => {
      const cssOnlyGuide: Guide = {
        slug: 'css-only',
        styles: ['css'],
      };
      const result = getStyleChangeTarget(cssOnlyGuide, 'react', 'tailwind');

      expect(result.url).toContain('/docs/framework/react/style/tailwind/');
      expect(result.replaceHistory).toBe(false);
    });

    it('should replace history for same guide different style', () => {
      const result = getStyleChangeTarget(mockGuide, 'react', 'css');

      expect(result.replaceHistory).toBe(true);
    });

    it('should not replace history when navigating to different guide', () => {
      const tailwindOnlyGuide: Guide = {
        slug: 'tailwind-only',
        styles: ['tailwind'],
      };
      const result = getStyleChangeTarget(tailwindOnlyGuide, 'react', 'css');

      expect(result.replaceHistory).toBe(false);
    });
  });
});
