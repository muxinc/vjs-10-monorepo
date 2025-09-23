import type { ConnectedComponent, ContextComponent } from '../utils/component-factory';

import React from 'react';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';
// Utility functions for pointer position and volume calculations
const calculatePointerRatio = (clientX: number, rect: DOMRect): number => {
  const x = clientX - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

const calculateVolumeFromRatio = (ratio: number): number => {
  return ratio / 100;
};

const calculateVolumeFromPointerEvent = (e: React.PointerEvent<HTMLDivElement>): number => {
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = calculatePointerRatio(e.clientX, rect);
  return calculateVolumeFromRatio(ratio);
};

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const useVolumeRangeRootState = (_props: any): {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  pointerPosition: number | null;
  setPointerPosition: (position: number | null) => void;
  hovering: boolean;
  setHovering: (hovering: boolean) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  trackRef: HTMLDivElement | null;
  setTrackRef: (ref: HTMLDivElement | null) => void;
} => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(volumeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = React.useMemo(() => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  const { requestVolumeChange } = methods;
  const [pointerPosition, setPointerPosition] = React.useState<number | null>(null);
  const [hovering, setHovering] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [trackRef, setTrackRef] = React.useState<HTMLDivElement | null>(null);

  return {
    volume: mediaState.volume,
    muted: mediaState.muted,
    volumeLevel: mediaState.volumeLevel,
    requestVolumeChange: requestVolumeChange,
    pointerPosition: pointerPosition,
    setPointerPosition: setPointerPosition,
    hovering: hovering,
    setHovering: setHovering,
    dragging: dragging,
    setDragging: setDragging,
    trackRef: trackRef,
    setTrackRef: setTrackRef,
  };
};

export const useVolumeRangeRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useVolumeRangeRootState>
) => {
  // When dragging, use pointer position for immediate feedback; otherwise use current volume
  const sliderFill =
    state.dragging && state.pointerPosition !== null
      ? state.pointerPosition
      : state.muted
        ? 0
        : state.volume * 100;

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      state.setDragging(true);
      const volume = calculateVolumeFromPointerEvent(e);
      state.requestVolumeChange(volume);

      // Capture pointer events to ensure we receive move and up events even if pointer leaves element
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [state.setDragging, state.requestVolumeChange]
  );

  const handlePointerMove = React.useCallback(
    (e: PointerEvent) => {
      if (!state.trackRef) return;

      const rect = state.trackRef.getBoundingClientRect();
      const ratio = calculatePointerRatio(e.clientX, rect);
      state.setPointerPosition(ratio);

      if (state.dragging) {
        const volume = calculateVolumeFromRatio(ratio);
        state.requestVolumeChange(volume);
      }
    },
    [state.trackRef, state.setPointerPosition, state.dragging, state.requestVolumeChange]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (state.dragging && state.trackRef && state.pointerPosition !== null) {
        const volume = calculateVolumeFromRatio(state.pointerPosition);
        state.requestVolumeChange(volume);
      }
      state.setDragging(false);
    },
    [state.dragging, state.trackRef, state.pointerPosition, state.requestVolumeChange, state.setDragging]
  );

  const handlePointerEnter = React.useCallback(() => {
    state.setHovering(true);
  }, [state.setHovering]);

  const handlePointerLeave = React.useCallback(() => {
    state.setHovering(false);
  }, [state.setHovering]);

  const volumeText = `${Math.round(state.muted ? 0 : state.volume * 100)}%`;

  return {
    role: 'slider',
    'aria-label': 'Volume',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': sliderFill,
    'aria-valuetext': volumeText,
    'data-muted': state.muted,
    'data-volume-level': state.volumeLevel,
    style: {
      ...props.style,
      '--slider-fill': `${sliderFill.toFixed(3)}%`,
      '--slider-pointer':
        state.hovering && state.pointerPosition !== null ? `${state.pointerPosition.toFixed(3)}%` : '0%',
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    ...props,
  } as React.PropsWithChildren<{ [k: string]: any }>;
};

type useVolumeRangeRootState = typeof useVolumeRangeRootState;
type useVolumeRangeRootProps = typeof useVolumeRangeRootProps;
type VolumeRangeRootProps = ReturnType<useVolumeRangeRootProps>;

export const renderVolumeRangeRoot = (props: VolumeRangeRootProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeRoot: ConnectedComponent<VolumeRangeRootProps, typeof renderVolumeRangeRoot> = toConnectedComponent(
  useVolumeRangeRootState,
  useVolumeRangeRootProps,
  renderVolumeRangeRoot,
  'VolumeRange.Root'
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export const useVolumeRangeTrackProps = (props: React.PropsWithChildren<{ [k: string]: any }>, context: any): React.PropsWithChildren<{ [k: string]: any }> & { ref: (ref: HTMLDivElement | null) => void } => {
  const { setTrackRef } = context;

  return {
    ref: setTrackRef,
    ...props,
  } as React.PropsWithChildren<{ [k: string]: any }> & { ref: (ref: HTMLDivElement | null) => void };
};

type useVolumeRangeTrackProps = typeof useVolumeRangeTrackProps;
type VolumeRangeTrackProps = ReturnType<useVolumeRangeTrackProps>;

export const renderVolumeRangeTrack = (props: VolumeRangeTrackProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeTrack: ContextComponent<any, any> = toContextComponent(useVolumeRangeTrackProps, renderVolumeRangeTrack, 'VolumeRange.Track');

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useVolumeRangeThumbProps = (props: React.HTMLAttributes<HTMLDivElement>): React.HTMLAttributes<HTMLDivElement> => {
  return {
    ...props,
    style: {
      ...props.style,
      insetInlineStart: 'var(--slider-fill)',
      position: 'absolute' as const,
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
  };
};

type useVolumeRangeThumbProps = typeof useVolumeRangeThumbProps;
type VolumeRangeThumbProps = ReturnType<useVolumeRangeThumbProps>;

export const renderVolumeRangeThumb = (props: VolumeRangeThumbProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeThumb: ContextComponent<any, any> = toContextComponent(useVolumeRangeThumbProps, renderVolumeRangeThumb, 'VolumeRange.Thumb');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useVolumeRangeProgressProps = (props: React.HTMLAttributes<HTMLDivElement>): React.HTMLAttributes<HTMLDivElement> => {
  return {
    ...props,
    style: {
      ...props.style,
      width: 'var(--slider-fill, 0%)',
      position: 'absolute' as const,
      height: '100%',
    },
  };
};

type useVolumeRangeProgressProps = typeof useVolumeRangeProgressProps;
type VolumeRangeProgressProps = ReturnType<useVolumeRangeProgressProps>;

export const renderVolumeRangeProgress = (props: VolumeRangeProgressProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeProgress: ContextComponent<any, any> = toContextComponent(useVolumeRangeProgressProps, renderVolumeRangeProgress, 'VolumeRange.Progress');

// ============================================================================
// EXPORTS
// ============================================================================

export const VolumeRange = Object.assign(
  {},
  {
    Root: VolumeRangeRoot,
    Track: VolumeRangeTrack,
    Thumb: VolumeRangeThumb,
    Progress: VolumeRangeProgress,
  }
) as {
  Root: typeof VolumeRangeRoot;
  Track: typeof VolumeRangeTrack;
  Thumb: typeof VolumeRangeThumb;
  Progress: typeof VolumeRangeProgress;
};

export default VolumeRange;
