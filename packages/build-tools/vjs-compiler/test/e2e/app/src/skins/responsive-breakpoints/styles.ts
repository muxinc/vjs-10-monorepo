/**
 * Level 5: Responsive Variants Test Skin - Styles
 *
 * Purpose: Test responsive breakpoint support (ISOLATED)
 *
 * Tailwind Complexity Level 5 Features:
 * - Responsive breakpoints ONLY: sm:, md:, lg:
 * - Container query generation
 * - Multiple properties per breakpoint
 *
 * Expected transformations:
 * - Responsive utilities wrapped in @container queries
 * - Breakpoints mapped to appropriate rem values
 * - Multiple responsive properties handled correctly
 *
 * NOTE: This is a SIMPLIFIED version testing ONLY responsive variants.
 * No hover states, no arbitrary values, no complex features.
 * See Level 6 (combined) for all features together.
 */

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: cn(
    'relative',
    // Responsive padding: increases at each breakpoint
    'p-4',        // Mobile: 1rem (16px)
    'sm:p-6',     // Small: 1.5rem (24px) @container (min-width: 24rem)
    'md:p-8',     // Medium: 2rem (32px) @container (min-width: 28rem)
    'lg:p-12',    // Large: 3rem (48px) @container (min-width: 32rem)
    // Responsive gap
    'gap-2',      // Mobile: 0.5rem
    'sm:gap-3',   // Small: 0.75rem
    'md:gap-4',   // Medium: 1rem
  ),

  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
  ),

  Button: cn(
    // Responsive padding
    'p-3',        // Mobile: 0.75rem
    'sm:p-4',     // Small: 1rem
    'md:p-6',     // Medium: 1.5rem
    'rounded-full',
    'bg-[#3b82f6]',  // Blue color (using arbitrary value for TW v4 compatibility)
    'pointer-events-auto',
    'grid',
    // Icon stacking and interactivity (from Level 2)
    '[&_.icon]:[grid-area:1/1]',
    '[&_.play-icon]:opacity-0',
    '[&[data-paused]_.play-icon]:opacity-100',
    '[&_.pause-icon]:opacity-100',
    '[&[data-paused]_.pause-icon]:opacity-0',
  ),

  Icon: cn(
    'icon',
  ),

  PlayIcon: cn(
    'play-icon',
  ),

  PauseIcon: cn(
    'pause-icon',
  ),
};

export default styles;
