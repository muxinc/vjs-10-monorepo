import { map } from 'nanostores';

import { shallowEqual } from '../utils/state';

export interface RangeState {
  _trackElement: HTMLElement | null;
  _pointerRatio: number;
  _hovering: boolean;
  _dragging: boolean;
  _fillWidth: number;
  _pointerWidth: number;
}

export class Range {
  #element: HTMLElement | null = null;
  #abortController: AbortController | null = null;
  #state = map<RangeState>({
    _trackElement: null,
    _pointerRatio: 0,
    _hovering: false,
    _dragging: false,
    _fillWidth: 0,
    _pointerWidth: 0,
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

  subscribe(callback: (state: RangeState) => void): () => void {
    return this.#state.subscribe(callback);
  }

  setState(state: Partial<RangeState>): void {
    if (shallowEqual(state, this.#state.get())) return;
    this.#state.set({ ...this.#state.get(), ...state });
  }

  getState(): RangeState {
    const state = this.#state.get();

    let _pointerWidth = 0;
    if (state._hovering && state._pointerRatio !== null) {
      _pointerWidth = state._pointerRatio;
    }

    return { ...state, _pointerWidth };
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

  getPointerRatio(evt: PointerEvent): number {
    const { _trackElement } = this.#state.get();
    if (!_trackElement) return 0;

    const rect = _trackElement.getBoundingClientRect();
    return getPointProgressOnLine(
      evt.clientX,
      evt.clientY,
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.bottom }
    );
  }

  #handlePointerDown(event: PointerEvent) {
    event.preventDefault();
    this.#element?.setPointerCapture(event.pointerId);

    this.setState({ _pointerRatio: this.getPointerRatio(event), _dragging: true });
  }

  #handlePointerMove(event: PointerEvent) {
    this.setState({ _pointerRatio: this.getPointerRatio(event) });
  }

  #handlePointerUp(event: PointerEvent) {
    this.setState({ _pointerRatio: this.getPointerRatio(event), _dragging: false });

    this.#element?.releasePointerCapture(event.pointerId);
  }

  #handlePointerEnter(_event: PointerEvent) {
    this.setState({ _hovering: true });
  }

  #handlePointerLeave(_event: PointerEvent) {
    this.setState({ _hovering: false });
  }
}

export type Point = { x: number; y: number };

/**
 * Get progress ratio of a point on a line segment.
 * @param x - The x coordinate of the point.
 * @param y - The y coordinate of the point.
 * @param p1 - The first point of the line segment.
 * @param p2 - The second point of the line segment.
 */
export function getPointProgressOnLine(x: number, y: number, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return 0; // Avoid division by zero if p1 === p2

  const projection = ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSquared;

  return Math.max(0, Math.min(1, projection)); // Clamp between 0 and 1
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
