/**
 * Converts a `NamedNodeMap` to a plain object.
 */
export function namedNodeMapToObject(namedNodeMap: NamedNodeMap): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }

  return obj;
}

/**
 * Sets multiple attributes on an element and handles boolean attributes appropriately.
 *
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
