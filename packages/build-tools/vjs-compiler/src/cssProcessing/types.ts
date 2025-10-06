/**
 * Types for CSS processing and Tailwind → CSS Modules compilation
 */

/**
 * Configuration for Tailwind → CSS Modules compilation
 */
export interface TailwindCompilationConfig {
  /**
   * Input: styles object with Tailwind classes
   * Each key is a CSS class name, each value is a string of Tailwind classes
   */
  stylesObject: Record<string, string>;

  /**
   * Optional Tailwind config
   */
  tailwindConfig?: any;

  /**
   * Enable warnings for unsupported features
   * @default true
   */
  warnings?: boolean;

  /**
   * Custom PostCSS plugins to add to the pipeline
   */
  postcssPlugins?: any[];
}

/**
 * Output from Tailwind → CSS Modules compilation
 */
export interface CSSModulesOutput {
  /**
   * Generated CSS content (.module.css)
   */
  css: string;

  /**
   * TypeScript definitions (.d.ts)
   */
  dts: string;

  /**
   * Warnings encountered during compilation
   */
  warnings: string[];
}
