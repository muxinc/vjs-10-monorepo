import { describe, expect, it } from 'vitest';

import { cssModulesToVanillaCSS } from '../src/cssProcessing/index.js';

describe('cssModulesToVanillaCSS', () => {
  it('should transform component class selectors to element selectors', () => {
    const css = `
.PlayButton {
  display: flex;
  padding: 8px;
}

.PlayButton:hover {
  background-color: blue;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button');
    expect(result).not.toContain('.PlayButton');
  });

  it('should preserve non-component class selectors (as kebab-case)', () => {
    const css = `
.PlayButton {
  display: flex;
}

.Button {
  padding: 8px;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button');
    expect(result).toContain('.button'); // Converted to kebab-case
    expect(result).not.toContain('.PlayButton');
    expect(result).not.toContain('.Button'); // PascalCase removed
  });

  it('should handle nested selectors correctly', () => {
    const css = `
.PlayButton .Icon {
  width: 24px;
  height: 24px;
}

.Button .PlayIcon {
  display: block;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
      PlayIcon: 'media-play-icon',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button .icon'); // icon converted to kebab-case
    expect(result).toContain('.button media-play-icon'); // button converted to kebab-case
    expect(result).not.toContain('.PlayButton');
    expect(result).not.toContain('.PlayIcon');
  });

  it('should handle complex selectors with multiple components', () => {
    const css = `
.Container .PlayButton,
.Container .MuteButton {
  margin: 4px;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
      MuteButton: 'media-mute-button',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button');
    expect(result).toContain('media-mute-button');
    expect(result).toContain('.container'); // Container converted to kebab-case
  });

  it('should handle pseudo-classes and pseudo-elements', () => {
    const css = `
.PlayButton:hover .Icon::before {
  content: '';
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button:hover');
    expect(result).toContain('.icon::before'); // Icon converted to kebab-case
  });

  it('should handle attribute selectors', () => {
    const css = `
.PlayButton[data-paused] .PauseIcon {
  display: none;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
      PauseIcon: 'media-pause-icon',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('media-play-button[data-paused]');
    expect(result).toContain('media-pause-icon');
  });

  it('should support data attribute mode', () => {
    const css = `
.PlayButton {
  display: flex;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
    };

    const result = cssModulesToVanillaCSS({
      css,
      componentMap,
      options: { useDataAttributes: true },
    });

    expect(result).toContain('[data-media-play-button]');
    expect(result).not.toContain('.PlayButton');
    // Should use data attribute, not element selector
    expect(result).not.toMatch(/^media-play-button/);
  });

  it('should handle compound selectors', () => {
    const css = `
.PlayButton.Button {
  color: blue;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    // PlayButton becomes element selector, Button converted to kebab-case
    expect(result).toContain('media-play-button.button');
  });

  it('should handle descendant combinators correctly', () => {
    const css = `
.Container > .PlayButton {
  margin: 0;
}

.Container .Button > .PlayIcon {
  padding: 4px;
}
`;

    const componentMap = {
      PlayButton: 'media-play-button',
      PlayIcon: 'media-play-icon',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    expect(result).toContain('.container > media-play-button'); // Container → container
    expect(result).toContain('.container .button > media-play-icon'); // Container → container, Button → button
  });

  it('should preserve empty component map', () => {
    const css = `
.PlayButton {
  display: flex;
}
`;

    const componentMap = {};

    const result = cssModulesToVanillaCSS({ css, componentMap });

    // No component transformations, but still convert to kebab-case
    expect(result).toContain('.play-button');
    expect(result).not.toContain('.PlayButton');
  });

  it('should handle real-world CSS with multiple components and styling classes', () => {
    const css = `
.Container {
  display: inline-block;
  position: relative;
}

.Container .Overlay {
  position: absolute;
  top: 0;
}

.Button {
  border: none;
  background: rgb(20 20 30 / 0.7);
  padding: 4px;
}

.PlayButton {
  composes: Button;
}

.PlayButton:not([data-paused]) .PauseIcon,
.PlayButton[data-paused] .PlayIcon {
  display: inline-block;
}

.MuteButton[data-volume-level='high'] .VolumeHighIcon {
  display: inline-block;
}
`;

    const componentMap = {
      Container: 'media-container',
      PlayButton: 'media-play-button',
      PlayIcon: 'media-play-icon',
      PauseIcon: 'media-pause-icon',
      MuteButton: 'media-mute-button',
      VolumeHighIcon: 'media-volume-high-icon',
    };

    const result = cssModulesToVanillaCSS({ css, componentMap });

    // Components should be transformed to element selectors
    expect(result).toContain('media-container');
    expect(result).toContain('media-play-button');
    expect(result).toContain('media-play-icon');
    expect(result).toContain('media-pause-icon');
    expect(result).toContain('media-mute-button');
    expect(result).toContain('media-volume-high-icon');

    // Styling classes converted to kebab-case
    expect(result).toContain('.button');
    expect(result).toContain('.overlay');

    // Should not contain component class selectors
    expect(result).not.toContain('.PlayButton');
    expect(result).not.toContain('.MuteButton');
    expect(result).not.toContain('.Container');
  });
});
