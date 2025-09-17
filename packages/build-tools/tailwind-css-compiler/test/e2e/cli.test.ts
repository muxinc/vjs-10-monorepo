import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { mkdirSync, rmSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { expectValidCSS } from '../utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_OUTPUT_DIR = resolve(__dirname, '../temp');
const FIXTURES_DIR = resolve(__dirname, '../fixtures');
const CLI_PATH = resolve(__dirname, '../../src/cli.ts');

/**
 * Run CLI command and return result
 */
function runCLI(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn('tsx', [CLI_PATH, ...args], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      reject(error);
    });

    // Kill after 10 seconds to prevent hanging
    setTimeout(() => {
      child.kill();
      reject(new Error('CLI command timed out'));
    }, 10000);
  });
}

describe('CLI Integration', () => {
  let outputDir: string;

  beforeEach(() => {
    outputDir = resolve(TEST_OUTPUT_DIR, 'cli-output');
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should display help when no arguments provided', async () => {
    const result = await runCLI([]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('tailwind-css-compiler');
  });

  it('should display help with --help flag', async () => {
    const result = await runCLI(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('--output');
    expect(result.stdout).toContain('--sources');
  });

  it('should compile with command line arguments', async () => {
    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
      '--output', outputDir
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Starting Tailwind CSS compilation');
    expect(result.stdout).toContain('Compilation complete');

    // Check that files were generated
    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(true);
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(true);

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    expectValidCSS(vanillaCSS);
    expect(vanillaCSS).toContain('simple-button {');
  });

  it('should work with multiple source files', async () => {
    const result = await runCLI([
      '--sources', `${resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')},${resolve(FIXTURES_DIR, 'components/ComplexPlayButton.tsx')}`,
      '--output', outputDir
    ]);

    expect(result.exitCode).toBe(0);

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    expect(vanillaCSS).toContain('simple-button {');
    expect(vanillaCSS).toContain('complex-play-button {');
  });

  it('should respect --no-vanilla flag', async () => {
    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
      '--output', outputDir,
      '--no-vanilla'
    ]);

    expect(result.exitCode).toBe(0);

    // Should not generate vanilla CSS
    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(false);
    // Should still generate modules
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(true);
  });

  it('should respect --no-modules flag', async () => {
    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
      '--output', outputDir,
      '--no-modules'
    ]);

    expect(result.exitCode).toBe(0);

    // Should generate vanilla CSS
    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(true);
    // Should not generate modules
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(false);
  });

  it('should work with config file', async () => {
    // Create a config file
    const configPath = resolve(outputDir, 'test-config.js');
    const configContent = `
module.exports = {
  sources: ['${resolve(FIXTURES_DIR, 'components/SimpleButton.tsx')}'],
  outputDir: '${outputDir}',
  generateVanilla: true,
  generateModules: true
};
`;
    writeFileSync(configPath, configContent);

    const result = await runCLI(['--config', configPath]);

    expect(result.exitCode).toBe(0);

    expect(existsSync(resolve(outputDir, 'vanilla.css'))).toBe(true);
    expect(existsSync(resolve(outputDir, 'modules.css'))).toBe(true);
  });

  it('should handle custom Tailwind config', async () => {
    // This test assumes there's a tailwind.config.js in the project
    const tailwindConfigPath = resolve(__dirname, '../../tailwind.config.js');

    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
      '--output', outputDir,
      '--tailwind-config', tailwindConfigPath
    ]);

    // Should not fail even if config doesn't exist
    expect(result.exitCode).toBe(0);
  });

  it('should handle non-existent source files gracefully', async () => {
    const result = await runCLI([
      '--sources', 'non-existent-file.tsx',
      '--output', outputDir
    ]);

    // Should complete but might warn about no usages found
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('No className usages found');
  });

  it('should handle invalid arguments gracefully', async () => {
    const result = await runCLI([
      '--invalid-flag'
    ]);

    // Should show help or handle gracefully
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
  });

  it('should create output directory if it does not exist', async () => {
    const deepOutputDir = resolve(outputDir, 'deep', 'nested', 'path');

    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/SimpleButton.tsx'),
      '--output', deepOutputDir
    ]);

    expect(result.exitCode).toBe(0);
    expect(existsSync(deepOutputDir)).toBe(true);
    expect(existsSync(resolve(deepOutputDir, 'vanilla.css'))).toBe(true);
  });

  it('should handle glob patterns in sources', async () => {
    const result = await runCLI([
      '--sources', resolve(FIXTURES_DIR, 'components/*.tsx'),
      '--output', outputDir
    ]);

    expect(result.exitCode).toBe(0);

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');

    // Should include both components
    expect(vanillaCSS).toContain('simple-button {');
    expect(vanillaCSS).toContain('complex-play-button {');
  });
});