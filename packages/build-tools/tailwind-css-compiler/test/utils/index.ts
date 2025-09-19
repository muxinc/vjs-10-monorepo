import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { ClassUsage, CompilerConfig, SemanticMapping } from '../../src/types.js';

/**
 * Create a temporary test file with given content
 */
export function createTestFile(relativePath: string, content: string, baseDir: string): string {
  const fullPath = resolve(baseDir, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

/**
 * Read a test file
 */
export function readTestFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Create a test CompilerConfig with sensible defaults
 */
export function createTestConfig(overrides: Partial<CompilerConfig> = {}): CompilerConfig {
  return {
    sources: ['**/*.tsx'],
    outputDir: './test-output',
    generateVanilla: true,
    generateModules: true,
    ...overrides
  };
}

/**
 * Create a test ClassUsage with sensible defaults
 */
export function createTestUsage(overrides: Partial<ClassUsage> = {}): ClassUsage {
  return {
    file: 'TestComponent.tsx',
    component: 'TestComponent',
    element: 'button',
    classes: ['bg-blue-500', 'text-white'],
    line: 1,
    column: 0,
    componentType: 'library', // Default to library component for tests
    ...overrides
  };
}

/**
 * Create test SemanticMapping with sensible defaults
 */
export function createTestMapping(overrides: Partial<SemanticMapping> = {}): SemanticMapping {
  return {
    component: 'TestComponent',
    element: 'button',
    vanillaSelector: 'test-component',
    moduleClassName: 'TestComponent',
    ...overrides
  };
}

/**
 * Assert that CSS contains expected rules
 */
export function expectCSSToContain(css: string, expectedRules: string[]): void {
  for (const rule of expectedRules) {
    if (!css.includes(rule)) {
      throw new Error(`Expected CSS to contain "${rule}"\nActual CSS:\n${css}`);
    }
  }
}

/**
 * Assert that CSS has proper structure (basic validation)
 */
export function expectValidCSS(css: string): void {
  // Check for balanced braces
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    throw new Error(`CSS has unbalanced braces: ${openBraces} open, ${closeBraces} close\nCSS:\n${css}`);
  }

  // Check that selectors end with opening braces
  const lines = css.split('\n').filter(line => line.trim());
  for (const line of lines) {
    if (line.includes(':') && !line.includes('{') && !line.includes('}') && !line.startsWith(' ')) {
      // This might be a property line, which should be indented
      if (!line.startsWith('  ') && !line.startsWith('\t')) {
        throw new Error(`CSS property "${line}" appears to be outside a rule block\nCSS:\n${css}`);
      }
    }
  }
}