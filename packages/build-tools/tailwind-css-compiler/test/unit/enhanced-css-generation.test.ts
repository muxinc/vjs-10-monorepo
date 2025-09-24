import { describe, it, expect, beforeEach } from 'vitest';
import postcss from 'postcss';
import { semanticCSSGenerator } from '../../src/semantic-css-generator.js';
import { enhanceClassUsages } from '../../src/class-parser.js';
import type { ClassUsage, EnhancedClassUsage } from '../../src/types.js';

describe('Enhanced CSS Generation', () => {
  let processor: postcss.Processor;

  beforeEach(() => {
    processor = postcss();
  });

  describe('Container Query CSS Generation', () => {
    it('should generate container declarations', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/container.tsx',
          component: 'MediaContainer',
          element: 'div',
          classes: ['@container/root', 'relative'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('container-type: inline-size');
      expect(result.css).toContain('container-name: root');
      expect(result.css).toContain('@apply relative');
    });

    it('should generate unnamed container declarations', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/container.tsx',
          component: 'MediaContainer',
          element: 'div',
          classes: ['@container', 'relative'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('container-type: inline-size');
      expect(result.css).not.toContain('container-name:');
      expect(result.css).toContain('@apply relative');
    });

    it('should generate container query rules', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@7xl/root:text-lg', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('@container root (min-width: 80rem)');
      expect(result.css).toContain('@apply text-lg');
      expect(result.css).toContain('@apply bg-blue-500');
    });

    it('should generate container query rules with arbitrary values', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@7xl/root:text-[0.9375rem]', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('@container root (min-width: 80rem)');
      expect(result.css).toContain('font-size: 0.9375rem');
      expect(result.css).toContain('@apply bg-blue-500');
    });

    it('should generate multiple container queries with different breakpoints', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@lg/controls:p-2', '@xl/controls:p-4', '@7xl/root:text-lg', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('@container controls (min-width: 32rem)');
      expect(result.css).toContain('@container controls (min-width: 36rem)');
      expect(result.css).toContain('@container root (min-width: 80rem)');
      expect(result.css).toContain('@apply p-2');
      expect(result.css).toContain('@apply p-4');
      expect(result.css).toContain('@apply text-lg');
    });
  });

  describe('Arbitrary Value CSS Generation', () => {
    it('should generate direct CSS properties for arbitrary values', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['font-[510]', 'text-[0.8125rem]', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('font-weight: 510');
      expect(result.css).toContain('font-size: 0.8125rem');
      expect(result.css).toContain('@apply bg-blue-500');
    });

    it('should handle multiple arbitrary values', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'CustomDiv',
          element: 'div',
          classes: ['w-[200px]', 'h-[100px]', 'bg-[#ff0000]', 'tracking-[-0.0125em]'],
          line: 1,
          column: 0,
          componentType: 'native',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('width: 200px');
      expect(result.css).toContain('height: 100px');
      expect(result.css).toContain('background-color: #ff0000');
      expect(result.css).toContain('letter-spacing: -0.0125em');
    });
  });

  describe('Mixed Complex Generation', () => {
    it('should handle MediaContainer-style complex usage', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/MediaSkin.tsx',
          component: 'MediaContainer',
          element: 'div',
          classes: [
            'relative',
            '@container/root',
            'overflow-clip',
            'rounded-4xl',
            'antialiased',
            'font-[510]',
            'font-sans',
            'text-[0.8125rem]',
            '@7xl/root:text-[0.9375rem]',
            'leading-normal',
            'tracking-[-0.0125em]'
          ],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      // Should generate simple classes via @apply
      expect(result.css).toContain('@apply relative overflow-clip rounded-4xl antialiased font-sans leading-normal');

      // Should generate container declaration
      expect(result.css).toContain('container-type: inline-size');
      expect(result.css).toContain('container-name: root');

      // Should generate arbitrary values as direct properties
      expect(result.css).toContain('font-weight: 510');
      expect(result.css).toContain('font-size: 0.8125rem');
      expect(result.css).toContain('letter-spacing: -0.0125em');

      // Should generate container query with arbitrary value
      expect(result.css).toContain('@container root (min-width: 80rem)');
      expect(result.css).toContain('font-size: 0.9375rem');
    });

    it('should generate both vanilla and modules CSS', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@container/controls', '@lg/controls:p-4', 'font-[600]', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: true,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      // Vanilla CSS should not have leading dots
      expect(result.css).toMatch(/PlayButton\s*{[^}]*container-type:/);
      expect(result.css).toMatch(/PlayButton\s*{[^}]*font-weight: 600/);

      // CSS Modules should have leading dots
      expect(result.css).toMatch(/\.PlayButton\s*{[^}]*container-type:/);
      expect(result.css).toMatch(/\.PlayButton\s*{[^}]*font-weight: 600/);

      // Container queries for both
      expect(result.css).toContain('@container controls (min-width: 32rem)');
    });

    it('should handle multiple components with different patterns', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/MediaSkin.tsx',
          component: 'MediaContainer',
          element: 'div',
          classes: ['@container/root', 'relative'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
        {
          file: '/test/MediaSkin.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@lg/root:p-2', 'bg-blue-500'],
          line: 5,
          column: 0,
          componentType: 'library',
        },
        {
          file: '/test/MediaSkin.tsx',
          component: 'MuteButton',
          element: 'button',
          classes: ['font-[600]', 'text-[0.875rem]'],
          line: 10,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      // MediaContainer should have container declaration
      expect(result.css).toMatch(/MediaContainer\s*{[^}]*container-type: inline-size/);
      expect(result.css).toMatch(/MediaContainer\s*{[^}]*container-name: root/);

      // PlayButton should have container query
      expect(result.css).toContain('@container root (min-width: 32rem)');
      expect(result.css).toMatch(/@container root \(min-width: 32rem\)[^}]*PlayButton[^}]*@apply p-2/);

      // MuteButton should have arbitrary values
      expect(result.css).toMatch(/MuteButton\s*{[^}]*font-weight: 600/);
      expect(result.css).toMatch(/MuteButton\s*{[^}]*font-size: 0.875rem/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty usages', async () => {
      const plugin = semanticCSSGenerator({
        usages: [],
        generateVanilla: true,
        generateModules: true,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css.trim()).toBe('');
    });

    it('should handle usages with no enhanced patterns', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/simple.tsx',
          component: 'SimpleButton',
          element: 'button',
          classes: ['bg-blue-500', 'text-white', 'rounded'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      expect(result.css).toContain('@apply bg-blue-500 text-white rounded');
      expect(result.css).not.toContain('container-type');
      expect(result.css).not.toContain('@container');
      expect(result.css).not.toContain('font-weight:');
    });

    it('should handle unknown container breakpoints gracefully', async () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/component.tsx',
          component: 'TestComponent',
          element: 'div',
          classes: ['@unknown/root:text-lg', 'bg-blue-500'],
          line: 1,
          column: 0,
          componentType: 'library',
        },
      ];

      const plugin = semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false,
      });

      const result = await processor.use(plugin).process('', { from: undefined });

      // Should still generate simple classes
      expect(result.css).toContain('@apply bg-blue-500');
      // Should not generate container query for unknown breakpoint
      expect(result.css).not.toContain('@container');
    });
  });
});