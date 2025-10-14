/**
 * Level 3: Interactive Test Skin - Styles
 *
 * Purpose: Test icon stacking and data attribute selectors
 *
 * Tailwind Complexity Level 3 Features:
 * - Icon stacking with grid overlay: `grid [&_.icon]:[grid-area:1/1]`
 * - Data attribute selectors: `[&[data-paused]_.play-icon]:opacity-100`
 * - Child combinators: `[&_.pause-icon]:opacity-0`
 *
 * Expected transformations:
 * - Grid layout for icon stacking
 * - Conditional opacity based on data-paused attribute
 * - Child selector specificity maintained
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
    'grid', // Grid layout for icon stacking
    '[&_.icon]:[grid-area:1/1]', // Overlay all icons in same grid cell
    // Play icon visibility (show when paused, hide when playing)
    '[&_.play-icon]:opacity-0', // Hide play icon when playing
    '[&[data-paused]_.play-icon]:opacity-100', // Show play icon when paused
    // Pause icon visibility (show when playing, hide when paused)
    '[&_.pause-icon]:opacity-100', // Show pause icon when playing
    '[&[data-paused]_.pause-icon]:opacity-0', // Hide pause icon when paused
  ),
  Icon: cn('play-icon'),
  PlayIcon: cn('play-icon'),
  PauseIcon: cn('pause-icon'),
};

export default styles;
