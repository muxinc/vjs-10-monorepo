/**
 * Styles for Level 1: Minimal Test Skin
 *
 * Simple Tailwind utility classes for baseline E2E validation
 *
 * Complexity Level: 0 + 1 only (see docs/TAILWIND_COMPLEXITY_MATRIX.md)
 * - Level 0: Basic positioning, display, spacing, alignment
 * - Level 1: Border radius, pointer events
 * - Avoids Level 2+: No opacity variants, no complex selectors
 */

// A (very crude) utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: cn('relative'),
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
  ),
  Button: cn(
    'p-3',
    'rounded-full',
    'pointer-events-auto',
    'flex',
    // Note: No background color to keep complexity at Level 0-1
    // bg-white/80 would be Level 2 (opacity variant with missing CSS vars)
  ),
};

export default styles;
