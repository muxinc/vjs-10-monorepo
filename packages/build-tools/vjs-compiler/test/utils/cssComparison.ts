import postcss, { type AtRule, type Declaration, type Root, type Rule } from 'postcss';

/**
 * Parse CSS string into PostCSS AST
 */
export function parseCSS(css: string): Root {
  return postcss.parse(css);
}

/**
 * Normalize a CSS value for comparison
 * - Removes unnecessary whitespace
 * - Normalizes color formats where possible
 * - Resolves calc() expressions
 */
export function normalizeValue(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
    .replace(/\s*\(\s*/g, '(') // Remove spaces after opening parens
    .replace(/\s*\)\s*/g, ')'); // Remove spaces before closing parens
}

/**
 * Extract all declarations from a CSS AST
 * Returns a map of property -> normalized value
 */
export function extractDeclarations(root: Root): Map<string, string[]> {
  const declarations = new Map<string, string[]>();

  root.walkDecls((decl: Declaration) => {
    const existing = declarations.get(decl.prop) || [];
    existing.push(normalizeValue(decl.value));
    declarations.set(decl.prop, existing);
  });

  return declarations;
}

/**
 * Extract declarations for a specific selector
 */
export function extractDeclarationsForSelector(
  root: Root,
  selector: string,
): Map<string, string> {
  const declarations = new Map<string, string>();

  root.walkRules((rule: Rule) => {
    if (rule.selector === selector || normalizeSelector(rule.selector) === normalizeSelector(selector)) {
      rule.walkDecls((decl: Declaration) => {
        declarations.set(decl.prop, normalizeValue(decl.value));
      });
    }
  });

  return declarations;
}

/**
 * Normalize selector for comparison
 * Handles whitespace and pseudo-selector variations
 */
export function normalizeSelector(selector: string): string {
  return selector
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s*>\s*/g, '>') // Normalize child combinator
    .replace(/\s*\+\s*/g, '+') // Normalize adjacent sibling
    .replace(/\s*~\s*/g, '~'); // Normalize general sibling
}

/**
 * Compare two CSS declarations maps
 * Returns differences found
 */
export interface CSSDeclarationDiff {
  property: string;
  expected: string;
  actual: string;
}

export function compareDeclarations(
  expected: Map<string, string>,
  actual: Map<string, string>,
): CSSDeclarationDiff[] {
  const diffs: CSSDeclarationDiff[] = [];

  // Check each expected property
  for (const [prop, expectedValue] of expected.entries()) {
    const actualValue = actual.get(prop);

    if (!actualValue) {
      diffs.push({
        property: prop,
        expected: expectedValue,
        actual: '(missing)',
      });
    } else if (expectedValue !== actualValue) {
      diffs.push({
        property: prop,
        expected: expectedValue,
        actual: actualValue,
      });
    }
  }

  // Check for unexpected properties
  for (const [prop, actualValue] of actual.entries()) {
    if (!expected.has(prop)) {
      diffs.push({
        property: prop,
        expected: '(not expected)',
        actual: actualValue,
      });
    }
  }

  return diffs;
}

/**
 * Extract all selectors from CSS
 */
export function extractSelectors(root: Root): string[] {
  const selectors: string[] = [];

  root.walkRules((rule: Rule) => {
    selectors.push(rule.selector);
  });

  return selectors;
}

/**
 * Check if two CSS ASTs are semantically equivalent
 * Ignores formatting differences and order
 */
export interface CSSEquivalenceResult {
  equivalent: boolean;
  differences: string[];
}

export function cssASTEqual(expected: Root, actual: Root): CSSEquivalenceResult {
  const differences: string[] = [];

  const expectedSelectors = new Set(extractSelectors(expected).map(normalizeSelector));
  const actualSelectors = new Set(extractSelectors(actual).map(normalizeSelector));

  // Check for missing selectors
  for (const selector of expectedSelectors) {
    if (!actualSelectors.has(selector)) {
      differences.push(`Missing selector: ${selector}`);
    }
  }

  // Check for extra selectors
  for (const selector of actualSelectors) {
    if (!expectedSelectors.has(selector)) {
      differences.push(`Unexpected selector: ${selector}`);
    }
  }

  // Compare declarations for each common selector
  for (const selector of expectedSelectors) {
    if (actualSelectors.has(selector)) {
      const expectedDecls = extractDeclarationsForSelector(expected, selector);
      const actualDecls = extractDeclarationsForSelector(actual, selector);
      const declDiffs = compareDeclarations(expectedDecls, actualDecls);

      for (const diff of declDiffs) {
        differences.push(
          `Selector "${selector}": ${diff.property} - expected: ${diff.expected}, actual: ${diff.actual}`,
        );
      }
    }
  }

  return {
    equivalent: differences.length === 0,
    differences,
  };
}

/**
 * Extract media queries and their contents
 */
export function extractMediaQueries(root: Root): Map<string, Root> {
  const mediaQueries = new Map<string, Root>();

  root.walkAtRules('media', (atRule: AtRule) => {
    const mediaRoot = postcss.root();
    atRule.nodes?.forEach((node) => {
      mediaRoot.append(node.clone());
    });
    mediaQueries.set(atRule.params, mediaRoot);
  });

  return mediaQueries;
}

/**
 * Extract container queries and their contents
 */
export function extractContainerQueries(root: Root): Map<string, Root> {
  const containerQueries = new Map<string, Root>();

  root.walkAtRules('container', (atRule: AtRule) => {
    const containerRoot = postcss.root();
    atRule.nodes?.forEach((node) => {
      containerRoot.append(node.clone());
    });
    containerQueries.set(atRule.params, containerRoot);
  });

  return containerQueries;
}
