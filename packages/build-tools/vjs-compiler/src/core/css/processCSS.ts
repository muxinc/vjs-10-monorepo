/**
 * Process CSS through PostCSS + Tailwind v4
 */

import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import postcssNested from 'postcss-nested';

// Type for Tailwind plugin factory (v4)
type TailwindPluginFactory = (options: { config: TailwindConfig }) => postcss.Plugin;
type TailwindConfig = Record<string, unknown>;

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
  // Build HTML with all classes for scanning
  const html = buildHTMLForTailwind(styles);

  // Build Tailwind config with content
  const tailwindConfig: TailwindConfig = {
    content: [{ raw: html, extension: 'html' }],
    corePlugins: {
      preflight: false, // Don't include reset styles
    },
  };

  // Create Tailwind plugin with config
  const tailwindPlugin = (tailwindcss as unknown as TailwindPluginFactory)({ config: tailwindConfig });

  // Build input CSS with Tailwind directives (v4 syntax)
  const inputCSS = `@tailwind utilities;`;

  // Process through PostCSS
  const result = await postcss([tailwindPlugin, postcssNested()]).process(inputCSS, {
    from: undefined,
    map: false,
  });

  return result.css;
}
