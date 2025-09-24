import { map } from 'nanostores';

export interface TimeRangeState {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  _trackElement: HTMLElement | null;
  _pointerPosition: number;
  _hovering: boolean;
  _dragging: boolean;
  _fillWidth: number;
  _pointerWidth: number;
  _currentTimeText: string;
  _durationText: string;
}

export class TimeRange extends EventTarget {
  #element: HTMLElement | null = null;
  #abortController: AbortController | null = null;
  #seekingTime: number | null = null;
  #oldCurrentTime: number | null = null;
  #state = map<TimeRangeState>({
    currentTime: 0,
    duration: Number.NaN,
    requestSeek: (_time: number) => {},
    _trackElement: null,
    _pointerPosition: 0,
    _hovering: false,
    _dragging: false,
    _fillWidth: 0,
    _pointerWidth: 0,
    _currentTimeText: '',
    _durationText: '',
  });

  attach(target: HTMLElement): void {
    this.#element = target;

    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    this.#element.addEventListener('pointerdown', this, { signal });
    this.#element.addEventListener('pointermove', this, { signal });
    this.#element.addEventListener('pointerup', this, { signal });
    this.#element.addEventListener('pointerenter', this, { signal });
    this.#element.addEventListener('pointerleave', this, { signal });
  }

  detach(): void {
    this.#element = null;
    this.#abortController?.abort();
    this.#abortController = null;
  }

  setState(state: Partial<TimeRangeState>): void {
    for (const key in state) {
      const value = state[key as keyof TimeRangeState];
      if (value !== undefined && value !== this.#state.get()[key as keyof TimeRangeState]) {
        this.#state.setKey(key as keyof TimeRangeState, value);
      }
    }
  }

  getState(): TimeRangeState {
    const state = this.#state.get();

    // When dragging, use pointer position for immediate feedback;
    // While seeking, use seeking time so it doesn't jump back to the current time;
    // Otherwise, use current time;
    let _fillWidth = 0;
    if (state._dragging && state._pointerPosition !== null) {
      _fillWidth = state._pointerPosition;
    } else if (state.duration > 0) {
      if (this.#seekingTime !== null && this.#oldCurrentTime === state.currentTime) {
        _fillWidth = (this.#seekingTime / state.duration) * 100;
      } else {
        _fillWidth = (state.currentTime / state.duration) * 100;
        this.#seekingTime = null;
      }
    }

    this.#oldCurrentTime = state.currentTime;

    let _pointerWidth = 0;
    if (state._hovering && state._pointerPosition !== null) {
      _pointerWidth = state._pointerPosition;
    }

    const _currentTimeText = formatTime(state.currentTime);
    const _durationText = formatTime(state.duration);

    return { ...state, _fillWidth, _pointerWidth, _currentTimeText, _durationText };
  }

  onStateChange(callback: (state: TimeRangeState) => void): () => void {
    return this.#state.listen(callback);
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
      case 'pointerenter':
        this.#handlePointerEnter(event as PointerEvent);
        break;
      case 'pointerleave':
        this.#handlePointerLeave(event as PointerEvent);
        break;
    }
  }

  #handlePointerDown(event: PointerEvent) {
    event.preventDefault();
    this.#element?.setPointerCapture(event.pointerId);

    this.#state.setKey('_dragging', true);

    const { duration, requestSeek } = this.#state.get();
    const seekTime = calculateSeekTimeFromPointerEvent(event, duration);
    requestSeek(seekTime);
    this.#seekingTime = seekTime;
  }

  #handlePointerMove(event: PointerEvent) {
    const { _trackElement, _dragging, duration, requestSeek } = this.#state.get();
    if (!_trackElement) return;

    const rect = _trackElement.getBoundingClientRect();
    const ratio = calculatePointerRatio(event.clientX, rect);
    this.#state.setKey('_pointerPosition', ratio);

    if (_dragging) {
      const seekTime = calculateSeekTimeFromRatio(ratio, duration);
      requestSeek(seekTime);
      this.#seekingTime = seekTime;
    }
  }

  #handlePointerUp(event: PointerEvent) {
    const { _dragging, _pointerPosition, duration, requestSeek } = this.#state.get();
    if (_dragging && _pointerPosition !== null) {
      const seekTime = calculateSeekTimeFromRatio(_pointerPosition, duration);
      requestSeek(seekTime);
      this.#seekingTime = seekTime;
    }

    this.#state.setKey('_dragging', false);

    this.#element?.releasePointerCapture(event.pointerId);
  }

  #handlePointerEnter(_event: PointerEvent) {
    this.#state.setKey('_hovering', true);
  }

  #handlePointerLeave(_event: PointerEvent) {
    this.#state.setKey('_hovering', false);
  }
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Utility functions for pointer position and seek time calculations
const calculatePointerRatio = (clientX: number, rect: DOMRect): number => {
  const x = clientX - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

const calculateSeekTimeFromRatio = (ratio: number, duration: number): number => {
  return (ratio / 100) * duration;
};

const calculateSeekTimeFromPointerEvent = (e: PointerEvent, duration: number): number => {
  if (!(e.currentTarget instanceof HTMLElement)) return 0;
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = calculatePointerRatio(e.clientX, rect);
  return calculateSeekTimeFromRatio(ratio, duration);
};
