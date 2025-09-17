import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TailwindCSSCompiler } from '../../src/compiler.js';
import { createTestConfig, expectValidCSS } from '../utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_OUTPUT_DIR = resolve(__dirname, '../temp');
const FIXTURES_DIR = resolve(__dirname, '../fixtures');

describe('End-to-End Compilation', () => {
  let outputDir: string;

  beforeEach(() => {
    outputDir = resolve(TEST_OUTPUT_DIR, 'e2e-output');
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should compile SimpleButton to both formats', async () => {
    const config = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: true
    });

    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();

    // Check that both files were generated
    const vanillaPath = resolve(outputDir, 'vanilla.css');
    const modulesPath = resolve(outputDir, 'modules.css');

    expect(existsSync(vanillaPath)).toBe(true);
    expect(existsSync(modulesPath)).toBe(true);

    const vanillaCSS = readFileSync(vanillaPath, 'utf-8');
    const modulesCSS = readFileSync(modulesPath, 'utf-8');

    expectValidCSS(vanillaCSS);
    expectValidCSS(modulesCSS);

    // Vanilla CSS should use semantic selectors
    expect(vanillaCSS).toContain('simple-button {');
    expect(vanillaCSS).toContain('simple-button:hover {');

    // CSS Modules should use class selectors
    expect(modulesCSS).toContain('.SimpleButton {');
    expect(modulesCSS).toContain('.SimpleButton:hover {');

    // Both should contain actual Tailwind-generated CSS properties
    expect(vanillaCSS).toContain('background-color:');
    expect(modulesCSS).toContain('background-color:');

    // Should not contain @apply directives
    expect(vanillaCSS).not.toContain('@apply');
    expect(modulesCSS).not.toContain('@apply');
  });

  it('should compile ComplexPlayButton with all features', async () => {
    const config = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: false
    });

    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();

    const vanillaPath = resolve(outputDir, 'vanilla.css');
    expect(existsSync(vanillaPath)).toBe(true);

    const vanillaCSS = readFileSync(vanillaPath, 'utf-8');
    expectValidCSS(vanillaCSS);

    // Should contain button styles
    expect(vanillaCSS).toContain('complex-play-button {');

    // Should contain icon styles
    expect(vanillaCSS).toMatch(/play-icon|pause-icon/);

    // Should handle data attributes
    expect(vanillaCSS).toContain('[data-playing]');
    expect(vanillaCSS).toContain('[data-disabled]');

    // Should contain complex layout properties
    expect(vanillaCSS).toContain('display: inline-flex');
    expect(vanillaCSS).toContain('align-items: center');
    expect(vanillaCSS).toContain('justify-content: center');
  });

  it('should handle multiple components in one compilation', async () => {
    const config = createTestConfig({
      sources: [
        resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
        resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx')
      ],
      outputDir,
      generateVanilla: true,
      generateModules: true
    });

    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    const modulesCSS = readFileSync(resolve(outputDir, 'modules.css'), 'utf-8');

    expectValidCSS(vanillaCSS);
    expectValidCSS(modulesCSS);

    // Should contain styles for both components
    expect(vanillaCSS).toContain('simple-button {');
    expect(vanillaCSS).toContain('complex-play-button {');

    expect(modulesCSS).toContain('.SimpleButton {');
    expect(modulesCSS).toContain('.ComplexPlayButton {');

    // Should contain unique styles from each component
    expect(vanillaCSS).toContain('font-weight: 700'); // SimpleButton's font-bold
    expect(vanillaCSS).toContain('cursor: pointer'); // ComplexPlayButton's cursor-pointer
  });

  it('should work with custom semantic mappings', async () => {
    const config = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: true,
      mappings: [{
        component: 'SimpleButton',
        element: 'button',
        vanillaSelector: 'media-simple-btn',
        moduleClassName: 'MediaSimpleBtn'
      }]
    });

    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    const modulesCSS = readFileSync(resolve(outputDir, 'modules.css'), 'utf-8');

    // Should use custom mappings
    expect(vanillaCSS).toContain('media-simple-btn {');
    expect(modulesCSS).toContain('.MediaSimpleBtn {');

    // Should NOT contain default mappings
    expect(vanillaCSS).not.toContain('simple-button {');
    expect(modulesCSS).not.toContain('.SimpleButton {');
  });

  it('should handle glob patterns for sources', async () => {
    const config = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/*.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: false
    });

    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    expectValidCSS(vanillaCSS);

    // Should include styles from all components matching the glob
    expect(vanillaCSS).toContain('simple-button {');
    expect(vanillaCSS).toContain('complex-play-button {');
  });

  it('should generate only requested formats', async () => {
    // Test vanilla only
    const vanillaOnlyConfig = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: false
    });

    let compiler = new TailwindCSSCompiler(vanillaOnlyConfig);
    await compiler.compile();

    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(true);
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(false);

    // Clean up
    rmSync(outputDir, { recursive: true, force: true });
    mkdirSync(outputDir, { recursive: true });

    // Test modules only
    const modulesOnlyConfig = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')],
      outputDir,
      generateVanilla: false,
      generateModules: true
    });

    compiler = new TailwindCSSCompiler(modulesOnlyConfig);
    await compiler.compile();

    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(false);
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(true);
  });

  it('should handle empty or no className usages gracefully', async () => {
    // Create a component with no className usages
    const config = createTestConfig({
      sources: ['non-existent-file.tsx'], // Non-existent file
      outputDir,
      generateVanilla: true,
      generateModules: true
    });

    const compiler = new TailwindCSSCompiler(config);

    // Should not throw, but might not generate files or generate empty files
    await expect(compiler.compile()).resolves.not.toThrow();

    // Files might exist but be minimal/empty
    if (existsSync(resolve(outputDir, 'vanilla.css'))) {
      const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
      expectValidCSS(vanillaCSS);
    }
  });

  it('should work with custom Tailwind config', async () => {
    // This would test with a custom tailwind.config.js, but for now we'll test
    // that the compiler accepts the tailwindConfig option
    const config = createTestConfig({
      sources: [resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')],
      outputDir,
      generateVanilla: true,
      generateModules: false,
      tailwindConfig: resolve(__dirname, '../../tailwind.config.js') // If it exists
    });

    const compiler = new TailwindCSSCompiler(config);

    // Should not throw with custom config path
    await expect(compiler.compile()).resolves.not.toThrow();
  });
});