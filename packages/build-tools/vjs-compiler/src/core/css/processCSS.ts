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
 * @param classes - Array of class strings
 * @returns HTML string with all classes
 */
export function buildHTMLForTailwind(classes: string[]): string {
  const elements = classes.map((classString, index) => {
    return `<div class="${classString}" data-key="${index}"></div>`;
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
