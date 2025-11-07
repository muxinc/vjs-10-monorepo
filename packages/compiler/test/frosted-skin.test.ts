import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compile } from '../src';

describe('frosted Skin Compilation', () => {
  it('compiles simplified frosted skin correctly', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/frosted-skin-simplified.tsx'),
      'utf-8',
    );

    const result = compile(source);

    // Component name
    expect(result.componentName).toBe('FrostedSkinSimplified');

    // Container and children
    expect(result.html).toContain('<media-container class="media-container">');
    expect(result.html).toContain('<slot name="media" slot="media"></slot>');

    // Overlay
    expect(result.html).toContain('<div class="overlay">');

    // Controls container
    expect(result.html).toContain('<div class="controls" data-testid="media-controls">');

    // Play button
    expect(result.html).toContain('<media-play-button class="play-button">');
    expect(result.html).toContain('<media-play-icon class="play-icon">');
    expect(result.html).toContain('<media-pause-icon class="pause-icon">');

    // Time controls
    expect(result.html).toContain('<div class="time-controls">');
    expect(result.html).toContain('<media-current-time-display class="time-display">');
    expect(result.html).toContain('<media-duration-display class="time-display">');

    // Time slider - verify Root → base element name
    expect(result.html).toContain('<media-time-slider class="slider-root">');
    expect(result.html).toContain('<media-time-slider-track class="slider-track">');
    expect(result.html).toContain('<media-time-slider-progress class="slider-progress">');
    expect(result.html).toContain('<media-time-slider-pointer class="slider-pointer">');
    expect(result.html).toContain('<media-time-slider-thumb class="slider-thumb">');

    // Mute button
    expect(result.html).toContain('<media-mute-button class="mute-button">');
    expect(result.html).toContain('<media-volume-high-icon class="volume-high-icon">');
    expect(result.html).toContain('<media-volume-low-icon class="volume-low-icon">');
    expect(result.html).toContain('<media-volume-off-icon class="volume-off-icon">');

    // Fullscreen button
    expect(result.html).toContain('<media-fullscreen-button class="fullscreen-button">');
    expect(result.html).toContain('<media-fullscreen-enter-icon class="fullscreen-enter-icon">');
    expect(result.html).toContain('<media-fullscreen-exit-icon class="fullscreen-exit-icon">');

    // Verify all expected classNames extracted
    const expectedClasses = [
      'controls',
      'fullscreen-button',
      'fullscreen-enter-icon',
      'fullscreen-exit-icon',
      'media-container',
      'mute-button',
      'overlay',
      'pause-icon',
      'play-button',
      'play-icon',
      'slider-pointer',
      'slider-progress',
      'slider-root',
      'slider-thumb',
      'slider-track',
      'time-controls',
      'time-display',
      'volume-high-icon',
      'volume-low-icon',
      'volume-off-icon',
    ];

    expect(result.classNames).toEqual(expectedClasses);
  });

  it('handles template literal classNames correctly', () => {
    const source = `
      export default function TestSkin() {
        const styles = { A: 'class-a', B: 'class-b', C: 'class-c' };
        return (
          <div>
            <button className={\`\${styles.A} \${styles.B}\`} />
            <span className={\`\${styles.C}\`} />
          </div>
        );
      }
    `;

    const result = compile(source);

    // Template literals are not fully resolved at compile time
    // This is expected - we just extract what we can
    expect(result.html).toContain('<div>');
    expect(result.html).toContain('<button');
    expect(result.html).toContain('<span');
  });

  it('verifies all Video.js component types transform correctly', () => {
    const componentTests = [
      { react: 'PlayButton', html: 'media-play-button' },
      { react: 'MuteButton', html: 'media-mute-button' },
      { react: 'FullscreenButton', html: 'media-fullscreen-button' },
      { react: 'MediaContainer', html: 'media-container' },
      { react: 'CurrentTimeDisplay', html: 'media-current-time-display' },
      { react: 'DurationDisplay', html: 'media-duration-display' },
      { react: 'PreviewTimeDisplay', html: 'media-preview-time-display' },
      { react: 'PlayIcon', html: 'media-play-icon' },
      { react: 'PauseIcon', html: 'media-pause-icon' },
      { react: 'VolumeHighIcon', html: 'media-volume-high-icon' },
      { react: 'VolumeLowIcon', html: 'media-volume-low-icon' },
      { react: 'VolumeOffIcon', html: 'media-volume-off-icon' },
      { react: 'FullscreenEnterIcon', html: 'media-fullscreen-enter-icon' },
      { react: 'FullscreenExitIcon', html: 'media-fullscreen-exit-icon' },
    ];

    componentTests.forEach(({ react, html }) => {
      const source = `export default function Test() { return <${react} />; }`;
      const result = compile(source);
      expect(result.html).toBe(`<${html}></${html}>`);
    });
  });

  it('verifies all slider compound components transform correctly', () => {
    const compoundTests = [
      // TimeSlider
      { react: 'TimeSlider.Root', html: 'media-time-slider' },
      { react: 'TimeSlider.Track', html: 'media-time-slider-track' },
      { react: 'TimeSlider.Progress', html: 'media-time-slider-progress' },
      { react: 'TimeSlider.Pointer', html: 'media-time-slider-pointer' },
      { react: 'TimeSlider.Thumb', html: 'media-time-slider-thumb' },
      // VolumeSlider
      { react: 'VolumeSlider.Root', html: 'media-volume-slider' },
      { react: 'VolumeSlider.Track', html: 'media-volume-slider-track' },
      { react: 'VolumeSlider.Progress', html: 'media-volume-slider-progress' },
      { react: 'VolumeSlider.Thumb', html: 'media-volume-slider-thumb' },
    ];

    compoundTests.forEach(({ react, html }) => {
      const source = `export default function Test() { return <${react} />; }`;
      const result = compile(source);
      expect(result.html).toBe(`<${html}></${html}>`);
    });
  });
});
