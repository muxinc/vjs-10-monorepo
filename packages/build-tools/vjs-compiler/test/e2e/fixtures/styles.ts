/**
 * Minimal styles for MinimalTestSkin
 *
 * Purpose: Provide simple Tailwind classes for basic validation
 * Focus: Import transformation, not CSS complexity
 */

export default {
  Container: 'relative w-full h-full',
  Controls: 'absolute bottom-0 left-0 right-0 flex gap-2 p-4',
  Button: 'p-2 rounded-full bg-white/10 hover:bg-white/20',
  PlayIcon: 'opacity-0 [.play-icon]:opacity-100',
  PauseIcon: 'opacity-100 [.pause-icon]:opacity-0',
};
