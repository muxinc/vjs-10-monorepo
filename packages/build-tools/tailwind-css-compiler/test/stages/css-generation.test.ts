import { describe, it, expect } from 'vitest';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { semanticCSSGenerator } from '../../src/semantic-css-generator.js';
import { createTestUsage, expectValidCSS, expectCSSToContain } from '../utils/index.js';

describe('CSS Generation Pipeline', () => {
  it('should generate and process CSS through Tailwind pipeline', async () => {
    const usages = [
      createTestUsage({
        component: 'PlayButton',
        element: 'button',
        classes: ['bg-blue-500', 'text-white', 'p-2', 'rounded']
      })
    ];

    // Create a basic Tailwind config for testing
    const tailwindConfig = {
      content: [{ raw: '', extension: 'html' }], // Minimal content to prevent warnings
      theme: {},
      plugins: []
    };

    // Full pipeline: generate semantic CSS -> process with Tailwind
    const processor = postcss([
      semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false
      }),
      tailwindcss(tailwindConfig)
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    expectValidCSS(css);

    // Should contain processed CSS rules (not @apply anymore)
    expectCSSToContain(css, [
      'play-button {',
      'background-color:',
      'color:',
      'padding:',
      'border-radius:'
    ]);

    // Should NOT contain @apply directives after Tailwind processing
    expect(css).not.toContain('@apply');
  });

  it('should handle complex class combinations', async () => {
    const usages = [
      createTestUsage({
        component: 'ComplexButton',
        element: 'button',
        classes: [
          'relative', 'inline-flex', 'items-center', 'justify-center',
          'bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold',
          'py-2', 'px-4', 'rounded', 'transition', 'duration-150'
        ],
        conditions: ['hover']
      })
    ];

    const processor = postcss([
      semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false
      }),
      tailwindcss({
        content: [{ raw: '', extension: 'html' }],
        theme: {},
        plugins: []
      })
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    expectValidCSS(css);

    // Should contain base styles
    expect(css).toContain('complex-button {');

    // Should contain hover styles
    expect(css).toContain('complex-button:hover {');

    // Should contain actual CSS properties
    expectCSSToContain(css, [
      'position: relative',
      'display: inline-flex',
      'align-items: center',
      'justify-content: center'
    ]);
  });

  it('should generate both vanilla and modules formats', async () => {
    const usages = [
      createTestUsage({
        component: 'TestButton',
        element: 'button',
        classes: ['bg-red-500', 'text-white']
      })
    ];

    // Generate both formats
    const processor = postcss([
      semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: true
      }),
      tailwindcss({
        content: [{ raw: '', extension: 'html' }],
        theme: {},
        plugins: []
      })
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    expectValidCSS(css);

    // Should contain both vanilla and modules selectors
    expect(css).toContain('test-button {');
    expect(css).toContain('.TestButton {');
  });

  it('should handle icon components correctly', async () => {
    const usages = [
      createTestUsage({
        component: 'PlayIcon',
        element: 'icon',
        classes: ['w-6', 'h-6', 'text-current'],
        conditions: ['data-state']
      })
    ];

    const processor = postcss([
      semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false
      }),
      tailwindcss({
        content: [{ raw: '', extension: 'html' }],
        theme: {},
        plugins: []
      })
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    expectValidCSS(css);

    // Should generate icon-specific selectors
    expect(css).toContain('play-icon .icon {');
    expect(css).toContain('[data-state] .icon {');

    // Should contain size properties
    expectCSSToContain(css, [
      'width: 1.5rem',
      'height: 1.5rem'
    ]);
  });

  it('should deduplicate classes across multiple usages', async () => {
    const usages = [
      createTestUsage({
        component: 'Button',
        element: 'button',
        classes: ['bg-blue-500', 'text-white']
      }),
      createTestUsage({
        component: 'Button',
        element: 'button',
        classes: ['bg-blue-500', 'p-2'] // Duplicate bg-blue-500, new p-2
      })
    ];

    const processor = postcss([
      semanticCSSGenerator({
        usages,
        generateVanilla: true,
        generateModules: false
      }),
      tailwindcss({
        content: [{ raw: '', extension: 'html' }],
        theme: {},
        plugins: []
      })
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    // Should only have one button rule
    const buttonRules = css.match(/button \{[^}]*\}/gs);
    expect(buttonRules?.length).toBeLessThanOrEqual(2); // Base rule + possible hover/condition rules

    // Should contain all merged classes
    expectCSSToContain(css, [
      'background-color: rgb(59 130 246)', // bg-blue-500
      'color: rgb(255 255 255)', // text-white
      'padding: 0.5rem' // p-2
    ]);
  });

  it('should handle custom semantic mappings', async () => {
    const usages = [
      createTestUsage({
        component: 'MediaPlayer',
        element: 'div',
        classes: ['bg-black', 'text-white']
      })
    ];

    const mappings = [{
      component: 'MediaPlayer',
      element: 'div',
      vanillaSelector: 'media-player-container',
      moduleClassName: 'MediaPlayerContainer'
    }];

    const processor = postcss([
      semanticCSSGenerator({
        usages,
        mappings,
        generateVanilla: true,
        generateModules: true
      }),
      tailwindcss({
        content: [{ raw: '', extension: 'html' }],
        theme: {},
        plugins: []
      })
    ]);

    const result = await processor.process('', { from: undefined });
    const css = result.css;

    // Should use custom mappings
    expect(css).toContain('media-player-container {');
    expect(css).toContain('.MediaPlayerContainer {');
  });
});