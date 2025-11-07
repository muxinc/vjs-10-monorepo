import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileFormatted } from '../src';

describe('example: Minimal Skin', () => {
  it('compiles example-minimal.tsx successfully', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/example-minimal.tsx'),
      'utf-8',
    );

    const output = compileFormatted(source);

    // Check HTML contains expected elements
    expect(output).toContain('<media-container class="container">');
    expect(output).toContain('<slot name="media" slot="media"></slot>');
    expect(output).toContain('<media-play-button class="play-button">');
    expect(output).toContain('<media-time-slider class="slider-root">');
    expect(output).toContain('<media-time-slider-track class="slider-track">');
    expect(output).toContain('<media-time-slider-progress class="slider-progress">');

    // Check CSS generation
    expect(output).toContain('.container {');
    expect(output).toContain('.controls {');
    expect(output).toContain('.play-button {');
    expect(output).toContain('.slider-root {');
    expect(output).toContain('.slider-track {');
    expect(output).toContain('.slider-progress {');

    // Check classNames list
    expect(output).toContain('container, controls, play-button, slider-progress, slider-root, slider-track');

    // eslint-disable-next-line no-console
    console.log(`\n${output}\n`);
  });
});
