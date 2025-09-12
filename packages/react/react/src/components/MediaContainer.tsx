import * as React from 'react';
import { useMediaStore } from '@vjs-10/react-media-store';

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
export const useMediaContainerRef = () => {
  const mediaStore = useMediaStore();
  
  return React.useCallback((containerElement: HTMLElement | null) => {
    if (!mediaStore) return;
    
    // Register or unregister the container element as the container state owner
    mediaStore.dispatch({ 
      type: 'containerstateownerchangerequest', 
      detail: containerElement 
    });
  }, [mediaStore]);
};

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
export const MediaContainer: React.FC<React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>> = ({ 
  children, 
  ...props 
}) => {
  const containerRef = useMediaContainerRef();
  
  return (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  );
};