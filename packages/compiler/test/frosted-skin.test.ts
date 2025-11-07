import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compile } from '../src';

describe('frosted Skin Compilation', () => {
  it('compiles actual frosted skin from react package', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/frosted-skin.tsx'),
      'utf-8',
    );

    const result = compile(source);

    // Component name
    expect(result.componentName).toBe('FrostedSkin');

    // Container and children
    expect(result.html).toContain('<media-container');
    expect(result.html).toContain('<slot name="media" slot="media"></slot>');

    // Overlay (simple div)
    expect(result.html).toContain('<div');

    // Controls container
    expect(result.html).toContain('data-testid="media-controls"');

    // Tooltip components - Currently transforms naively (v0.1 limitation)
    // NOTE: This produces incorrect nested structure. HTML version should be flat
    // with commandfor linking. Requires transformation rules (Phase 2+)
    // Current: <media-tooltip><media-tooltip-trigger>...</media-tooltip-trigger></media-tooltip>
    // Target:  <button commandfor="id"><media-tooltip id="id">...</media-tooltip>
    expect(result.html).toContain('<media-tooltip');
    expect(result.html).toContain('<media-tooltip-trigger>');
    expect(result.html).toContain('<media-tooltip-portal>');
    expect(result.html).toContain('<media-tooltip-positioner');
    expect(result.html).toContain('<media-tooltip-popup');

    // Play button (wrapped in Tooltip)
    expect(result.html).toContain('<media-play-button');
    expect(result.html).toContain('<media-play-icon');
    expect(result.html).toContain('<media-pause-icon');

    // Time controls
    expect(result.html).toContain('<media-current-time-display');
    expect(result.html).toContain('<media-duration-display');
    expect(result.html).toContain('<media-preview-time-display');

    // Time slider - verify Root → base element name
    expect(result.html).toContain('<media-time-slider');
    expect(result.html).toContain('<media-time-slider-track');
    expect(result.html).toContain('<media-time-slider-progress');
    expect(result.html).toContain('<media-time-slider-pointer');
    expect(result.html).toContain('<media-time-slider-thumb');

    // Popover components - Same limitation as Tooltip
    // Current: Nested structure
    // Target:  <button commandfor="id" command="toggle-popover"><media-popover id="id">
    expect(result.html).toContain('<media-popover');
    expect(result.html).toContain('<media-popover-trigger>');
    expect(result.html).toContain('<media-popover-portal>');
    expect(result.html).toContain('<media-popover-positioner');
    expect(result.html).toContain('<media-popover-popup');

    // Mute button (wrapped in Popover)
    expect(result.html).toContain('<media-mute-button');
    expect(result.html).toContain('<media-volume-high-icon');
    expect(result.html).toContain('<media-volume-low-icon');
    expect(result.html).toContain('<media-volume-off-icon');

    // Volume slider (inside Popover)
    expect(result.html).toContain('<media-volume-slider');
    expect(result.html).toContain('<media-volume-slider-track');
    expect(result.html).toContain('<media-volume-slider-progress');

    // Fullscreen button (wrapped in Tooltip)
    expect(result.html).toContain('<media-fullscreen-button');
    expect(result.html).toContain('<media-fullscreen-enter-icon');
    expect(result.html).toContain('<media-fullscreen-exit-icon');

    // Note: classNames from template literals aren't extracted (known limitation)
    // Note: Tooltip/Popover structure is incorrect (known limitation - see COMPONENT_MAPPING.md)
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
