import { cn } from '../utils';

/**
 * Level 11: ARIA States
 *
 * Tests Tailwind's ARIA state selectors for accessibility-driven styling
 */
const styles = {
  // Wrapper with basic styles
  Wrapper: cn(
    'relative',
  ),

  // Overlay with basic backdrop
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
    'bg-[#000]/30',
    'backdrop-blur-sm',
  ),

  // Button with ARIA state variants
  Button: cn(
    'p-4',
    'rounded-full',
    'bg-[#3b82f6]/90',
    'text-white',
    'transition-all',
    'duration-300',
    'pointer-events-auto',
    'grid',
    // ARIA disabled state
    'aria-disabled:opacity-50',
    'aria-disabled:cursor-not-allowed',
    'aria-disabled:bg-[#64748b]',
    // ARIA busy state
    'aria-busy:opacity-70',
    'aria-busy:animate-pulse',
    // ARIA pressed state
    'aria-pressed:bg-[#1e40af]',
    'aria-pressed:ring-2',
    'aria-pressed:ring-[#fff]/30',
    // Normal hover (when not disabled)
    'hover:bg-[#2563eb]',
    'hover:scale-110',
    // Aria-disabled overrides hover
    'aria-disabled:hover:bg-[#64748b]',
    'aria-disabled:hover:scale-100',
  ),

  // Icon with state-based transitions
  PlayIcon: cn(
    'grid-area-[1/1]',
    'transition-opacity',
    'duration-200',
    'opacity-0',
    // Scale down when button is busy
    'aria-busy:scale-90',
  ),

  PauseIcon: cn(
    'grid-area-[1/1]',
    'transition-opacity',
    'duration-200',
    'opacity-100',
    // Scale down when button is busy
    'aria-busy:scale-90',
  ),
};

export default styles;
