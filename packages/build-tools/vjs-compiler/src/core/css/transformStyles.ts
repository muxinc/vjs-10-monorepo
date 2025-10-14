/**
 * Transform styles object to CSS
 *
 * Phase 3: Tailwind utilities → CSS with proper selectors (using categorization)
 */

import postcss from 'postcss';

import type { StyleKeyUsage, StylesObject } from '../../types.js';

import type { ProjectionOptions } from '../projection/projectStyleSelector.js';
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
 * @param options - Projection options (selector strategy, etc.)
 * @returns Transformation result with CSS and class name mapping
 */
export async function transformStyles(
  styles: StylesObject,
  categorizedStyleKeys?: StyleKeyUsage[],
  options?: ProjectionOptions
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
  const rescopedCSS = rescopeCSSToStyleKeys(root, styles, categorizedStyleKeys, options);

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
 * @param options - Projection options (selector strategy, etc.)
 * @returns Rescoped CSS string
 */
function rescopeCSSToStyleKeys(
  root: postcss.Root,
  styles: Record<string, string>,
  categorizedStyleKeys?: StyleKeyUsage[],
  options?: ProjectionOptions
): string {
  // Phase 3: Build utility class to complete rule map
  // Maps utility class name → rule info (rule + parent at-rule if any)
  interface RuleInfo {
    rule: postcss.Rule;
    parentAtRule: postcss.AtRule | null;
  }
  const utilityRuleMap = new Map<string, RuleInfo>();

  // Maps utility class name → arbitrary variant rules (with descendant selectors)
  // These rules have patterns like: `.\[\&_\.icon\]\:\[grid-area\:1\/1\] .icon { ... }`
  const arbitraryVariantRuleMap = new Map<string, RuleInfo[]>();

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
      // Check if this is an arbitrary variant with descendant selector
      // Pattern: `.\[\&_<something>\] <descendant>` or `.\[\&\[<attr>\]_<something>\] <descendant>`
      // These selectors contain a SPACE (descendant combinator) after the utility class
      // Note: The [& is escaped by Tailwind as \[\&
      if (selector.includes(' ') && /^\.\\\[\\&/.test(selector)) {
        // This is an arbitrary variant with a descendant selector
        // Examples:
        // - `.\[\&_\.icon\]\:\[grid-area\:1\/1\] .icon`
        // - `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon`
        //
        // The second example has an attribute selector [data-paused] AFTER the utility class
        // but BEFORE the space. We need to strip that to match the original utility name.

        const spaceIndex = selector.indexOf(' ');
        let utilityClassPart = selector.substring(0, spaceIndex);

        // Check if there's an attribute selector at the end (before the space)
        // The utility class ALWAYS ends with an ESCAPED ] (e.g., `.\[\&_\.icon\]` or `.\[\&\[data-paused\]_\.play-icon\]`)
        // But there might be a trailing UNESCAPED attribute selector: `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused]`
        //                                                                                              ^-- last \]    ^-- trailing [data-paused]
        //
        // We need to find the last ESCAPED \] which marks the end of the utility class

        // Find the last \] (escaped bracket) which marks the end of the utility class
        let lastEscapedBracketIndex = utilityClassPart.lastIndexOf('\\]');

        if (lastEscapedBracketIndex > 0 && lastEscapedBracketIndex + 2 < utilityClassPart.length) {
          // There's something after the last \], extract it (after the 2-char sequence \])
          const afterUtilityClass = utilityClassPart.substring(lastEscapedBracketIndex + 2);

          // Check if it contains [ (unescaped attribute selector like [data-paused])
          // The pattern is: \:utility-name[attribute-selector]
          // e.g., "\:opacity-100[data-paused]"
          const attrSelectorIndex = afterUtilityClass.indexOf('[');
          if (attrSelectorIndex !== -1) {
            // This has a trailing attribute selector, remove everything from [ onwards
            utilityClassPart = utilityClassPart.substring(0, lastEscapedBracketIndex + 2 + attrSelectorIndex);
          }
        }

        // Remove the leading dot and unescape
        const utilityClass = utilityClassPart.substring(1)
          .replace(/\\:/g, ':')
          .replace(/\\\[/g, '[')
          .replace(/\\\]/g, ']')
          .replace(/\\=/g, '=')
          .replace(/\\\//g, '/')
          .replace(/\\&/g, '&')
          .replace(/\\_/g, '_')
          .replace(/\\\./g, '.');

        // Store in arbitrary variant map
        const parentAtRule = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule) : null;
        const ruleInfo: RuleInfo = {
          rule: rule.clone(),
          parentAtRule: parentAtRule ? (parentAtRule.clone() as postcss.AtRule) : null,
        };

        const existing = arbitraryVariantRuleMap.get(utilityClass);
        if (existing) {
          existing.push(ruleInfo);
        } else {
          arbitraryVariantRuleMap.set(utilityClass, [ruleInfo]);
        }
        return; // Don't add to utilityRuleMap
      }

      // Regular utility class (no descendant selector)
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

    // Collect arbitrary variant rules (separate array for special handling)
    const arbitraryVariantRules: RuleInfo[] = [];

    for (const utility of utilities) {
      // Check regular utility map first
      const ruleInfo = utilityRuleMap.get(utility);
      if (ruleInfo) {
        collectedRules.push(ruleInfo);
      }

      // Also check arbitrary variant map
      const arbitraryRules = arbitraryVariantRuleMap.get(utility);
      if (arbitraryRules) {
        arbitraryVariantRules.push(...arbitraryRules);
      }
    }

    if (collectedRules.length > 0) {
      // Determine base selector based on categorization
      let baseSelector = `.${key}`; // Default to class selector
      const styleKey = styleKeyMap.get(key);
      if (styleKey) {
        const projection = projectStyleSelector(styleKey, options);
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

      // Process arbitrary variant rules (descendant selectors)
      // These have patterns like:
      // - `.\[\&_\.icon\]\:\[grid-area\:1\/1\] .icon { grid-area: 1/1; }`
      // - `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon`
      //
      // The second pattern has [data-paused] BETWEEN the utility class and the space,
      // which needs to be attached to the base selector.
      for (const ruleInfo of arbitraryVariantRules) {
        const { rule, parentAtRule } = ruleInfo;
        const originalSelector = rule.selector.trim();

        const spaceIndex = originalSelector.indexOf(' ');
        if (spaceIndex === -1) continue; // Should always have a space, but defensive

        // Extract what comes before the space
        const beforeSpace = originalSelector.substring(0, spaceIndex);

        // Check if there's a trailing attribute selector (after the utility class)
        // E.g., `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused]`
        // The `[data-paused]` at the end is the attribute selector
        //
        // To find it, we look for the last ESCAPED \] (end of utility class),
        // then check if there's a [ somewhere after it
        let attributeSelector = '';
        const lastEscapedBracket = beforeSpace.lastIndexOf('\\]');

        if (lastEscapedBracket !== -1 && lastEscapedBracket + 2 < beforeSpace.length) {
          // There's something after the last \]
          const afterUtility = beforeSpace.substring(lastEscapedBracket + 2);
          const attrStart = afterUtility.indexOf('[');

          if (attrStart !== -1) {
            // Found an attribute selector
            attributeSelector = afterUtility.substring(attrStart);
          }
        }

        // Extract the descendant part after the space
        const descendantPart = originalSelector.substring(spaceIndex + 1);

        // Build rescoped selector: baseSelector + attributeSelector + descendant
        // E.g., `.button` + `[data-paused]` + ` .play-icon` → `.button[data-paused] .play-icon`
        // E.g., `.button` + `` + ` .icon` → `.button .icon`
        const rescopedSelector = `${baseSelector}${attributeSelector} ${descendantPart}`;

        // Create rescoped rule
        const rescopedRule = postcss.rule({ selector: rescopedSelector });
        rule.each((child) => {
          if (child.type === 'decl') {
            rescopedRule.append(child.clone());
          }
        });

        // Output rule (wrap in @media if needed)
        if (rescopedRule.nodes && rescopedRule.nodes.length > 0) {
          if (parentAtRule) {
            const existingMediaRule = mediaRules.find((mr) => mr.params === parentAtRule.params);
            if (existingMediaRule) {
              existingMediaRule.append(rescopedRule);
            } else {
              const mediaRule = postcss.atRule({
                name: parentAtRule.name,
                params: parentAtRule.params,
              });
              mediaRule.append(rescopedRule);
              mediaRules.push(mediaRule);
              rescopedRules.push(mediaRule.toString());
            }
          } else {
            rescopedRules.push(rescopedRule.toString());
          }
        }
      }
    } else if (arbitraryVariantRules.length > 0) {
      // Only arbitrary variant rules, no regular utilities
      // Still need to process them
      let baseSelector = `.${key}`;
      const styleKey = styleKeyMap.get(key);
      if (styleKey) {
        const projection = projectStyleSelector(styleKey, options);
        baseSelector = projection.cssSelector;
      }

      const mediaRules: postcss.AtRule[] = [];

      for (const ruleInfo of arbitraryVariantRules) {
        const { rule, parentAtRule } = ruleInfo;
        const originalSelector = rule.selector.trim();

        const spaceIndex = originalSelector.indexOf(' ');
        if (spaceIndex === -1) continue;

        // Extract what comes before the space
        const beforeSpace = originalSelector.substring(0, spaceIndex);

        // Check if there's a trailing attribute selector (after the utility class)
        // Same logic as the first branch above
        let attributeSelector = '';
        const lastEscapedBracket = beforeSpace.lastIndexOf('\\]');

        if (lastEscapedBracket !== -1 && lastEscapedBracket + 2 < beforeSpace.length) {
          const afterUtility = beforeSpace.substring(lastEscapedBracket + 2);
          const attrStart = afterUtility.indexOf('[');

          if (attrStart !== -1) {
            attributeSelector = afterUtility.substring(attrStart);
          }
        }

        // Extract the descendant part after the space
        const descendantPart = originalSelector.substring(spaceIndex + 1);

        // Build rescoped selector: baseSelector + attributeSelector + descendant
        const rescopedSelector = `${baseSelector}${attributeSelector} ${descendantPart}`;

        const rescopedRule = postcss.rule({ selector: rescopedSelector });
        rule.each((child) => {
          if (child.type === 'decl') {
            rescopedRule.append(child.clone());
          }
        });

        if (rescopedRule.nodes && rescopedRule.nodes.length > 0) {
          if (parentAtRule) {
            const existingMediaRule = mediaRules.find((mr) => mr.params === parentAtRule.params);
            if (existingMediaRule) {
              existingMediaRule.append(rescopedRule);
            } else {
              const mediaRule = postcss.atRule({
                name: parentAtRule.name,
                params: parentAtRule.params,
              });
              mediaRule.append(rescopedRule);
              mediaRules.push(mediaRule);
            }
          } else {
            rescopedRules.push(rescopedRule.toString());
          }
        }
      }

      // Output media rules
      for (const mediaRule of mediaRules) {
        rescopedRules.push(mediaRule.toString());
      }
    } else {
      // No rules found - optionally add comment for debugging
      if (options?.includeEmptyRules) {
        let baseSelector = `.${key}`; // Default to class selector
        const styleKey = styleKeyMap.get(key);
        if (styleKey) {
          const projection = projectStyleSelector(styleKey, options);
          baseSelector = projection.cssSelector;
        }
        rescopedRules.push(`${baseSelector} {\n  /* Tailwind classes: ${classString} */\n  /* No CSS generated */\n}`);
      }
      // Otherwise, skip empty rules entirely (default behavior)
    }
  }

  return rescopedRules.join('\n\n');
}
