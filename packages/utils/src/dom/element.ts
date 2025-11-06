type OverflowAncestors = Array<Element | Window | VisualViewport>;

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

export function getDocumentElement(node: Node | Window): HTMLElement {
  return (
    (isNode(node) ? node.ownerDocument : node.document) || window.document
  )?.documentElement;
}

export function isNode(value: unknown): value is Node {
  if (!hasWindow()) {
    return false;
  }

  return value instanceof Node || value instanceof getWindow(value).Node;
}

export function isElement(value: unknown): value is Element {
  if (!hasWindow()) {
    return false;
  }

  return value instanceof Element || value instanceof getWindow(value).Element;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  if (!hasWindow()) {
    return false;
  }

  return (
    value instanceof HTMLElement
    || value instanceof getWindow(value).HTMLElement
  );
}

export function getDocument(node: Element | null): Document {
  return node?.ownerDocument ?? document;
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

export function getNodeName(node: Node | Window): string {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}

export function getParentNode(node: Node): Node {
  if (getNodeName(node) === 'html') {
    return node;
  }

  const result
    // Step into the shadow DOM of the parent of a slotted node.
    = (node as any).assignedSlot
    // DOM Element detected.
      || node.parentNode
    // ShadowRoot detected.
      || (isShadowRoot(node) && node.host)
    // Fallback.
      || getDocumentElement(node);

  return isShadowRoot(result) ? result.host : result;
}

const invalidOverflowDisplayValues = new Set(['inline', 'contents']);

export function isOverflowElement(element: Element): boolean {
  const { overflow, overflowX, overflowY, display } = getComputedStyle(element);
  return (
    /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX)
    && !invalidOverflowDisplayValues.has(display)
  );
}

const lastTraversableNodeNames = new Set(['html', 'body', '#document']);

export function isLastTraversableNode(node: Node): boolean {
  return lastTraversableNodeNames.has(getNodeName(node));
}

export function getNearestOverflowAncestor(node: Node): HTMLElement {
  const parentNode = getParentNode(node);

  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument
      ? node.ownerDocument.body
      : (node as Document).body;
  }

  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }

  return getNearestOverflowAncestor(parentNode);
}

export function getOverflowAncestors(
  node: Node,
  list: OverflowAncestors = [],
  traverseIframes = true,
): OverflowAncestors {
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === node.ownerDocument?.body;
  const win = getWindow(scrollableAncestor);

  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(
      win,
      win.visualViewport || [],
      isOverflowElement(scrollableAncestor) ? scrollableAncestor : [],
      frameElement && traverseIframes ? getOverflowAncestors(frameElement) : [],
    );
  }

  return list.concat(
    scrollableAncestor,
    getOverflowAncestors(scrollableAncestor, [], traverseIframes),
  );
}

export function getFrameElement(win: Window): Element | null {
  return win.parent && Object.getPrototypeOf(win.parent)
    ? win.frameElement
    : null;
}
