/**
 * Styles for Level 1: Minimal Test Skin
 *
 * Simple Tailwind utility classes for baseline E2E validation
 */

// A (very crude) utility to merge class names
// Usually I'd use something like `clsx` or `classnames` but this is ok for our simple use case.
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
    'bg-white/80',
    'pointer-events-auto',
  ),
};

export default styles;
