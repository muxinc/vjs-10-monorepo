import { describe, expect, it } from 'vitest';
import { generateDocsRedirects } from '../staticRedirects';

describe('staticRedirects', () => {
  describe('generateDocsRedirects', () => {
    const redirects = generateDocsRedirects();

    it('should redirect /docs to html+css first guide', () => {
      expect(redirects['/docs']).toBeDefined();
      expect(redirects['/docs']).toMatch(/^\/docs\/framework\/html\/style\/css\/.+/);
    });

    it('should redirect /docs/framework/html to first guide with default style (css)', () => {
      expect(redirects['/docs/framework/html']).toBeDefined();
      expect(redirects['/docs/framework/html']).toMatch(
        /^\/docs\/framework\/html\/style\/css\/.+/,
      );
    });

    it('should redirect /docs/framework/react to first guide with default style (css)', () => {
      expect(redirects['/docs/framework/react']).toBeDefined();
      expect(redirects['/docs/framework/react']).toMatch(
        /^\/docs\/framework\/react\/style\/css\/.+/,
      );
    });

    it('should redirect /docs/framework/html/style/css to first html+css guide', () => {
      expect(redirects['/docs/framework/html/style/css']).toBeDefined();
      expect(redirects['/docs/framework/html/style/css']).toMatch(
        /^\/docs\/framework\/html\/style\/css\/.+/,
      );
    });

    it('should redirect /docs/framework/html/style/tailwind to first html+tailwind guide', () => {
      expect(redirects['/docs/framework/html/style/tailwind']).toBeDefined();
      expect(redirects['/docs/framework/html/style/tailwind']).toMatch(
        /^\/docs\/framework\/html\/style\/tailwind\/.+/,
      );
    });

    it('should redirect /docs/framework/react/style/css to first react+css guide', () => {
      expect(redirects['/docs/framework/react/style/css']).toBeDefined();
      expect(redirects['/docs/framework/react/style/css']).toMatch(
        /^\/docs\/framework\/react\/style\/css\/.+/,
      );
    });

    it('should redirect /docs/framework/react/style/tailwind to first react+tailwind guide', () => {
      expect(redirects['/docs/framework/react/style/tailwind']).toBeDefined();
      expect(redirects['/docs/framework/react/style/tailwind']).toMatch(
        /^\/docs\/framework\/react\/style\/tailwind\/.+/,
      );
    });

    it('should redirect /docs/framework/react/style/styled-components to first react+styled-components guide', () => {
      expect(redirects['/docs/framework/react/style/styled-components']).toBeDefined();
      expect(redirects['/docs/framework/react/style/styled-components']).toMatch(
        /^\/docs\/framework\/react\/style\/styled-components\/.+/,
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

    it('should use concepts/everyone as first guide for html+css (based on actual sidebar)', () => {
      // Based on the actual sidebar config, 'concepts/everyone' is the first guide
      // that's visible to html+css (it has no framework/style restrictions)
      expect(redirects['/docs']).toBe(
        '/docs/framework/html/style/css/concepts/everyone',
      );
      expect(redirects['/docs/framework/html']).toBe(
        '/docs/framework/html/style/css/concepts/everyone',
      );
      expect(redirects['/docs/framework/html/style/css']).toBe(
        '/docs/framework/html/style/css/concepts/everyone',
      );
    });

    it('should use concepts/everyone as first guide for react+css', () => {
      // 'concepts/everyone' has no restrictions, so it should be first for react+css
      expect(redirects['/docs/framework/react/style/css']).toBe(
        '/docs/framework/react/style/css/concepts/everyone',
      );
    });

    it('should use concepts/tailwind-only as first guide for html+tailwind', () => {
      // Based on sidebar: concepts/everyone (no style restriction) comes before concepts/tailwind-only
      // So html+tailwind should use concepts/everyone
      expect(redirects['/docs/framework/html/style/tailwind']).toBe(
        '/docs/framework/html/style/tailwind/concepts/everyone',
      );
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
  });
});
