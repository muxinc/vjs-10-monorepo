import type { MediaToastedSkinStyles } from "./types";

// Utility to merge class names
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles: MediaToastedSkinStyles = {
  MediaContainer: cn(
    'relative @container/root group/root overflow-clip bg-black',
    // Base typography
    'text-sm',
    // 'ring-1 ring-inset ring-black/10 dark:ring-white/10',
    'after:absolute after:inset-0 after:ring-black/10 after:ring-1 dark:after:ring-white/10 after:ring-inset after:z-10 after:pointer-events-none after:rounded-[inherit]',
    // Prevent rounded corners in fullscreen.
    '[&:fullscreen]:rounded-none [&:fullscreen]:[&_video]:h-full [&:fullscreen]:[&_video]:w-full',
    // Ensure the nested video inherits the radius.
    '[&_video]:rounded-[inherit] [&_video]:w-full [&_video]:h-auto',
  ),
  Controls: cn(
    '@container/controls absolute inset-x-0 bottom-0 top-1/3 flex flex-col justify-end z-20 px-2.5 pb-2.5 text-white text-shadow',
    'shadow-sm shadow-black/15',
    // Background
    'bg-gradient-to-t from-stone-950/70 via-stone-950/60 via-35% to-transparent',
    // Animation
    'transition ease-in-out',
    //  FIXME: Temporary hide/show logic
    'translate-y-full opacity-0 delay-500 pointer-events-none',
    'has-[[data-paused]]:translate-y-0 has-[[data-paused]]:opacity-100 has-[[data-paused]]:delay-0 has-[[data-paused]]:pointer-events-auto',
    'group-hover/root:translate-y-0 group-hover/root:opacity-100 group-hover/root:delay-0 group-hover/root:pointer-events-auto',
  ),
  ControlsRow: cn('flex items-center justify-between'),
  Button: cn(
    'group/button cursor-pointer relative shrink-0 transition select-none p-2 rounded-md',
    // Background/foreground
    'bg-transparent text-white/90',
    // Hover and focus states
    'hover:no-underline hover:bg-stone-100/10 hover:backdrop-blur-md hover:text-white focus-visible:no-underline focus-visible:bg-stone-100/10 focus-visible:text-white',
    // Focus state
    '-outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
    // Disabled state
    'aria-disabled:grayscale aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
    // Loading state
    'aria-busy:pointer-events-none aria-busy:cursor-not-allowed',
    // Expanded state
    'aria-expanded:bg-stone-100/10 aria-expanded:text-white',
    // Pressed state
    'active:scale-95',
  ),
  IconButton: cn(
    'grid',
    '[&_.icon]:[grid-area:1/1] [&_.icon]:shrink-0 [&_.icon]:transition [&_.icon]:duration-300 [&_.icon]:ease-out [&_.icon]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] [&_.icon]:shadow-black/20',
  ),
  Icon: cn('icon'),
  PlayButton: cn(
    '[&_.pause-icon]:opacity-100 [&[data-paused]_.pause-icon]:opacity-0',
    '[&_.play-icon]:opacity-0 [&[data-paused]_.play-icon]:opacity-100',
  ),
  PlayIcon: cn('play-icon', 'icon'),
  PauseIcon: cn('pause-icon', 'icon'),
  VolumeControls: cn('flex items-center flex-row-reverse group/volume'),
  VolumeSlider: cn(
    'w-0 px-3 overflow-hidden pointer-events-none transition-[opacity,width] opacity-0 ease-out delay-500',
    'group-hover/volume:w-28 group-hover/volume:pointer-events-auto group-hover/volume:opacity-100 group-hover/volume:delay-0',
    'group-focus-within/volume:w-28 group-focus-within/volume:pointer-events-auto group-focus-within/volume:opacity-100 group-focus-within/volume:delay-0',
  ),
  MuteButton: cn(
    // Hide all icons by default
    '[&_.icon]:opacity-0',
    // Show volume-high-icon when data-volume-level="high"
    '[&[data-volume-level="high"]_.volume-high-icon]:opacity-100',
    // Show volume-low-icon when data-volume-level="medium" or "low"
    '[&[data-volume-level="medium"]_.volume-low-icon]:opacity-100',
    '[&[data-volume-level="low"]_.volume-low-icon]:opacity-100',
    // Show volume-off-icon when data-volume-level="off"
    '[&[data-volume-level="off"]_.volume-off-icon]:opacity-100'
  ),
  // Volume icons
  VolumeHighIcon: cn('volume-high-icon', 'icon'),
  VolumeLowIcon: cn('volume-low-icon', 'icon'),
  VolumeOffIcon: cn('volume-off-icon', 'icon'),
  FullscreenButton: cn(
    '[&_.fullscreen-enter-icon]:opacity-100 [&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0',
    '[&_.fullscreen-exit-icon]:opacity-0 [&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100',
    '[&_path]:transition-transform ease-out',
  ),
  FullscreenEnterIcon: cn(
    'fullscreen-enter-icon',
    'icon',
    'group-hover/button:[&_.arrow-1]:-translate-x-px group-hover/button:[&_.arrow-1]:-translate-y-px',
    'group-hover/button:[&_.arrow-2]:translate-x-px group-hover/button:[&_.arrow-2]:translate-y-px',
  ),
  FullscreenExitIcon: cn(
    'fullscreen-exit-icon',
    'icon',
    '[&_.arrow-1]:-translate-x-px [&_.arrow-1]:-translate-y-px',
    '[&_.arrow-2]:translate-x-px [&_.arrow-2]:translate-y-px',
    'group-hover/button:[&_.arrow-1]:translate-0',
    'group-hover/button:[&_.arrow-2]:translate-0',
  ),
  TimeRangeThumb: cn(
    'opacity-0',
    'group-hover/range:opacity-100 group-focus-within/range:opacity-100',
  ),
  TimeDisplay: cn('tabular-nums text-shadow-2xs shadow-black/50'),
  RangeRoot: cn(
    'flex items-center justify-center flex-1 group/range relative',
    '[&[data-orientation="horizontal"]]:h-5 [&[data-orientation="horizontal"]]:min-w-20',
    '[&[data-orientation="vertical"]]:w-5 [&[data-orientation="vertical"]]:h-20',
  ),
  RangeTrack: cn(
    'relative select-none rounded-full bg-white/25 backdrop-blur-sm backdrop-brightness-90 backdrop-saturate-150 shadow-sm shadow-black/10',
    '[&[data-orientation="horizontal"]]:w-full [&[data-orientation="horizontal"]]:h-1',
    '[&[data-orientation="vertical"]]:w-1',
  ),
  RangeProgress: cn('bg-amber-500 rounded-[inherit]'),
  // TODO: Work out what we want to do here.
  RangePointer: cn('rounded-[inherit]'),
  RangeThumb: cn(
    'bg-white z-10 select-none ring ring-black/10 rounded-full shadow-sm shadow-black/15 transition-[opacity,height,width] ease-in-out',
    '-outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
    'size-3 active:size-3.5 group-active/range:size-3.5 hover:cursor-ew-resize',
  ),
};

export default styles;
