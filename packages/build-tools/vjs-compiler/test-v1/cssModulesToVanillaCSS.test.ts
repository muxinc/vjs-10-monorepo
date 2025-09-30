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

  // Tests for kebab-case inputs (from Tailwind CSS compilation)
  // This validates the fix for icon visibility issue where componentMap needs kebab-case keys
  describe('kebab-case class name support (Tailwind CSS)', () => {
    it('should transform kebab-case component classes to element selectors', () => {
      const css = `
.play-button {
  display: flex;
}

.play-icon {
  width: 24px;
}
`;

      // ComponentMap must include kebab-case keys for Tailwind CSS output
      const componentMap = {
        'play-button': 'media-play-button',
        'play-icon': 'media-play-icon',
      };

      const result = cssModulesToVanillaCSS({ css, componentMap });

      expect(result).toContain('media-play-button');
      expect(result).toContain('media-play-icon');
      expect(result).not.toContain('.play-button');
      expect(result).not.toContain('.play-icon');
    });

    it('should handle kebab-case classes with data-attribute selectors', () => {
      const css = `
.play-button .pause-icon {
  opacity: 100%;
}

.play-button[data-paused] .pause-icon {
  opacity: 0%;
}

.play-button .play-icon {
  opacity: 0%;
}

.play-button[data-paused] .play-icon {
  opacity: 100%;
}
`;

      const componentMap = {
        'play-button': 'media-play-button',
        'play-icon': 'media-play-icon',
        'pause-icon': 'media-pause-icon',
      };

      const result = cssModulesToVanillaCSS({ css, componentMap });

      // Should transform to element selectors
      expect(result).toContain('media-play-button media-pause-icon');
      expect(result).toContain('media-play-button[data-paused] media-pause-icon');
      expect(result).toContain('media-play-button media-play-icon');
      expect(result).toContain('media-play-button[data-paused] media-play-icon');

      // Should not contain class selectors
      expect(result).not.toContain('.play-button');
      expect(result).not.toContain('.play-icon');
      expect(result).not.toContain('.pause-icon');
    });

    it('should handle kebab-case volume button with data-volume-level selectors', () => {
      const css = `
.volume-button svg {
  display: none;
}

.volume-button[data-volume-level="high"] .volume-high-icon {
  display: inline;
}

.volume-button[data-volume-level="medium"] .volume-low-icon {
  display: inline;
}

.volume-button[data-volume-level="low"] .volume-low-icon {
  display: inline;
}

.volume-button[data-volume-level="off"] .volume-off-icon {
  display: inline;
}
`;

      const componentMap = {
        'volume-button': 'media-mute-button',
        'volume-high-icon': 'media-volume-high-icon',
        'volume-low-icon': 'media-volume-low-icon',
        'volume-off-icon': 'media-volume-off-icon',
      };

      const result = cssModulesToVanillaCSS({ css, componentMap });

      // Should transform to element selectors with data attributes
      expect(result).toContain('media-mute-button[data-volume-level="high"] media-volume-high-icon');
      expect(result).toContain('media-mute-button[data-volume-level="medium"] media-volume-low-icon');
      expect(result).toContain('media-mute-button[data-volume-level="low"] media-volume-low-icon');
      expect(result).toContain('media-mute-button[data-volume-level="off"] media-volume-off-icon');

      // Should not contain class selectors
      expect(result).not.toContain('.volume-button');
      expect(result).not.toContain('.volume-high-icon');
      expect(result).not.toContain('.volume-low-icon');
      expect(result).not.toContain('.volume-off-icon');
    });

    it('should handle mixed PascalCase and kebab-case in same componentMap', () => {
      const css = `
.PlayButton .play-icon {
  display: flex;
}

.play-button .PlayIcon {
  display: block;
}
`;

      // ComponentMap with both forms (as created by compileSkin.ts fix)
      const componentMap = {
        PlayButton: 'media-play-button',
        'play-button': 'media-play-button',
        PlayIcon: 'media-play-icon',
        'play-icon': 'media-play-icon',
      };

      const result = cssModulesToVanillaCSS({ css, componentMap });

      // Both should transform correctly
      expect(result).toContain('media-play-button media-play-icon');
      expect(result).not.toContain('.PlayButton');
      expect(result).not.toContain('.play-button');
      expect(result).not.toContain('.PlayIcon');
      expect(result).not.toContain('.play-icon');
    });

    it('should handle fullscreen button with kebab-case', () => {
      const css = `
.full-screen-button .fullscreen-enter-icon {
  opacity: 100%;
}

.full-screen-button[data-fullscreen] .fullscreen-enter-icon {
  opacity: 0%;
}

.full-screen-button .fullscreen-exit-icon {
  opacity: 0%;
}

.full-screen-button[data-fullscreen] .fullscreen-exit-icon {
  opacity: 100%;
}
`;

      const componentMap = {
        'full-screen-button': 'media-fullscreen-button',
        'fullscreen-enter-icon': 'media-fullscreen-enter-icon',
        'fullscreen-exit-icon': 'media-fullscreen-exit-icon',
      };

      const result = cssModulesToVanillaCSS({ css, componentMap });

      // Should transform to element selectors
      expect(result).toContain('media-fullscreen-button media-fullscreen-enter-icon');
      expect(result).toContain('media-fullscreen-button[data-fullscreen] media-fullscreen-enter-icon');
      expect(result).toContain('media-fullscreen-button media-fullscreen-exit-icon');
      expect(result).toContain('media-fullscreen-button[data-fullscreen] media-fullscreen-exit-icon');
    });
  });
});
