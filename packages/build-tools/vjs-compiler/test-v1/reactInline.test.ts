import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validateSkinModule, validateTypeScriptWithESLint } from './utils/outputValidation.js';

describe('React Inline CSS Pipeline - E2E Validation', () => {
  const outputPath = join(
    process.cwd(),
    '../../../temp-skin-permutations/output/react-inline/MediaSkinDefault.tsx',
  );

  it('validates generated React inline CSS output exists', () => {
    expect(existsSync(outputPath), `Output file should exist at ${outputPath}`).toBe(true);
  });

  it('validates generated React inline CSS output has valid TypeScript syntax', async () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');
    const validation = await validateSkinModule(content);

    // Should pass ESLint (no syntax errors)
    expect(validation.eslint.valid, 'Generated code should pass ESLint').toBe(true);
    expect(validation.eslint.errors, 'Generated code should have no ESLint errors').toHaveLength(0);

    // Log warnings for informational purposes (we allow warnings)
    if (validation.eslint.warnings.length > 0) {
      console.log(
        `ℹ️  ${validation.eslint.warnings.length} ESLint warnings (allowed):`,
      );
      validation.eslint.warnings.forEach(w =>
        console.log(`  - ${w.message} (${w.ruleId})`),
      );
    }
  });

  it('ensures styles object has properly quoted keys', () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Extract the styles object
    const stylesMatch = content.match(
      /const styles: Record<string, string> = \{([^}]+)\}/s,
    );
    expect(stylesMatch, 'Should find styles object').not.toBeNull();

    if (stylesMatch) {
      const stylesObject = stylesMatch[1];

      // Check for unquoted hyphenated keys (invalid syntax)
      // Pattern: word character followed by hyphen, not preceded by quote
      const unquotedHyphenatedKeyPattern = /(?<!['"'])\b([a-z]+-[a-z0-9-]+)\s*:/gi;
      const invalidKeys = stylesObject.match(unquotedHyphenatedKeyPattern);

      expect(
        invalidKeys,
        `Should not have unquoted hyphenated keys. Found: ${invalidKeys?.join(', ')}`,
      ).toBeNull();
    }
  });

  it('validates inline CSS is present and valid', () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Should have inlineStyles constant
    expect(content).toContain('const inlineStyles = `');

    // Should have style tag with dangerouslySetInnerHTML
    expect(content).toContain('<style dangerouslySetInnerHTML={{ __html: inlineStyles }}');

    // Should have Fragment wrapper
    expect(content).toContain('<>');
    expect(content).toContain('</>');
  });

  it('validates styles object maps all CSS class names', () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Extract CSS from inlineStyles
    const cssMatch = content.match(/const inlineStyles = `([^`]+)`/s);
    expect(cssMatch, 'Should find inlineStyles constant').not.toBeNull();

    if (cssMatch) {
      const css = cssMatch[1];

      // Extract styles object
      const stylesMatch = content.match(
        /const styles: Record<string, string> = \{([^}]+)\}/s,
      );
      expect(stylesMatch, 'Should find styles object').not.toBeNull();

      if (stylesMatch) {
        const stylesObject = stylesMatch[1];

        // Extract class names from CSS
        const cssClassNames = new Set<string>();
        const classRegex = /\.([a-zA-Z_][\w-]*)\s*\{/g;
        let match;
        while ((match = classRegex.exec(css)) !== null) {
          cssClassNames.add(match[1]);
        }

        // Extract class names from styles object
        const stylesClassNames = new Set<string>();
        const stylesKeyRegex = /['"]?([a-zA-Z_][\w-]*)['"]?\s*:/g;
        while ((match = stylesKeyRegex.exec(stylesObject)) !== null) {
          stylesClassNames.add(match[1]);
        }

        // Verify all CSS classes are in styles object
        const missingClasses: string[] = [];
        cssClassNames.forEach(className => {
          if (!stylesClassNames.has(className)) {
            missingClasses.push(className);
          }
        });

        expect(
          missingClasses,
          `All CSS classes should be in styles object. Missing: ${missingClasses.join(', ')}`,
        ).toHaveLength(0);
      }
    }
  });

  it('validates TypeScript can parse the generated code', async () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Use ESLint with TypeScript parser to validate syntax
    const result = await validateTypeScriptWithESLint(content);

    // Should have no syntax errors (severity 2)
    expect(
      result.errors,
      `TypeScript should parse without errors. Errors: ${result.errors.map(e => e.message).join(', ')}`,
    ).toHaveLength(0);
  });

  it('validates no runtime Tailwind dependencies', () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Should not import tailwind
    expect(content).not.toContain('tailwindcss');
    expect(content).not.toContain('@tailwind');

    // Should not have CSS variables (should be resolved)
    const cssMatch = content.match(/const inlineStyles = `([^`]+)`/s);
    if (cssMatch) {
      const css = cssMatch[1];

      // Allow some CSS variables (like --font-sans) but not calc(var(...))
      const unresolvedCalcVars = css.match(/calc\(var\([^)]+\)[^)]*\)/g);
      expect(
        unresolvedCalcVars,
        'Should not have unresolved calc(var(...)) expressions',
      ).toBeNull();
    }
  });

  it('extracts class names from complex selectors (regression test)', () => {
    if (!existsSync(outputPath)) {
      console.warn(`Skipping test: ${outputPath} does not exist`);
      return;
    }

    const content = readFileSync(outputPath, 'utf-8');

    // Extract CSS from inlineStyles
    const cssMatch = content.match(/const inlineStyles = `([^`]+)`/s);
    expect(cssMatch, 'Should find inlineStyles constant').not.toBeNull();

    if (cssMatch) {
      const css = cssMatch[1];

      // Extract styles object
      const stylesMatch = content.match(
        /const styles: Record<string, string> = \{([^}]+)\}/s,
      );
      expect(stylesMatch, 'Should find styles object').not.toBeNull();

      if (stylesMatch) {
        const stylesObject = stylesMatch[1];

        // Extract class names from styles object
        const stylesClassNames = new Set<string>();
        const stylesKeyRegex = /['"]?([a-zA-Z_][\w-]*)['"]?\s*:/g;
        let match;
        while ((match = stylesKeyRegex.exec(stylesObject)) !== null) {
          stylesClassNames.add(match[1]);
        }

        // Test specific cases that were previously missing:
        // 1. Class with attribute selector: .PlayButton[data-paused]
        if (css.includes('.PlayButton[data-paused]') || css.includes('.PlayButton ')) {
          expect(
            stylesClassNames.has('PlayButton'),
            'Should extract PlayButton from complex selectors like .PlayButton[data-paused]',
          ).toBe(true);
        }

        // 2. Class with pseudo-class: .VolumeButton[data-volume-level="high"]
        if (css.includes('.VolumeButton[')) {
          expect(
            stylesClassNames.has('VolumeButton'),
            'Should extract VolumeButton from selectors with attribute',
          ).toBe(true);
        }

        // 3. Nested class selectors: .FullscreenButton .fullscreen-enter-icon
        if (css.includes('.FullscreenButton ')) {
          expect(
            stylesClassNames.has('FullscreenButton'),
            'Should extract FullscreenButton from nested selectors',
          ).toBe(true);
        }

        // 4. Icon classes in nested selectors
        if (css.includes('.play-icon') || css.includes('.pause-icon')) {
          expect(
            stylesClassNames.has('play-icon') || stylesClassNames.has('pause-icon'),
            'Should extract icon classes from nested selectors',
          ).toBe(true);
        }
      }
    }
  });
});

describe('React Inline CSS Pipeline - Syntax Validation Unit Tests', () => {
  it('detects unquoted hyphenated keys in object literals', () => {
    const validCode = `
      const styles = {
        'arrow-1': 'arrow-1',
        'play-icon': 'play-icon',
        Button: 'Button'
      };
    `;

    const invalidCode = `
      const styles = {
        arrow-1: 'arrow-1',
        play-icon: 'play-icon',
        Button: 'Button'
      };
    `;

    // Valid code should have no matches
    const validPattern = /(?<!['"'])\b([a-z]+-[a-z0-9-]+)\s*:/gi;
    const validMatches = validCode.match(validPattern);
    expect(validMatches, 'Valid code should not match pattern').toBeNull();

    // Invalid code should have matches
    const invalidMatches = invalidCode.match(validPattern);
    expect(invalidMatches, 'Invalid code should match pattern').not.toBeNull();
    expect(invalidMatches?.length).toBeGreaterThan(0);
  });

  it('validates quoted keys are always syntactically correct', async () => {
    const codeWithQuotedKeys = `
      const styles: Record<string, string> = {
        'arrow-1': 'arrow-1',
        'arrow-2': 'arrow-2',
        'play-icon': 'play-icon',
        'Button': 'Button',
        'MediaContainer': 'MediaContainer'
      };
      export default styles;
    `;

    const result = await validateTypeScriptWithESLint(codeWithQuotedKeys);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates unquoted hyphenated keys are invalid JavaScript', () => {
    const codeWithUnquotedKeys = `
      const styles = {
        arrow-1: 'arrow-1',
        Button: 'Button'
      };
    `;

    // Try to parse with JavaScript - should throw SyntaxError
    let syntaxError: Error | null = null;
    try {
      // This will fail because arrow-1 is parsed as "arrow minus 1"
      new Function(codeWithUnquotedKeys);
    }
    catch (error) {
      syntaxError = error as Error;
    }

    expect(syntaxError, 'Should throw syntax error for unquoted hyphenated keys').not.toBeNull();
    expect(syntaxError?.name).toBe('SyntaxError');
  });
});
