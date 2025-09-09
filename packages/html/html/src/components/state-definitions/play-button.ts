export interface PlayButtonState {
  paused: boolean;
}

export interface PlayButtonMethods {
  requestPlay: () => void;
  requestPause: () => void;
}

export interface PlayButtonStateDefinition {
  keys: string[];
  stateTransform: (rawState: any) => PlayButtonState;
  createRequestMethods: (
    dispatch: (action: { type: string }) => void,
  ) => PlayButtonMethods;
}

/**
 * PlayButton state definition
 * Defines the core state logic that can be shared between implementations
 */
export const playButtonStateDefinition: PlayButtonStateDefinition = {
  keys: ['paused'],

  stateTransform: (rawState: any): PlayButtonState => ({
    paused: rawState.paused ?? true,
  }),

  createRequestMethods: (dispatch): PlayButtonMethods => ({
    requestPlay: () => dispatch({ type: 'playrequest' }),
    requestPause: () => dispatch({ type: 'pauserequest' }),
  }),
};
