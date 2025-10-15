import { cn } from '../utils';

/**
 * Level 10: Named Groups
 *
 * Tests Tailwind's named group feature for nested group interactions.
 * Named groups allow multiple group levels with explicit names (group/name).
 *
 * Key features:
 * - Named groups: group/root, group/controls
 * - Named group hover: group-hover/root:
 * - Nested group interactions
 * - Multiple simultaneous groups
 */

const styles = {
  // Root wrapper with named group
  Wrapper: cn(
    'group/root',
    'relative',
    'transition-transform',
    'duration-300',
  ),

  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
    'bg-[#000]/30',
    'backdrop-blur-sm',
    'transition-all',
    'duration-300',
    // When root group is hovered, increase overlay darkness
    'group-hover/root:bg-[#000]/50',
    'group-hover/root:backdrop-blur-md',
  ),

  // Controls container with its own named group
  ControlsContainer: cn(
    'group/controls',
    'flex',
    'gap-2',
    'items-center',
  ),

  Button: cn(
    'p-4',
    'rounded-full',
    'bg-[#3b82f6]/90',
    'color-[#fff]',
    'transition-all',
    'duration-200',
    'pointer-events-auto',
    'display-grid',
    // When button itself is hovered
    'hover:bg-[#2563eb]',
    'hover:scale-110',
    // When root group is hovered
    'group-hover/root:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    // When controls group is hovered (any button in controls)
    'group-hover/controls:ring-2',
    'group-hover/controls:ring-[#fff]/30',
  ),

  Icon: cn(
    '[grid-area:1/1]',
    'transition-opacity',
    'duration-200',
    // Icons scale when their button is hovered
    'group-hover:scale-110',
  ),

  PlayIcon: cn('opacity-0'),
  PauseIcon: cn('opacity-100'),
};

export default styles;
