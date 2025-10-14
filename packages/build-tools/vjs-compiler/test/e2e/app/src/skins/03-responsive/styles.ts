/**
 * Level 4: Responsive Test Skin - Styles
 *
 * Purpose: Test responsive breakpoints and complex arbitrary values
 *
 * Tailwind Complexity Level 4 Features:
 * - Responsive breakpoints: sm:, md:, lg:
 * - Complex arbitrary values: calc(), clamp(), custom colors
 * - Transitions and transforms
 * - Backdrop filters
 * - Multiple value changes per breakpoint
 *
 * Expected transformations:
 * - Media queries wrapping responsive utilities
 * - Arbitrary values preserved in CSS
 * - Transition properties combined correctly
 * - Transform properties work together
 */

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Container: cn('relative'),

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
  ),

  Icon: cn(
    '[grid-area:1/1]',
    'transition-opacity',
    'duration-200',
  ),

  PlayIcon: cn(
    'opacity-0',
  ),

  PauseIcon: cn(
    'opacity-100',
  ),
};

export default styles;
