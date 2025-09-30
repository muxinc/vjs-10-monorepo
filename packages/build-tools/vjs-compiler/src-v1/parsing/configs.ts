import type { ParseConfig } from './types.js';

/**
 * Config for basic JSX-to-HTML compilation
 * Only extracts the JSX element
 */
export const JSX_ONLY_CONFIG: ParseConfig = {
  extractJSX: true,
};

/**
 * Config for full skin compilation
 * Extracts everything needed to compile a skin
 */
export const SKIN_CONFIG: ParseConfig = {
  extractJSX: true,
  extractComponentName: true,
  extractImports: true,
  extractStyles: true,
};
