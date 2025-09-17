import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import postcss from 'postcss';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { multiFormatOutput } from '../../src/multi-format-output.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_OUTPUT_DIR = resolve(__dirname, '../temp');

describe('multiFormatOutput', () => {
  const outputDir = resolve(TEST_OUTPUT_DIR, 'multi-format-test');

  beforeEach(() => {
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should generate vanilla CSS output', async () => {
    const inputCSS = `
media-play-button {
  background-color: rgb(59 130 246);
  color: rgb(255 255 255);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

media-play-button:hover {
  background-color: rgb(29 78 216);
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: true,
        generateModules: false
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    const vanillaPath = resolve(outputDir, 'vanilla.css');
    expect(existsSync(vanillaPath)).toBe(true);

    const vanillaCSS = readFileSync(vanillaPath, 'utf-8');

    expect(vanillaCSS).toContain('/* Generated Vanilla CSS');
    expect(vanillaCSS).toContain('media-play-button {');
    expect(vanillaCSS).toContain('background-color: rgb(59 130 246)');
    expect(vanillaCSS).toContain('media-play-button:hover {');
  });

  it('should generate CSS modules output', async () => {
    const inputCSS = `
.PlayButton {
  background-color: rgb(59 130 246);
  color: rgb(255 255 255);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.PlayButton:hover {
  background-color: rgb(29 78 216);
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: false,
        generateModules: true
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    const modulesPath = resolve(outputDir, 'modules.css');
    expect(existsSync(modulesPath)).toBe(true);

    const modulesCSS = readFileSync(modulesPath, 'utf-8');

    expect(modulesCSS).toContain('/* Generated CSS Modules');
    expect(modulesCSS).toContain('.PlayButton {');
    expect(modulesCSS).toContain('background-color: rgb(59 130 246)');
    expect(modulesCSS).toContain('.PlayButton:hover {');
  });

  it('should transform vanilla selectors correctly', async () => {
    const inputCSS = `
play-button {
  color: red;
}

pause-button .icon {
  width: 1rem;
}

media-container > .overlay {
  position: absolute;
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: true,
        generateModules: false
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');

    expect(vanillaCSS).toContain('media-play-button {');
    expect(vanillaCSS).toContain('media-pause-button .icon {');
    expect(vanillaCSS).toContain('media-container > .overlay {');
  });

  it('should transform CSS modules selectors correctly', async () => {
    const inputCSS = `
.PlayButton {
  color: red;
}

.PauseButton .Icon {
  width: 1rem;
}

.Container .Overlay {
  position: absolute;
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: false,
        generateModules: true
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    const modulesCSS = readFileSync(resolve(outputDir, 'modules.css'), 'utf-8');

    expect(modulesCSS).toContain('.PlayButton {');
    expect(modulesCSS).toContain('.PauseButton .Icon {');
    expect(modulesCSS).toContain('.Container .Overlay {');
  });

  it('should generate both formats when requested', async () => {
    const inputCSS = `
.TestComponent {
  background: blue;
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: true,
        generateModules: true,
        vanillaFilename: 'custom-vanilla.css',
        modulesFilename: 'custom-modules.css'
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    expect(existsSync(resolve(outputDir, 'custom-vanilla.css'))).toBe(true);
    expect(existsSync(resolve(outputDir, 'custom-modules.css'))).toBe(true);

    const vanillaCSS = readFileSync(resolve(outputDir, 'custom-vanilla.css'), 'utf-8');
    const modulesCSS = readFileSync(resolve(outputDir, 'custom-modules.css'), 'utf-8');

    expect(vanillaCSS).toContain('media-test-component {');
    expect(modulesCSS).toContain('.TestComponent {');
  });

  it('should handle complex nested selectors', async () => {
    const inputCSS = `
media-player .controls .play-button {
  background: green;
}

media-player[data-fullscreen="true"] .controls {
  bottom: 0;
}

.MediaPlayer .Controls:hover .PlayButton {
  opacity: 1;
}
`;

    const processor = postcss([
      multiFormatOutput({
        outputDir,
        generateVanilla: true,
        generateModules: true
      })
    ]);

    await processor.process(inputCSS, { from: undefined });

    const vanillaCSS = readFileSync(resolve(outputDir, 'vanilla.css'), 'utf-8');
    const modulesCSS = readFileSync(resolve(outputDir, 'modules.css'), 'utf-8');

    // Vanilla should preserve structure but add media- prefix where needed
    expect(vanillaCSS).toContain('media-player .controls .play-button {');
    expect(vanillaCSS).toContain('media-player[data-fullscreen="true"] .controls {');

    // Modules should preserve class structure
    expect(modulesCSS).toContain('.MediaPlayer .Controls:hover .PlayButton {');
  });

  it('should create output directory if it does not exist', async () => {
    const nonExistentDir = resolve(TEST_OUTPUT_DIR, 'non-existent', 'deep', 'path');

    const processor = postcss([
      multiFormatOutput({
        outputDir: nonExistentDir,
        generateVanilla: true,
        generateModules: false
      })
    ]);

    await processor.process('.test { color: red; }', { from: undefined });

    expect(existsSync(resolve(nonExistentDir, 'vanilla.css'))).toBe(true);

    // Cleanup
    rmSync(resolve(TEST_OUTPUT_DIR, 'non-existent'), { recursive: true, force: true });
  });
});