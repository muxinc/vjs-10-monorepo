/**
 * Resolve CSS variables to concrete values
 *
 * This post-processes CSS output to replace CSS variable references with their
 * resolved values, making the output self-contained and easier to read.
 *
 * Part of the "inline-vanilla" CSS strategy's goal of producing terse,
 * human-readable CSS output.
 */

import postcss from 'postcss';

import type { Declaration } from 'postcss';

export interface ThemeVariables {
  [key: string]: string | undefined;
}

/**
 * Tailwind v4 default theme variables
 *
 * WORKAROUND: Tailwind v4's PostCSS plugin doesn't generate theme variables when used
 * programmatically. The @tailwind theme directive works in file-based workflows, but not
 * when using the PostCSS plugin API.
 *
 * These hardcoded defaults ensure spacing utilities like p-3, inset-0, gap-2, etc. can be
 * resolved properly even though Tailwind doesn't emit the :host { --spacing: 0.25rem } rule.
 *
 * This is the same root cause as semantic colors not working (see processCSS.ts line 286-310).
 *
 * See: https://github.com/tailwindlabs/tailwindcss/issues/18966
 */
const TAILWIND_DEFAULT_THEME: ThemeVariables = {
  // Spacing scale - used by p-*, m-*, gap-*, inset-*, top-*, etc.
  // Default: 0.25rem (4px) per unit
  '--spacing': '0.25rem',
};

interface ParsedValue {
  value: number;
  unit: string;
}

/**
 * Parse a CSS value like "0.25rem" into { value: 0.25, unit: "rem" }
 */
function parseValue(cssValue: string | undefined): ParsedValue | null {
  if (!cssValue) return null;

  const match = cssValue.trim().match(/^([-\d.]+)([a-z%]*)$/i);
  if (!match || !match[1]) return null;

  return {
    value: Number.parseFloat(match[1]),
    unit: match[2] || '',
  };
}

/**
 * Resolve calc(var(--name) * N) expressions
 *
 * Matches patterns like:
 * - calc(var(--spacing) * 3)
 * - calc(var(--spacing) * 0.5)
 * - calc(var(--spacing) * 2.5)
 */
function resolveCalcExpression(value: string, theme: ThemeVariables): string {
  // Pattern: calc(var(--variable) * number)
  const calcPattern = /calc\(var\((--[\w-]+)\)\s*\*\s*([\d.]+)\)/g;

  return value.replace(calcPattern, (match, varName, multiplier) => {
    const themeValue = theme[varName];
    if (!themeValue) {
      // Variable not found in theme, keep original
      return match;
    }

    const parsed = parseValue(themeValue);
    if (!parsed) {
      // Can't parse theme value, keep original
      return match;
    }

    const result = parsed.value * Number.parseFloat(multiplier);
    return `${result}${parsed.unit}`;
  });
}

/**
 * Resolve direct var() references
 *
 * Matches patterns like:
 * - var(--spacing)
 * - var(--color-white)
 * - var(--spacing, fallback) - uses fallback if variable not found
 *
 * Also removes invalid var() references (undefined variables with no fallback)
 * and cleans up redundant spaces.
 *
 * Returns both the resolved value and which variables were resolved
 */
function resolveVarReference(
  value: string,
  theme: ThemeVariables
): { value: string; resolved: string[] } {
  const resolved: string[] = [];
  // Pattern: var(--variable, optional-fallback)
  // Captures fallback separately to handle it properly
  const varPattern = /var\((--[\w-]+)(?:,\s*([^)]*))?\)/g;

  const newValue = value.replace(varPattern, (match, varName, fallback) => {
    const themeValue = theme[varName];
    if (themeValue) {
      // Variable found, resolve it
      resolved.push(varName);
      return themeValue;
    }

    // Variable not found
    if (fallback && fallback.trim()) {
      // Use fallback if provided and non-empty
      return fallback.trim();
    }

    // No variable and no useful fallback - remove the reference
    // This handles cases like var(--tw-backdrop-brightness,) with empty fallback
    return '';
  });

  // Clean up multiple spaces and trim
  return {
    value: newValue.replace(/\s+/g, ' ').trim(),
    resolved,
  };
}

export interface ResolveOptions {
  /**
   * Which categories of variables to resolve
   * Default: ['all'] (resolve everything for terse output)
   */
  resolve?: ('spacing' | 'colors' | 'all')[];
}

