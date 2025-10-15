/**
 * Level 7: Semantic Colors Test Skin - Styles
 *
 * Purpose: Test semantic Tailwind color class support
 *
 * Tailwind Complexity Level 7 Features:
 * - Semantic color classes: bg-blue-500, bg-blue-600
 * - Semantic outline colors: outline-blue-500
 * - Semantic text colors: text-white
 * - Semantic ring colors: ring-blue-300
 *
 * CURRENT STATUS: ❌ NOT YET SUPPORTED
 *
 * This skin intentionally uses semantic color classes (like bg-blue-500)
 * instead of arbitrary values (like bg-[#3b82f6]) to test and document
 * the semantic color limitation in programmatic Tailwind v4 PostCSS usage.
 *
 * Expected behavior:
 * - Compiler will process these classes
 * - Output CSS will have empty color values (e.g., "background-color: ")
 * - Visual appearance will be broken (no colors rendered)
 *
 * See processCSS.ts lines 286-298 for technical details on the limitation.
 *
 * Workaround: Use arbitrary colors:
 * - bg-blue-500 → bg-[#3b82f6]
 * - bg-blue-600 → bg-[#2563eb]
 * - outline-blue-500 → outline-[#3b82f6]
 * - ring-blue-300 → ring-[#93c5fd]
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
    'bg-blue-500',              // ❌ Semantic color - will NOT compile correctly
    'hover:bg-blue-600',        // ❌ Semantic color - will NOT compile correctly
    'focus:ring-2',
    'focus:ring-blue-300',      // ❌ Semantic color - will NOT compile correctly
    'focus:outline-none',
    'active:scale-95',
    'transition-all',
    'duration-200',
    'ease-in-out',
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
