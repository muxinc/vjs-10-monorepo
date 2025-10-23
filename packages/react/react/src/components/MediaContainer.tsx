import type { FC, HTMLProps, PropsWithChildren, RefCallback } from 'react';

import { playButtonStateDefinition, useMediaSelector, useMediaStore } from '@vjs-10/core/store';
import { shallowEqual } from '@vjs-10/utils';

import { forwardRef, useCallback, useMemo } from 'react';
import { useComposedRefs } from '../utils/useComposedRefs';

/**
 * Hook to associate a React element as the fullscreen container for the media store.
 * This is equivalent to Media Chrome's useMediaFullscreenRef but for VJS-10.
 *
 * The ref callback will register the element as the container state owner
 * in the media store, enabling fullscreen functionality.
 *
 * @example
 * import { useMediaContainerRef } from '@vjs-10/react';
 *
 * const PlayerContainer = ({ children }) => {
 *   const containerRef = useMediaContainerRef();
 *   return <div ref={containerRef}>{children}</div>;
 * };
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useMediaContainerRef(): RefCallback<HTMLElement | null> {
  const mediaStore = useMediaStore();

  return useCallback(
    (containerElement: HTMLElement | null) => {
      if (!mediaStore) return;

      // Register or unregister the container element as the container state owner
      mediaStore.dispatch({
        type: 'containerstateownerchangerequest',
        detail: containerElement,
      });
    },
    [mediaStore],
  );
}

/**
 * MediaContainer component that automatically registers itself as the fullscreen container.
 * This provides a simple wrapper component for fullscreen functionality.
 *
 * @example
 * import { MediaContainer } from '@vjs-10/react';
 *
 * const MyPlayer = () => (
 *   <MediaContainer>
 *     <video src="video.mp4" />
 *     <div>Controls here</div>
 *   </MediaContainer>
 * );
 */
export const MediaContainer: FC<PropsWithChildren<HTMLProps<HTMLDivElement> & { portalId?: string }>> = forwardRef(
  ({ children, portalId = '@default_portal_id', ...props }, ref) => {
    const containerRef = useMediaContainerRef();
    const composedRef = useComposedRefs(ref, containerRef);

    const mediaStore = useMediaStore();
    const mediaState = useMediaSelector(playButtonStateDefinition.stateTransform, shallowEqual);
    const methods = useMemo(() => playButtonStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (!['video', 'audio'].includes((event.target as HTMLElement).localName || '')) return;

      if (mediaState.paused) {
        methods.requestPlay();
      } else {
        methods.requestPause();
      }
    }, [mediaState.paused, methods]);

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        ref={composedRef}
        onClick={handleClick}
        {...props}
      >
        {children}
        {/* @TODO We need to make sure this is non-brittle longer term (CJP) */}
        <div id={portalId} style={{ position: 'absolute', zIndex: 10 }} />
      </div>
    );
  },
);
