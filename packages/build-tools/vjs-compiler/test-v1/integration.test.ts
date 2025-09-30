import { describe, expect, it } from 'vitest';

import { compileJSXToHTML, compileSkinToHTML } from '../src/index.js';
import { loadFixture } from './utils/fixtures.js';
import { validateSkinModule } from './utils/outputValidation.js';
import { validateHTML } from './utils/validator.js';

describe('compileJSXToHTML - Integration Tests with Fixtures', () => {
  it('compiles simple component with built-in elements', async () => {
    const fixture = loadFixture('simple-component');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    // Validate HTML
    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('compiles compound components (member expressions)', async () => {
    const fixture = loadFixture('compound-components');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('replaces {children} with slot element', async () => {
    const fixture = loadFixture('with-children');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('handles attribute transformations and JSX expressions', async () => {
    const fixture = loadFixture('with-attributes');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('handles mixed built-in and custom elements', async () => {
    const fixture = loadFixture('mixed-elements');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('compiles real-world skin example', async () => {
    const fixture = loadFixture('real-world-skin');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });
});

describe('compileJSXToHTML - Additional Tests', () => {
  it('removes JSX comments', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          {/* This is a comment */}
          <PlayButton>
            {/* Another comment */}
            <PlayIcon />
          </PlayButton>
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).not.toContain('This is a comment');
    expect(html).not.toContain('Another comment');
    expect(html).not.toContain('{/*');
    expect(html).not.toContain('*/}');
  });

  it('returns null for non-component code', () => {
    const source = `
      const foo = 'bar';
      export default foo;
    `;

    const html = compileJSXToHTML(source);
    expect(html).toBeNull();
  });

  it('handles indentation options', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <button>Click</button>
        </div>
      );
    `;

    const html = compileJSXToHTML(source, { indent: 4, indentSize: 2 });
    expect(html).not.toBeNull();
    expect(html?.startsWith('    <div>')).toBe(true); // 4 spaces initial indent
  });

  it('converts self-closing tags to explicit closing', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <PlayIcon />
          <PauseIcon />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-play-icon></media-play-icon>');
    expect(html).toContain('<media-pause-icon></media-pause-icon>');
    expect(html).not.toContain('/>');
  });

  it('preserves boolean attributes', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <button disabled>Click</button>
          <input checked readOnly />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('disabled');
    expect(html).toContain('checked');
    expect(html).toContain('read-only');
  });

  it('handles nested custom components', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <MediaContainer>
          <div className="overlay">
            <div className="controls">
              <PlayButton>
                <PlayIcon />
              </PlayButton>
            </div>
          </div>
        </MediaContainer>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-container>');
    expect(html).toContain('<div class="overlay">');
    expect(html).toContain('<div class="controls">');
    expect(html).toContain('<media-play-button>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
  });

  it('handles empty elements correctly', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <span></span>
          <PlayIcon />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<span></span>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
  });
});

describe('compileSkinToHTML - Skin Module Output Validation', () => {
  it('generates valid TypeScript modules from fixtures', async () => {
    const fixtures = ['simple-component', 'compound-components', 'with-children', 'mixed-elements', 'real-world-skin'];

    for (const fixtureName of fixtures) {
      const fixture = loadFixture(fixtureName);
      const module = compileSkinToHTML(fixture.input);

      expect(module, `${fixtureName} should generate a module`).not.toBeNull();

      // Validate that generated TypeScript passes ESLint and Prettier
      const validation = await validateSkinModule(module!);

      expect(validation.eslint.valid, `${fixtureName}: ESLint should pass`).toBe(true);
      expect(validation.eslint.errors, `${fixtureName}: no ESLint errors`).toHaveLength(0);
      expect(validation.prettier.valid, `${fixtureName}: Prettier should pass`).toBe(true);
    }
  });

  it('generates properly formatted skin module structure', async () => {
    const fixture = loadFixture('simple-component');
    const module = compileSkinToHTML(fixture.input);

    expect(module).not.toBeNull();

    // Verify module contains expected structure
    expect(module).toContain('export function getTemplateHTML()');
    expect(module).toContain('export class');
    expect(module).toContain('extends MediaSkin');
    expect(module).toContain('customElements.define');

    // Validate it's well-formed
    const validation = await validateSkinModule(module!);
    expect(validation.eslint.valid).toBe(true);
    expect(validation.prettier.valid).toBe(true);
  });
});

describe('compileSkinToHTML - ComponentMap Generation', () => {
  it('creates componentMap with both PascalCase and kebab-case keys', async () => {
    const source = `
import { PlayButton, PlayIcon, PauseIcon } from '../components';
import styles from './styles';

export default function MediaSkinSimple() {
  return (
    <div className={styles.Container}>
      <PlayButton className={styles.PlayButton}>
        <PlayIcon />
        <PauseIcon />
      </PlayButton>
    </div>
  );
}
`;

    const result = await compileSkinToHTML(source);

    expect(result).not.toBeNull();
    expect(result?.componentMap).toBeDefined();

    // Should have PascalCase keys (for React CSS Modules)
    expect(result?.componentMap.PlayButton).toBe('media-play-button');
    expect(result?.componentMap.PlayIcon).toBe('media-play-icon');
    expect(result?.componentMap.PauseIcon).toBe('media-pause-icon');

    // Should have kebab-case keys (for Tailwind CSS)
    expect(result?.componentMap['play-button']).toBe('media-play-button');
    expect(result?.componentMap['play-icon']).toBe('media-play-icon');
    expect(result?.componentMap['pause-icon']).toBe('media-pause-icon');
  });

  it('handles volume button and icons with both case formats', async () => {
    const source = `
import { MuteButton, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '../components';
import styles from './styles';

export default function MediaSkinVolume() {
  return (
    <MuteButton className={styles.VolumeButton}>
      <VolumeHighIcon />
      <VolumeLowIcon />
      <VolumeOffIcon />
    </MuteButton>
  );
}
`;

    const result = await compileSkinToHTML(source);

    expect(result).not.toBeNull();

    // PascalCase keys
    expect(result?.componentMap.MuteButton).toBe('media-mute-button');
    expect(result?.componentMap.VolumeHighIcon).toBe('media-volume-high-icon');
    expect(result?.componentMap.VolumeLowIcon).toBe('media-volume-low-icon');
    expect(result?.componentMap.VolumeOffIcon).toBe('media-volume-off-icon');

    // kebab-case keys
    expect(result?.componentMap['mute-button']).toBe('media-mute-button');
    expect(result?.componentMap['volume-high-icon']).toBe('media-volume-high-icon');
    expect(result?.componentMap['volume-low-icon']).toBe('media-volume-low-icon');
    expect(result?.componentMap['volume-off-icon']).toBe('media-volume-off-icon');
  });

  it('handles fullscreen button with both case formats', async () => {
    const source = `
import { FullscreenButton, FullscreenEnterIcon, FullscreenExitIcon } from '../components';
import styles from './styles';

export default function MediaSkinFullscreen() {
  return (
    <FullscreenButton className={styles.FullScreenButton}>
      <FullscreenEnterIcon />
      <FullscreenExitIcon />
    </FullscreenButton>
  );
}
`;

    const result = await compileSkinToHTML(source);

    expect(result).not.toBeNull();

    // PascalCase keys
    expect(result?.componentMap.FullscreenButton).toBe('media-fullscreen-button');
    expect(result?.componentMap.FullscreenEnterIcon).toBe('media-fullscreen-enter-icon');
    expect(result?.componentMap.FullscreenExitIcon).toBe('media-fullscreen-exit-icon');

    // kebab-case keys
    expect(result?.componentMap['fullscreen-button']).toBe('media-fullscreen-button');
    expect(result?.componentMap['fullscreen-enter-icon']).toBe('media-fullscreen-enter-icon');
    expect(result?.componentMap['fullscreen-exit-icon']).toBe('media-fullscreen-exit-icon');
  });

  it('handles compound components with both case formats', async () => {
    const source = `
import { TimeRange, VolumeRange } from '../components';
import styles from './styles';

export default function MediaSkinRanges() {
  return (
    <div>
      <TimeRange.Root>
        <TimeRange.Track>
          <TimeRange.Progress />
        </TimeRange.Track>
        <TimeRange.Thumb />
      </TimeRange.Root>
      <VolumeRange.Root>
        <VolumeRange.Track>
          <VolumeRange.Progress />
        </VolumeRange.Track>
        <VolumeRange.Thumb />
      </VolumeRange.Root>
    </div>
  );
}
`;

    const result = await compileSkinToHTML(source);

    expect(result).not.toBeNull();

    // Compound components should be in componentMap as combined names
    // PascalCase forms
    expect(result?.componentMap.TimeRangeRoot).toBe('media-time-range-root');
    expect(result?.componentMap.TimeRangeTrack).toBe('media-time-range-track');
    expect(result?.componentMap.TimeRangeProgress).toBe('media-time-range-progress');
    expect(result?.componentMap.TimeRangeThumb).toBe('media-time-range-thumb');

    expect(result?.componentMap.VolumeRangeRoot).toBe('media-volume-range-root');
    expect(result?.componentMap.VolumeRangeTrack).toBe('media-volume-range-track');
    expect(result?.componentMap.VolumeRangeProgress).toBe('media-volume-range-progress');
    expect(result?.componentMap.VolumeRangeThumb).toBe('media-volume-range-thumb');

    // kebab-case forms
    expect(result?.componentMap['time-range-root']).toBe('media-time-range-root');
    expect(result?.componentMap['time-range-track']).toBe('media-time-range-track');
    expect(result?.componentMap['time-range-progress']).toBe('media-time-range-progress');
    expect(result?.componentMap['time-range-thumb']).toBe('media-time-range-thumb');

    expect(result?.componentMap['volume-range-root']).toBe('media-volume-range-root');
    expect(result?.componentMap['volume-range-track']).toBe('media-volume-range-track');
    expect(result?.componentMap['volume-range-progress']).toBe('media-volume-range-progress');
    expect(result?.componentMap['volume-range-thumb']).toBe('media-volume-range-thumb');
  });
});
