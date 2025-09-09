export interface TimeRangeState {
  currentTime: number;
  duration: number;
}

export interface TimeRangeMethods {
  requestSeek: (time: number) => void;
}

export interface TimeRangeStateDefinition {
  keys: string[];
  stateTransform: (rawState: any) => TimeRangeState;
  createRequestMethods: (
    dispatch: (action: { type: string; detail?: any }) => void,
  ) => TimeRangeMethods;
}

/**
 * TimeRange state definition
 * Defines the core state logic that can be shared between implementations
 */
export const timeRangeStateDefinition: TimeRangeStateDefinition = {
  keys: ['currentTime', 'duration'],
  stateTransform: (rawState: any) => ({
    currentTime: rawState.currentTime ?? 0,
    duration: rawState.duration ?? 0,
  }),
  createRequestMethods: (dispatch) => ({
    requestSeek: (time: number) => {
      dispatch({ type: 'seekrequest', detail: time });
    },
  }),
};