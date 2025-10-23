/**
 * Get the active element, accounting for Shadow DOM subtrees.
 *
 * @param root - The root node to search for the active element.
 */
export function activeElement(
  root: Document = document,
): Element | null {
  let element = root.activeElement;

  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }

  return element;
}

export function getDocument(node: Element | null): Document {
  return node?.ownerDocument ?? document;
}
