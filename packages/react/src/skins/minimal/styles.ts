import type { MinimalSkinStyles } from './types';

// NOTE: Removing import to sidestep for compiler complexity (CJP)
// import { cn } from '../../utils/cn';
// A (very crude) utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
// It just makes the billions of Tailwind classes a little easier to read.
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles: MinimalSkinStyles = {
  MediaContainer: cn(
    'vjs', // Scope preflight
    'vjs:relative vjs:isolate vjs:@container/root vjs:group/root vjs:overflow-clip vjs:bg-black',
    // Base typography
    'vjs:text-[0.8125rem]', // 13px
    // 'ring-1 ring-inset ring-black/10 dark:ring-white/10',
    'vjs:after:absolute vjs:after:inset-0 vjs:after:ring-black/10 vjs:after:ring-1 vjs:dark:after:ring-white/10 vjs:after:ring-inset vjs:after:z-10 vjs:after:pointer-events-none vjs:after:rounded-[inherit]',
    // Prevent rounded corners in fullscreen.
    'vjs:[&:fullscreen]:rounded-none vjs:[&:fullscreen]:[&_video]:h-full vjs:[&:fullscreen]:[&_video]:w-full',
    // Ensure the nested video inherits the radius.
    'vjs:[&_video]:w-full vjs:[&_video]:h-full',
  ),
  Overlay: cn(
    'vjs:absolute vjs:inset-0 vjs:rounded-[inherit] vjs:pointer-events-none',
    'vjs:bg-gradient-to-t vjs:from-black/70 vjs:via-black/50 vjs:via-[120px] vjs:to-transparent',
    'vjs:opacity-0 vjs:delay-500 vjs:duration-300',
    //  FIXME: Temporary hide/show logic
    'vjs:has-[+.controls_[data-paused]]:opacity-100 vjs:has-[+.controls_[data-paused]]:delay-0 vjs:has-[+.controls_[data-paused]]:duration-75',
    'vjs:has-[+.controls_[aria-expanded="true"]]:opacity-100 vjs:has-[+.controls_[aria-expanded="true"]]:delay-0 vjs:has-[+.controls_[aria-expanded="true"]]:duration-75',
    'vjs:group-hover/root:opacity-100 vjs:group-hover/root:delay-0 vjs:group-hover/root:duration-75',
    // High contrast mode
    'vjs:contrast-more:from-black/75',
  ),
  Controls: cn(
    'controls', //  FIXME: Temporary className hook for above logic in the overlay. Can be removed once have a proper way to handle controls visibility.
    'vjs:@container/controls vjs:absolute vjs:inset-x-0 vjs:bottom-0 vjs:flex vjs:items-center vjs:gap-3.5 vjs:z-20 vjs:px-3 vjs:pb-3 vjs:pt-10 vjs:text-white',
    // Animation
    'vjs:transition vjs:ease-in-out',
    //  FIXME: Temporary hide/show logic
    'vjs:translate-y-full vjs:opacity-0 vjs:delay-500 vjs:duration-300',
    'vjs:has-[[data-paused]]:translate-y-0 vjs:has-[[data-paused]]:opacity-100 vjs:has-[[data-paused]]:delay-0 vjs:has-[[data-paused]]:duration-75',
    'vjs:has-[[aria-expanded="true"]]:translate-y-0 vjs:has-[[aria-expanded="true"]]:opacity-100 vjs:has-[[aria-expanded="true"]]:delay-0 vjs:has-[[aria-expanded="true"]]:duration-75',
    'vjs:group-hover/root:translate-y-0 vjs:group-hover/root:opacity-100 vjs:group-hover/root:delay-0 vjs:group-hover/root:duration-75',
  ),
  Icon: cn('icon'),
  Button: cn(
    'vjs:group/button vjs:cursor-pointer vjs:relative vjs:shrink-0 vjs:transition-[color,background,outline-offset] vjs:select-none vjs:p-2.5 vjs:rounded-md',
    // Background/foreground
    'vjs:bg-transparent vjs:text-white',
    // Hover and focus states
    'vjs:hover:text-white/80 vjs:focus-visible:text-white/80',
    // Focus state
    'vjs:-outline-offset-2 vjs:focus-visible:outline-2 vjs:focus-visible:outline-offset-2 vjs:focus-visible:outline-white',
    // Disabled state
    'vjs:disabled:grayscale vjs:disabled:opacity-50 vjs:disabled:cursor-not-allowed',
    // Loading state
    'vjs:aria-busy:pointer-events-none vjs:aria-busy:cursor-not-allowed',
    // Expanded state
    'vjs:aria-expanded:text-white/80',
  ),
  ButtonGroup: cn('vjs:flex vjs:items-center vjs:gap-1.5'),
  IconButton: cn(
    'vjs:grid vjs:[&_.icon]:[grid-area:1/1]',
    'vjs:[&_.icon]:shrink-0 vjs:[&_.icon]:transition-opacity vjs:[&_.icon]:duration-150 vjs:[&_.icon]:ease-linear vjs:[&_.icon]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] vjs:[&_.icon]:shadow-black/40',
  ),
  PlayButton: cn(
    'vjs:[&_.pause-icon]:opacity-100 vjs:[&[data-paused]_.pause-icon]:opacity-0',
    'vjs:[&_.play-icon]:opacity-0 vjs:[&[data-paused]_.play-icon]:opacity-100',
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
    'vjs:group-hover/button:[&_.arrow-1]:translate-x-px vjs:group-hover/button:[&_.arrow-1]:-translate-y-px',
    'vjs:group-hover/button:[&_.arrow-2]:-translate-x-px vjs:group-hover/button:[&_.arrow-2]:translate-y-px',
  ),
  FullscreenExitIcon: cn(
    'fullscreen-exit-icon',
    'vjs:[&_.arrow-1]:translate-x-px vjs:[&_.arrow-1]:-translate-y-px',
    'vjs:[&_.arrow-2]:-translate-x-px vjs:[&_.arrow-2]:translate-y-px',
    'vjs:group-hover/button:[&_.arrow-1]:translate-0',
    'vjs:group-hover/button:[&_.arrow-2]:translate-0',
  ),
  FullscreenTooltipPopup: cn(
    'vjs:[&_.fullscreen-enter-tooltip]:inline vjs:[&[data-fullscreen]_.fullscreen-enter-tooltip]:hidden',
    'vjs:[&_.fullscreen-exit-tooltip]:hidden vjs:[&[data-fullscreen]_.fullscreen-exit-tooltip]:inline',
  ),
  FullscreenEnterTooltip: cn('fullscreen-enter-tooltip'),
  FullscreenExitTooltip: cn('fullscreen-exit-tooltip'),
  TimeSliderRoot: cn('vjs:mx-2'),
  TimeDisplay: cn('vjs:tabular-nums vjs:text-shadow-2xs/20'),
  DurationDisplay: cn('vjs:text-white/50 vjs:contents'),
  SliderRoot: cn(
    'vjs:flex vjs:items-center vjs:justify-center vjs:flex-1 vjs:group/slider vjs:relative vjs:rounded-full',
    'vjs:[&[data-orientation="horizontal"]]:h-5 vjs:[&[data-orientation="horizontal"]]:min-w-20',
    'vjs:[&[data-orientation="vertical"]]:w-5 vjs:[&[data-orientation="vertical"]]:h-18',
  ),
  SliderTrack: cn(
    'vjs:relative vjs:select-none vjs:rounded-[inherit] vjs:bg-white/10',
    'vjs:[&[data-orientation="horizontal"]]:w-full vjs:[&[data-orientation="horizontal"]]:h-[0.1875rem]',
    'vjs:[&[data-orientation="vertical"]]:w-[0.1875rem]',
    'vjs:-outline-offset-2 vjs:group-focus-visible/slider-root:outline-2 vjs:group-focus-visible/slider-root:outline-offset-2 vjs:group-focus-visible/slider-root:outline-white',
  ),
  SliderProgress: cn('vjs:bg-white vjs:rounded-[inherit]'),
  SliderPointer: cn('vjs:hidden'),
  SliderThumb: cn(
    'vjs:opacity-0 vjs:scale-70 vjs:group-hover/slider:opacity-100 vjs:group-hover/slider:scale-100 vjs:focus-visible:opacity-100 vjs:focus-visible:scale-100',
    'vjs:bg-white vjs:z-10 vjs:size-3 vjs:select-none vjs:ring vjs:ring-black/10 vjs:rounded-full vjs:shadow-sm vjs:shadow-black/15 vjs:transition-[opacity,scale] vjs:ease-out',
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
    'vjs:py-2',
  ),
  TooltipPopup: cn(
    'vjs:whitespace-nowrap vjs:flex vjs:flex-col vjs:rounded vjs:text-white vjs:text-xs vjs:@7xl/root:text-sm vjs:px-2 vjs:py-1 vjs:bg-white/20 vjs:backdrop-blur-3xl vjs:backdrop-saturate-150 vjs:backdrop-brightness-90 vjs:shadow-md vjs:shadow-black/5',
  ),
};

export default styles;
