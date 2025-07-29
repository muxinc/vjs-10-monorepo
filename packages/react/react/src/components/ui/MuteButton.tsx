import * as React from 'react';
import type { ElementType, PropsWithChildren } from 'react';

type DefaultMuteButtonState = { mediaVolumeLevel: string };
type DefaultMuteButtonEventCallbacks = {
  onmediamuterequest: (event: Pick<CustomEvent, 'type'>) => void;
  onmediaunmuterequest: (event: Pick<CustomEvent, 'type'>) => void;
};
type ComponentType = ElementType<
  PropsWithChildren<
    Partial<DefaultMuteButtonState & DefaultMuteButtonEventCallbacks>
  >
>;

const MuteButton: ComponentType = ({
  mediaVolumeLevel,
  onmediamuterequest,
  onmediaunmuterequest,
  children,
  ...props
}) => {
  const mediaMuted = mediaVolumeLevel === 'off';
  console.log('mediaVolumeLevel', mediaVolumeLevel);
  return (
    <button
      {...props}
      data-muted={mediaMuted || undefined}
      data-volume-level={mediaVolumeLevel}
      onClick={() => {
        const type = mediaMuted ? 'mediaunmuterequest' : 'mediamuterequest';
        console.log('clicked', type);
        /** @TODO Discuss tradeoffs of requiring passing in object with type, esp. since callback already identifies action type (CJP) */
        mediaMuted
          ? onmediaunmuterequest?.({
              type,
            })
          : onmediamuterequest?.({
              type,
            });
      }}
    >
      {children}
    </button>
  );
};

export default MuteButton;
