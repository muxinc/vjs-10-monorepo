import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
import screenfull from 'screenfull';

export interface UseFullscreenOptions {
  /**
   * When true, automatically handles fullscreen change events
   * to synchronize the state with browser fullscreen status
   * @default true
   */
  trackChanges?: boolean;
  /**
   * Callback fired when fullscreen state changes
   */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /**
   * Callback fired when fullscreen encounters an error
   */
  onFullscreenError?: (error: Error) => void;
}

export interface UseFullscreenResult {
  /**
   * Whether the element is currently in fullscreen mode
   */
  isFullscreen: boolean;
  /**
   * Whether fullscreen is supported in the current environment
   */
  isSupported: boolean;
  /**
   * Request fullscreen for the target element
   * @returns Promise that resolves when fullscreen is entered
   */
  enter: () => Promise<void>;
  /**
   * Exit fullscreen mode
   * @returns Promise that resolves when fullscreen is exited
   */
  exit: () => Promise<void>;
  /**
   * Toggle fullscreen mode for the target element
   * @returns Promise that resolves when the toggle is complete
   */
  toggle: () => Promise<void>;
}

/**
 * Hook that provides fullscreen functionality for a DOM element
 *
 * @param elementRef - Ref to the element to make fullscreen
 * @param options - Configuration options
 * @returns Methods and state for managing fullscreen
 */
export function useFullscreen(
  elementRef: RefObject<HTMLElement | null>,
  options: UseFullscreenOptions = {},
): UseFullscreenResult {
  const {
    trackChanges = true,
    onFullscreenChange,
    onFullscreenError,
  } = options;

  const [isFullscreen, setIsFullscreen] = useState(
    screenfull.isEnabled ? screenfull.isFullscreen : false,
  );

  // Handle fullscreen change events
  useEffect(() => {
    if (!screenfull.isEnabled || !trackChanges) return;

    const handleChange = () => {
      const newIsFullscreen = screenfull.isFullscreen;
      setIsFullscreen(newIsFullscreen);
      onFullscreenChange?.(newIsFullscreen);
    };

    const handleError = () => {
      onFullscreenError?.(new Error('Fullscreen error occurred'));
    };

    screenfull.on('change', handleChange);
    screenfull.on('error', handleError);

    return () => {
      screenfull.off('change', handleChange);
      screenfull.off('error', handleError);
    };
  }, [trackChanges, onFullscreenChange, onFullscreenError]);

  // Request fullscreen for the target element
  const enter = useCallback(async (): Promise<void> => {
    if (!screenfull.isEnabled || !elementRef.current) return;

    try {
      await screenfull.request(elementRef.current);
    } catch (error) {
      onFullscreenError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [elementRef, onFullscreenError]);

  // Exit fullscreen mode
  const exit = useCallback(async (): Promise<void> => {
    if (!screenfull.isEnabled) return;

    try {
      await screenfull.exit();
    } catch (error) {
      onFullscreenError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onFullscreenError]);

  // Toggle fullscreen mode for the target element
  const toggle = useCallback(async (): Promise<void> => {
    if (!screenfull.isEnabled || !elementRef.current) return;

    try {
      await screenfull.toggle(elementRef.current);
    } catch (error) {
      onFullscreenError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [elementRef, onFullscreenError]);

  return {
    isFullscreen,
    isSupported: screenfull.isEnabled,
    enter,
    exit,
    toggle,
  };
}
