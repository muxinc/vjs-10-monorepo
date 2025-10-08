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

  // Build Tailwind config with content and theme
  const tailwindConfig: TailwindConfig = {
    content: [{ raw: html, extension: 'html' }],
    corePlugins: {
      preflight: false, // Don't include reset styles
    },
    theme: {
      extend: {
        // Add default spacing scale (for p-*, px-*, gap-*, etc.)
        spacing: {
          '0': '0px',
          '1': '0.25rem', // 4px
          '2': '0.5rem',  // 8px
          '3': '0.75rem', // 12px
          '4': '1rem',    // 16px
          '5': '1.25rem', // 20px
          '6': '1.5rem',  // 24px
          '8': '2rem',    // 32px
          '10': '2.5rem', // 40px
          '12': '3rem',   // 48px
          '16': '4rem',   // 64px
        },
        // Add border-radius values (for rounded)
        borderRadius: {
          'none': '0px',
          'sm': '0.125rem',   // 2px
          'DEFAULT': '0.25rem', // 4px (for just "rounded")
          'md': '0.375rem',   // 6px
          'lg': '0.5rem',     // 8px
          'xl': '0.75rem',    // 12px
          '2xl': '1rem',      // 16px
          'full': '9999px',
        },
        // Add flex values (for flex-1, flex-auto, etc.)
        flex: {
          '1': '1 1 0%',
          'auto': '1 1 auto',
          'initial': '0 1 auto',
          'none': 'none',
        },
      },
    },
  };

  // Create Tailwind plugin with config
  const tailwindPlugin = (tailwindcss as unknown as TailwindPluginFactory)({ config: tailwindConfig });

  // Build input CSS with Tailwind directives (v4 syntax) + theme customization
  // NOTE: @theme defines CSS variables, but we also need a :root rule to make them available
  const inputCSS = `
@theme {
  /* Spacing scale */
  --spacing-0: 0px;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* Border radius */
  --radius: 0.25rem;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

/* Make theme variables available in shadow DOM */
:host {
  --spacing-0: 0px;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --radius: 0.25rem;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

@tailwind utilities;
`;

  // Process through PostCSS
  const result = await postcss([tailwindPlugin, postcssNested()]).process(inputCSS, {
    from: undefined,
    map: false,
  });

  return result.css;
}
