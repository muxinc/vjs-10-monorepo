import type { FocusableElement } from 'tabbable';
import { tabbable } from 'tabbable';

export function namedNodeMapToObject(namedNodeMap: NamedNodeMap): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }

  return obj;
}

let id = 0;

/**
 * Generates a unique ID for an element.
 * React's useId() is more complex but might not be needed for this use case.
 * @returns A unique ID.
 */
export function uniqueId(): string {
  id++;
  return `:h${id}:`;
}

/**
 * Sets attributes on an element.
 * @param element - The element to set attributes on.
 * @param attributes - The attributes to set.
 */
export function setAttributes(element: HTMLElement, attributes: Record<string, string>): void {
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'boolean') {
      element.toggleAttribute(key, value);
    } else {
      element.setAttribute(key, value);
    }
  }
}

/**
 * Get the active element, accounting for Shadow DOM subtrees.
 * @param root - The root node to search for the active element.
 */
export function activeElement(
  doc: Document = document,
): Element | null {
  let element = doc.activeElement;

  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }

  return element;
}

export function getDocument(node: Element | null): Document {
  return node?.ownerDocument ?? document;
}

export function getTabbableOptions() {
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

export function isOutsideEvent(event: FocusEvent, container?: Element): boolean {
  const containerElement = container || (event.currentTarget as Element);
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  return !relatedTarget || !containerElement.contains(relatedTarget);
}
