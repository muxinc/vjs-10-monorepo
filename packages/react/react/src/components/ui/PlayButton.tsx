import type { ElementType, PropsWithChildren } from 'react';

type DefaultPlayButtonState = { mediaPaused: boolean };
type DefaultPlayButtonEventCallbacks = {
  onmediaplayrequest: (event: Pick<CustomEvent, 'type'>) => void;
  onmediapauserequest: (event: Pick<CustomEvent, 'type'>) => void;
};
type ComponentType = ElementType<
  Partial<
    PropsWithChildren<DefaultPlayButtonState & DefaultPlayButtonEventCallbacks>
  >
>;

const PlayButton: ComponentType = ({
  mediaPaused,
  onmediaplayrequest,
  onmediapauserequest,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      data-paused={mediaPaused || undefined}
      onClick={() => {
        const type = mediaPaused ? 'mediaplayrequest' : 'mediapauserequest';
        /** @TODO Discuss tradeoffs of requiring passing in object with type, esp. since callback already identifies action type (CJP) */
        mediaPaused
          ? onmediaplayrequest?.({ type })
          : onmediapauserequest?.({
              type,
            });
      }}
    >
      {children}
    </button>
  );
};

export default PlayButton;
