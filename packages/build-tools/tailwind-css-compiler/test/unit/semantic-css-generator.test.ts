import { describe, it, expect } from 'vitest';
import postcss from 'postcss';
import { semanticCSSGenerator } from '../../src/semantic-css-generator.js';
import { createTestUsage, createTestMapping, expectCSSToContain, expectValidCSS } from '../utils/index.js';

describe('semanticCSSGenerator', () => {
  describe('vanilla CSS generation', () => {
    it('should generate vanilla CSS with semantic selectors', async () => {
      const usages = [
        createTestUsage({
          component: 'PlayButton',
          element: 'button',
          classes: ['bg-blue-500', 'text-white', 'rounded']
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectValidCSS(css);
      expectCSSToContain(css, [
        'play-button {',
        '@apply bg-blue-500 text-white rounded',
        '}'
      ]);
    });

    it('should use custom semantic mappings', async () => {
      const usages = [
        createTestUsage({
          component: 'CustomButton',
          element: 'button',
          classes: ['bg-red-500']
        })
      ];

      const mappings = [
        createTestMapping({
          component: 'CustomButton',
          element: 'button',
          vanillaSelector: 'media-custom-button'
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          mappings,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectCSSToContain(css, [
        'media-custom-button {',
        '@apply bg-red-500'
      ]);
    });

    it('should handle conditional classes', async () => {
      const usages = [
        createTestUsage({
          component: 'PlayButton',
          element: 'button',
          classes: ['bg-blue-500'],
          conditions: ['hover', 'data-playing']
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectValidCSS(css);
      expectCSSToContain(css, [
        'play-button {',
        'play-button:hover {',
        'play-button[data-playing] {'
      ]);
    });
  });

  describe('CSS modules generation', () => {
    it('should generate CSS modules with class selectors', async () => {
      const usages = [
        createTestUsage({
          component: 'PlayButton',
          element: 'button',
          classes: ['bg-blue-500', 'text-white']
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: false,
          generateModules: true
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectValidCSS(css);
      expectCSSToContain(css, [
        '.PlayButton {',
        '@apply bg-blue-500 text-white'
      ]);
    });

    it('should use custom module class names', async () => {
      const usages = [
        createTestUsage({
          component: 'CustomComponent',
          element: 'div',
          classes: ['p-4']
        })
      ];

      const mappings = [
        createTestMapping({
          component: 'CustomComponent',
          element: 'div',
          moduleClassName: 'CustomModuleName'
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          mappings,
          generateVanilla: false,
          generateModules: true
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectCSSToContain(css, [
        '.CustomModuleName {'
      ]);
    });
  });

  describe('deduplication', () => {
    it('should deduplicate identical component-element combinations', async () => {
      const usages = [
        createTestUsage({
          component: 'Button',
          element: 'button',
          classes: ['bg-blue-500']
        }),
        createTestUsage({
          component: 'Button',
          element: 'button',
          classes: ['text-white'] // Different classes, same component+element
        }),
        createTestUsage({
          component: 'Button',
          element: 'button',
          classes: ['bg-blue-500'] // Duplicate classes
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      // Should only have one rule for button, with merged classes
      const buttonRules = css.match(/button \{[^}]*\}/g);
      expect(buttonRules).toHaveLength(1);

      expectCSSToContain(css, [
        '@apply bg-blue-500 text-white'
      ]);
    });
  });

  describe('icon handling', () => {
    it('should generate icon-specific selectors', async () => {
      const usages = [
        createTestUsage({
          component: 'PlayIcon',
          element: 'icon',
          classes: ['w-6', 'h-6'],
          conditions: ['data-state']
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      expectValidCSS(css);
      expectCSSToContain(css, [
        'play-icon .icon {',
        '@apply w-6 h-6'
      ]);

      // Should handle icon conditional states
      expect(css).toContain('[data-state] .icon');
    });
  });

  describe('edge cases', () => {
    it('should handle empty class lists', async () => {
      const usages = [
        createTestUsage({
          classes: [] // Empty classes
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      // Should not generate rules for empty class lists
      expect(css.trim()).toBe('');
    });

    it('should handle usages with only conditions', async () => {
      const usages = [
        createTestUsage({
          classes: [],
          conditions: ['hover', 'focus']
        })
      ];

      const processor = postcss([
        semanticCSSGenerator({
          usages,
          generateVanilla: true,
          generateModules: false
        })
      ]);

      const result = await processor.process('', { from: undefined });
      const css = result.css;

      // Should generate conditional rules even without base classes
      expectCSSToContain(css, [
        ':hover {',
        ':focus {'
      ]);
    });
  });
});