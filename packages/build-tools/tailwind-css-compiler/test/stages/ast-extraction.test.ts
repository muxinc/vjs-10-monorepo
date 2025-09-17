import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ASTParser } from '../../src/ast-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, '../fixtures');

describe('AST Extraction Pipeline', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = new ASTParser();
  });

  it('should extract classes from SimpleButton fixture', () => {
    const filePath = resolve(FIXTURES_DIR, 'components/SimpleButton.tsx');
    const result = parser.parseFile(filePath);

    expect(result.usages).toHaveLength(1);

    const usage = result.usages[0];
    expect(usage.component).toBe('SimpleButton');
    expect(usage.element).toBe('button');
    expect(usage.classes).toEqual(
      expect.arrayContaining([
        'bg-blue-500',
        'hover:bg-blue-700',
        'text-white',
        'font-bold',
        'py-2',
        'px-4',
        'rounded'
      ])
    );

    // Should extract hover condition
    expect(usage.conditions).toContain('hover');
  });

  it('should extract complex classes from ComplexPlayButton fixture', () => {
    const filePath = resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx');
    const result = parser.parseFile(filePath);

    // Should find multiple usages - button, PlayIcon, PauseIcon
    expect(result.usages.length).toBeGreaterThan(1);

    // Find the main button usage
    const buttonUsage = result.usages.find(u => u.element === 'button');
    expect(buttonUsage).toBeDefined();
    expect(buttonUsage?.component).toBe('ComplexPlayButton');

    // Should extract template literal classes
    expect(buttonUsage?.classes).toEqual(
      expect.arrayContaining([
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'cursor-pointer',
        'select-none',
        'p-2',
        'rounded-full',
        'transition-all',
        'duration-150',
        'ease-in-out'
      ])
    );

    // Find icon usages
    const iconUsages = result.usages.filter(u => u.element === 'icon' || u.component.includes('Icon'));
    expect(iconUsages.length).toBeGreaterThan(0);
  });

  it('should handle data attributes correctly', () => {
    const filePath = resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx');
    const result = parser.parseFile(filePath);

    const buttonUsage = result.usages.find(u => u.element === 'button');
    expect(buttonUsage?.conditions).toEqual(
      expect.arrayContaining(['data-playing', 'data-disabled'])
    );
  });

  it('should extract component names from file paths', () => {
    const simpleResult = parser.parseFile(resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'));
    expect(simpleResult.usages[0]?.component).toBe('SimpleButton');

    const complexResult = parser.parseFile(resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx'));
    expect(complexResult.usages[0]?.component).toBe('ComplexPlayButton');
  });

  it('should provide location information', () => {
    const filePath = resolve(FIXTURES_DIR, 'components/SimpleButton.tsx');
    const result = parser.parseFile(filePath);

    const usage = result.usages[0];
    expect(usage.line).toBeGreaterThan(0);
    expect(usage.column).toBeGreaterThanOrEqual(0);
    expect(usage.file).toBe(filePath);
  });

  it('should handle multiple components in one file', () => {
    // This would test if we had multiple exports in ComplexPlayButton.tsx
    const filePath = resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx');
    const result = parser.parseFile(filePath);

    // Should track different component names within the file
    const componentNames = new Set(result.usages.map(u => u.component));
    expect(componentNames.size).toBeGreaterThanOrEqual(1);
    expect(componentNames.has('ComplexPlayButton')).toBe(true);
  });
});