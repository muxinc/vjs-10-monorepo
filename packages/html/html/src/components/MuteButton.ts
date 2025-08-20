import { toConnectedHTMLComponent, StateHook, PropsHook, EventsHook } from '../utils/component-factory';
import { MediaMuteButton } from './ui/media-mute-button';

/**
 * MuteButton state hook - equivalent to React's useMuteButtonState
 * Handles media store state subscription and transformation
 */
export const useMuteButtonState: StateHook<{ muted: boolean; volumeLevel: string }> = {
  keys: ['mediaMuted', 'mediaVolumeLevel'],
  transform: (rawState) => ({
    muted: rawState.mediaMuted ?? false,
    volumeLevel: rawState.mediaVolumeLevel ?? 'off'
  })
};

/**
 * MuteButton props hook - equivalent to React's useMuteButtonProps
 * Handles element attributes and properties based on state
 */
export const useMuteButtonProps: PropsHook<{ muted: boolean; volumeLevel: string }> = (state, element) => {
  // Handle boolean data attribute: present with empty string when true, absent when false
  // This matches the React component behavior exactly
  if (state.muted) {
    element.setAttribute('data-muted', '');
  } else {
    element.removeAttribute('data-muted');
  }
  
  // Set volume level data attribute
  element.setAttribute('data-volume-level', state.volumeLevel);
  
  // Set element properties for backwards compatibility
  // @ts-ignore - Custom element property
  element.mediaMuted = state.muted;
  // @ts-ignore - Custom element property
  element.mediaVolumeLevel = state.volumeLevel;
};

/**
 * MuteButton events hook - equivalent to React's event handlers
 * Handles event dispatch to media store
 */
export const useMuteButtonEvents: EventsHook = {
  events: ['mediamuterequest', 'mediaunmuterequest'],
  handler: (event, mediaStore) => {
    if (['mediamuterequest', 'mediaunmuterequest'].includes(event.type)) {
      const { type, detail } = event;
      mediaStore.dispatch({ type, detail });
    }
  }
};

/**
 * Connected MuteButton component using hook-style architecture
 * Equivalent to React's MuteButton = toConnectedComponent(...)
 */
export const MuteButton = toConnectedHTMLComponent(
  MediaMuteButton,
  useMuteButtonState,
  useMuteButtonProps,
  useMuteButtonEvents,
  'MuteButton'
);

export default MuteButton;