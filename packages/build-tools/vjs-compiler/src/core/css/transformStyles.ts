/**
 * Transform styles object to CSS
 *
 * Phase 3: Tailwind utilities → CSS with proper selectors (using categorization)
 */

import type { StylesObject, StyleKeyUsage } from '../../types.js';
import { processTailwindClasses } from './processCSS.js';
import { projectStyleSelector } from '../projection/projectStyleSelector.js';
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
 * Phase 3: Full Tailwind CSS processing with categorization
 * - Process Tailwind classes through Tailwind v4
 * - Parse generated CSS rules
 * - Rescope utility classes to style keys with proper selectors
 * - Use categorization to determine element vs class selectors
 *
 * @param styles - Styles object from styles.ts
 * @param categorizedStyleKeys - Categorized style keys from usage analysis
 * @returns Transformation result with CSS and class name mapping
 */
export async function transformStyles(
  styles: StylesObject,
  categorizedStyleKeys?: StyleKeyUsage[]
): Promise<TransformStylesResult> {
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

  // Phase 3: Rescope utility classes to style keys with proper selectors
  const rescopedCSS = rescopeCSSToStyleKeys(root, styles, categorizedStyleKeys);

  return {
    css: rescopedCSS,
    classNames,
  };
}

/**
 * Rescope utility classes from Tailwind output to style keys
 *
 * Takes raw Tailwind CSS (e.g., `.flex { display: flex }`)
 * and rescopes it to style keys with proper selectors based on categorization
 * - Component Selector ID: element selector (e.g., `media-container { ... }`)
 * - Type/Generic Selector: class selector (e.g., `.button { ... }`)
 *
 * @param root - PostCSS AST of Tailwind output
 * @param styles - Original styles object
 * @param categorizedStyleKeys - Categorized style keys with selector information
 * @returns Rescoped CSS string
 */
function rescopeCSSToStyleKeys(
  root: postcss.Root,
  styles: Record<string, string>,
  categorizedStyleKeys?: StyleKeyUsage[]
): string {
  // Phase 3: Build utility class to declarations map
  const utilityMap = new Map<string, postcss.Declaration[]>();
  let hostRule: string | null = null;

  root.walkRules((rule) => {
    const selector = rule.selector.trim();

    // Preserve :host rule (contains CSS variable definitions)
    if (selector === ':host') {
      hostRule = rule.toString();
      return;
    }

    // Extract utility class name (e.g., '.flex' → 'flex')
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

  // Build map of style keys to their categorization
  const styleKeyMap = new Map<string, StyleKeyUsage>();
  if (categorizedStyleKeys) {
    for (const styleKey of categorizedStyleKeys) {
      styleKeyMap.set(styleKey.key, styleKey);
    }
  }

  // Generate rescoped CSS for each style key
  const rescopedRules: string[] = [];

  // Prepend :host rule with CSS variable definitions (if present)
  if (hostRule) {
    rescopedRules.push(hostRule);
  }

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
      // Determine selector based on categorization
      let selector = `.${key}`; // Default to class selector
      const styleKey = styleKeyMap.get(key);
      if (styleKey) {
        const projection = projectStyleSelector(styleKey);
        selector = projection.cssSelector;
      }

      // Build CSS rule
      const rule = postcss.rule({ selector });
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
