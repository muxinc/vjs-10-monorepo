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

/**
 * Gets the document or shadow root of a node, not the node itself which can lead to bugs.
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#return_value
 * @param node - The node to get the root node from.
 */
export function getDocumentOrShadowRoot(
  node: Node,
): Document | ShadowRoot | null {
  const rootNode = node?.getRootNode?.();
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    return rootNode;
  }
  return null;
}

export function getDocument(node: Element | null): Document {
  return node?.ownerDocument ?? document;
}

export function isElement(value: unknown): value is Element {
  if (!hasWindow()) {
    return false;
  }

  return value instanceof Element || value instanceof getWindow(value).Element;
}

export function contains(parent?: Element | null, child?: Element | null): boolean {
  if (!parent || !child) {
    return false;
  }

  const rootNode = child.getRootNode?.();

  // First, attempt with faster native method
  if (parent.contains(child)) {
    return true;
  }

  // then fallback to custom implementation with Shadow DOM support
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) {
        return true;
      }
      // @ts-expect-error - next.host is not defined in the type
      next = next.parentNode || next.host;
    }
  }

  // Give up, the result is false
  return false;
}

export function getTarget(event: Event): EventTarget | null {
  if ('composedPath' in event) {
    return event.composedPath()[0] ?? null;
  }

  // TS thinks `event` is of type never as it assumes all browsers support
  // `composedPath()`, but browsers without shadow DOM don't.
  return (event as Event).target;
}

export function isShadowRoot(value: unknown): value is ShadowRoot {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }

  return (
    value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot
  );
}

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getWindow(node: any): typeof window {
  return node?.ownerDocument?.defaultView || window;
}

export interface FloatingNodeType {
  id: string;
  parentId: string | null;
  context: FloatingContext;
};

interface FloatingContext {
  open: boolean;
}

export function getNodeChildren(
  nodes: Array<FloatingNodeType>,
  id: string | undefined,
  onlyOpenChildren = true,
): Array<FloatingNodeType> {
  const directChildren = nodes.filter(
    node => node.parentId === id && (!onlyOpenChildren || node.context?.open),
  );
  return directChildren.flatMap(child => [
    child,
    ...getNodeChildren(nodes, child.id, onlyOpenChildren),
  ]);
}
