/**
 * Level 6: Combined Features Test Skin - Styles
 *
 * Purpose: Test ALL Tailwind features working together
 *
 * Tailwind Complexity Level 6 Features (combines 3, 4, 5):
 * - Hover/focus/active pseudo-classes (Level 3)
 * - Arbitrary values: calc(), clamp(), rgba(), custom colors (Level 4)
 * - Responsive breakpoints: sm:, md:, lg: (Level 5)
 * - Transitions and transforms
 * - Backdrop filters
 * - Complex feature interactions
 *
 * Expected transformations:
 * - Container queries wrapping responsive utilities
 * - @media (hover: hover) wrapping hover states
 * - Arbitrary values preserved in CSS
 * - All features working together without conflicts
 */

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: cn(
    'relative',
    // Responsive padding: increases at each breakpoint
    'p-4',        // Mobile: 1rem (16px)
    'sm:p-6',     // Small: 1.5rem (24px) @media (min-width: 640px)
    'md:p-8',     // Medium: 2rem (32px) @media (min-width: 768px)
    'lg:p-12',    // Large: 3rem (48px) @media (min-width: 1024px)
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
    // Complex arbitrary values
    'bg-[rgba(0,0,0,0.3)]',     // Custom RGBA color
    'backdrop-blur-[2px]',       // Custom backdrop blur
  ),

  Button: cn(
    // Responsive padding
    'p-3',        // Mobile: 0.75rem
    'sm:p-4',     // Small: 1rem
    'md:p-5',     // Medium: 1.25rem
    // Responsive border radius
    'rounded-[12px]',      // Mobile: 12px
    'md:rounded-[16px]',   // Medium: 16px
    // Custom colors with hover
    'bg-[#1da1f2]',                    // Twitter blue
    'hover:bg-[#0d8ddb]',              // Darker on hover
    'pointer-events-auto',
    'grid',
    // Transitions
    'transition-all',
    'duration-300',
    'ease-in-out',
    // Transform with hover
    'scale-100',
    'hover:scale-110',
    // Complex arbitrary values for sizing
    'w-[clamp(3rem,10vw,5rem)]',      // Fluid width: min 3rem, preferred 10vw, max 5rem
    'h-[clamp(3rem,10vw,5rem)]',      // Fluid height: min 3rem, preferred 10vw, max 5rem
    // Icon stacking and interactivity
    '[&_.icon]:[grid-area:1/1]',                // Overlay all icons in same grid cell
    '[&_.play-icon]:opacity-0',                 // Hide play icon when playing
    '[&[data-paused]_.play-icon]:opacity-100',  // Show play icon when paused
    '[&_.pause-icon]:opacity-100',              // Show pause icon when playing
    '[&[data-paused]_.pause-icon]:opacity-0',   // Hide pause icon when paused
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
