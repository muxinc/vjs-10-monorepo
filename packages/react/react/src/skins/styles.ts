// Utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
// It just makes the billions of Tailwind classes a little easier to read.
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const styles = {
  MediaContainer: cn(
    'relative @container/root group/root overflow-clip rounded-4xl',
    // Prevent rounded corners in fullscreen.
    '[&:fullscreen]:rounded-none [&:fullscreen]:[&_video]:h-full [&:fullscreen]:[&_video]:w-full',
    // Fancy borders.
    'after:absolute after:inset-0 after:ring-black/10 after:ring-1 dark:after:ring-black/40 after:ring-inset after:z-10 after:pointer-events-none after:rounded-[inherit]',
    'before:absolute before:inset-px before:rounded-[inherit] before:ring-white/15 before:ring-1 before:ring-inset before:z-10 before:pointer-events-none',
    // Ensure the nested video inherits the radius.
    '[&_video]:rounded-[inherit]',
  ),
  Overlay: cn(
    'opacity-0 delay-500 rounded-[inherit] absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity backdrop-saturate-150 backdrop-brightness-90',
    // Hide when playing (for now).
    // This is crude temporary logic, we’ll improve it later I guess with a [data-show-controls] attribute or something?
    'has-[+.controls_[data-paused]]:opacity-100 has-[+.controls_[data-paused]]:delay-0',
    'group-hover/root:opacity-100 group-hover/root:delay-0',
  ),
  Controls: cn(
    'controls', // Temporary className hook for above logic. Can be removed once have a proper selector as above.
    '@container/controls absolute inset-x-3 bottom-3 rounded-full z-20 flex items-center p-1 ring ring-white/10 ring-inset gap-0.5 text-white text-shadow',
    'shadow-sm shadow-black/15',
    // Background
    'bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90',
    // Animation
    'transition will-change-transform origin-bottom ease-out',
    // Temporary hide/show logic
    'scale-90 opacity-0 delay-500',
    'has-[[data-paused]]:scale-100 has-[[data-paused]]:opacity-100 has-[[data-paused]]:delay-0',
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
    'hocus:no-underline hocus:bg-white/10 hocus:text-white',
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
    'grid [&_svg]:[grid-area:1/1]',
    '[&_svg]:shrink-0 [&_svg]:transition-opacity [&_svg]:duration-300 [&_svg]:ease-out [&_svg]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] [&_svg]:shadow-black/20',
  ),
  PlayButton: cn(
    '[&_.pause-icon]:opacity-100 [&[data-paused]_.pause-icon]:opacity-0',
    '[&_.play-icon]:opacity-0 [&[data-paused]_.play-icon]:opacity-100',
  ),
  PlayIcon: cn('play-icon'),
  PauseIcon: cn('pause-icon'),
  VolumeButton: cn(
    '[&_svg]:opacity-0',
    '[&[data-volume-level="high"]_.volume-high-icon]:opacity-100',
    '[&[data-volume-level="medium"]_.volume-low-icon]:opacity-100',
    '[&[data-volume-level="low"]_.volume-low-icon]:opacity-100',
    '[&[data-volume-level="off"]_.volume-off-icon]:opacity-100',
  ),
  VolumeHighIcon: cn('volume-high-icon'),
  VolumeLowIcon: cn('volume-low-icon'),
  VolumeOffIcon: cn('volume-off-icon'),
  FullScreenButton: cn(
    '[&_.fullscreen-enter-icon]:opacity-100 [&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0',
    '[&_.fullscreen-exit-icon]:opacity-0 [&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100',
    '[&_path]:transition-transform ease-out',
  ),
  FullScreenEnterIcon: cn(
    'fullscreen-enter-icon',
    'group-hover/button:[&_.arrow-1]:-translate-x-px group-hover/button:[&_.arrow-1]:-translate-y-px',
    'group-hover/button:[&_.arrow-2]:translate-x-px group-hover/button:[&_.arrow-2]:translate-y-px',
  ),
  FullScreenExitIcon: cn(
    'fullscreen-exit-icon',
    '[&_.arrow-1]:-translate-x-px [&_.arrow-1]:-translate-y-px',
    '[&_.arrow-2]:translate-x-px [&_.arrow-2]:translate-y-px',
    'group-hover/button:[&_.arrow-1]:translate-0',
    'group-hover/button:[&_.arrow-2]:translate-0',
  ),
  TimeControls: cn('flex-1 flex items-center gap-3 px-1.5'),
  TimeDisplay: cn(
    'tabular-nums text-sm @7xl/root:text-base text-shadow-2xs shadow-black/50'
  ),
  TimeRangeRoot: cn('flex h-5 items-center flex-1 group/slider relative'),
  TimeRangeTrack: cn('h-1 w-full relative select-none rounded-full bg-white/20 ring-1 ring-black/5'),
  TimeRangeProgress: cn('bg-white rounded-[inherit]'),
  // TODO: Work out what we want to do here.
  TimeRangePointer: cn('rounded-[inherit]'),
  TimeRangeThumb: cn(
    'bg-white z-10 select-none ring ring-black/10 rounded-full shadow-sm shadow-black/15',
    'opacity-0 transition-[opacity,height,width] ease-in-out',
    '-outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    'group-hover/slider:opacity-100 group-focus-within/slider:opacity-100',
    'size-2.5 active:size-3 group-active/slider:size-3',
  )
}

export default styles;