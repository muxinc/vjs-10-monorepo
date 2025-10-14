import type { Sidebar } from '../../../types/docs';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FRAMEWORK, DEFAULT_STYLE } from '../../../types/docs';
import { generateDocsRedirects } from '../staticRedirects';

describe('staticRedirects', () => {
  describe('generateDocsRedirects', () => {
    // Mock sidebar with predictable structure for testing
    const mockSidebar: Sidebar = [
      // Guide with no restrictions - visible to all frameworks and styles
      {
        slug: 'getting-started',
      },
      // Section with mixed guides
      {
        sidebarLabel: 'Core Concepts',
        contents: [
          {
            slug: 'core/basics',
          },
          {
            slug: 'core/html-only',
            frameworks: ['html'],
          },
          {
            slug: 'core/react-only',
            frameworks: ['react'],
          },
        ],
      },
      // Style-specific guides
      {
        sidebarLabel: 'Styling',
        contents: [
          {
            slug: 'styling/tailwind-only',
            styles: ['tailwind'],
          },
          {
            slug: 'styling/css-only',
            styles: ['css'],
          },
          {
            slug: 'styling/styled-components-only',
            styles: ['styled-components'],
          },
        ],
      },
      // Combination: react + tailwind only
      {
        slug: 'advanced/react-tailwind',
        frameworks: ['react'],
        styles: ['tailwind'],
      },
    ];

    const redirects = generateDocsRedirects(mockSidebar);

    it('should redirect /docs to default framework+style first guide', () => {
      expect(redirects['/docs']).toBe(
        `/docs/framework/${DEFAULT_FRAMEWORK}/style/${DEFAULT_STYLE}/getting-started`,
      );
    });

    it('should redirect /docs/framework/html to html+css first guide', () => {
      expect(redirects['/docs/framework/html']).toBe(
        '/docs/framework/html/style/css/getting-started',
      );
    });

    it('should redirect /docs/framework/react to react+css first guide', () => {
      expect(redirects['/docs/framework/react']).toBe(
        '/docs/framework/react/style/css/getting-started',
      );
    });

    it('should redirect /docs/framework/html/style/css to first html+css compatible guide', () => {
      expect(redirects['/docs/framework/html/style/css']).toBe(
        '/docs/framework/html/style/css/getting-started',
      );
    });

    it('should redirect /docs/framework/html/style/tailwind to first html+tailwind compatible guide', () => {
      // 'getting-started' has no style restrictions, so it's first for html+tailwind too
      expect(redirects['/docs/framework/html/style/tailwind']).toBe(
        '/docs/framework/html/style/tailwind/getting-started',
      );
    });

    it('should redirect /docs/framework/react/style/css to first react+css compatible guide', () => {
      expect(redirects['/docs/framework/react/style/css']).toBe(
        '/docs/framework/react/style/css/getting-started',
      );
    });

    it('should redirect /docs/framework/react/style/tailwind to first react+tailwind compatible guide', () => {
      expect(redirects['/docs/framework/react/style/tailwind']).toBe(
        '/docs/framework/react/style/tailwind/getting-started',
      );
    });

    it('should redirect /docs/framework/react/style/styled-components to first react+styled-components compatible guide', () => {
      expect(redirects['/docs/framework/react/style/styled-components']).toBe(
        '/docs/framework/react/style/styled-components/getting-started',
      );
    });

    it('should generate correct number of redirects', () => {
      // 1 base (/docs)
      // + 2 frameworks (/docs/framework/html, /docs/framework/react)
      // + 5 framework/style combinations (html: css+tailwind, react: css+tailwind+styled-components)
      // = 8 total redirects
      const redirectKeys = Object.keys(redirects);
      expect(redirectKeys).toHaveLength(8);
    });

    it('should include all expected redirect paths', () => {
      const expectedPaths = [
        '/docs',
        '/docs/framework/html',
        '/docs/framework/react',
        '/docs/framework/html/style/css',
        '/docs/framework/html/style/tailwind',
        '/docs/framework/react/style/css',
        '/docs/framework/react/style/tailwind',
        '/docs/framework/react/style/styled-components',
      ];

      expectedPaths.forEach((path) => {
        expect(redirects).toHaveProperty(path);
      });
    });

    it('should return object with string keys and string values', () => {
      Object.entries(redirects).forEach(([source, destination]) => {
        expect(typeof source).toBe('string');
        expect(typeof destination).toBe('string');
        expect(source).toMatch(/^\/docs/);
        expect(destination).toMatch(/^\/docs\/framework\/.+\/style\/.+\/.+/);
      });
    });

    it('should not include trailing slashes in source paths', () => {
      Object.keys(redirects).forEach((source) => {
        expect(source).not.toMatch(/\/$/);
      });
    });

    it('should not include trailing slashes in destination paths', () => {
      Object.values(redirects).forEach((destination) => {
        expect(destination).not.toMatch(/\/$/);
      });
    });

    describe('framework and style filtering', () => {
      it('should skip framework-restricted guides for non-matching frameworks', () => {
        // The mock has 'core/html-only' which shouldn't appear in react redirects
        Object.entries(redirects).forEach(([source, destination]) => {
          if (source.includes('/react/')) {
            expect(destination).not.toContain('html-only');
          }
        });
      });

      it('should skip style-restricted guides for non-matching styles', () => {
        // The mock has 'styling/css-only' which shouldn't appear in tailwind redirects
        Object.entries(redirects).forEach(([source, destination]) => {
          if (source.includes('/tailwind')) {
            expect(destination).not.toContain('css-only');
          }
        });
      });
    });

    describe('empty sidebar handling', () => {
      it('should return empty redirects object when sidebar is empty', () => {
        const emptyRedirects = generateDocsRedirects([]);
        expect(Object.keys(emptyRedirects)).toHaveLength(0);
      });

      it('should skip redirect when no matching guide exists for framework/style combo', () => {
        // Sidebar with only react-specific guides
        const reactOnlySidebar: Sidebar = [
          {
            slug: 'react-guide',
            frameworks: ['react'],
          },
        ];

        const reactOnlyRedirects = generateDocsRedirects(reactOnlySidebar);

        // Should have no html redirects since no guides match html
        expect(reactOnlyRedirects['/docs/framework/html']).toBeUndefined();
        expect(reactOnlyRedirects['/docs/framework/html/style/css']).toBeUndefined();
      });
    });
  });

  describe('generateDocsRedirects with real sidebar', () => {
    it('should generate non-empty redirects from actual sidebar config', () => {
      // Smoke test to ensure real sidebar integration works
      const realRedirects = generateDocsRedirects();

      expect(Object.keys(realRedirects).length).toBeGreaterThan(0);
      expect(realRedirects['/docs']).toBeDefined();
      expect(realRedirects['/docs']).toMatch(
        new RegExp(`^/docs/framework/${DEFAULT_FRAMEWORK}/style/${DEFAULT_STYLE}/.+`),
      );
    });
  });
});
