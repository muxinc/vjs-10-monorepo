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
