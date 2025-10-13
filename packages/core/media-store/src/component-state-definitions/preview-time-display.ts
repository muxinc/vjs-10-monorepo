/**
 * @fileoverview Preview time display component state definition
 *
 * This module provides the component state definition for preview time display
 * components across HTML, React, and React Native platforms. The preview time
 * display is a read-only component that shows the preview time when hovering
 * over the time slider.
 */

/**
 * State interface for preview time display components
 */
export interface PreviewTimeDisplayState {
  /** The preview time value in seconds */
  previewTime: number | undefined;
}

/**
 * Preview time display component state definition following VJS-10 patterns.
 * This provides a read-only display component that shows the preview time.
 */
export interface PreviewTimeDisplayStateDefinition {
  keys: (keyof PreviewTimeDisplayState)[];
  stateTransform: (rawState: any) => PreviewTimeDisplayState;
}

/**
 * Preview time display state definition
 * Defines the core state logic that can be shared between implementations
 */
export const previewTimeDisplayStateDefinition: PreviewTimeDisplayStateDefinition = {
  keys: ['previewTime'],
  stateTransform: (rawState: any) => ({
    previewTime: rawState.previewTime ?? 0,
  }),
};
