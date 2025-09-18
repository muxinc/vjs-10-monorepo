import { Plugin, Root, Rule } from 'postcss';
import postcss from 'postcss';

export interface SemanticTransformOptions {
  /** Component-specific selector mappings */
  componentMappings?: Record<string, string>;
  /** Element-specific transformations */
  elementMappings?: Record<string, string>;
  /** Whether this is for CSS modules */
  isModule?: boolean;
}

/**
 * PostCSS plugin that transforms compiled CSS with semantic enhancements
 * Runs after Tailwind has processed @apply directives
 */
export const semanticTransform = (options: SemanticTransformOptions = {}): Plugin => {
  const plugin = {
    postcssPlugin: 'semantic-transform',
    Rule(rule: Rule) {
      const { componentMappings = {}, elementMappings = {}, isModule = false } = options;

      const originalSelector = rule.selector;

      // Transform component-specific selectors
      rule.selector = plugin.transformComponentSelectors(rule.selector, componentMappings);

      // Transform element selectors
      rule.selector = plugin.transformElementSelectors(rule.selector, elementMappings);

      // Add media- prefix for vanilla CSS if not present
      if (!isModule) {
        rule.selector = plugin.addMediaPrefix(rule.selector);
      }

      // Handle nested icon states for better specificity
      rule.selector = plugin.enhanceIconStates(rule.selector, isModule);

    },

    OnceExit(root: Root) {
      // Add any additional enhancements after all rules are processed
      plugin.addUtilityClasses(root, options);
    },

    /**
     * Transform component-specific selectors
     */
    transformComponentSelectors(selector: string, mappings: Record<string, string>): string {
      let transformed = selector;

      for (const [from, to] of Object.entries(mappings)) {
        const regex = new RegExp(`\\b${from}\\b`, 'g');
        transformed = transformed.replace(regex, to);
      }

      return transformed;
    },

    /**
     * Transform element selectors
     */
    transformElementSelectors(selector: string, mappings: Record<string, string>): string {
      let transformed = selector;

      for (const [from, to] of Object.entries(mappings)) {
        transformed = transformed.replace(from, to);
      }

      return transformed;
    },

    /**
     * Add media- prefix for vanilla CSS selectors that don't have it
     */
    addMediaPrefix(selector: string): string {
      // Skip if already has media- prefix or is a utility class
      if (selector.includes('media-') || selector.startsWith('.') || selector.includes('#')) {
        return selector;
      }

      // Handle complex selectors
      const parts = selector.split(',').map(part => {
        const trimmed = part.trim();

        // Skip pseudo-classes and attribute selectors
        if (trimmed.includes(':') || trimmed.includes('[')) {
          return part;
        }

        // Add media- prefix to component selectors
        const componentRegex = /^([a-z-]+)(\s|$)/;
        if (componentRegex.test(trimmed) && !trimmed.startsWith('media-')) {
          return part.replace(componentRegex, 'media-$1$2');
        }

        return part;
      });

      return parts.join(',');
    },

    /**
     * Enhance icon state selectors for better specificity
     */
    enhanceIconStates(selector: string, isModule: boolean): string {
      // Handle play/pause button states
      if (selector.includes('play') && selector.includes('icon')) {
        if (selector.includes('[data-paused]')) {
          if (isModule) {
            return selector.replace('.PlayIcon', '.PlayButton[data-paused] .PlayIcon');
          } else {
            return selector.replace('.icon', 'media-play-button[data-paused] .play-icon');
          }
        }

        if (selector.includes(':not([data-paused])')) {
          if (isModule) {
            return selector.replace('.PauseIcon', '.PlayButton:not([data-paused]) .PauseIcon');
          } else {
            return selector.replace('.icon', 'media-play-button:not([data-paused]) .pause-icon');
          }
        }
      }

      // Handle mute button volume states
      if (selector.includes('volume') && selector.includes('icon')) {
        const volumeStates = ['high', 'low', 'medium', 'off'];
        for (const state of volumeStates) {
          if (selector.includes(`[data-volume-level="${state}"]`)) {
            if (isModule) {
              return selector.replace(
                '.VolumeIcon',
                `.MuteButton[data-volume-level="${state}"] .Volume${this.capitalize(state)}Icon`
              );
            } else {
              return selector.replace(
                '.icon',
                `media-mute-button[data-volume-level="${state}"] .volume-${state}-icon`
              );
            }
          }
        }
      }

      // Handle fullscreen button states
      if (selector.includes('fullscreen') && selector.includes('icon')) {
        if (selector.includes('[data-fullscreen]')) {
          if (isModule) {
            return selector.replace('.FullscreenExitIcon', '.FullscreenButton[data-fullscreen] .FullscreenExitIcon');
          } else {
            return selector.replace('.icon', 'media-fullscreen-button[data-fullscreen] .fullscreen-exit-icon');
          }
        }

        if (selector.includes(':not([data-fullscreen])')) {
          if (isModule) {
            return selector.replace('.FullscreenEnterIcon', '.FullscreenButton:not([data-fullscreen]) .FullscreenEnterIcon');
          } else {
            return selector.replace('.icon', 'media-fullscreen-button:not([data-fullscreen]) .fullscreen-enter-icon');
          }
        }
      }

      return selector;
    },

    /**
     * Add utility classes that might be commonly needed
     */
    addUtilityClasses(root: any, options: SemanticTransformOptions) {
      const { isModule = false } = options;

      // Add common utility classes
      const spacerSelector = isModule ? '.Spacer' : '.spacer';
      const spacerRule = postcss.rule({ selector: spacerSelector });
      const spacerDecl = postcss.decl({ prop: 'flex-grow', value: '1' });
      spacerRule.append(spacerDecl);
      root.append(spacerRule);

      // Add control bar styles
      const controlBarSelector = isModule ? '.ControlBar' : '.control-bar';
      const controlBarRule = postcss.rule({ selector: controlBarSelector });
      controlBarRule.append(postcss.decl({ prop: 'display', value: 'flex' }));
      controlBarRule.append(postcss.decl({ prop: 'align-items', value: 'center' }));
      controlBarRule.append(postcss.decl({ prop: 'justify-content', value: 'flex-start' }));
      controlBarRule.append(postcss.decl({ prop: 'width', value: '100%' }));
      root.append(controlBarRule);

      // Add container overlay styles
      const overlaySelector = isModule ? '.Container .Overlay' : 'media-container > .overlay';
      const overlayRule = postcss.rule({ selector: overlaySelector });
      overlayRule.append(postcss.decl({ prop: 'position', value: 'absolute' }));
      overlayRule.append(postcss.decl({ prop: 'top', value: '0' }));
      overlayRule.append(postcss.decl({ prop: 'left', value: '0' }));
      overlayRule.append(postcss.decl({ prop: 'bottom', value: '0' }));
      overlayRule.append(postcss.decl({ prop: 'right', value: '0' }));
      overlayRule.append(postcss.decl({ prop: 'display', value: 'flex' }));
      overlayRule.append(postcss.decl({ prop: 'flex-flow', value: 'column nowrap' }));
      overlayRule.append(postcss.decl({ prop: 'align-items', value: 'start' }));
      overlayRule.append(postcss.decl({ prop: 'background', value: 'none' }));
      root.append(overlayRule);
    },

    /**
     * Capitalize first letter
     */
    capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  return plugin;
};

semanticTransform.postcss = true;