import type { FrostedSkinStyles } from './types';

// NOTE: Removing import to sidestep for compiler complexity (CJP)
// import { cn } from '../../utils/cn';
// A (very crude) utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
// It just makes the billions of Tailwind classes a little easier to read.
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles: FrostedSkinStyles = {
  MediaContainer: cn(
    'vjs', // Scope preflight
    'vjs:relative vjs:isolate vjs:@container/root vjs:group/root vjs:overflow-clip',
    // Base typography
    'vjs:text-[0.8125rem]', // 13px
    // Prevent rounded corners in fullscreen.
    'vjs:[&:fullscreen]:rounded-none vjs:[&:fullscreen]:[&_video]:h-full vjs:[&:fullscreen]:[&_video]:w-full',
    // Fancy borders.
    'vjs:after:absolute vjs:after:inset-0 vjs:after:ring-black/10 vjs:after:ring-1 vjs:dark:after:ring-white/10 vjs:after:ring-inset vjs:after:z-10 vjs:after:pointer-events-none vjs:after:rounded-[inherit]',
    'vjs:before:absolute vjs:before:inset-px vjs:before:rounded-[inherit] vjs:before:ring-white/15 vjs:before:ring-1 vjs:before:ring-inset vjs:before:z-10 vjs:before:pointer-events-none vjs:dark:before:ring-0',
    // Ensure the nested video inherits the radius.
    'vjs:[&_video]:rounded-[inherit] vjs:[&_video]:w-full vjs:[&_video]:h-auto',
  ),
  Overlay: cn(
    'vjs:opacity-0 vjs:delay-500 vjs:rounded-[inherit] vjs:absolute vjs:inset-0 vjs:pointer-events-none vjs:bg-gradient-to-t vjs:from-black/50 vjs:via-black/20 vjs:to-transparent vjs:transition-opacity vjs:backdrop-saturate-150 vjs:backdrop-brightness-90',
    // Hide when playing (for now).
    //  FIXME: This is crude temporary logic, we'll improve it later I guess with a [data-show-controls] attribute or something?
    'vjs:has-[+.controls_[data-paused]]:opacity-100 vjs:has-[+.controls_[data-paused]]:delay-0',
    'vjs:has-[+.controls_[aria-expanded="true"]]:opacity-100 vjs:has-[+.controls_[aria-expanded="true"]]:delay-0',
    'vjs:group-hover/root:opacity-100 vjs:group-hover/root:delay-0',
  ),
  Surface: cn(
    'vjs:bg-white/10 vjs:backdrop-blur-3xl vjs:backdrop-saturate-150 vjs:backdrop-brightness-90',
    // Ring and shadow
    'vjs:ring vjs:ring-white/10 vjs:ring-inset vjs:shadow-sm vjs:shadow-black/15',
    // Border to enhance contrast on lighter videos
    'vjs:after:absolute vjs:after:inset-0 vjs:after:ring vjs:after:rounded-[inherit] vjs:after:ring-black/15 vjs:after:pointer-events-none vjs:after:z-10',
    // Reduced transparency for users with preference
    // XXX: This requires a Tailwind custom variant (see 1 below)
    'vjs:reduced-transparency:bg-black/70 vjs:reduced-transparency:ring-black vjs:reduced-transparency:after:ring-white/20',
    // High contrast mode
    'vjs:contrast-more:bg-black/90 vjs:contrast-more:ring-black vjs:contrast-more:after:ring-white/20',
  ),
  Controls: cn(
    'vjs:@container/controls vjs:absolute vjs:inset-x-3 vjs:bottom-3 vjs:rounded-full vjs:flex vjs:items-center vjs:p-1 vjs:gap-0.5 vjs:text-white',
    // Animation
    'vjs:transition vjs:will-change-transform vjs:origin-bottom vjs:ease-out',
    //  FIXME: Temporary className hook for above logic in the overlay. Can be removed once have a proper way to handle controls visibility.
    'controls',
    //  FIXME: Temporary hide/show logic
    'vjs:scale-90 vjs:opacity-0 vjs:delay-500 vjs:duration-300',
    'vjs:has-[[data-paused]]:scale-100 vjs:has-[[data-paused]]:opacity-100 vjs:has-[[data-paused]]:delay-0',
    'vjs:has-[[aria-expanded="true"]]:scale-100 vjs:has-[[aria-expanded="true"]]:opacity-100 vjs:has-[[aria-expanded="true"]]:delay-0',
    'vjs:group-hover/root:scale-100 vjs:group-hover/root:opacity-100 vjs:group-hover/root:delay-0',
  ),
  Icon: cn('icon'),
  Button: cn(
    'vjs:group/button vjs:cursor-pointer vjs:relative vjs:shrink-0 vjs:transition vjs:select-none vjs:p-2 vjs:rounded-full',
    // Background/foreground
    'vjs:bg-transparent vjs:text-white/90',
    // Hover and focus states
    'vjs:hover:no-underline vjs:hover:bg-white/10 vjs:hover:text-white vjs:focus-visible:no-underline vjs:focus-visible:bg-white/10 vjs:focus-visible:text-white',
    // Focus state
    'vjs:-outline-offset-2 vjs:focus-visible:outline-2 vjs:focus-visible:outline-offset-2 vjs:focus-visible:outline-blue-500',
    // Disabled state
    'vjs:aria-disabled:grayscale vjs:aria-disabled:opacity-50 vjs:aria-disabled:cursor-not-allowed',
    // Loading state
    'vjs:aria-busy:pointer-events-none vjs:aria-busy:cursor-not-allowed',
    // Expanded state
    'vjs:aria-expanded:bg-white/10 vjs:aria-expanded:text-white',
    // Pressed state
    'vjs:active:scale-95',
  ),
  IconButton: cn(
    'vjs:grid vjs:[&_.icon]:[grid-area:1/1]',
    'vjs:[&_.icon]:shrink-0 vjs:[&_.icon]:transition-[opacity,filter] vjs:[&_.icon]:duration-500 vjs:[&_.icon]:linear vjs:[&_.icon]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] vjs:[&_.icon]:shadow-black/25',
  ),
  PlayButton: cn(
    'vjs:[&_.pause-icon]:opacity-100 vjs:[&[data-paused]_.pause-icon]:opacity-0 vjs:[&[data-paused]_.pause-icon]:blur-sm',
    'vjs:[&_.play-icon]:opacity-0 vjs:[&_.play-icon]:blur-sm vjs:[&[data-paused]_.play-icon]:opacity-100 vjs:[&[data-paused]_.play-icon]:blur-none',
  ),
  PlayIcon: cn('play-icon'),
  PauseIcon: cn('pause-icon'),
  PlayTooltipPopup: cn(
    'vjs:[&_.pause-tooltip]:inline vjs:[&[data-paused]_.pause-tooltip]:hidden',
    'vjs:[&_.play-tooltip]:hidden vjs:[&[data-paused]_.play-tooltip]:inline',
  ),
  PlayTooltip: cn('play-tooltip'),
  PauseTooltip: cn('pause-tooltip'),
  MuteButton: cn(
    'vjs:[&_.icon]:hidden',
    'vjs:[&[data-volume-level="high"]_.volume-high-icon]:inline',
    'vjs:[&[data-volume-level="medium"]_.volume-low-icon]:inline',
    'vjs:[&[data-volume-level="low"]_.volume-low-icon]:inline',
    'vjs:[&[data-volume-level="off"]_.volume-off-icon]:inline',
  ),
  VolumeHighIcon: cn('volume-high-icon'),
  VolumeLowIcon: cn('volume-low-icon'),
  VolumeOffIcon: cn('volume-off-icon'),
  FullscreenButton: cn(
    'vjs:[&_.fullscreen-enter-icon]:opacity-100 vjs:[&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0',
    'vjs:[&_.fullscreen-exit-icon]:opacity-0 vjs:[&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100',
    'vjs:[&_path]:transition-transform vjs:ease-out',
  ),
  FullscreenEnterIcon: cn(
    'fullscreen-enter-icon',
    'vjs:group-hover/button:[&_.arrow-1]:-translate-x-px vjs:group-hover/button:[&_.arrow-1]:-translate-y-px',
    'vjs:group-hover/button:[&_.arrow-2]:translate-x-px vjs:group-hover/button:[&_.arrow-2]:translate-y-px',
  ),
  FullscreenExitIcon: cn(
    'fullscreen-exit-icon',
    'vjs:[&_.arrow-1]:-translate-x-px vjs:[&_.arrow-1]:-translate-y-px',
    'vjs:[&_.arrow-2]:translate-x-px vjs:[&_.arrow-2]:translate-y-px',
    'vjs:group-hover/button:[&_.arrow-1]:translate-0',
    'vjs:group-hover/button:[&_.arrow-2]:translate-0',
  ),
  FullscreenTooltipPopup: cn(
    'vjs:[&_.fullscreen-enter-tooltip]:inline vjs:[&[data-fullscreen]_.fullscreen-enter-tooltip]:hidden',
    'vjs:[&_.fullscreen-exit-tooltip]:hidden vjs:[&[data-fullscreen]_.fullscreen-exit-tooltip]:inline',
  ),
  FullscreenEnterTooltip: cn('fullscreen-enter-tooltip'),
  FullscreenExitTooltip: cn('fullscreen-exit-tooltip'),
  TimeControls: cn('vjs:flex-1 vjs:flex vjs:items-center vjs:gap-3 vjs:px-1.5'),
  TimeDisplay: cn('vjs:tabular-nums vjs:text-shadow-2xs/25'),
  SliderRoot: cn(
    'vjs:group/slider-root',
    'vjs:outline-0',
    'vjs:flex vjs:items-center vjs:justify-center vjs:flex-1 vjs:group/slider vjs:relative vjs:rounded-full',
    'vjs:[&[data-orientation="horizontal"]]:h-5 vjs:[&[data-orientation="horizontal"]]:min-w-20',
    'vjs:[&[data-orientation="vertical"]]:w-5 vjs:[&[data-orientation="vertical"]]:h-20',
  ),
  SliderTrack: cn(
    'vjs:-outline-offset-2 vjs:group-focus-visible/slider-root:outline-2 vjs:group-focus-visible/slider-root:outline-offset-2 vjs:group-focus-visible/slider-root:outline-blue-500',
    'vjs:w-full vjs:relative vjs:select-none vjs:rounded-full vjs:bg-white/20 vjs:ring-1 vjs:ring-black/5',
    'vjs:[&[data-orientation="horizontal"]]:h-1',
    'vjs:[&[data-orientation="vertical"]]:w-1',
  ),
  SliderProgress: cn('vjs:bg-white vjs:rounded-[inherit]'),
  // TODO: Work out what we want to do here.
  SliderPointer: cn('vjs:bg-white/20 vjs:rounded-[inherit]'),
  SliderThumb: cn(
    'vjs:bg-white vjs:z-10 vjs:select-none vjs:ring vjs:ring-black/10 vjs:rounded-full vjs:shadow-sm vjs:shadow-black/15',
    'vjs:opacity-0 vjs:transition-[opacity,height,width] vjs:ease-in-out',
    'vjs:-outline-offset-2 vjs:focus-visible:outline-2 vjs:focus-visible:outline-offset-2 vjs:focus-visible:outline-blue-500',
    'vjs:group-hover/slider:opacity-100 vjs:group-focus-within/slider:opacity-100',
    'vjs:size-2.5 vjs:active:size-3 vjs:group-active/slider:size-3',
    'vjs:[&[data-orientation="horizontal"]]:hover:cursor-ew-resize',
    'vjs:[&[data-orientation="vertical"]]:hover:cursor-ns-resize',
  ),
  PopupAnimation: cn(
    // Animation
    // XXX: We can't use transforms since floating UI uses them for positioning.
    'vjs:transition-[transform,scale,opacity,filter] vjs:origin-bottom vjs:duration-200 vjs:data-[instant]:duration-0',
    'vjs:data-[starting-style]:scale-0 vjs:data-[starting-style]:opacity-0 vjs:data-[starting-style]:blur-sm',
    'vjs:data-[ending-style]:scale-0 vjs:data-[ending-style]:opacity-0 vjs:data-[ending-style]:blur-sm',
  ),
  PopoverPopup: cn(
    'vjs:relative vjs:px-1 vjs:py-3 vjs:rounded-full',
  ),
  TooltipPopup: cn(
    'vjs:whitespace-nowrap vjs:flex vjs:flex-col vjs:rounded-full vjs:text-white vjs:text-xs vjs:@7xl/root:text-sm vjs:px-2.5 vjs:py-1',
  ),
};

/*
[1] @custom-variant reduced-transparency @media (prefers-reduced-transparency: reduce);
*/

export default styles;
