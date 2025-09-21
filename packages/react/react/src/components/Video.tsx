'use client';

import * as React from 'react';
import { useMediaRef } from '@vjs-10/react-media-store';
import { createMediaStateOwner } from '@vjs-10/media';
import {
  ElementType,
  VideoHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
  CSSProperties,
  Ref,
  useImperativeHandle,
  useRef,
} from 'react';

export type MuxVideoProps = {
  'playback-id'?: string;
};

type MediaStateOwner = NonNullable<Parameters<ReturnType<typeof useMediaRef>>[0]>;

/** @TODO Improve type inference and narrowing/widening for different use cases (CJP) */
type ComponentType = ElementType<
  Omit<
    DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>,
    'ref'
  > & { ref: Ref<MediaStateOwner> }
>;

// These are the first steps/WIP POC of decoupling the Media State Owner from the DOM.
// Note that everything will still work if you use:
// 1. an audio/video element directly
// 2. a custom element a la media-elements
type CreateMediaStateOwner = typeof createMediaStateOwner;
const useMediaStateOwner = (
  ref: Ref<any>,
  createMediaStateOwner: CreateMediaStateOwner /*, props? */
) => {
  const mediaStateOwnerRef = useRef(createMediaStateOwner(/* props? */));
  useImperativeHandle(ref, () => mediaStateOwnerRef.current, []);
  /** @TODO Parameterize this (CJP) */
  type ComponentProps = DetailedHTMLProps<
    VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >;
  return {
    updateMediaElement(
      mediaEl: HTMLMediaElement | null,
      props: ComponentProps
    ) {
      // NOTE: The details here will almost definitely change for a less "bare bones"/"POC" implementation of Media State Owner impl. (CJP)
      mediaStateOwnerRef.current.mediaElement = mediaEl ?? undefined;
      mediaStateOwnerRef.current.src = props.src as string;
      if (props.muted) {
        mediaStateOwnerRef.current.muted = props.muted;
      }
    },
  };
};

const DefaultVideoComponent: ElementType<
  Omit<
    DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>,
    'ref'
  > & { ref: Ref<any> }
> = ({ children, ref, ...props }) => {
  const { updateMediaElement } = useMediaStateOwner(ref, createMediaStateOwner);
  return (
    <video {...props} ref={(mediaEl) => {
        /** @TODO In later iterations/non-POC, we should be able to have a function that can be used directly for the `ref` prop (CJP) */
        updateMediaElement(mediaEl, props);
      }}>
      {children}
    </video>
  );
};

/**
 * @description This is a "thin wrapper" around the media component whose primary responsibility is to wire up the element
 * to the <MediaProvider/>'s MediaStore for the media state.
 * @param props - Identical to both a <video/>'s props and the <Player/> props, with one addition that may be familiar to
 * MUI users: a `component` prop that allows you to use something other than the <video/> element under the hood.
 * @returns A media react component (e.g. <video/>), wired up as the media element.
 */
const ConnectedVideo = ({
  component,
  children,
  ...props
}: PropsWithChildren<{
  component: ComponentType;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}>) => {
  const Component = component;
  const mediaRefCallback = useMediaRef();
  // NOTE: While this may feel like magic to folks, in the "default" use case, you can think of it as:
  // return (<video ref={mediaRefCallback} {...restProps} >{children}</video>);
  return (
    <Component {...props} ref={mediaRefCallback}>
      {children}
    </Component>
  );
};

// Main Video component with default component
export const Video = ({
  component = DefaultVideoComponent,
  children,
  ...props
}: PropsWithChildren<{
  component?: ComponentType;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}>) => {
  return (
    <ConnectedVideo {...props} component={component}>
      {children}
    </ConnectedVideo>
  );
};

// MediaElementVideo export (same as Video but for backwards compatibility)
export const MediaElementVideo = Video;

export default Video;