/**
 * Generate container query CSS from responsive variants
 *
 * Transforms responsive variants (sm:p-6, md:p-8) into @container queries
 * since Tailwind v4 doesn't auto-generate responsive media queries.
 */

import postcss from 'postcss';

import type { ResponsiveVariant } from './responsiveVariants.js';
import { CONTAINER_BREAKPOINTS } from './responsiveVariants.js';

/**
 * Generate container query CSS for responsive variants
 *
 * Strategy:
 * 1. Get base utility CSS from Tailwind (e.g., CSS for "p-6" utility)
 2. Find rules for the base utility in Tailwind output
 * 3. Wrap those rules in @container query with breakpoint size
 * 4. Rescope selectors to use the target selector (e.g., `.Wrapper` → `.wrapper`)
 *
 * Example input:
 * - Variant: { breakpoint: "sm", utility: "p-6", ... }
 * - Target selector: `.wrapper`
 * - Tailwind CSS contains: `.p-6 { padding: 1.5rem; }`
 *
 * Example output:
 * ```css
 * @container (min-width: 24rem) {
 *   .wrapper {
 *     padding: 1.5rem;
 *   }
 * }
 * ```
 *
 * @param variants - Responsive variants to generate CSS for
 * @param baseSelector - Target CSS selector (e.g., `.Wrapper`, `media-container`)
 * @param tailwindCSS - Raw Tailwind CSS output
 * @returns CSS string with @container rules
 */
export function generateContainerQueryCSS(
  variants: ResponsiveVariant[],
  baseSelector: string,
  tailwindCSS: string
): string {
  if (variants.length === 0) {
    return '';
  }

  // Parse Tailwind CSS
  const root = postcss.parse(tailwindCSS);

  // Build utility class → rule map
  const utilityRuleMap = new Map<string, postcss.Rule[]>();

  root.walkRules((rule) => {
    const selector = rule.selector.trim();

    // Extract utility class name from selector (e.g., `.p-6` → `p-6`)
    // Handle escaped characters (e.g., `.hover\:bg-blue-500:hover` → `hover:bg-blue-500`)
    const match = selector.match(/^\.((?:[^:[\\\s]|\\.)+)/);
    if (!match || !match[1]) return;

    const utilityClass = match[1]
      // Unescape Tailwind class name (e.g., `hover\:bg-blue-500` → `hover:bg-blue-500`)
      .replace(/\\(.)/g, '$1');

    if (!utilityRuleMap.has(utilityClass)) {
      utilityRuleMap.set(utilityClass, []);
    }
    utilityRuleMap.get(utilityClass)!.push(rule.clone());
  });

  // Group variants by breakpoint for efficient container query generation
  const variantsByBreakpoint = new Map<string, ResponsiveVariant[]>();
  for (const variant of variants) {
    if (!variantsByBreakpoint.has(variant.breakpoint)) {
      variantsByBreakpoint.set(variant.breakpoint, []);
    }
    variantsByBreakpoint.get(variant.breakpoint)!.push(variant);
  }

  // Generate @container rules for each breakpoint
  const containerRules: string[] = [];

  for (const [breakpoint, breakpointVariants] of variantsByBreakpoint) {
    const breakpointSize = CONTAINER_BREAKPOINTS[breakpoint];
    if (!breakpointSize) {
      console.warn(`Unknown breakpoint: ${breakpoint}`);
      continue;
    }

    // Create @container at-rule
    const containerRule = postcss.atRule({
      name: 'container',
      params: `(min-width: ${breakpointSize})`,
    });

    // Create base rule with target selector
    const targetRule = postcss.rule({ selector: baseSelector });

    // Collect declarations from all variants in this breakpoint
    for (const variant of breakpointVariants) {
      const utilityRules = utilityRuleMap.get(variant.utility);
      if (!utilityRules) {
        console.warn(`No CSS found for utility: ${variant.utility}`);
        continue;
      }

      // Add declarations from all matching rules
      for (const utilityRule of utilityRules) {
        utilityRule.each((child) => {
          if (child.type === 'decl') {
            targetRule.append(child.clone());
          }
        });
      }
    }

    // Only output container rule if we found declarations
    if (targetRule.nodes && targetRule.nodes.length > 0) {
      containerRule.append(targetRule);
      containerRules.push(containerRule.toString());
    }
  }

  return containerRules.join('\n\n');
}

/**
 * Generate container query CSS for all style keys with responsive variants
 *
 * @param variantsByKey - Map of style key → responsive variants
 * @param selectorsByKey - Map of style key → CSS selector
 * @param tailwindCSS - Raw Tailwind CSS output
 * @returns Map of style key → container query CSS
 */
export function generateAllContainerQueries(
  variantsByKey: Map<string, ResponsiveVariant[]>,
  selectorsByKey: Map<string, string>,
  tailwindCSS: string
): Map<string, string> {
  const result = new Map<string, string>();

  for (const [key, variants] of variantsByKey) {
    const selector = selectorsByKey.get(key) || `.${key}`;
    const containerCSS = generateContainerQueryCSS(variants, selector, tailwindCSS);
    if (containerCSS) {
      result.set(key, containerCSS);
    }
  }

  return result;
}
