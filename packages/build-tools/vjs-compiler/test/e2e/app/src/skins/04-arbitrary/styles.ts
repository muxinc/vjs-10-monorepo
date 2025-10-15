/**
 * Level 4: Arbitrary Values Test Skin - Styles
 *
 * Purpose: Test arbitrary value support in Tailwind classes
 *
 * Tailwind Complexity Level 4 Features:
 * - Arbitrary colors: bg-[#hex], bg-[rgba(...)]
 * - Arbitrary sizing: w-[clamp(...)], h-[calc(...)]
 * - Arbitrary border radius: rounded-[12px]
 * - Arbitrary filters: backdrop-blur-[2px]
 * - Arbitrary grid areas: [grid-area:1/1]
 *
 * Expected transformations:
 * - Arbitrary values preserved in CSS output
 * - Bracket notation handled correctly
 * - Complex functions (clamp, calc, rgba) work
 */

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
    'bg-[rgba(0,0,0,0.3)]',      // Arbitrary RGBA color
    'backdrop-blur-[2px]',        // Arbitrary backdrop blur
  ),

  Button: cn(
    'p-3',
    'rounded-[12px]',             // Arbitrary border radius
    'bg-[#1da1f2]',               // Arbitrary hex color (Twitter blue)
    'hover:bg-[#0d8ddb]',         // Hover with arbitrary color
    'w-[clamp(3rem,10vw,5rem)]',  // Arbitrary sizing with clamp()
    'h-[clamp(3rem,10vw,5rem)]',  // Fluid sizing: min 3rem, preferred 10vw, max 5rem
    'pointer-events-auto',
    'grid',
    'transition-colors',
    'duration-200',
    // Icon stacking and interactivity (from Level 2)
    '[&_.icon]:[grid-area:1/1]',
    '[&_.play-icon]:opacity-0',
    '[&[data-paused]_.play-icon]:opacity-100',
    '[&_.pause-icon]:opacity-100',
    '[&[data-paused]_.pause-icon]:opacity-0',
  ),

  Icon: cn(
    'icon',
    'transition-opacity',
    'duration-200',
  ),

  PlayIcon: cn(
    'play-icon',
  ),

  PauseIcon: cn(
    'pause-icon',
  ),
};

export default styles;
