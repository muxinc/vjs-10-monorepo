/**
 * Process CSS through PostCSS + Tailwind v4
 */

import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

import postcssNested from 'postcss-nested';

import { processTailwindWithCLI } from './processCSSWithCLI';

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
 * Extract all Tailwind classes from styles object
 *
 * Splits class strings and collects unique class names for safelist.
 * This ensures Tailwind generates CSS for all classes, including:
 * - Responsive variants (sm:, md:, lg:)
 * - Arbitrary values (bg-[#hex], w-[clamp(...)])
 * - Complex variants that might not parse from HTML
 *
 * @param styles - Map of style keys to Tailwind class strings
 * @returns Array of unique class names
 */
function extractAllClasses(styles: Record<string, string>): string[] {
  const allClasses = new Set<string>();

  for (const classString of Object.values(styles)) {
    // Split by whitespace and filter out empty strings
    const classes = classString.split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      allClasses.add(cls);
    }
  }

  return Array.from(allClasses);
}

/**
 * Detect if styles contain container query utilities
 *
 * Container queries (@container) require Tailwind CLI processing because
 * the PostCSS plugin API doesn't generate @container at-rules properly.
 *
 * @param styles - Map of style keys to Tailwind class strings
 * @returns true if container queries detected
 */
function hasContainerQueries(styles: Record<string, string>): boolean {
  for (const classString of Object.values(styles)) {
    // Check for @container/name definition or @size/name: queries
    const hasLiteral = classString.includes('@container');
    const hasPattern = /@[a-z]+\/[a-z]+:/i.test(classString);

    if (process.env.DEBUG_TAILWIND_CLI) {
      if (hasLiteral || hasPattern) {
        console.log('[DEBUG] Container query detected in:', classString.substring(0, 100));
        console.log('[DEBUG]   hasLiteral:', hasLiteral, 'hasPattern:', hasPattern);
      }
    }

    if (hasLiteral || hasPattern) {
      return true;
    }
  }

  if (process.env.DEBUG_TAILWIND_CLI) {
    console.log('[DEBUG] No container queries detected');
  }

  return false;
}

/**
 * Process Tailwind classes through Tailwind v4
 *
 * Takes a styles object, generates HTML, processes through Tailwind,
 * and returns the raw CSS output.
 *
 * Strategy:
 * 1. Build HTML with all classes (for Tailwind to scan)
 * 2. Build safelist with all classes (ensures complex patterns generate)
 * 3. Pass both to Tailwind config
 *
 * The safelist is critical for:
 * - Responsive breakpoints (sm:p-6, md:p-8, lg:p-12)
 * - Arbitrary values (bg-[#1da1f2], w-[clamp(...)])
 * - Complex variants that Tailwind v4 might not parse from HTML
 *
 * PROCESSING METHOD:
 * - Uses PostCSS plugin API by default (fast, in-memory)
 * - Automatically switches to CLI for container queries (slow, file-based, but fully featured)
 * - Can force CLI mode with USE_TAILWIND_CLI=1 environment variable
 *
 * @param styles - Map of style keys to Tailwind class strings
 * @returns Raw CSS from Tailwind processing
 */
export async function processTailwindClasses(styles: Record<string, string>): Promise<string> {
  // Check if we should use CLI-based processing
  const useCLI = process.env.USE_TAILWIND_CLI === '1' || hasContainerQueries(styles);

  if (useCLI) {
    // Use file-based CLI processing for full @theme/@container support
    const html = buildHTMLForTailwind(styles);
    return processTailwindWithCLI(styles, html);
  }

  // Use PostCSS plugin API (default - faster, but limited features)
  // Build HTML with all classes for scanning
  const html = buildHTMLForTailwind(styles);

  // Extract all classes for safelist (ensures responsive + arbitrary values generate)
  const safelist = extractAllClasses(styles);

  // DEBUG: Log generated HTML and safelist
  if (process.env.DEBUG_TAILWIND) {
    console.log('=== Generated HTML for Tailwind ===');
    console.log(html);
    console.log('=== End HTML ===\n');
    console.log('=== Safelist ===');
    console.log(safelist.slice(0, 20).join(', ') + (safelist.length > 20 ? '...' : ''));
    console.log(`Total: ${safelist.length} classes\n`);
  }

  // Build Tailwind config with content, safelist, and theme
  const tailwindConfig: TailwindConfig = {
    content: [{ raw: html, extension: 'html' }],
    safelist, // Explicitly tell Tailwind to generate CSS for all classes
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
        // NOTE: Tailwind v4 does NOT support theme.extend.colors configuration!
        // Unlike v3, colors must be defined via @theme CSS directives, not JS config.
        // Use arbitrary values (bg-[#hex]) instead of semantic classes (bg-blue-500).
        // See: https://tailwindcss.com/docs/v4-beta#migrating-from-v3
      },
    },
  };

  // Create Tailwind plugin with config
  const tailwindPlugin = (tailwindcss as unknown as TailwindPluginFactory)({ config: tailwindConfig });

  // Build input CSS with Tailwind directives (v4 syntax)
  //
  // LIMITATION: Tailwind v4 semantic color classes (like bg-blue-500) are NOT supported
  // in programmatic PostCSS plugin usage.
  //
  // ROOT CAUSE: The @theme directive is only processed in the main entry file that
  // Tailwind directly processes (e.g., via @import 'tailwindcss' in a CSS file).
  // When @theme CSS is passed programmatically as a string to the PostCSS plugin,
  // Tailwind does NOT process the @theme directive.
  //
  // See: https://github.com/tailwindlabs/tailwindcss/issues/18966
  //
  // This is a fundamental limitation of Tailwind v4's CSS-first architecture.
  // Normal apps work because they use @import 'tailwindcss' in CSS files, which
  // triggers Tailwind to process the @theme directives. But programmatic usage
  // via the PostCSS plugin API doesn't have this capability.
  //
  // WORKAROUND: Use arbitrary color values:
  //   bg-blue-500 → bg-[#3b82f6]     (or bg-[oklch(62.3% 0.214 259.815)])
  //   bg-blue-600 → bg-[#2563eb]     (or bg-[oklch(54.6% 0.245 262.881)])
  //
  // FUTURE SOLUTION: This may require:
  //   1. Using a different Tailwind plugin/API that supports theme processing
  //   2. Waiting for Tailwind v4 to add programmatic theme support
  //   3. Pre-processing CSS files through Tailwind's file-based pipeline
  //
  // See: TEST_SKIN_PROGRESSION.md - Level 7 (Semantic Colors) for tracking
  //
  // IMPORTANT: We need to include @tailwind theme to get the :host rule with CSS variables
  // like --spacing, which are used in utility classes like p-3 → calc(var(--spacing) * 3)
  const inputCSS = `
@tailwind theme;
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
