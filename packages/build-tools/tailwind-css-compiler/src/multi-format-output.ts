import type { Helpers, Plugin, Root } from 'postcss';

import { mkdirSync, writeFileSync } from 'fs';

export interface MultiFormatOutputOptions {
  /** Output directory */
  outputDir: string;
  /** Generate vanilla CSS */
  generateVanilla?: boolean;
  /** Generate CSS modules */
  generateModules?: boolean;
  /** Vanilla CSS filename */
  vanillaFilename?: string;
  /** CSS modules filename */
  modulesFilename?: string;
}

/**
 * PostCSS plugin that outputs the final CSS in multiple formats
 */
const multiFormatOutput: {
  (options: MultiFormatOutputOptions): Plugin;
  postcss: boolean;
} = (options: MultiFormatOutputOptions): Plugin => {
  const plugin = {
    postcssPlugin: 'multi-format-output',
    OnceExit(root: Root, _helpers: Helpers) {
      const {
        outputDir,
        generateVanilla = true,
        generateModules = true,
        vanillaFilename = 'vanilla.css',
        modulesFilename = 'modules.css',
      } = options;

      // Ensure output directory exists
      mkdirSync(outputDir, { recursive: true });

      if (generateVanilla) {
        plugin.generateVanillaOutput(root, outputDir, vanillaFilename);
      }

      if (generateModules) {
        plugin.generateModulesOutput(root, outputDir, modulesFilename);
      }
    },

    /**
     * Generate vanilla CSS output with semantic element selectors
     */
    generateVanillaOutput(root: any, outputDir: string, filename: string) {
      const vanillaRoot = root.clone();

      // Transform all rules for vanilla CSS output
      vanillaRoot.walkRules((rule: any) => {
        rule.selector = plugin.transformToVanillaSelector(rule.selector);
      });

      // Add header comment
      const header = plugin.createHeaderComment('Vanilla CSS', 'Use with HTML elements and custom elements');
      const css = header + vanillaRoot.toString();

      const filePath = `${outputDir}/${filename}`;
      writeFileSync(filePath, css);
      console.log(`✅ Generated vanilla CSS: ${filePath}`);
    },

    /**
     * Generate CSS modules output with class-based selectors
     */
    generateModulesOutput(root: any, outputDir: string, filename: string) {
      const modulesRoot = root.clone();

      // Transform all rules for CSS modules output
      modulesRoot.walkRules((rule: any) => {
        rule.selector = plugin.transformToModuleSelector(rule.selector);
      });

      // Add header comment
      const header = plugin.createHeaderComment('CSS Modules', 'Import and use with React className prop');
      const css = header + modulesRoot.toString();

      const filePath = `${outputDir}/${filename}`;
      writeFileSync(filePath, css);
      console.log(`✅ Generated CSS modules: ${filePath}`);
    },

    /**
     * Transform selectors for vanilla CSS (custom elements, semantic names)
     */
    transformToVanillaSelector(selector: string): string {
      let transformed = selector;

      // Transform class-based selectors to element selectors
      const transformations = {
        '.PlayButton': 'media-play-button',
        '.MuteButton': 'media-mute-button',
        '.FullscreenButton': 'media-fullscreen-button',
        '.VolumeRange': 'media-volume-range',
        '.TimeRange': 'media-time-range',
        '.CurrentTimeDisplay': 'media-current-time-display',
        '.DurationDisplay': 'media-duration-display',
        '.Container': 'media-container',

        // Icon transformations
        '.PlayIcon': '.play-icon',
        '.PauseIcon': '.pause-icon',
        '.VolumeHighIcon': '.volume-high-icon',
        '.VolumeLowIcon': '.volume-low-icon',
        '.VolumeOffIcon': '.volume-off-icon',
        '.FullscreenEnterIcon': '.fullscreen-enter-icon',
        '.FullscreenExitIcon': '.fullscreen-exit-icon',
        '.Icon': '.icon',
      };

      for (const [from, to] of Object.entries(transformations)) {
        const regex = new RegExp(plugin.escapeRegex(from), 'g');
        transformed = transformed.replace(regex, to);
      }

      return transformed;
    },

    /**
     * Transform selectors for CSS modules (keep class-based)
     */
    transformToModuleSelector(selector: string): string {
      // For CSS modules, we mostly keep the class-based approach
      // but ensure consistent naming
      let transformed = selector;

      // Ensure consistent icon naming
      const iconTransformations = {
        '.play-icon': '.PlayIcon',
        '.pause-icon': '.PauseIcon',
        '.volume-high-icon': '.VolumeHighIcon',
        '.volume-low-icon': '.VolumeLowIcon',
        '.volume-off-icon': '.VolumeOffIcon',
        '.fullscreen-enter-icon': '.FullscreenEnterIcon',
        '.fullscreen-exit-icon': '.FullscreenExitIcon',
        '.icon': '.Icon',
      };

      for (const [from, to] of Object.entries(iconTransformations)) {
        const regex = new RegExp(plugin.escapeRegex(from), 'g');
        transformed = transformed.replace(regex, to);
      }

      return transformed;
    },

    /**
     * Create header comment for generated files
     */
    createHeaderComment(format: string, description: string): string {
      return `/* Generated ${format} - ${description} */
/* This file is auto-generated by @vjs-10/tailwind-css-compiler */
/* Do not edit manually - changes will be overwritten */

`;
    },

    /**
     * Escape regex special characters
     */
    escapeRegex(string: string): string {
      return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');
    },
  };

  return plugin;
};

multiFormatOutput.postcss = true;

export { multiFormatOutput };
