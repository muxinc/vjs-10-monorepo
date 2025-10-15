/**
 * Level 12: Container Queries Test Skin - Styles
 *
 * Purpose: Test container query support (@container, @Nxl/name)
 *
 * Tailwind Complexity Level 12 Features:
 * - @container/name - Define named containers
 * - @sm/name:* - Small container (≥ 20rem / 320px)
 * - @md/name:* - Medium container (≥ 28rem / 448px)
 * - @lg/name:* - Large container (≥ 32rem / 512px)
 * - @xl/name:* - Extra large container (≥ 36rem / 576px)
 * - @2xl/name:* - 2X large container (≥ 42rem / 672px)
 *
 * Expected transformations:
 * - @container/name → container-type: size; container-name: name;
 * - @md/name:text-lg → @container name (min-width: 28rem) { .class { font-size: 1.125rem; } }
 * - Multiple named containers with independent queries
 */

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: cn(
    'relative',
    '@container/root', // Define root container
  ),

  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
    'bg-[#000]/30',
    // Container query: change background opacity at larger sizes
    '@md/root:bg-[#000]/40',
    '@lg/root:bg-[#000]/50',
  ),

  ControlsContainer: cn(
    '@container/controls', // Define nested controls container
    'flex',
    'flex-col',
    'items-center',
    'gap-2',
    // Container query: switch to row layout at medium size
    '@md/controls:flex-row',
    '@md/controls:gap-4',
  ),

  Button: cn(
    'rounded-full',
    'bg-[#3b82f6]/90',
    'text-white',
    'transition-all',
    'pointer-events-auto',
    'grid',
    // Base size
    'p-2',
    // Container queries for button sizing
    '@sm/root:p-3',
    '@md/root:p-4',
    '@lg/root:p-5',
    '@xl/root:p-6',
    // Icon stacking (from Level 2)
    '[&_.icon]:[grid-area:1/1]',
    '[&_.play-icon]:opacity-0',
    '[&[data-paused]_.play-icon]:opacity-100',
    '[&_.pause-icon]:opacity-100',
    '[&[data-paused]_.pause-icon]:opacity-0',
  ),

  Icon: cn(
    'icon',
    'transition-opacity',
    // Container query: scale icons at larger sizes
    '@md/root:scale-110',
    '@lg/root:scale-125',
  ),

  PlayIcon: cn('play-icon'),
  PauseIcon: cn('pause-icon'),

  Label: cn(
    'text-white',
    'pointer-events-auto',
    // Base size (hidden by default)
    'text-xs',
    'opacity-0',
    // Container queries: show and scale text at larger sizes
    '@sm/controls:opacity-100',
    '@md/controls:text-sm',
    '@lg/controls:text-base',
    '@xl/controls:text-lg',
  ),
};

export default styles;