/**
 * Build theme variable map from CSS
 *
 * Extracts variables from:
 * - :root and :host blocks (traditional theme definitions)
 * - @theme blocks (Tailwind v4)
 * - Inline definitions (Tailwind v4 utilities like transitions/transforms)
 */
function extractThemeVariables(css: string): ThemeVariables {
  // Start with Tailwind default theme variables (workaround for programmatic API limitation)
  const theme: ThemeVariables = { ...TAILWIND_DEFAULT_THEME };
  const root = postcss.parse(css);

  // Extract from :root blocks
  root.walkRules(':root', (rule) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        theme[decl.prop] = decl.value;
      }
    });
  });

  // Extract from :host blocks (Shadow DOM)
  root.walkRules(':host', (rule) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        theme[decl.prop] = decl.value;
      }
    });
  });

  // Extract from @theme blocks (Tailwind v4)
  root.walkAtRules('theme', (atRule) => {
    const themeContent = postcss.parse(`${atRule.params} {${atRule.nodes?.map((n) => n.toString()).join('')}}`);
    themeContent.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        theme[decl.prop] = decl.value;
      }
    });
  });

  // IMPORTANT: Also extract inline variable definitions from ALL rules
  // Tailwind v4 defines variables like --tw-scale-x, --tw-duration inline
  // within the same rule where they're used
  root.walkRules((rule) => {
    // Skip :root and :host since we already processed them
    if (rule.selector === ':root' || rule.selector === ':host') {
      return;
    }

    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        theme[decl.prop] = decl.value;
      }
    });
  });

  return theme;
}

/**
 * Determine if a variable should be resolved based on options
 */
function shouldResolveVariable(varName: string, options: ResolveOptions): boolean {
  const resolveList = options.resolve || ['all'];

  if (resolveList.includes('all')) {
    return true;
  }

  if (resolveList.includes('spacing')) {
    // Resolve spacing-related variables
    if (varName.startsWith('--spacing')) return true;
    if (varName.startsWith('--radius')) return true;
  }

  if (resolveList.includes('colors')) {
    // Resolve color-related variables
    if (varName.startsWith('--color-')) return true;
    if (varName.startsWith('--tw-')) return true; // Tailwind internal vars
  }

  return false;
}

/**
 * Filter theme to only variables we want to resolve
 */
function filterTheme(theme: ThemeVariables, options: ResolveOptions): ThemeVariables {
  const filtered: ThemeVariables = {};

  for (const [key, value] of Object.entries(theme)) {
    if (shouldResolveVariable(key, options)) {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Find all CSS variable references in the stylesheet
 *
 * This scans all property values (excluding variable definitions in :host/:root)
 * to find which variables are actually used.
 */
function findAllUsedVariables(root: postcss.Root): Set<string> {
  const usedVars = new Set<string>();
  const varPattern = /var\((--[\w-]+)\)/g;

  root.walkDecls((decl: Declaration) => {
    // Skip variable definitions in :host and :root
    if (decl.prop.startsWith('--')) {
      const parent = decl.parent;
      if (parent && 'selector' in parent) {
        const selector = parent.selector;
        if (selector === ':host' || selector === ':root') {
          return; // Skip this declaration
        }
      }
    }

    // Find all var() references in the value
    const matches = decl.value.matchAll(varPattern);
    for (const match of matches) {
      if (match[1]) {
        usedVars.add(match[1]);
      }
    }
  });

  return usedVars;
}

/**
 * Remove CSS variable definitions that are not used anywhere
 *
 * This keeps the output clean by removing unused variable declarations
 * from :host and :root blocks.
 */
function removeUnusedDefinitions(root: postcss.Root, usedVars: Set<string>): void {
  root.walkRules((rule) => {
    if (rule.selector === ':host' || rule.selector === ':root') {
      // Remove declarations for variables that aren't used
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--') && !usedVars.has(decl.prop)) {
          decl.remove();
        }
      });

      // Remove the rule if it's now empty
      if (rule.nodes && rule.nodes.length === 0) {
        rule.remove();
      }
    }
  });
}

