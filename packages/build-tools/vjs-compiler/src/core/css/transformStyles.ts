/**
 * Transform styles object to CSS
 *
 * Phase 2: Simple Tailwind utilities → CSS Modules
 */

import type { StylesObject } from '../../types.js';
import { processTailwindClasses } from './processCSS.js';
import postcss from 'postcss';

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
 * Phase 3: Full Tailwind CSS processing
 * - Process Tailwind classes through Tailwind v4
 * - Parse generated CSS rules
 * - Rescope utility classes to style keys
 *
 * @param styles - Styles object from styles.ts
 * @returns Transformation result with CSS and class name mapping
 */
export async function transformStyles(styles: StylesObject): Promise<TransformStylesResult> {
  const classNames: Record<string, string> = {};

  // Identity mapping for Phase 3
  for (const key of Object.keys(styles)) {
    classNames[key] = key;
  }

  // Process through Tailwind v4
  let tailwindCSS: string;
  try {
    tailwindCSS = await processTailwindClasses(styles);
  } catch (error) {
    console.error('Tailwind CSS processing failed:', error);
    // Fallback to placeholder CSS
    const fallbackRules = Object.entries(styles).map(
      ([key, classString]) => `.${key} {\n  /* Tailwind classes: ${classString} */\n  /* Processing failed */\n}`
    );
    return {
      css: fallbackRules.join('\n\n'),
      classNames,
    };
  }

  // Parse the Tailwind CSS output
  const root = postcss.parse(tailwindCSS);

  // Phase 3: Rescope utility classes to style keys
  const rescopedCSS = rescopeCSSToStyleKeys(root, styles);

  return {
    css: rescopedCSS,
    classNames,
  };
}

/**
 * Rescope utility classes from Tailwind output to style keys
 *
 * Takes raw Tailwind CSS (e.g., `.flex { display: flex }`)
 * and rescopes it to style keys (e.g., `.Controls { display: flex }`)
 *
 * @param root - PostCSS AST of Tailwind output
 * @param styles - Original styles object
 * @returns Rescoped CSS string
 */
function rescopeCSSToStyleKeys(root: postcss.Root, styles: Record<string, string>): string {
  // Phase 3: Build utility class to declarations map
  const utilityMap = new Map<string, postcss.Declaration[]>();

  root.walkRules((rule) => {
    // Extract utility class name (e.g., '.flex' → 'flex')
    const selector = rule.selector.trim();
    if (selector.startsWith('.')) {
      const utilityClass = selector.slice(1);
      const declarations: postcss.Declaration[] = [];

      rule.walkDecls((decl) => {
        declarations.push(decl.clone());
      });

      if (declarations.length > 0) {
        utilityMap.set(utilityClass, declarations);
      }
    }
  });

  // Generate rescoped CSS for each style key
  const rescopedRules: string[] = [];

  for (const [key, classString] of Object.entries(styles)) {
    const utilities = classString.split(/\s+/).filter(Boolean);
    const declarations: postcss.Declaration[] = [];

    // Collect declarations from all utilities
    for (const utility of utilities) {
      const utilDecls = utilityMap.get(utility);
      if (utilDecls) {
        declarations.push(...utilDecls.map((d) => d.clone()));
      }
    }

    if (declarations.length > 0) {
      // Build CSS rule
      const rule = postcss.rule({ selector: `.${key}` });
      for (const decl of declarations) {
        rule.append(decl);
      }

      rescopedRules.push(rule.toString());
    } else {
      // No declarations found - add comment
      rescopedRules.push(`.${key} {\n  /* Tailwind classes: ${classString} */\n  /* No CSS generated */\n}`);
    }
  }

  return rescopedRules.join('\n\n');
}
