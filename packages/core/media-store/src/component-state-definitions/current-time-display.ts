/**
 * @fileoverview Current time display component state definition
 *
 * This module provides the component state definition for current time display
 * components across HTML, React, and React Native platforms. The current time
 * display is a read-only component that shows the current playback time of media.
 */

/**
 * State interface for current time display components
 */
export interface CurrentTimeDisplayState {
  /** The current time value in seconds */
  currentTime: number | undefined;

  /** The total duration in seconds (for future functionality) */
  duration: number | undefined;
}

/**
 * Current time display component state definition following VJS-10 patterns.
 * This provides a read-only display component that shows the current playback time.
 */
export const currentTimeDisplayStateDefinition = {
  /**
   * Keys from the media store that this component depends on
   */
  keys: ['currentTime', 'duration'] as const,

  /**
   * Transform raw media store state into current time display component state
   * @param rawState - Raw state from media store
   * @returns Transformed state for current time display component
   */
  stateTransform: (rawState: Record<string, any>): CurrentTimeDisplayState => {
    const { currentTime, duration } = rawState;

    return {
      currentTime,
      duration,
    };
  },

  /**
   * Current time display is read-only, so no request methods are needed
   * @param _dispatch - Dispatch function (unused)
   * @returns Empty object (no request methods)
   */
  createRequestMethods: (_dispatch: (action: { type: string; detail?: any }) => void) => ({}),
};

/**
 * Type helper to extract the state type from the current time display state definition
 */
export type CurrentTimeDisplayStateDefinition = typeof currentTimeDisplayStateDefinition;

/**
 * Type helper to extract the transformed state type
 */
export type CurrentTimeDisplayComponentState = ReturnType<typeof currentTimeDisplayStateDefinition.stateTransform>;

/**
 * Type helper to extract the request methods type (empty for read-only component)
 */
export type CurrentTimeDisplayRequestMethods = ReturnType<
  typeof currentTimeDisplayStateDefinition.createRequestMethods
>;
