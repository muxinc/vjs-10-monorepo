import type { RangeState } from './range';

import { Range } from './range';

export interface TimeRangeState extends RangeState {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  _currentTimeText: string;
  _durationText: string;
}

export class TimeRange extends Range {
  #seekingTime: number | null = null;
  #oldCurrentTime: number | null = null;

  getState(): TimeRangeState {
    const state = super.getState() as TimeRangeState;

    // When dragging, use pointer position for immediate feedback;
    // While seeking, use seeking time so it doesn't jump back to the current time;
    // Otherwise, use current time;
    let _fillWidth = 0;
    if (state._dragging) {
      _fillWidth = state._pointerRatio * 100;
    } else if (state.duration > 0) {
      if (this.#seekingTime !== null && this.#oldCurrentTime === state.currentTime) {
        _fillWidth = (this.#seekingTime / state.duration) * 100;
      } else {
        _fillWidth = (state.currentTime / state.duration) * 100;
        this.#seekingTime = null;
      }
    }

    this.#oldCurrentTime = state.currentTime;

    const _currentTimeText = formatTime(state.currentTime);
    const _durationText = formatTime(state.duration);

    return { ...state, _fillWidth, _currentTimeText, _durationText };
  }

  handleEvent(event: Event): void {
    const { type } = event;
    switch (type) {
      case 'pointerdown':
        this.#handlePointerDown(event as PointerEvent);
        break;
      case 'pointermove':
        this.#handlePointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this.#handlePointerUp(event as PointerEvent);
        break;
      default:
        super.handleEvent(event);
        break;
    }
  }

  #handlePointerDown(event: PointerEvent) {
    super.handleEvent(event);

    const { _pointerRatio, duration, requestSeek } = super.getState() as TimeRangeState;

    this.#seekingTime = _pointerRatio * duration;
    requestSeek(this.#seekingTime);
  }

  #handlePointerMove(event: PointerEvent) {
    super.handleEvent(event);

    const { _dragging, _pointerRatio, duration, requestSeek } = super.getState() as TimeRangeState;

    if (_dragging) {
      this.#seekingTime = _pointerRatio * duration;
      requestSeek(this.#seekingTime);
    }
  }

  #handlePointerUp(event: PointerEvent) {
    const { _dragging, _pointerRatio, duration, requestSeek } = super.getState() as TimeRangeState;

    if (_dragging) {
      this.#seekingTime = _pointerRatio * duration;
      requestSeek(this.#seekingTime);
    }

    super.handleEvent(event);
  }
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
