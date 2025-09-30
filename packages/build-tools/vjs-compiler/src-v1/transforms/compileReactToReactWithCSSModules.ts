import type { ParseConfig } from '../parsing/types.js';

import babelGenerate from '@babel/generator';
import babelTraverse from '@babel/traverse';

import { parseReactSource } from '../parsing/index.js';

const traverse = (babelTraverse as any).default || babelTraverse;
const generate = (babelGenerate as any).default || babelGenerate;

/**
 * Configuration for React → React + CSS Modules transformation
 * Extracts imports and styles to identify which imports to transform
 */
export const REACT_TO_CSS_MODULES_CONFIG: ParseConfig = {
  extractImports: true,
  extractStyles: true,
};

/**
 * Options for React → React + CSS Modules compilation
 */
export interface CompileReactToCSSModulesOptions {
  /**
   * Custom parse configuration
   * Defaults to REACT_TO_CSS_MODULES_CONFIG
   */
  parseConfig?: ParseConfig;

  /**
   * Whether to preserve comments in output
   * @default true
   */
  comments?: boolean;
}

/**
 * Transforms React + Tailwind component to React + CSS Modules
 *
 * This is a minimal transformation that primarily updates style imports:
 * - `import styles from './styles'` → `import styles from './styles.module.css'`
 *
 * The JSX and className usage remain unchanged, making this a safe,
 * low-risk transformation suitable for gradual migration.
 *
 * @param source - React/TSX source code with Tailwind styles
 * @param options - Transformation options
 * @returns Transformed React/TSX source code with CSS Modules imports, or null if parsing fails
 *
 * @example
 * ```typescript
 * const input = `
 *   import styles from './styles';
 *   export const Button = () => <button className={styles.Button}>Click</button>;
 * `;
 *
 * const output = compileReactToReactWithCSSModules(input);
 * // import styles from './styles.module.css';
 * // export const Button = () => <button className={styles.Button}>Click</button>;
 * ```
 */
export function compileReactToReactWithCSSModules(
  source: string,
  options: CompileReactToCSSModulesOptions = {}
): string | null {
  const { parseConfig = REACT_TO_CSS_MODULES_CONFIG, comments = true } = options;

  // 1. Parse the React source (with error handling)
  let parsed;
  try {
    parsed = parseReactSource(source, parseConfig);
  } catch {
    // If parsing fails (invalid syntax), return null
    return null;
  }

  // We need the AST to transform, but styles aren't strictly required
  // (component might not use styles, which is valid)
  if (!parsed.ast) {
    return null;
  }

  // 2. Transform the AST - update all styles imports
  // We transform any import that looks like a styles import and isn't already .css
  traverse(parsed.ast, {
    ImportDeclaration(path: any) {
      const importSource = path.node.source.value;

      // Check if this import has a default specifier (import X from 'Y')
      const hasDefaultImport = path.node.specifiers.some((spec: any) => spec.type === 'ImportDefaultSpecifier');

      // Only transform if:
      // 1. Has a default import (CSS modules use default imports)
      // 2. Import path looks like a styles import
      // 3. It's not already a .css or .module.css file
      if (
        hasDefaultImport &&
        (importSource.includes('styles') || importSource.includes('style')) &&
        !importSource.endsWith('.css') &&
        !importSource.endsWith('.module.css')
      ) {
        // Transform the import path
        path.node.source.value = `${importSource}.module.css`;
      }
    },
  });

  // 3. Generate the transformed source code
  const output = generate(parsed.ast, {
    retainLines: false,
    comments,
    compact: false,
    jsescOption: {
      quotes: 'double', // Use double quotes to match project style
    },
  });

  return output.code;
}