/**
 * Remove inline CSS variable definitions that were resolved
 *
 * Tailwind v4 defines variables like --tw-scale-x inline within rules.
 * After resolving these to concrete values, we should remove the definitions
 * to keep the output clean and terse.
 *
 * Also removes ALL unused inline variable definitions (not referenced anywhere).
 *
 * This removes variable definitions from rules EXCEPT :host and :root
 * (those are handled by removeUnusedDefinitions).
 */
function removeInlineDefinitions(root: postcss.Root, resolvedVars: Set<string>): void {
  // First find all variables that are actually referenced
  const referencedVars = new Set<string>();
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) {
      const varPattern = /var\((--[\w-]+)/g;
      const matches = decl.value.matchAll(varPattern);
      for (const match of matches) {
        if (match[1]) {
          referencedVars.add(match[1]);
        }
      }
    }
  });

  root.walkRules((rule) => {
    // Skip :host and :root - those are theme definitions we want to keep
    if (rule.selector === ':host' || rule.selector === ':root') {
      return;
    }

    // Remove inline variable definitions that were:
    // 1. Resolved (no longer needed)
    // 2. Not referenced anywhere (unused)
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        const varName = decl.prop;
        if (resolvedVars.has(varName) || !referencedVars.has(varName)) {
          decl.remove();
        }
      }
    });
  });
}

/**
 * Resolve CSS variables in a stylesheet
 *
 * @param css - CSS string to process
 * @param options - Configuration for what to resolve
 * @returns CSS with resolved variables
 */
export function resolveCSSVariables(css: string, options: ResolveOptions = {}): string {
  // First, extract theme variables from the CSS itself (including inline definitions)
  const allThemeVars = extractThemeVariables(css);

  // Filter to only the variables we want to resolve
  const theme = filterTheme(allThemeVars, options);

  // Track which variables we successfully resolved
  const resolvedVars = new Set<string>();

  // Parse CSS
  const root = postcss.parse(css);

  // Walk all declarations and resolve values
  root.walkDecls((decl: Declaration) => {
    // Skip variable definitions in :host/:root (we only resolve usage)
    if (decl.prop.startsWith('--')) {
      const parent = decl.parent;
      if (parent && 'selector' in parent) {
        const selector = parent.selector;
        if (selector === ':host' || selector === ':root') {
          return; // Skip this declaration
        }
      }
    }

    let newValue = decl.value;

    // First resolve calc() expressions (these are higher priority)
    const afterCalc = resolveCalcExpression(newValue, theme);
    if (afterCalc !== newValue) {
      newValue = afterCalc;
      // Track variables in the original value that might have been resolved
      const varPattern = /var\((--[\w-]+)\)/g;
      const matches = decl.value.matchAll(varPattern);
      for (const match of matches) {
        if (match[1] && theme[match[1]]) {
          resolvedVars.add(match[1]);
        }
      }
    }

    // Then resolve direct var() references
    const result = resolveVarReference(newValue, theme);
    if (result.value !== newValue) {
      newValue = result.value;
      // Track which variables were resolved
      for (const varName of result.resolved) {
        resolvedVars.add(varName);
      }
    }

    // Update if changed
    if (newValue !== decl.value) {
      decl.value = newValue;
    }
  });

  // Remove inline variable definitions that were resolved
  // (e.g., --tw-scale-x: 100% in .button {})
  removeInlineDefinitions(root, resolvedVars);

  // Remove redundant property declarations
  // (e.g., when same property appears twice due to variable resolution)
  root.walkRules((rule) => {
    const seenProps = new Map<string, postcss.Declaration[]>();

    // Collect all declarations grouped by property
    rule.walkDecls((decl) => {
      if (!seenProps.has(decl.prop)) {
        seenProps.set(decl.prop, []);
      }
      seenProps.get(decl.prop)!.push(decl);
    });

    // For properties that appear multiple times, keep only the last one
    for (const [prop, decls] of seenProps) {
      if (decls.length > 1) {
        // Remove all but the last declaration
        for (let i = 0; i < decls.length - 1; i++) {
          decls[i].remove();
        }
      }
    }
  });

  // After resolution, find which variables are still being used
  // (includes any variables that weren't resolved)
  const usedVars = findAllUsedVariables(root);

  // Remove definitions for variables that aren't used anywhere
  // (from :host and :root blocks)
  removeUnusedDefinitions(root, usedVars);

  return root.toString();
}
