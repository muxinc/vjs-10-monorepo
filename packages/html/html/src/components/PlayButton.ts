import { toConnectedHTMLComponent, StateHook, PropsHook, EventsHook } from '../utils/component-factory';
import { MediaPlayButton } from './ui/media-play-button';

/**
 * PlayButton state hook - equivalent to React's usePlayButtonState
 * Handles media store state subscription and transformation
 */
export const usePlayButtonState: StateHook<{ paused: boolean }> = {
  keys: ['mediaPaused'],
  transform: (rawState) => ({
    paused: rawState.mediaPaused ?? true
  })
};

/**
 * PlayButton props hook - equivalent to React's usePlayButtonProps  
 * Handles element attributes and properties based on state
 */
export const usePlayButtonProps: PropsHook<{ paused: boolean }> = (state, element) => {
  // Handle boolean data attribute: present with empty string when true, absent when false
  // This matches the React component behavior exactly
  if (state.paused) {
    element.setAttribute('data-paused', '');
  } else {
    element.removeAttribute('data-paused');
  }
  
  // Set element property for backwards compatibility
  // @ts-ignore - Custom element property
  element.mediaPaused = state.paused;
};

/**
 * PlayButton events hook - equivalent to React's event handlers
 * Handles event dispatch to media store
 */
export const usePlayButtonEvents: EventsHook = {
  events: ['mediaplayrequest', 'mediapauserequest'],
  handler: (event, mediaStore) => {
    if (['mediaplayrequest', 'mediapauserequest'].includes(event.type)) {
      const { type, detail } = event;
      mediaStore.dispatch({ type, detail });
    }
  }
};

/**
 * Connected PlayButton component using hook-style architecture
 * Equivalent to React's PlayButton = toConnectedComponent(...)
 */
export const PlayButton = toConnectedHTMLComponent(
  MediaPlayButton,
  usePlayButtonState,
  usePlayButtonProps,
  usePlayButtonEvents,
  'PlayButton'
);

export default PlayButton;