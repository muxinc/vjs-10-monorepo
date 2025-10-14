/**
 * Transform styles object to CSS
 *
 * Phase 3: Tailwind utilities → CSS with proper selectors (using categorization)
 */

import postcss from 'postcss';

import type { StyleKeyUsage, StylesObject } from '../../types.js';

import { projectStyleSelector } from '../projection/projectStyleSelector.js';
import { processTailwindClasses } from './processCSS.js';
import { resolveCSSVariables } from './resolveCSSVariables.js';

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

  // Phase 3.5: Resolve CSS variables to concrete values
  // Part of "inline-vanilla" CSS strategy's goal of producing terse, human-readable output
  const finalCSS = resolveCSSVariables(rescopedCSS, { resolve: ['all'] });

  return {
    css: finalCSS,
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
  // Phase 3: Build utility class to complete rule map
  // Maps utility class name → rule info (rule + parent at-rule if any)
  interface RuleInfo {
    rule: postcss.Rule;
    parentAtRule: postcss.AtRule | null;
  }
  const utilityRuleMap = new Map<string, RuleInfo>();
  let hostRule: string | null = null;

  root.walkRules((rule) => {
    const selector = rule.selector.trim();

    // Preserve :host rule (contains CSS variable definitions)
    if (selector === ':host') {
      hostRule = rule.toString();
      return;
    }

    // Extract utility class name (e.g., '.flex' → 'flex', '.hover\:bg-blue-600:hover' → 'hover:bg-blue-600')
    // Only process top-level rules (parent is Root or AtRule like @media)
    if (selector.startsWith('.') && (rule.parent?.type === 'root' || rule.parent?.type === 'atrule')) {
      // First, extract the class name part (before any pseudo-classes/elements/attribute selectors)
      // We need to match: . followed by any characters until we hit an unescaped : or [
      // Pattern: . followed by (non-: non-[ non-\ non-space chars OR \ followed by any char)+
      // This correctly handles escaped colons (\:) and brackets (\[) as part of the class name
      const match = selector.match(/^.((?:[^:[\\\s]|\\.)+)/);

      if (!match || !match[1]) {
        return;
      }

      // Unescape the class name (Tailwind escapes colons, brackets, equals, slashes)
      const utilityClass = match[1]
        .replace(/\\:/g, ':') // Unescape colons
        .replace(/\\\[/g, '[') // Unescape brackets
        .replace(/\\\]/g, ']')
        .replace(/\\=/g, '=') // Unescape equals
        .replace(/\\\//g, '/'); // Unescape slashes

      // Store the rule along with its parent at-rule (if any)
      const parentAtRule = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule) : null;
      utilityRuleMap.set(utilityClass, {
        rule: rule.clone(),
        parentAtRule: parentAtRule ? (parentAtRule.clone() as postcss.AtRule) : null,
      });
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

    // Collect complete rules from all utilities
    interface CollectedRuleInfo {
      rule: postcss.Rule;
      parentAtRule: postcss.AtRule | null;
    }
    const collectedRules: CollectedRuleInfo[] = [];

    for (const utility of utilities) {
      const ruleInfo = utilityRuleMap.get(utility);
      if (ruleInfo) {
        collectedRules.push(ruleInfo);
      }
    }

    if (collectedRules.length > 0) {
      // Determine base selector based on categorization
      let baseSelector = `.${key}`; // Default to class selector
      const styleKey = styleKeyMap.get(key);
      if (styleKey) {
        const projection = projectStyleSelector(styleKey);
        baseSelector = projection.cssSelector;
      }

      // Group rules by their pseudo-class/variant context and media query context
      // - Base rules (no pseudo-class, no media query) go directly in main rule
      // - Variant rules (with pseudo-class like :hover) get their own nested rules
      // - Media query rules (inside @media) get wrapped in appropriate @media at-rule
      const baseRule = postcss.rule({ selector: baseSelector });
      const variantRules: postcss.Rule[] = [];
      const mediaRules: postcss.AtRule[] = []; // Track @media wrappers

      for (const ruleInfo of collectedRules) {
        const { rule, parentAtRule } = ruleInfo;

        // Check if this rule had a pseudo-class in its original selector
        // The original selector is like `.hover\:bg-blue-600:hover`
        // We already know the utility class name from utilityRuleMap
        // Find which utility this rule came from
        const originalSelector = rule.selector;

        // Extract the utility class name from the original selector (same logic as before)
        const utilMatch = originalSelector.match(/^.((?:[^:[\\\s]|\\.)+)/);
        if (!utilMatch || !utilMatch[1]) continue;

        // Extract pseudo-class/attribute selector by removing the utility class part
        // E.g., `.hover\:bg-blue-600:hover` → remove `.hover\:bg-blue-600` → `:hover`
        // E.g., `.data-[state=active]:bg-blue[data-state="active"]` → `[data-state="active"]`
        const utilSelectorEscaped = `.${utilMatch[1]}`; // E.g., `.hover\:bg-blue-600`
        const pseudoPart = originalSelector.slice(utilSelectorEscaped.length); // E.g., `:hover` or `[data-state="active"]`

        // parentAtRule is passed in from ruleInfo (stored when we built the map)

        if (pseudoPart || parentAtRule) {
          // This is a variant rule - create a rule with the pseudo-class/attribute selector
          const variantSelector = `${baseSelector}${pseudoPart}`;
          const variantRule = postcss.rule({ selector: variantSelector });

          rule.each((child) => {
            if (child.type === 'decl') {
              variantRule.append(child.clone());
            }
          });

          if (variantRule.nodes && variantRule.nodes.length > 0) {
            // If inside @media, wrap in @media at-rule
            if (parentAtRule) {
              const existingMediaRule = mediaRules.find((mr) => mr.params === parentAtRule.params);
              if (existingMediaRule) {
                existingMediaRule.append(variantRule);
              } else {
                const mediaRule = postcss.atRule({
                  name: parentAtRule.name,
                  params: parentAtRule.params,
                });
                mediaRule.append(variantRule);
                mediaRules.push(mediaRule);
              }
            } else {
              variantRules.push(variantRule);
            }
          }
        } else {
          // This is a base rule - add declarations directly
          rule.each((child) => {
            if (child.type === 'decl') {
              baseRule.append(child.clone());
            }
          });
        }
      }

      // Output base rule if it has declarations
      if (baseRule.nodes && baseRule.nodes.length > 0) {
        rescopedRules.push(baseRule.toString());
      }

      // Output variant rules (not in media queries)
      for (const variantRule of variantRules) {
        rescopedRules.push(variantRule.toString());
      }

      // Output media query rules
      for (const mediaRule of mediaRules) {
        rescopedRules.push(mediaRule.toString());
      }
    } else {
      // No rules found - add comment
      rescopedRules.push(`.${key} {\n  /* Tailwind classes: ${classString} */\n  /* No CSS generated */\n}`);
    }
  }

  return rescopedRules.join('\n\n');
}
