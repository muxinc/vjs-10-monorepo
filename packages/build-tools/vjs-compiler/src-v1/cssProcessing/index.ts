/**
 * CSS Processing Module
 * Handles Tailwind → CSS Modules compilation and CSS Modules → Vanilla CSS transformation
 */

export { compileTailwindToCSS } from './tailwindToCSSModules.js';
export { cssModulesToVanillaCSS } from './cssModulesToVanillaCSS.js';
export { parseEnhancedClassString, enhanceClassString } from './class-parser.js';
export type { TailwindCompilationConfig, CSSModulesOutput, EnhancedClassUsage, ContainerQuery, ArbitraryValue } from './types.js';
export type { CSSTransformConfig } from './cssModulesToVanillaCSS.js';
