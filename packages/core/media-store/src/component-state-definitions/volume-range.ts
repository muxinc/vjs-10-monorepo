export interface VolumeRangeState {
  volume: number;
  muted: boolean;
  volumeLevel: 'high' | 'medium' | 'low' | 'off';
}

export interface VolumeRangeMethods {
  requestVolumeChange: (volume: number) => void;
}

export interface VolumeRangeStateDefinition {
  keys: string[];
  stateTransform: (rawState: any) => VolumeRangeState;
  createRequestMethods: (
    dispatch: (action: { type: string; detail?: any }) => void,
  ) => VolumeRangeMethods;
}

/**
 * VolumeRange state definition
 * Defines the core state logic that can be shared between implementations
 */
export const volumeRangeStateDefinition: VolumeRangeStateDefinition = {
  keys: ['volume', 'muted', 'volumeLevel'],
  stateTransform: (rawState: any) => ({
    volume: rawState.volume ?? 1,
    muted: rawState.muted ?? false,
    volumeLevel: rawState.volumeLevel ?? 'high',
  }),
  createRequestMethods: (dispatch) => ({
    /**
     * @TODO Unmuting is owned by the "request-map" in media-chrome.
     * The closest equivalent to that is the "actions" in the current architecture.
     * Should unmuting live here (even if "here" gets promoted to the state model) or "actions" or state setter?
     * Currently this is solved in the state setter (as is the corresponding unmute behavior). See state-mediators/audible for details. (CJP)
     **/
    requestVolumeChange: (volume: number) => {
      // if (volume > 0) {
      //   dispatch({ type: 'unmuterequest' });
      // }
      dispatch({ type: 'volumerequest', detail: volume });
    },
  }),
};
