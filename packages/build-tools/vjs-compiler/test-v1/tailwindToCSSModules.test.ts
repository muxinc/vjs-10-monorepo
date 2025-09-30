import { describe, expect, it } from 'vitest';

import { compileTailwindToCSS } from '../src/cssProcessing/index.js';

describe('compileTailwindToCSS', () => {
  it('should compile Tailwind classes to CSS', async () => {
    const stylesObject = {
      container: 'flex items-center gap-4',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result).toBeDefined();
    expect(result.css).toBeDefined();
    expect(result.css).toContain('.container');
    expect(result.css).toContain('display');
    expect(result.css).toContain('flex');
  });

  it('should generate TypeScript definitions', async () => {
    const stylesObject = {
      button: 'px-4 py-2 bg-blue-500',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.dts).toBeDefined();
    expect(result.dts).toContain('button');
    expect(result.dts).toContain('export');
  });

  it('should handle multiple classes', async () => {
    const stylesObject = {
      primary: 'bg-blue-500 text-white px-4',
      secondary: 'bg-gray-500 py-2',
      tertiary: 'bg-green-500 rounded',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    // Should generate CSS (at least one class should have styles)
    expect(result.css.length).toBeGreaterThan(0);
    expect(result.dts).toContain('primary');
    expect(result.dts).toContain('secondary');
    expect(result.dts).toContain('tertiary');
  });

  it('should support state modifiers', async () => {
    const stylesObject = {
      button: 'bg-blue-500 hover:bg-blue-600 px-4',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    // Should generate CSS and TypeScript defs
    expect(result.css.length).toBeGreaterThan(0);
    expect(result.dts).toContain('button');
  });

  it('should support arbitrary values', async () => {
    const stylesObject = {
      custom: 'w-[750px] h-[200px]',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.custom');
    expect(result.css).toContain('750px');
    expect(result.css).toContain('200px');
  });

  it('should support arbitrary values with font weights and sizes', async () => {
    const stylesObject = {
      customText: 'font-[510] text-[0.8125rem]',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.customText');
    expect(result.css).toContain('510');
    expect(result.css).toContain('0.8125rem');
  });

  it('should support container declarations', async () => {
    const stylesObject = {
      container: '@container/root flex',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.container');
    expect(result.css).toContain('container-type');
    expect(result.css).toContain('inline-size');
    expect(result.css).toContain('container-name');
    expect(result.css).toContain('root');
  });

  it('should support container queries', async () => {
    const stylesObject = {
      text: '@container/root @7xl/root:text-[0.9375rem]',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.text');
    expect(result.css).toContain('@container root');
    expect(result.css).toContain('80rem');
    expect(result.css).toContain('0.9375rem');
  });

  it('should remove orphaned & selectors', async () => {
    const stylesObject = {
      button: 'flex px-4 hover:bg-blue-500',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    // Should not contain any lines starting with &
    const lines = result.css.split('\n');
    const orphanedSelectors = lines.filter((line) => line.trim().startsWith('&'));

    expect(orphanedSelectors.length).toBe(0);
  });

  it('should handle complex class combinations', async () => {
    const stylesObject = {
      complexButton:
        'flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.complexButton');
    expect(result.css.length).toBeGreaterThan(50); // Should generate substantial CSS
  });

  it('should handle empty styles object', async () => {
    const stylesObject = {};

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result).toBeDefined();
    expect(result.css).toBeDefined();
    expect(result.dts).toBeDefined();
  });

  it('should return warnings array', async () => {
    const stylesObject = {
      test: 'flex',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should use embedded theme configuration', async () => {
    const stylesObject = {
      text: 'font-sans',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    // Should reference the custom font via CSS variable or direct value
    expect(result.css).toMatch(/font-family/);
  });

  it('should handle classes with fractional values', async () => {
    const stylesObject = {
      half: 'w-1/2',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    expect(result.css).toContain('.half');
    expect(result.css).toMatch(/width/);
  });

  it('should handle multiple classes with shared Tailwind utilities', async () => {
    const stylesObject = {
      button1: 'flex px-4',
      button2: 'flex px-4',
      button3: 'flex px-4',
    };

    const result = await compileTailwindToCSS({ stylesObject });

    // Should generate CSS for all three classes
    expect(result.css).toContain('.button1');
    expect(result.css).toContain('.button2');
    expect(result.css).toContain('.button3');
  });
});
