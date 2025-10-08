import type { RangeState } from './range';

import { Range } from './range';

export interface VolumeRangeState extends RangeState {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  _volumeText: string;
}

export class VolumeRange extends Range {
  getState(): VolumeRangeState {
    const state = super.getState() as VolumeRangeState;

    // When dragging, use pointer position for immediate feedback;
    // Otherwise, use current volume;
    let _fillWidth = 0;
    if (state._dragging) {
      _fillWidth = state._pointerRatio * 100;
    }
    else {
      _fillWidth = state.muted ? 0 : (state.volume || 0) * 100;
    }

    const _volumeText = formatVolume(state.muted ? 0 : state.volume || 0);

    return { ...state, _fillWidth, _volumeText };
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

    const { _pointerRatio, requestVolumeChange } = super.getState() as VolumeRangeState;
    requestVolumeChange(_pointerRatio);
  }

  #handlePointerMove(event: PointerEvent) {
    super.handleEvent(event);

    const { _dragging, _pointerRatio, requestVolumeChange } = super.getState() as VolumeRangeState;

    if (_dragging) {
      requestVolumeChange(_pointerRatio);
    }
  }

  #handlePointerUp(event: PointerEvent) {
    const { _dragging, _pointerRatio, requestVolumeChange } = super.getState() as VolumeRangeState;

    if (_dragging) {
      requestVolumeChange(_pointerRatio);
    }

    super.handleEvent(event);
  }
}

function formatVolume(volume: number): string {
  return `${Math.round(volume * 100)}%`;
}
