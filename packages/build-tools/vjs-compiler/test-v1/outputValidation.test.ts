import { describe, expect, it } from 'vitest';

import { compileSkinToHTML } from '../src/index.js';
import { loadFixture } from './utils/fixtures.js';
import {
  validateCSS,
  validateFormattingWithPrettier,
  validateSkinModule,
  validateTypeScriptWithESLint,
} from './utils/outputValidation.js';

describe('output Validation - TypeScript', () => {
  it('validates well-formed TypeScript code', async () => {
    const code = `
      export function hello() {
        return 'world';
      }
    `;

    const result = await validateTypeScriptWithESLint(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects linting errors', async () => {
    const code = `
      debugger; // ESLint error: no-debugger
      console.log('test');
    `;

    const result = await validateTypeScriptWithESLint(code);
    // debugger statement should trigger an error
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });

  it('detects linting violations', async () => {
    const code = `
      const unused = 123; // Unused variable
      export function test() {
        return 'test';
      }
    `;

    const result = await validateTypeScriptWithESLint(code);
    // Should have errors or warnings about unused variable
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });
});

describe('output Validation - Prettier', () => {
  it('validates properly formatted TypeScript', async () => {
    const code = `export function hello() {\n  return 'world';\n}\n`;

    const result = await validateFormattingWithPrettier(code, 'typescript');
    expect(result.valid).toBe(true);
  });

  it('detects improperly formatted TypeScript', async () => {
    const code = `export function hello(){return "world"}`; // No spaces, double quotes

    const result = await validateFormattingWithPrettier(code, 'typescript');
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('validates properly formatted CSS', async () => {
    const css = `.button {\n  color: red;\n}\n`;

    const result = await validateCSS(css);
    expect(result.valid).toBe(true);
  });

  it('detects improperly formatted CSS', async () => {
    const css = `.button{color:red}`; // No spaces, no semicolon

    const result = await validateCSS(css);
    expect(result.valid).toBe(false);
  });
});

describe('output Validation - Generated Skin Modules', () => {
  it('validates generated skin module from simple fixture', async () => {
    const fixture = loadFixture('simple-component');
    const module = compileSkinToHTML(fixture.input);

    expect(module).not.toBeNull();

    const validation = await validateSkinModule(module!);

    // Should be valid TypeScript
    expect(validation.eslint.valid).toBe(true);
    expect(validation.eslint.errors).toHaveLength(0);

    // Should be properly formatted
    expect(validation.prettier.valid).toBe(true);
  });

  it('validates generated skin module from compound components fixture', async () => {
    const fixture = loadFixture('compound-components');
    const module = compileSkinToHTML(fixture.input);

    expect(module).not.toBeNull();

    const validation = await validateSkinModule(module!);

    expect(validation.eslint.valid).toBe(true);
    expect(validation.eslint.errors).toHaveLength(0);
    expect(validation.prettier.valid).toBe(true);
  });

  it('validates generated skin module from real-world fixture', async () => {
    const fixture = loadFixture('real-world-skin');
    const module = compileSkinToHTML(fixture.input);

    expect(module).not.toBeNull();

    const validation = await validateSkinModule(module!);

    expect(validation.eslint.valid).toBe(true);
    expect(validation.eslint.errors).toHaveLength(0);
    expect(validation.prettier.valid).toBe(true);
  });

  it('validates all fixture-generated modules', async () => {
    const fixtures = ['simple-component', 'compound-components', 'with-children', 'mixed-elements', 'real-world-skin'];

    for (const fixtureName of fixtures) {
      const fixture = loadFixture(fixtureName);
      const module = compileSkinToHTML(fixture.input);

      expect(module, `${fixtureName} should generate a module`).not.toBeNull();

      const validation = await validateSkinModule(module!);

      expect(validation.eslint.valid, `${fixtureName} should pass ESLint`).toBe(true);
      expect(validation.eslint.errors, `${fixtureName} should have no ESLint errors`).toHaveLength(0);
      expect(validation.prettier.valid, `${fixtureName} should be properly formatted`).toBe(true);
    }
  });
});

describe('output Validation - Edge Cases', () => {
  it('handles empty code gracefully', async () => {
    const result = await validateTypeScriptWithESLint('');
    expect(result.valid).toBe(true);
  });

  it('handles code with multiple violations', async () => {
    const code = `
      debugger;
      const unused = 123;
      console.log("double quotes");
    `;

    const result = await validateTypeScriptWithESLint(code);
    // Should have at least one error or warning
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });
});
