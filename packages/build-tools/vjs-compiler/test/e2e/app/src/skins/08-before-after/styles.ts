/**
 * Level 8: Before/After Pseudo-Elements Test Skin - Styles
 *
 * Purpose: Test ::before and ::after pseudo-element support
 *
 * Tailwind Complexity Level 8 Features:
 * - Before pseudo-element: before:absolute, before:content-['']
 * - After pseudo-element: after:absolute, after:content-['']
 * - Pseudo-element positioning: before:inset-0, after:inset-0
 * - Pseudo-element styling: before:rounded-[inherit], after:bg-[#hex]/opacity
 * - Decorative borders and overlays
 *
 * Expected transformations:
 * - before: classes compile to ::before { ... }
 * - after: classes compile to ::after { ... }
 * - Content property added automatically: content: ''
 * - Inheritance works: rounded-[inherit] inherits parent border-radius
 *
 * Note: Using arbitrary colors (bg-[#hex]) due to semantic color limitation
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
    // Semi-transparent overlay
    'bg-[#000]/40',
    'backdrop-blur-sm',
  ),

  Button: cn(
    'relative', // Required for pseudo-elements to position correctly
    'p-4',
    'rounded-2xl',
    // Base colors
    'bg-[#3b82f6]/90',
    'text-[#fff]',
    // Hover states
    'hover:bg-[#2563eb]',
    'hover:scale-105',
    // Transitions
    'transition-all',
    'duration-300',
    'pointer-events-auto',
    'grid',
    // Before pseudo-element: inner border/glow effect
    'before:absolute',
    'before:inset-px',
    'before:rounded-[inherit]',
    'before:bg-[#fff]/10',
    'before:pointer-events-none',
    // After pseudo-element: outer glow on hover
    'after:absolute',
    'after:inset-0',
    'after:rounded-[inherit]',
    'after:bg-[#3b82f6]/0',
    'after:blur-xl',
    'after:transition-all',
    'after:duration-300',
    'after:pointer-events-none',
    'hover:after:bg-[#3b82f6]/50',
    'hover:after:inset-[-8px]',
    // Icon stacking
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
    'relative', // Above pseudo-elements
    'z-10',
  ),

  PlayIcon: cn(
    'play-icon',
  ),

  PauseIcon: cn(
    'pause-icon',
  ),
};

export default styles;
