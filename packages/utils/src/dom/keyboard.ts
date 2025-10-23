import type { FocusableElement } from 'tabbable';
import { tabbable } from 'tabbable';
import { activeElement, getDocument } from './element';

export function getTabbableOptions(): Readonly<{
  getShadowRoot: boolean;
  displayCheck: 'full' | 'none';
}> {
  // JSDOM does not support the `tabbable` library. To solve this we can
  // check if `ResizeObserver` is a real function (not polyfilled), which
  // determines if the current environment is JSDOM-like.
  const isNativeResizeObserver: boolean = typeof ResizeObserver === 'function' && ResizeObserver.toString().includes('[native code]');
  const displayCheck: 'full' | 'none' = isNativeResizeObserver ? 'full' : 'none';

  return ({
    getShadowRoot: true,
    displayCheck: displayCheck as 'full' | 'none',
  }) as const;
}

function getTabbableIn(container: HTMLElement, dir: 1 | -1): FocusableElement | undefined {
  const list = tabbable(container, getTabbableOptions());
  const len = list.length;
  if (len === 0) {
    return undefined;
  }

  const active = activeElement(getDocument(container)) as FocusableElement;
  const index = list.indexOf(active);

  const nextIndex = index === -1 ? (dir === 1 ? 0 : len - 1) : index + dir;

  return list[nextIndex];
}

export function getNextTabbable(referenceElement: Element | null): FocusableElement | null {
  return (
    getTabbableIn(getDocument(referenceElement).body, 1) || (referenceElement as FocusableElement)
  );
}

export function getPreviousTabbable(referenceElement: Element | null): FocusableElement | null {
  return (
    getTabbableIn(getDocument(referenceElement).body, -1) || (referenceElement as FocusableElement)
  );
}
