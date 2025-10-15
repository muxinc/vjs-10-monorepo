/**
 * Level 3: Hover and Pseudo-Classes Test Skin - Styles
 *
 * Purpose: Test hover, focus, and active pseudo-class support
 *
 * Tailwind Complexity Level 3 Features:
 * - Hover states: hover:bg-*
 * - Focus states: focus:ring-*
 * - Active states: active:scale-*
 * - Transition properties
 * - @media (hover: hover) wrapper generation
 *
 * Expected transformations:
 * - hover: classes wrapped in @media (hover: hover)
 * - focus: and active: classes compiled correctly
 * - Transitions combined properly
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
  ),

  Button: cn(
    'p-3',
    'rounded-full',
    'bg-blue-500',           // Base color
    'hover:bg-blue-600',     // Hover state (should wrap in @media (hover: hover))
    'focus:ring-2',          // Focus state
    'focus:ring-blue-300',   // Focus ring color
    'focus:outline-none',    // Remove default outline
    'active:scale-95',       // Active state (pressed)
    'transition-all',        // Transition all properties
    'duration-200',          // 200ms duration
    'ease-in-out',           // Easing function
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
