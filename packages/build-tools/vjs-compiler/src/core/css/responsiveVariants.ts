/**
 * Responsive variant parsing and transformation
 *
 * Transforms standard Tailwind responsive syntax (sm:, md:, lg:) into
 * container query CSS since Tailwind v4 doesn't auto-generate responsive
 * media queries.
 *
 * Strategy:
 * 1. Parse class strings to extract responsive variants (e.g., "sm:p-6" → {breakpoint: "sm", utility: "p-6"})
 * 2. For each responsive variant, get base CSS from Tailwind (e.g., CSS for "p-6")
 * 3. Wrap base CSS in container query (e.g., "@container (min-width: 24rem) { .Wrapper { padding: 1.5rem; } }")
 */

export interface ResponsiveVariant {
  /** Original class with breakpoint (e.g., "sm:p-6") */
  originalClass: string;
  /** Breakpoint name (e.g., "sm", "md", "lg") */
  breakpoint: string;
  /** Base utility without breakpoint (e.g., "p-6") */
  utility: string;
  /** Whether this is a pseudo-class variant (e.g., "sm:hover:bg-blue-500") */
  hasPseudoClass: boolean;
  /** Pseudo-class if present (e.g., "hover", "focus") */
  pseudoClass?: string;
}

/**
 * Container query breakpoint sizes
 *
 * These match v1's breakpoints which are optimized for container queries.
 * They're smaller than standard Tailwind media query breakpoints since
 * they apply to container width, not viewport width.
 *
 * Standard Tailwind breakpoints (media queries):
 * - sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 *
 * Container query breakpoints (v1 approach):
 * - sm: 384px (24rem), md: 448px (28rem), lg: 512px (32rem), xl: 576px (36rem)
 */
export const CONTAINER_BREAKPOINTS: Record<string, string> = {
  xs: '20rem', // 320px
  sm: '24rem', // 384px
  md: '28rem', // 448px
  lg: '32rem', // 512px
  xl: '36rem', // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
  '6xl': '72rem', // 1152px
  '7xl': '80rem', // 1280px
};

/**
 * Known breakpoint prefixes (in order of specificity)
 */
const BREAKPOINT_PREFIXES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as const;

/**
 * Known pseudo-class variants
 */
const PSEUDO_CLASSES = ['hover', 'focus', 'active', 'focus-within', 'focus-visible', 'disabled'] as const;

/**
 * Parse a single class to check if it's a responsive variant
 *
 * Examples:
 * - "sm:p-6" → { breakpoint: "sm", utility: "p-6", ... }
 * - "md:hover:bg-blue-500" → { breakpoint: "md", utility: "bg-blue-500", pseudoClass: "hover", ... }
 * - "p-6" → null (not a responsive variant)
 *
 * @param className - Single Tailwind class name
 * @returns Parsed responsive variant or null if not responsive
 */
export function parseResponsiveVariant(className: string): ResponsiveVariant | null {
  // Check if class starts with a known breakpoint
  for (const breakpoint of BREAKPOINT_PREFIXES) {
    const prefix = `${breakpoint}:`;
    if (className.startsWith(prefix)) {
      const afterBreakpoint = className.slice(prefix.length);

      // Check for pseudo-class variant (e.g., "sm:hover:bg-blue-500")
      for (const pseudoClass of PSEUDO_CLASSES) {
        const pseudoPrefix = `${pseudoClass}:`;
        if (afterBreakpoint.startsWith(pseudoPrefix)) {
          const utility = afterBreakpoint.slice(pseudoPrefix.length);
          return {
            originalClass: className,
            breakpoint,
            utility: `${pseudoClass}:${utility}`, // Keep pseudo-class in utility for Tailwind processing
            hasPseudoClass: true,
            pseudoClass,
          };
        }
      }

      // No pseudo-class, just breakpoint + utility
      return {
        originalClass: className,
        breakpoint,
        utility: afterBreakpoint,
        hasPseudoClass: false,
      };
    }
  }

  return null;
}

/**
 * Extract all responsive variants from a class string
 *
 * @param classString - Space-separated Tailwind classes
 * @returns Array of responsive variants found
 */
export function extractResponsiveVariants(classString: string): ResponsiveVariant[] {
  const classes = classString.split(/\s+/).filter(Boolean);
  const variants: ResponsiveVariant[] = [];

  for (const cls of classes) {
    const variant = parseResponsiveVariant(cls);
    if (variant) {
      variants.push(variant);
    }
  }

  return variants;
}

/**
 * Extract all responsive variants from a styles object
 *
 * @param styles - Map of style keys to class strings
 * @returns Map of style keys to their responsive variants
 */
export function extractAllResponsiveVariants(
  styles: Record<string, string>
): Map<string, ResponsiveVariant[]> {
  const result = new Map<string, ResponsiveVariant[]>();

  for (const [key, classString] of Object.entries(styles)) {
    const variants = extractResponsiveVariants(classString);
    if (variants.length > 0) {
      result.set(key, variants);
    }
  }

  return result;
}

/**
 * Get unique base utilities from responsive variants
 *
 * This is used to build a list of utilities to process through Tailwind.
 * We strip off the breakpoint prefix to get the base utility.
 *
 * Example:
 * - ["sm:p-6", "md:p-8", "sm:hover:bg-blue-500"]
 * - → ["p-6", "p-8", "hover:bg-blue-500"]
 *
 * @param variants - Array of responsive variants
 * @returns Set of unique base utilities
 */
export function getUniqueBaseUtilities(variants: ResponsiveVariant[]): Set<string> {
  return new Set(variants.map(v => v.utility));
}

/**
 * Remove responsive variants from a class string
 *
 * Used to generate a "base" class string without responsive variants,
 * which can be processed normally through Tailwind.
 *
 * Example:
 * - "p-4 sm:p-6 md:p-8 bg-white" → "p-4 bg-white"
 *
 * @param classString - Original class string with responsive variants
 * @returns Class string without responsive variants
 */
export function removeResponsiveVariants(classString: string): string {
  const classes = classString.split(/\s+/).filter(Boolean);
  const nonResponsive = classes.filter(cls => !parseResponsiveVariant(cls));
  return nonResponsive.join(' ');
}
