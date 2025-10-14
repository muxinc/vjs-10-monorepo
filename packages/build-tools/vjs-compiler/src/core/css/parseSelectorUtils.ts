/**
 * CSS Selector Parsing Utilities
 *
 * Uses postcss-selector-parser to provide robust CSS selector parsing
 * instead of fragile string manipulation.
 */

import selectorParser from 'postcss-selector-parser';

/**
 * Information about a parsed Tailwind utility class selector
 */
export interface ParsedUtilitySelector {
  /**
   * The full original selector
   */
  original: string;

  /**
   * The utility class name (unescaped, e.g., "[&_.icon]:opacity-0")
   */
  utilityClass: string;

  /**
   * Attribute selectors that appear after the utility class but before any descendant
   * (e.g., "[data-paused]" in ".\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon")
   */
  trailingAttributes: string[];

  /**
   * Descendant selector parts (everything after the first space/combinator)
   * (e.g., ".play-icon" in ".\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon")
   */
  descendantSelector: string | null;

  /**
   * Whether this selector has descendant selectors (arbitrary variant pattern)
   */
  hasDescendant: boolean;

  /**
   * Pseudo-classes attached to the utility class (e.g., ":hover")
   */
  pseudoClasses: string[];

  /**
   * Pseudo-elements attached to the utility class (e.g., "::before")
   */
  pseudoElements: string[];
}

/**
 * Parse a Tailwind utility class selector using postcss-selector-parser
 *
 * Handles patterns like:
 * - `.flex` → simple utility
 * - `.hover\:bg-blue-600:hover` → utility with pseudo-class
 * - `.\[\&_\.icon\]\:opacity-0 .icon` → arbitrary variant with descendant
 * - `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon` → arbitrary variant with attribute and descendant
 *
 * @param selector - CSS selector string to parse
 * @returns Parsed selector information
 */
export function parseUtilitySelector(selector: string): ParsedUtilitySelector {
  let utilityClass = '';
  let trailingAttributes: string[] = [];
  let descendantSelector: string | null = null;
  let hasDescendant = false;
  const pseudoClasses: string[] = [];
  const pseudoElements: string[] = [];

  // Parse the selector using postcss-selector-parser
  selectorParser((selectors) => {
    // We expect a single selector (not a selector list)
    const firstSelector = selectors.nodes[0];
    if (!firstSelector) return;

    let foundUtilityClass = false;
    let afterUtilityClass = false;
    const descendantParts: string[] = [];

    firstSelector.each((node) => {
      // First class node is the utility class
      if (node.type === 'class' && !foundUtilityClass) {
        // This is the utility class - unescape it
        utilityClass = unescapeTailwindClass(node.value);
        foundUtilityClass = true;
        return;
      }

      // After finding utility class, collect trailing attributes
      if (foundUtilityClass && !afterUtilityClass) {
        if (node.type === 'attribute') {
          trailingAttributes.push(node.toString());
        } else if (node.type === 'pseudo') {
          if (node.value.startsWith('::')) {
            pseudoElements.push(node.value);
          } else {
            pseudoClasses.push(node.value);
          }
        } else if (node.type === 'combinator') {
          // Found a combinator (space, >, +, ~) - everything after is descendant
          afterUtilityClass = true;
          hasDescendant = true;
        }
        return;
      }

      // After combinator, collect descendant selector parts
      if (afterUtilityClass) {
        descendantParts.push(node.toString());
      }
    });

    // Build descendant selector string
    if (descendantParts.length > 0) {
      descendantSelector = descendantParts.join('');
    }
  }).processSync(selector);

  return {
    original: selector,
    utilityClass,
    trailingAttributes,
    descendantSelector,
    hasDescendant,
    pseudoClasses,
    pseudoElements,
  };
}

/**
 * Unescape a Tailwind class name
 *
 * Tailwind escapes special characters in class names:
 * - `\:` → `:`
 * - `\[` → `[`
 * - `\]` → `]`
 * - `\/` → `/`
 * - `\&` → `&`
 * - `\_` → `_`
 * - `\.` → `.`
 * - `\=` → `=`
 *
 * @param escapedClass - Escaped class name from Tailwind CSS
 * @returns Unescaped class name
 */
export function unescapeTailwindClass(escapedClass: string): string {
  return escapedClass
    .replace(/\\:/g, ':')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\//g, '/')
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\\./g, '.')
    .replace(/\\=/g, '=');
}

/**
 * Extract utility class name from a selector for map lookup
 *
 * This strips trailing attribute selectors and pseudo-classes to get
 * the clean utility class name that matches the original utility string.
 *
 * Examples:
 * - `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon` → `[&[data-paused]_.play-icon]:opacity-100`
 * - `.flex` → `flex`
 * - `.hover\:bg-blue:hover` → `hover:bg-blue`
 *
 * @param selector - CSS selector string
 * @returns Utility class name for map lookup
 */
export function extractUtilityClassName(selector: string): string {
  const parsed = parseUtilitySelector(selector);
  return parsed.utilityClass;
}

/**
 * Build a rescoped selector by replacing the utility class with a base selector
 *
 * Handles:
 * - Simple utilities: `.flex` + `.button` → `.button`
 * - Pseudo-classes: `.hover\:bg-blue:hover` + `.button` → `.button:hover`
 * - Attribute selectors: `.flex[data-state="open"]` + `.button` → `.button[data-state="open"]`
 * - Arbitrary variants: `.\[\&_\.icon\]\:opacity-0 .icon` + `.button` → `.button .icon`
 * - Complex: `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon` + `.button` → `.button[data-paused] .play-icon`
 *
 * @param originalSelector - Original Tailwind selector
 * @param baseSelector - Base selector to rescope to (e.g., ".button")
 * @returns Rescoped selector
 */
export function rescopeSelector(originalSelector: string, baseSelector: string): string {
  const parsed = parseUtilitySelector(originalSelector);

  // Build rescoped selector parts
  const parts = [baseSelector];

  // Add trailing attributes (between utility class and descendant)
  if (parsed.trailingAttributes.length > 0) {
    parts.push(...parsed.trailingAttributes);
  }

  // Add pseudo-classes
  if (parsed.pseudoClasses.length > 0) {
    parts.push(...parsed.pseudoClasses);
  }

  // Add pseudo-elements
  if (parsed.pseudoElements.length > 0) {
    parts.push(...parsed.pseudoElements);
  }

  // Add descendant selector (with space combinator)
  if (parsed.descendantSelector) {
    parts.push(' ');
    parts.push(parsed.descendantSelector);
  }

  return parts.join('');
}

/**
 * Check if a selector is an arbitrary variant with descendant selector
 *
 * Arbitrary variants have patterns like:
 * - `.\[\&_\.icon\]\:opacity-0 .icon`
 * - `.\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon`
 *
 * They start with `.\[` and contain a descendant combinator (space).
 *
 * @param selector - CSS selector string
 * @returns True if this is an arbitrary variant with descendant
 */
export function isArbitraryVariantWithDescendant(selector: string): boolean {
  // Quick check: must start with .\[ and contain a space
  if (!selector.startsWith('.\\[\\&') || !selector.includes(' ')) {
    return false;
  }

  // Use parser to confirm it has a descendant
  const parsed = parseUtilitySelector(selector);
  return parsed.hasDescendant;
}
