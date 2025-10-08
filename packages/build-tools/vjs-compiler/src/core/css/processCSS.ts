/**
 * Process CSS through PostCSS + Tailwind v4
 */

import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import postcssNested from 'postcss-nested';

/**
 * PostCSS processor instance (cached)
 */
let postcssProcessor: postcss.Processor | null = null;

/**
 * Get or create PostCSS processor
 *
 * Configured with:
 * - Tailwind CSS v4
 * - postcss-nested (for flattening nested rules)
 *
 * @returns PostCSS processor
 */
function getPostCSSProcessor(): postcss.Processor {
  if (!postcssProcessor) {
    postcssProcessor = postcss([
      tailwindcss(),
      postcssNested(),
    ]);
  }
  return postcssProcessor;
}

/**
 * Process CSS string through PostCSS + Tailwind
 *
 * @param css - Input CSS string
 * @param from - Source filename (optional, for error messages)
 * @returns Processed CSS string
 */
export async function processCSS(css: string, from?: string): Promise<string> {
  const processor = getPostCSSProcessor();

  const result = await processor.process(css, {
    from: from || undefined,
  });

  return result.css;
}

/**
 * Build HTML wrapper for Tailwind processing
 *
 * Tailwind v4 scans HTML to determine which classes to generate.
 * This function wraps class strings in HTML for processing.
 *
 * @param classMap - Map of style keys to class strings
 * @returns HTML string with all classes
 */
export function buildHTMLForTailwind(classMap: Record<string, string>): string {
  const elements = Object.entries(classMap).map(([key, classString]) => {
    return `<div class="${classString}" data-style-key="${key}"></div>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${elements.join('\n')}
</body>
</html>`;
}

/**
 * Process Tailwind classes through Tailwind v4
 *
 * Takes a styles object, generates HTML, processes through Tailwind,
 * and returns the raw CSS output.
 *
 * @param styles - Map of style keys to Tailwind class strings
 * @returns Raw CSS from Tailwind processing
 */
export async function processTailwindClasses(styles: Record<string, string>): Promise<string> {
  // TODO: Phase 3+ - Implement proper Tailwind v4 processing
  // Current issue: Need to configure Tailwind v4 content scanning correctly
  // The plugin needs to scan the HTML to generate utility CSS

  // For now, return empty string to trigger fallback in transformStyles
  // Phase 3+ will build HTML and process through Tailwind
  void styles; // Suppress unused parameter warning
  return '';

  // Phase 3+ implementation will look like:
  // 1. Build HTML with buildHTMLForTailwind(styles)
  // 2. Configure Tailwind v4 with content scanning
  // 3. Process @import "tailwindcss" with HTML content
  // 4. Extract generated utility CSS
  // 5. Return CSS string for rescoping
}
