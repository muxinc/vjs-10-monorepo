/**
 * Process CSS through PostCSS + Tailwind v4
 */

import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

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
    postcssProcessor = postcss([tailwindcss(), postcssNested()]);
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
 * Infer appropriate HTML element type from style key name
 *
 * Uses naming conventions to determine what element type would be most
 * appropriate for Tailwind to process variants correctly.
 *
 * @param styleKey - Style key name (e.g., "Button", "Input", "Container")
 * @returns HTML element name (e.g., "button", "input", "div")
 */
function inferElementType(styleKey: string): string {
  const lowerKey = styleKey.toLowerCase();

  // Interactive elements that benefit from :hover, :focus, :active
  if (lowerKey.includes('button')) return 'button';
  if (lowerKey.includes('input')) return 'input';
  if (lowerKey.includes('select')) return 'select';
  if (lowerKey.includes('textarea')) return 'textarea';
  if (lowerKey.includes('link')) return 'a';

  // Default to div for containers and other elements
  return 'div';
}

/**
 * Extract child class selectors from arbitrary variants
 *
 * Arbitrary variants like `[&_.icon]:opacity-0` reference child elements
 * that need to exist in the HTML for Tailwind to generate the CSS.
 *
 * Patterns we extract:
 * - `[&_.class]:utility` → `.class`
 * - `[&[data-foo]_.class]:utility` → `.class`
 * - `[&_.class]:[arbitrary]` → `.class`
 *
 * @param classString - Tailwind class string with arbitrary variants
 * @returns Array of child class names (without the dot)
 */
function extractChildClassSelectors(classString: string): string[] {
  const childClasses = new Set<string>();

  // Pattern: [&_.<class-name>] or [&[...]_.<class-name>]
  // Matches arbitrary variants that reference child classes
  // Examples:
  // - [&_.icon]:opacity-0 → captures "icon"
  // - [&[data-paused]_.play-icon]:opacity-100 → captures "play-icon"
  // - [&_.icon]:[grid-area:1/1] → captures "icon"
  const pattern = /\[&(?:\[[^\]]+\])?_\.([a-z0-9-]+)\]/gi;

  let match;
  while ((match = pattern.exec(classString)) !== null) {
    if (match[1]) {
      childClasses.add(match[1]);
    }
  }

  return Array.from(childClasses);
}

/**
 * Build HTML wrapper for Tailwind processing
 *
 * Tailwind v4 scans HTML to determine which classes to generate.
 * This function wraps class strings in appropriate HTML elements
 * to enable variant processing (pseudo-classes, data attributes, etc.)
 *
 * For arbitrary variants with child selectors (e.g., `[&_.icon]:opacity-0`),
 * we generate placeholder child elements so Tailwind can see the structure
 * and generate the appropriate CSS.
 *
 * @param classMap - Map of style keys to class strings
 * @returns HTML string with all classes
 */
export function buildHTMLForTailwind(classMap: Record<string, string>): string {
  const elements = Object.entries(classMap).map(([key, classString]) => {
    // Infer appropriate element type for better variant support
    const elementType = inferElementType(key);

    // Add common attributes that might be referenced in variants
    const attributes = [`class="${classString}"`, `data-style-key="${key}"`];

    // Add data attributes that might be used in selectors
    // This helps Tailwind process data-[attr] variants
    if (classString.includes('data-[')) {
      // Extract data attribute names from the class string
      const dataAttrMatches = classString.match(/data-\[([^\]=]+)/g);
      if (dataAttrMatches) {
        for (const match of dataAttrMatches) {
          const attrName = match.replace('data-[', '');
          // Add a placeholder data attribute so Tailwind sees it
          attributes.push(`data-${attrName}="placeholder"`);
        }
      }
    }

    // Extract child class selectors from arbitrary variants
    const childClasses = extractChildClassSelectors(classString);

    // Build child elements if any child selectors were found
    const childElements = childClasses.length > 0
      ? '\n  ' + childClasses.map(className => `<span class="${className}"></span>`).join('\n  ') + '\n'
      : '';

    return `<${elementType} ${attributes.join(' ')}>${childElements}</${elementType}>`;
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

  // DEBUG: Log generated HTML
  if (process.env.DEBUG_TAILWIND) {
    console.log('=== Generated HTML for Tailwind ===');
    console.log(html);
    console.log('=== End HTML ===\n');
  }

  // Build Tailwind config with content and theme
  const tailwindConfig: TailwindConfig = {
    content: [{ raw: html, extension: 'html' }],
    darkMode: 'media', // Enable dark mode with media query strategy
    corePlugins: {
      preflight: false, // Don't include reset styles
    },
    theme: {
      extend: {
        // Add default spacing scale (for p-*, px-*, gap-*, etc.)
        spacing: {
          0: '0px',
          1: '0.25rem', // 4px
          2: '0.5rem', // 8px
          3: '0.75rem', // 12px
          4: '1rem', // 16px
          5: '1.25rem', // 20px
          6: '1.5rem', // 24px
          8: '2rem', // 32px
          10: '2.5rem', // 40px
          12: '3rem', // 48px
          16: '4rem', // 64px
        },
        // Add border-radius values (for rounded)
        borderRadius: {
          none: '0px',
          sm: '0.125rem', // 2px
          DEFAULT: '0.25rem', // 4px (for just "rounded")
          md: '0.375rem', // 6px
          lg: '0.5rem', // 8px
          xl: '0.75rem', // 12px
          '2xl': '1rem', // 16px
          full: '9999px',
        },
        // Add flex values (for flex-1, flex-auto, etc.)
        flex: {
          1: '1 1 0%',
          auto: '1 1 auto',
          initial: '0 1 auto',
          none: 'none',
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
  /* Color palette */
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  --color-white: #ffffff;

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
  // NOTE: postcss-nested is REQUIRED because Tailwind v4 outputs nested CSS with & syntax
  // for arbitrary variants like `[&_.icon]:opacity-0`, which become:
  //   .\[\&_\.icon\]\:opacity-0 {
  //     & .icon { opacity: 0; }
  //   }
  // postcss-nested flattens this to: `.\[\&_\.icon\]\:opacity-0 .icon { opacity: 0; }`
  const result = await postcss([tailwindPlugin, postcssNested()]).process(inputCSS, {
    from: undefined,
    map: false,
  });

  // DEBUG: Log Tailwind output
  if (process.env.DEBUG_TAILWIND) {
    console.log('=== Tailwind CSS Output (after PostCSS) ===');
    console.log(result.css);
    console.log('=== End Tailwind Output ===\n');

    // Check if descendant selectors are present
    const hasDescendantSelectors = result.css.includes('\\[\\&');
    console.log(`[DEBUG] Has descendant selectors with \\[\\&: ${hasDescendantSelectors}`);

    if (hasDescendantSelectors) {
      const matches = result.css.match(/\.\\\[\\&[^\s]+\s+[^\{]+\{/g);
      console.log(`[DEBUG] Found ${matches ? matches.length : 0} descendant selector patterns`);
      if (matches) {
        console.log('[DEBUG] Patterns:', matches.slice(0, 3));
      }
    }
  }

  return result.css;
}
