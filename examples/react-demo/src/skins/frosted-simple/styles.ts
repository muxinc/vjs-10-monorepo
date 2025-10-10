import type { MediaDefaultSkinStyles } from './types';

// NOTE: Removing import to sidestep for compiler complexity (CJP)
// import { cn } from '../../utils/cn';
// A (very crude) utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
// It just makes the billions of Tailwind classes a little easier to read.
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// SIMPLIFIED VERSION: All arbitrary variant selectors removed for baseline testing
// This version uses ONLY simple Tailwind utilities that work with current compiler
// Known limitations removed:
// - [&_.child] selectors (arbitrary variants)
// - [&[data-attr]_.child] selectors (arbitrary variants with data attributes)
// - [&_svg] selectors (arbitrary variants for SVG children)
// See frosted/ directory for full version with arbitrary variants

const styles: MediaDefaultSkinStyles = {
  MediaContainer: cn(
    'relative @container/root group/root overflow-clip',
    // Base typography
    'text-sm',
    // Fancy borders
    'after:absolute after:inset-0 after:ring-black/10 after:ring-1 dark:after:ring-black/40 after:ring-inset after:z-10 after:pointer-events-none after:rounded-[inherit]',
    'before:absolute before:inset-px before:rounded-[inherit] before:ring-white/15 before:ring-1 before:ring-inset before:z-10 before:pointer-events-none',
  ),
  Overlay: cn(
    'opacity-0 delay-500 rounded-[inherit] absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity backdrop-saturate-150 backdrop-brightness-90',
    // Hide when playing (SIMPLIFIED - removed has-[] selectors)
    'group-hover/root:opacity-100 group-hover/root:delay-0',
  ),
  Controls: cn(
    'controls',
    '@container/controls absolute inset-x-3 bottom-3 rounded-full flex items-center p-1 ring ring-white/10 ring-inset gap-0.5 text-white text-shadow',
    'shadow-sm shadow-black/15',
    // Background
    'bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90',
    // Animation (SIMPLIFIED - removed has-[] selectors)
    'transition will-change-transform origin-bottom ease-out',
    'scale-90 opacity-0 delay-500',
    'group-hover/root:scale-100 group-hover/root:opacity-100 group-hover/root:delay-0',
    // Border to enhance contrast on lighter videos
    'after:absolute after:inset-0 after:ring after:rounded-[inherit] after:ring-black/15 after:pointer-events-none after:z-10',
    // Reduced transparency for users with preference
    'reduced-transparency:bg-black/70 reduced-transparency:ring-black reduced-transparency:after:ring-white/20',
    // High contrast mode
    'contrast-more:bg-black/90 contrast-more:ring-black contrast-more:after:ring-white/20',
  ),
  Button: cn(
    'group/button cursor-pointer relative shrink-0 transition select-none p-2 rounded-full',
    // Background/foreground
    'bg-transparent text-white/90',
    // Hover and focus states
    'hover:no-underline hover:bg-white/10 hover:text-white focus-visible:no-underline focus-visible:bg-white/10 focus-visible:text-white',
    // Focus state
    '-outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    // Disabled state
    'aria-disabled:grayscale aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
    // Loading state
    'aria-busy:pointer-events-none aria-busy:cursor-not-allowed',
    // Expanded state
    'aria-expanded:bg-white/10 aria-expanded:text-white',
    // Pressed state
    'active:scale-95',
  ),
  IconButton: cn(
    'grid',
    // REMOVED: [&_svg]:[grid-area:1/1] - arbitrary variant
    // REMOVED: [&_svg]:shrink-0 [&_svg]:transition-opacity etc - arbitrary variants
  ),
  PlayButton: cn(
    // REMOVED: [&_.pause-icon]:opacity-100 - arbitrary variant
    // REMOVED: [&[data-paused]_.pause-icon]:opacity-0 - arbitrary variant
    // REMOVED: [&_.play-icon]:opacity-0 - arbitrary variant
    // REMOVED: [&[data-paused]_.play-icon]:opacity-100 - arbitrary variant
    // NOTE: Icon visibility will not work in this simplified version
  ),
  PlayIcon: cn('play-icon'),
  PauseIcon: cn('pause-icon'),
  TooltipPopup: cn(
    'whitespace-nowrap flex origin-[var(--transform-origin)] flex-col rounded-md text-white text-xs @7xl/root:text-sm px-2 py-1',
    // Background
    'bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90',
    // Animation
    'transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0',
    // Ring
    'ring-1 ring-white/10 ring-inset',
    // Text shadow
    'text-shadow shadow-black/10',
    // Border to enhance contrast on lighter videos
    'after:absolute after:inset-0 after:ring after:rounded-[inherit] after:ring-black/15 after:pointer-events-none',
  ),
  PlayTooltipPopup: cn(
    // REMOVED: [&_.pause-tooltip]:inline - arbitrary variant
    // REMOVED: [&[data-paused]_.pause-tooltip]:hidden - arbitrary variant
    // REMOVED: [&_.play-tooltip]:hidden - arbitrary variant
    // REMOVED: [&[data-paused]_.play-tooltip]:inline - arbitrary variant
  ),
  PlayTooltip: cn('play-tooltip'),
  PauseTooltip: cn('pause-tooltip'),
  MuteButton: cn(
    // REMOVED: [&_svg]:opacity-0 - arbitrary variant
    // REMOVED: [&[data-volume-level="high"]_.volume-high-icon]:opacity-100 - arbitrary variant
    // REMOVED: All volume icon visibility selectors - arbitrary variants
  ),
  VolumeHighIcon: cn('volume-high-icon'),
  VolumeLowIcon: cn('volume-low-icon'),
  VolumeOffIcon: cn('volume-off-icon'),
  FullScreenButton: cn(
    // REMOVED: [&_.fullscreen-enter-icon]:opacity-100 - arbitrary variant
    // REMOVED: [&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0 - arbitrary variant
    // REMOVED: [&_.fullscreen-exit-icon]:opacity-0 - arbitrary variant
    // REMOVED: [&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100 - arbitrary variant
    // REMOVED: [&_path]:transition-transform - arbitrary variant
  ),
  FullScreenEnterIcon: cn(
    'fullscreen-enter-icon',
    // REMOVED: group-hover/button:[&_.arrow-1] selectors - arbitrary variants
    // REMOVED: group-hover/button:[&_.arrow-2] selectors - arbitrary variants
  ),
  FullScreenExitIcon: cn(
    'fullscreen-exit-icon',
    // REMOVED: [&_.arrow-1] and [&_.arrow-2] selectors - arbitrary variants
    // REMOVED: group-hover/button:[&_.arrow-1] selectors - arbitrary variants
    // REMOVED: group-hover/button:[&_.arrow-2] selectors - arbitrary variants
  ),
  FullScreenTooltipPopup: cn(
    // REMOVED: [&_.fullscreen-enter-tooltip] selectors - arbitrary variants
    // REMOVED: [&_.fullscreen-exit-tooltip] selectors - arbitrary variants
  ),
  FullScreenEnterTooltip: cn('fullscreen-enter-tooltip'),
  FullScreenExitTooltip: cn('fullscreen-exit-tooltip'),
  TimeControls: cn('flex-1 flex items-center gap-3 px-1.5'),
  TimeDisplay: cn('tabular-nums text-shadow-2xs shadow-black/50'),
  SliderRoot: cn(
    'flex items-center justify-center flex-1 group/slider relative',
    '[&[data-orientation="horizontal"]]:h-5 [&[data-orientation="horizontal"]]:min-w-20',
    '[&[data-orientation="vertical"]]:w-5 [&[data-orientation="vertical"]]:h-20',
  ),
  SliderTrack: cn(
    'w-full relative select-none rounded-full bg-white/20 ring-1 ring-black/5',
    '[&[data-orientation="horizontal"]]:h-1',
    '[&[data-orientation="vertical"]]:w-1',
  ),
  SliderProgress: cn('bg-white rounded-[inherit]'),
  SliderPointer: cn('rounded-[inherit]'),
  SliderThumb: cn(
    'bg-white z-10 select-none ring ring-black/10 rounded-full shadow-sm shadow-black/15',
    'opacity-0 transition-[opacity,height,width] ease-in-out',
    '-outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    'group-hover/slider:opacity-100 group-focus-within/slider:opacity-100',
    'size-2.5 active:size-3 group-active/slider:size-3 hover:cursor-ew-resize',
  ),
  PopoverPopup: cn(
    'relative px-2 py-4 rounded-2xl',
    'bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90',
    'ring ring-white/10 ring-inset shadow-sm shadow-black/15',
    // Border to enhance contrast on lighter videos
    'after:absolute after:inset-0 after:ring after:rounded-[inherit] after:ring-black/15 after:pointer-events-none after:z-10',
    // Reduced transparency for users with preference
    'reduced-transparency:bg-black/70 reduced-transparency:ring-black reduced-transparency:after:ring-white/20',
    // High contrast mode
    'contrast-more:bg-black/90 contrast-more:ring-black contrast-more:after:ring-white/20',
  ),
};

/*
[1] @custom-variant reduced-transparency @media (prefers-reduced-transparency: reduce);
*/

export default styles;
