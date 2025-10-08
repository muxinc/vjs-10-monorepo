/**
 * Transform styles object to CSS
 *
 * Phase 2: Simple Tailwind utilities → CSS Modules
 */

import type { StylesObject } from '../../types.js';
import { processCSS, buildHTMLForTailwind } from './processCSS.js';

/**
 * CSS transformation result
 */
export interface TransformStylesResult {
  /**
   * Generated CSS (CSS Modules format for Phase 2)
   */
  css: string;

  /**
   * Mapping from style keys to CSS class names
   * Phase 2: Identity mapping (Container → .Container)
   */
  classNames: Record<string, string>;
}

/**
 * Transform styles object to CSS
 *
 * Phase 2: Minimal CSS placeholder
 * Just generates placeholder CSS rules to validate pipeline is working.
 * Full Tailwind processing will be implemented in later phases.
 *
 * @param styles - Styles object from styles.ts
 * @returns Transformation result with CSS and class name mapping
 */
export async function transformStyles(styles: StylesObject): Promise<TransformStylesResult> {
  // Phase 2: Simple placeholder CSS
  // Generate basic CSS rules for each style key
  const cssRules: string[] = [];
  const classNames: Record<string, string> = {};

  for (const [key, classString] of Object.entries(styles)) {
    classNames[key] = key;

    // Generate placeholder CSS rule
    // TODO: Phase 3+ will integrate full Tailwind processing
    cssRules.push(`.${key} {
  /* Tailwind classes: ${classString} */
}`);
  }

  const css = cssRules.join('\n\n');

  return {
    css,
    classNames,
  };
}

/**
 * Build HTML wrapper for Tailwind processing from array of elements
 *
 * @param elements - Array of HTML elements
 * @returns HTML string
 */
function buildHTMLForTailwind(elements: string[]): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${elements.join('\n')}
</body>
</html>`;
}
