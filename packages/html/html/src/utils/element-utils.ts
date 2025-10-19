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
export function getActiveElement(
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
