'use client';

import type {
  CSSProperties,
  DetailedHTMLProps,
  PropsWithChildren,
  VideoHTMLAttributes,
} from 'react';

import { useMediaRef } from '@vjs-10/react-media-store';
import React, { forwardRef } from 'react';

export type SimpleVideoProps = PropsWithChildren<
  DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
    className?: string | undefined;
    style?: CSSProperties | undefined;
  }
>;

/**
 * SimpleVideo - A basic video component that works with native HTML5 video formats (MP4, WebM, etc.)
 * without using a playback engine. Use this for simple MP4 files. For HLS/DASH streaming, use the
 * regular Video component instead.
 *
 * This component connects to MediaProvider for play/pause state but sets the src directly on the
 * video element without going through HLS.js or other playback engines.
 *
 * @example
 * ```tsx
 * <MediaProvider>
 *   <MediaSkin>
 *     <SimpleVideo src="video.mp4" />
 *   </MediaSkin>
 * </MediaProvider>
 * ```
 */
export const SimpleVideo: React.ForwardRefExoticComponent<
  SimpleVideoProps & React.RefAttributes<HTMLVideoElement>
> = forwardRef<HTMLVideoElement, SimpleVideoProps>(
  ({ children, ...props }, _ref) => {
    const mediaRefCallback = useMediaRef();

    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video {...props} ref={mediaRefCallback}>
        {children}
      </video>
    );
  },
);

SimpleVideo.displayName = 'SimpleVideo';

export default SimpleVideo;
