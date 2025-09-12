/**
 * @fileoverview Duration display component state definition
 * 
 * This module provides the component state definition for duration display
 * components across HTML, React, and React Native platforms. The duration
 * display is a read-only component that shows the total duration of media.
 */

import { formatDuration, formatAsTimePhrase, isValidDuration } from '../utils/time';

/**
 * State interface for duration display components
 */
export interface DurationDisplayState {
  /** The raw duration value in seconds */
  duration: number | undefined;
  
  /** Whether the duration is valid and should be displayed */
  isValidDuration: boolean;
  
  /** Formatted duration string for display (e.g., "4:32" or "--:--") */
  formattedDuration: string;
  
  /** Human-readable duration phrase for accessibility (e.g., "4 minutes, 32 seconds") */
  durationPhrase: string;
}

/**
 * Duration display component state definition following VJS-10 patterns.
 * This provides a read-only display component that shows the total media duration.
 */
export const durationDisplayStateDefinition = {
  /**
   * Keys from the media store that this component depends on
   */
  keys: ['duration'] as const,

  /**
   * Transform raw media store state into duration display component state
   * @param rawState - Raw state from media store
   * @returns Transformed state for duration display component
   */
  stateTransform: (rawState: Record<string, any>): DurationDisplayState => {
    const { duration } = rawState;
    const isValid = isValidDuration(duration);
    
    return {
      duration,
      isValidDuration: isValid,
      formattedDuration: formatDuration(duration),
      durationPhrase: isValid ? formatAsTimePhrase(duration) : 'Duration unknown',
    };
  },

  /**
   * Duration display is read-only, so no request methods are needed
   * @param _dispatch - Dispatch function (unused)
   * @returns Empty object (no request methods)
   */
  createRequestMethods: (_dispatch: (action: { type: string; detail?: any }) => void) => ({}),
} as const;

/**
 * Type helper to extract the state type from the duration display state definition
 */
export type DurationDisplayStateDefinition = typeof durationDisplayStateDefinition;

/**
 * Type helper to extract the transformed state type
 */
export type DurationDisplayComponentState = ReturnType<typeof durationDisplayStateDefinition.stateTransform>;

/**
 * Type helper to extract the request methods type (empty for read-only component)
 */
export type DurationDisplayRequestMethods = ReturnType<typeof durationDisplayStateDefinition.createRequestMethods>;