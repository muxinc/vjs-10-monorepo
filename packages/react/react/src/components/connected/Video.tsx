'use client';
import { useMediaRef } from '../../MediaProvider';
import {
  ElementType,
  VideoHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
  CSSProperties,
  Ref,
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

/**
 * @description This is a "thin wrapper" around the media component whose primary responsibility is to wire up the element
 * to the <MediaProvider/>'s MediaStore for the media state.
 * @param props - Identical to both a <video/>'s props and the <Player/> props, with one addition that may be familiar to
 * MUI users: a `component` prop that allows you to use something other than the <video/> element under the hood.
 * @returns A media react component (e.g. <video/>), wired up as the media element.
 */
const Video = ({
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

export default Video;
