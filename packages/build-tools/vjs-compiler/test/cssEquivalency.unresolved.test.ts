import { describe, expect, it } from 'vitest';

import { compileTailwindToCSS } from '../src/cssProcessing/index.js';
import { extractDeclarationsForSelector, parseCSS } from './utils/cssComparison.js';

/**
 * RED TESTS - These tests document known issues and expected behavior
 * that is currently NOT working. As we fix issues, tests should move
 * from this file to cssEquivalency.test.ts
 *
 * Run with: npm test -- cssEquivalency.unresolved
 */

/**
 * Helper to compile a single class string and extract its CSS
 */
async function compileAndExtract(classes: string): Promise<string> {
  const result = await compileTailwindToCSS({
    stylesObject: { test: classes },
  });
  return result.css;
}

describe('RED: Positioning and Spacing Utilities', () => {
  it('should generate inset-x-3 with left and right properties', async () => {
    const compiled = parseCSS(await compileAndExtract('inset-x-3'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set left and right (or inset-inline)
    expect(actualDecls.get('left')).toBeDefined();
    expect(actualDecls.get('right')).toBeDefined();
    expect(actualDecls.get('left')).toContain('0.75rem'); // 3 * 0.25rem
    expect(actualDecls.get('right')).toContain('0.75rem');
  });

  it('should generate bottom-3 with bottom property', async () => {
    const compiled = parseCSS(await compileAndExtract('bottom-3'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set bottom property
    expect(actualDecls.get('bottom')).toBeDefined();
    expect(actualDecls.get('bottom')).toContain('0.75rem');
  });

  it('should generate p-1 with padding', async () => {
    const compiled = parseCSS(await compileAndExtract('p-1'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set padding
    expect(actualDecls.get('padding')).toBeDefined();
    expect(actualDecls.get('padding')).toContain('0.25rem');
  });

  it('should generate gap-0.5 with gap property', async () => {
    const compiled = parseCSS(await compileAndExtract('gap-0.5'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set gap
    expect(actualDecls.get('gap')).toBeDefined();
    expect(actualDecls.get('gap')).toContain('0.125rem'); // 0.5 * 0.25rem
  });

  it('should generate gap-3 with gap property', async () => {
    const compiled = parseCSS(await compileAndExtract('gap-3'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set gap
    expect(actualDecls.get('gap')).toBeDefined();
    expect(actualDecls.get('gap')).toContain('0.75rem');
  });

  it('should generate px-1.5 with horizontal padding', async () => {
    const compiled = parseCSS(await compileAndExtract('px-1.5'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set padding-left and padding-right (or padding-inline)
    const hasPaddingInline = actualDecls.has('padding-inline');
    const hasPaddingLeftRight = actualDecls.has('padding-left') && actualDecls.has('padding-right');

    expect(hasPaddingInline || hasPaddingLeftRight).toBe(true);

    if (hasPaddingInline) {
      expect(actualDecls.get('padding-inline')).toContain('0.375rem'); // 1.5 * 0.25rem
    } else {
      expect(actualDecls.get('padding-left')).toContain('0.375rem');
      expect(actualDecls.get('padding-right')).toContain('0.375rem');
    }
  });
});

describe('RED: Size Utilities with Decimals', () => {
  it('should generate size-2.5 with width and height', async () => {
    const compiled = parseCSS(await compileAndExtract('size-2.5'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set both width and height
    expect(actualDecls.get('width')).toBeDefined();
    expect(actualDecls.get('height')).toBeDefined();
    expect(actualDecls.get('width')).toContain('0.625rem'); // 2.5 * 0.25rem
    expect(actualDecls.get('height')).toContain('0.625rem');
  });

  it('should generate size-3 with width and height', async () => {
    const compiled = parseCSS(await compileAndExtract('size-3'));
    const actualDecls = extractDeclarationsForSelector(compiled, '.test');

    // EXPECTED: Should set both width and height
    expect(actualDecls.get('width')).toBeDefined();
    expect(actualDecls.get('height')).toBeDefined();
    expect(actualDecls.get('width')).toContain('0.75rem');
    expect(actualDecls.get('height')).toContain('0.75rem');
  });

  it('should generate active:size-3 with width and height in :active state', async () => {
    const compiled = parseCSS(await compileAndExtract('active:size-3'));
    const css = compiled.toString();

    // EXPECTED: Should have :active pseudo-class with width and height
    expect(css).toContain(':active');
    expect(css).toMatch(/width.*0\.75rem/);
    expect(css).toMatch(/height.*0\.75rem/);
  });
});

describe('RED: Arbitrary Attribute Selectors', () => {
  it('should generate [&[data-orientation="horizontal"]]:h-5 with attribute selector', async () => {
    const compiled = parseCSS(await compileAndExtract('[&[data-orientation="horizontal"]]:h-5'));
    const css = compiled.toString();

    // EXPECTED: Should have attribute selector with height
    expect(css).toContain('[data-orientation="horizontal"]');
    expect(css).toMatch(/height.*1\.25rem/); // 5 * 0.25rem
  });

  it('should generate [&[data-orientation="vertical"]]:w-5 with attribute selector', async () => {
    const compiled = parseCSS(await compileAndExtract('[&[data-orientation="vertical"]]:w-5'));
    const css = compiled.toString();

    // EXPECTED: Should have attribute selector with width
    expect(css).toContain('[data-orientation="vertical"]');
    expect(css).toMatch(/width.*1\.25rem/);
  });
});

describe('RED: Custom Variants', () => {
  it('should generate hocus:bg-white/10 for hover and focus-visible', async () => {
    const compiled = parseCSS(await compileAndExtract('hocus:bg-white/10'));
    const css = compiled.toString();

    // EXPECTED: Should generate :is(:hover, :focus-visible) selector
    expect(css).toMatch(/:hover|:focus-visible/);
    expect(css).toMatch(/background-color/);
  });

  it('should generate reduced-transparency:bg-black/70 media query', async () => {
    const compiled = parseCSS(await compileAndExtract('reduced-transparency:bg-black/70'));
    const css = compiled.toString();

    // EXPECTED: Should generate @media (prefers-reduced-transparency: reduce)
    expect(css).toContain('@media');
    expect(css).toContain('prefers-reduced-transparency');
    expect(css).toMatch(/background-color/);
  });

  it('should generate contrast-more:bg-black/90 media query', async () => {
    const compiled = parseCSS(await compileAndExtract('contrast-more:bg-black/90'));
    const css = compiled.toString();

    // EXPECTED: Should generate @media (prefers-contrast: more)
    expect(css).toContain('@media');
    expect(css).toContain('prefers-contrast');
    expect(css).toMatch(/background-color/);
  });

  it('should generate aria-expanded:bg-white/10 attribute selector', async () => {
    const compiled = parseCSS(await compileAndExtract('aria-expanded:bg-white/10'));
    const css = compiled.toString();

    // EXPECTED: Should generate [aria-expanded] or [aria-expanded="true"]
    expect(css).toMatch(/\[aria-expanded/);
    expect(css).toMatch(/background-color/);
  });
});

describe('RED: Arbitrary Child Selectors', () => {
  it('should generate [&_svg]:shrink-0 for svg descendants', async () => {
    const compiled = parseCSS(await compileAndExtract('[&_svg]:shrink-0'));
    const css = compiled.toString();

    // EXPECTED: Should have descendant selector for svg elements
    expect(css).toMatch(/svg/);
    expect(css).toMatch(/flex-shrink.*0/);
  });

  it('should generate [&_svg]:opacity-0 for svg descendants', async () => {
    const compiled = parseCSS(await compileAndExtract('[&_svg]:opacity-0'));
    const css = compiled.toString();

    // EXPECTED: Should have descendant selector for svg elements
    expect(css).toMatch(/svg/);
    expect(css).toMatch(/opacity.*0/);
  });

  it('should generate [&_svg]:ease-out for svg descendants', async () => {
    const compiled = parseCSS(await compileAndExtract('[&_svg]:ease-out'));
    const css = compiled.toString();

    // EXPECTED: Should have descendant selector for svg elements with easing
    expect(css).toMatch(/svg/);
    expect(css).toMatch(/ease-out|cubic-bezier/);
  });
});

describe('RED: Real World Controls Component - Full Class String', () => {
  it('should compile all Controls classes without unresolved tokens', async () => {
    // This is the actual class string from our Controls component
    const controlsClasses =
      '@container/controls absolute inset-x-3 bottom-3 rounded-full z-20 flex items-center p-1 ring ring-white/10 ring-inset gap-0.5 text-white text-shadow';

    const result = await compileTailwindToCSS({
      stylesObject: { Controls: controlsClasses },
    });

    // EXPECTED: Should compile without warnings
    // Check if we have unresolved tokens
    const hasUnresolvedTokens = result.warnings.length > 0;

    if (hasUnresolvedTokens) {
      console.log('Unresolved tokens in Controls:', result.warnings);
    }

    // Should compile successfully with minimal unresolved tokens
    expect(result.css).toBeDefined();
    expect(result.css.length).toBeGreaterThan(0);

    // Key properties should be present
    const compiled = parseCSS(result.css);
    const actualDecls = extractDeclarationsForSelector(compiled, '.Controls');

    expect(actualDecls.get('position')).toBe('absolute');
    expect(actualDecls.get('display')).toBe('flex');
    expect(actualDecls.get('align-items')).toBe('center');

    // These are currently failing:
    expect(actualDecls.get('left')).toBeDefined(); // from inset-x-3
    expect(actualDecls.get('right')).toBeDefined(); // from inset-x-3
    expect(actualDecls.get('bottom')).toBeDefined(); // from bottom-3
    expect(actualDecls.get('padding')).toBeDefined(); // from p-1
    expect(actualDecls.get('gap')).toBeDefined(); // from gap-0.5
  });
});
