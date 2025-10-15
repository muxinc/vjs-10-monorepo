/**
 * Level 7: Color Opacity Modifiers Test Skin - Styles
 *
 * Purpose: Test Tailwind's slash opacity syntax for semi-transparent colors
 *
 * Tailwind Complexity Level 7 Features:
 * - Color with opacity: text-white/90, bg-white/10, bg-black/50
 * - Hover with opacity: hover:bg-white/20
 * - Ring with opacity: ring-white/10
 * - Multiple opacity values
 *
 * Expected transformations:
 * - Slash syntax converts to rgba/oklch with alpha channel
 * - Works with arbitrary colors: bg-[#1da1f2]/80
 * - Hover opacity wrapped in @media (hover: hover)
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
    // Semi-transparent black overlay (50% opacity)
    'bg-[#000]/50',
    // Backdrop blur for glassmorphism effect
    'backdrop-blur-sm',
  ),

  Button: cn(
    'p-3',
    'rounded-full',
    // Base color with opacity - twitter blue at 90% opacity
    'bg-[#1da1f2]/90',
    // Hover state with higher opacity
    'hover:bg-[#1da1f2]/100',
    // Focus ring with low opacity white
    'focus:ring-2',
    'focus:ring-[#fff]/30',
    'focus:outline-none',
    // Text color with high opacity for readability
    'text-[#fff]/95',
    'active:scale-95',
    'transition-all',
    'duration-200',
    'pointer-events-auto',
    'grid',
    // Icon stacking with opacity-based show/hide
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
