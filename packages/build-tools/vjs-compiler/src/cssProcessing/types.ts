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

  /**
   * Resolve CSS variables to concrete values
   * @default ['spacing'] - Only resolve spacing-related variables
   *
   * Options:
   * - 'spacing': Resolve --spacing variables (gap-3, p-1, size-3, etc.)
   * - 'colors': Resolve --color-* variables
   * - 'all': Resolve all variables
   */
  resolveCSSVariables?: ('spacing' | 'colors' | 'all')[];
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

/**
 * Container query definition
 */
export interface ContainerQuery {
  /** Breakpoint name (e.g., "7xl", "lg") */
  breakpoint: string;
  /** Container name (e.g., "root", "sidebar") */
  container: string;
  /** The utility class to apply (e.g., "text-[0.9375rem]") */
  utility: string;
}

/**
 * Arbitrary value definition
 */
export interface ArbitraryValue {
  /** CSS property (e.g., "font-size", "font-weight") */
  property: string;
  /** CSS value (e.g., "0.9375rem", "510") */
  value: string;
  /** Original class for reference (e.g., "text-[0.9375rem]") */
  originalClass: string;
}

/**
 * Enhanced class usage with categorized Tailwind utilities
 */
export interface EnhancedClassUsage {
  /** Original class string */
  classString: string;
  /** Simple Tailwind classes (can use @apply) */
  simpleClasses: string[];
  /** Container declarations (e.g., ["@container/root"]) */
  containerDeclarations: string[];
  /** Container query usages */
  containerQueries: ContainerQuery[];
  /** Arbitrary value usages */
  arbitraryValues: ArbitraryValue[];
}
