import type { ConnectedComponent } from '../utils/component-factory';

import { TimeSlider as CoreTimeSlider } from '@vjs-10/core';

import { timeSliderStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { useCallback, useMemo } from 'react';

import { toConnectedComponent, toContextComponent, useCore } from '../utils/component-factory';
import { useComposedRefs } from '../utils/useComposedRefs';

export interface TimeSliderState {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeSlider;
  orientation: 'horizontal' | 'vertical';
}

export interface TimeSliderProps extends React.ComponentPropsWithRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

interface TimeSliderRenderProps extends React.ComponentProps<'div'> {
  'data-orientation'?: 'horizontal' | 'vertical';
  'data-current-time'?: number;
  'data-duration'?: number;
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export function useTimeSliderRootState(props: TimeSliderProps): TimeSliderState {
  const { orientation = 'horizontal' } = props;
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(timeSliderStateDefinition.stateTransform, shallowEqual);
  const mediaMethods = useMemo(() => timeSliderStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);
  const core = useCore(CoreTimeSlider, { ...mediaState, ...mediaMethods });

  return {
    ...mediaState,
    ...mediaMethods,
    orientation,
    core,
  };
}

export function useTimeSliderRootProps(props: TimeSliderProps, state: TimeSliderState): TimeSliderRenderProps {
  const { _fillWidth, _pointerWidth, _currentTimeText, _durationText } = state.core.getState();

  const { children, className, id, style, orientation = 'horizontal', ref } = props;

  const internalRef = useCallback((el: HTMLDivElement) => {
    if (!el) return;
    state.core?.attach(el);
  }, [state.core]);

  const composedRef = useComposedRefs(ref, internalRef);

  return {
    ref: composedRef,
    id,
    role: 'slider',
    tabIndex: 0,
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': Math.round(state.duration),
    'aria-valuenow': Math.round(state.currentTime),
    'aria-valuetext': `${_currentTimeText} of ${_durationText}`,
    'aria-orientation': orientation,
    'data-orientation': orientation,
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    className,
    style: {
      ...style,
      '--slider-fill': `${_fillWidth.toFixed(3)}%`,
      '--slider-pointer': `${(_pointerWidth * 100).toFixed(3)}%`,
    } as React.CSSProperties,
    children,
  };
}

export function renderTimeSliderRoot(props: TimeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const TimeSliderRoot: ConnectedComponent<TimeSliderProps, typeof renderTimeSliderRoot> = toConnectedComponent(
  useTimeSliderRootState,
  useTimeSliderRootProps,
  renderTimeSliderRoot,
  'TimeSlider.Root',
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export function useTimeSliderTrackProps(props: React.ComponentProps<'div'>, context: TimeSliderState): TimeSliderRenderProps {
  return {
    ref: useCallback((el: HTMLDivElement) => {
      context.core?.setState({ _trackElement: el });
    }, [context.core]),
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: '100%',
    },
  };
}

export function renderTimeSliderTrack(props: TimeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const TimeSliderTrack: ConnectedComponent<React.ComponentProps<'div'>, typeof renderTimeSliderTrack> = toContextComponent(
  useTimeSliderTrackProps,
  renderTimeSliderTrack,
  'TimeSlider.Track',
);

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export function getTimeSliderThumbProps(props: React.ComponentProps<'div'>, context: TimeSliderState): TimeSliderRenderProps {
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'insetInlineStart' : 'insetBlockEnd']: 'var(--slider-fill)',
      [context.orientation === 'horizontal' ? 'top' : 'left']: '50%',
      translate: context.orientation === 'horizontal' ? '-50% -50%' : '-50% 50%',
      position: 'absolute' as const,
    },
  };
}

export function renderTimeSliderThumb(props: TimeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const TimeSliderThumb: ConnectedComponent<React.ComponentProps<'div'>, typeof renderTimeSliderThumb> = toContextComponent(
  getTimeSliderThumbProps,
  renderTimeSliderThumb,
  'TimeSlider.Thumb',
);

// ============================================================================
// POINTER COMPONENT
// ============================================================================

export function getTimeSliderPointerProps(props: React.ComponentProps<'div'>, context: TimeSliderState): TimeSliderRenderProps {
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: 'var(--slider-pointer, 0%)',
      [context.orientation === 'horizontal' ? 'height' : 'width']: '100%',
      position: 'absolute' as const,
    },
  };
}

export function renderTimeSliderPointer(props: TimeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const TimeSliderPointer: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderTimeSliderPointer
> = toContextComponent(getTimeSliderPointerProps, renderTimeSliderPointer, 'TimeSlider.Pointer');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export function getTimeSliderProgressProps(props: React.ComponentProps<'div'>, context: TimeSliderState): TimeSliderRenderProps {
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: 'var(--slider-fill, 0%)',
      [context.orientation === 'horizontal' ? 'height' : 'width']: '100%',
      [context.orientation === 'horizontal' ? 'top' : 'bottom']: '0',
      position: 'absolute' as const,
    },
  };
}

export function renderTimeSliderProgress(props: TimeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const TimeSliderProgress: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderTimeSliderProgress
> = toContextComponent(getTimeSliderProgressProps, renderTimeSliderProgress, 'TimeSlider.Progress');

// ============================================================================
// EXPORTS
// ============================================================================

export const TimeSlider = Object.assign(
  {},
  {
    Root: TimeSliderRoot,
    Track: TimeSliderTrack,
    Thumb: TimeSliderThumb,
    Pointer: TimeSliderPointer,
    Progress: TimeSliderProgress,
  },
) as {
  Root: typeof TimeSliderRoot;
  Track: typeof TimeSliderTrack;
  Thumb: typeof TimeSliderThumb;
  Pointer: typeof TimeSliderPointer;
  Progress: typeof TimeSliderProgress;
};

export default TimeSlider;
