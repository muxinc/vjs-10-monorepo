/**
 * Level 9: Has Selector Test Skin - Styles
 *
 * Purpose: Test :has() parent selector support for conditional styling
 *
 * Tailwind Complexity Level 9 Features:
 * - Has selector: has-[[data-paused]]:scale-100
 * - Has with descendant: has-[_.some-child]:opacity-100
 * - Has with pseudo-class: has-[:hover]:bg-[#hex]
 * - Parent styling based on child state
 *
 * Expected transformations:
 * - has-[selector] compiles to :has(selector) { ... }
 * - Enables parent styling based on child/descendant state
 * - Modern CSS feature (2023+), supported in all major browsers
 *
 * Note: Using arbitrary colors (bg-[#hex]) due to semantic color limitation
 */

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  // Wrapper scales up when it contains a paused button
  Wrapper: cn(
    'relative',
    'transition-transform',
    'duration-300',
    'scale-100',
    // When wrapper has a [data-paused] descendant, scale to 105%
    'has-[[data-paused]]:scale-105',
  ),

  // Overlay changes appearance based on whether controls are visible
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
    // Semi-transparent overlay
    'bg-[#000]/30',
    'backdrop-blur-sm',
    'transition-all',
    'duration-300',
    // When overlay has a button being hovered, increase blur
    'has-[.button:hover]:backdrop-blur-md',
    'has-[.button:hover]:bg-[#000]/50',
  ),

  Button: cn(
    'button', // Class name for :has() targeting
    'p-4',
    'rounded-full',
    // Base colors
    'bg-[#3b82f6]/90',
    'text-[#fff]',
    // Hover states
    'hover:bg-[#2563eb]',
    'hover:scale-110',
    // Transitions
    'transition-all',
    'duration-200',
    'pointer-events-auto',
    'grid',
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
  ),

  PlayIcon: cn(
    'play-icon',
  ),

  PauseIcon: cn(
    'pause-icon',
  ),
};

export default styles;
