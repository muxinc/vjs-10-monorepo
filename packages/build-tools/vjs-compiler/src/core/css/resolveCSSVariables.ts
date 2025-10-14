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
 */
function resolveVarReference(value: string, theme: ThemeVariables): string {
  // Pattern: var(--variable)
  const varPattern = /var\((--[\w-]+)\)/g;

  return value.replace(varPattern, (match, varName) => {
    const themeValue = theme[varName];
    if (!themeValue) {
      // Variable not found, keep original
      return match;
    }

    return themeValue;
  });
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
 * Extracts variables from :root and :host blocks
 */
function extractThemeVariables(css: string): ThemeVariables {
  const theme: ThemeVariables = {};
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
 * Resolve CSS variables in a stylesheet
 *
 * @param css - CSS string to process
 * @param options - Configuration for what to resolve
 * @returns CSS with resolved variables
 */
export function resolveCSSVariables(css: string, options: ResolveOptions = {}): string {
  // First, extract theme variables from the CSS itself
  const allThemeVars = extractThemeVariables(css);

  // Filter to only the variables we want to resolve
  const theme = filterTheme(allThemeVars, options);

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
    }

    // Then resolve direct var() references
    const afterVar = resolveVarReference(newValue, theme);
    if (afterVar !== newValue) {
      newValue = afterVar;
    }

    // Update if changed
    if (newValue !== decl.value) {
      decl.value = newValue;
    }
  });

  // After resolution, find which variables are still being used
  // (includes any variables that weren't resolved)
  const usedVars = findAllUsedVariables(root);

  // Remove definitions for variables that aren't used anywhere
  removeUnusedDefinitions(root, usedVars);

  return root.toString();
}
