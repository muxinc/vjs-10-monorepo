import type { StyleProcessor } from './types.js';

/**
 * Placeholder style processor that returns an empty string
 *
 * This is a temporary processor used until CSS processing
 * (Tailwind, CSS Modules, vanilla CSS) is implemented.
 *
 * @returns Empty string (no styles)
 */
export const placeholderStyleProcessor: StyleProcessor = () => {
  return '';
};
