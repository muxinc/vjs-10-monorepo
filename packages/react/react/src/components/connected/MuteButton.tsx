// NOTE: This is an example of a "skeletal" connected component definition of a Mute Button. It "knows about" A Media (UI) Store and expects
// to be provided a non-connected component
import * as React from 'react';
import { useMediaDispatch, useMediaSelector } from '@vjs-10/react-media-store';
import type { CSSProperties, ElementType, PropsWithChildren } from 'react';

/** @TODO Export more types. Define more contracts (CJP) */
type MediaCallbackType = ReturnType<typeof useMediaDispatch>;

type DefaultMuteButtonState = { mediaVolumeLevel: string };
/** @TODO Support camel case deeply for callbacks. Define these as consts and types in core lib with clear relationships to event types (CJP) */
type DefaultMuteButtonEventCallbacks = {
  onmediamuterequest: MediaCallbackType;
  onmediaunmuterequest: MediaCallbackType;
};
type ComponentType = ElementType<
  PropsWithChildren<
    Partial<
      DefaultMuteButtonState &
        DefaultMuteButtonEventCallbacks & {
          className: string | undefined;
          style: CSSProperties | undefined;
        }
    >
  >
>;

const MuteButton = ({
  component,
  children,
  ...props
}: PropsWithChildren<{
  component: ComponentType;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}>) => {
  const Component = component;
  const dispatch = useMediaDispatch();
  // @ts-ignore - State type issues
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel);
  console.log('mediaVolumeLevel', mediaVolumeLevel);
  return (
    <Component
      {...props}
      onmediamuterequest={dispatch}
      onmediaunmuterequest={dispatch}
      mediaVolumeLevel={mediaVolumeLevel}
    >
      {children}
    </Component>
  );
};

export default MuteButton;
