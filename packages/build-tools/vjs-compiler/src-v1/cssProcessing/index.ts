/**
 * CSS Processing Module
 * Handles Tailwind → CSS Modules compilation and CSS Modules → Vanilla CSS transformation
 */

export { enhanceClassString, parseEnhancedClassString } from './class-parser.js';
export { cssModulesToVanillaCSS } from './cssModulesToVanillaCSS.js';
export type { CSSTransformConfig } from './cssModulesToVanillaCSS.js';
export { compileTailwindToCSS } from './tailwindToCSSModules.js';
export type {
  ArbitraryValue,
  ContainerQuery,
  CSSModulesOutput,
  EnhancedClassUsage,
  TailwindCompilationConfig,
} from './types.js';
