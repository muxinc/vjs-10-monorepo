/**
 * Placeholder CSS Generation
 *
 * Generates basic CSS stubs for extracted classNames.
 * TODO: Replace with actual Tailwind processing in future iteration.
 */

export interface CSSResult {
  /** Generated CSS string */
  css: string;
  /** Class names that were processed */
  classNames: string[];
}

/**
 * Generate placeholder CSS from class names
 */
export function generatePlaceholderCSS(classNames: Set<string>): CSSResult {
  const classes = Array.from(classNames).sort();

  if (classes.length === 0) {
    return { css: '/* No classes found */', classNames: [] };
  }

  const rules = classes.map((className) => {
    return `.${className} {\n  /* TODO: Add styles */\n}`;
  });

  const css = `/**
 * Placeholder CSS
 * Generated from extracted classNames
 * TODO: Replace with Tailwind processing
 */

${rules.join('\n\n')}
`;

  return {
    css,
    classNames: classes,
  };
}

/**
 * Generate element selector CSS (for Component Selector IDs)
 * e.g., "Container" → "media-container { }"
 */
export function generateElementSelectorCSS(
  elementName: string,
  prefix: string = 'media-',
): string {
  const kebabCase = elementName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  return `${prefix}${kebabCase} {\n  /* TODO: Add styles */\n}`;
}
