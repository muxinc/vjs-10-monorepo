export interface TimeSliderState {
  currentTime: number;
  duration: number;
  previewTime: number;
}

export interface TimeSliderMethods {
  requestSeek: (time: number) => void;
  requestPreview: (time: number) => void;
}

export interface TimeSliderStateDefinition {
  keys: string[];
  stateTransform: (rawState: any) => TimeSliderState;
  createRequestMethods: (dispatch: (action: { type: string; detail?: any }) => void) => TimeSliderMethods;
}

/**
 * TimeSlider state definition
 * Defines the core state logic that can be shared between implementations
 */
export const timeSliderStateDefinition: TimeSliderStateDefinition = {
  keys: ['currentTime', 'duration', 'previewTime'],
  stateTransform: (rawState: any) => ({
    currentTime: rawState.currentTime ?? 0,
    duration: rawState.duration ?? 0,
    previewTime: rawState.previewTime ?? 0,
  }),
  createRequestMethods: dispatch => ({
    requestSeek: (time: number) => {
      dispatch({ type: 'seekrequest', detail: time });
    },
    requestPreview: (time: number) => {
      dispatch({ type: 'previewrequest', detail: time });
    },
  }),
};
