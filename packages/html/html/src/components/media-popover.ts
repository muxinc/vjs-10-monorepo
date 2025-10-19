import type { Placement } from '@floating-ui/dom';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

import { tabbable } from 'tabbable';

import { getActiveElement, getDocument, uniqueId } from '../utils/element-utils';

export class MediaPopoverRoot extends HTMLElement {
  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';

  constructor() {
    super();
    this.addEventListener('mouseenter', this.#handleMouseEnter.bind(this));
    this.addEventListener('mouseleave', this.#handleMouseLeave.bind(this));
    this.addEventListener('focusin', this.#handleFocusIn.bind(this));
    this.addEventListener('focusout', this.#handleFocusOut.bind(this));
  }

  connectedCallback(): void {
    this.#updateVisibility();
  }

  disconnectedCallback(): void {
    this.#clearHoverTimeout();
    this.#cleanup?.();

    this.#transitionStatus = 'unmounted';
    this.#updateVisibility();
  }

  static get observedAttributes(): string[] {
    return ['open-on-hover', 'delay', 'close-delay'];
  }

  get openOnHover(): boolean {
    return this.hasAttribute('open-on-hover');
  }

  get delay(): number {
    return Number.parseInt(this.getAttribute('delay') ?? '0', 10);
  }

  get closeDelay(): number {
    return Number.parseInt(this.getAttribute('close-delay') ?? '0', 10);
  }

  get #triggerElement(): MediaPopoverTrigger | null {
    return this.querySelector('media-popover-trigger') as MediaPopoverTrigger | null;
  }

  get #portalElement(): MediaPopoverPortal | null {
    return this.querySelector('media-popover-portal') as MediaPopoverPortal | null;
  }

  get #positionerElement(): MediaPopoverPositioner | null {
    return this.#portalElement?.querySelector('media-popover-positioner') as MediaPopoverPositioner | null;
  }

  get #popupElement(): MediaPopoverPopup | null {
    return this.#portalElement?.querySelector('media-popover-popup') as MediaPopoverPopup | null;
  }

  #setOpen(open: boolean): void {
    if (this.#open === open) return;

    this.#open = open;

    if (open) {
      this.#transitionStatus = 'initial';
      requestAnimationFrame(() => {
        this.#transitionStatus = 'open';
        this.#updateVisibility();
      });
    } else {
      this.#transitionStatus = 'close';
    }

    this.#updateVisibility();

    if (open) {
      this.#setupFloating();
    } else {
      this.#cleanup?.();
      this.#cleanup = null;
    }
  }

  #updateVisibility(): void {
    this.style.display = 'contents';

    if (this.#popupElement) {
      const placement = this.#positionerElement?.side ?? 'top';
      this.#popupElement.setAttribute('data-side', placement);

      this.#popupElement.toggleAttribute('data-starting-style', this.#transitionStatus === 'initial');
      this.#popupElement.toggleAttribute('data-open', this.#transitionStatus === 'initial' || this.#transitionStatus === 'open');
      this.#popupElement.toggleAttribute('data-ending-style', this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted');
      this.#popupElement.toggleAttribute('data-closed', this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted');
    }

    const triggerElement = this.#triggerElement?.firstElementChild as HTMLElement;
    if (triggerElement) {
      triggerElement.setAttribute('aria-expanded', this.#open.toString());
      triggerElement.toggleAttribute('data-popup-open', this.#open);
    }
  }

  #setupFloating(): void {
    if (!this.#triggerElement || !this.#popupElement) return;

    const trigger = this.#triggerElement.firstElementChild as HTMLElement;
    const popup = this.#popupElement;

    if (!trigger || !popup) return;

    const placement = this.#positionerElement?.side ?? 'top';
    const sideOffset = this.#positionerElement?.sideOffset;

    const updatePosition = () => {
      computePosition(trigger, popup, {
        placement,
        middleware: [offset(sideOffset), flip(), shift()],
      }).then(({ x, y }: { x: number; y: number }) => {
        Object.assign(popup.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    };

    updatePosition();
    this.#cleanup = autoUpdate(trigger, popup, updatePosition);
  }

  #clearHoverTimeout(): void {
    if (this.#hoverTimeout) {
      clearTimeout(this.#hoverTimeout);
      this.#hoverTimeout = null;
    }
  }

  #handleMouseEnter(): void {
    if (!this.openOnHover) return;

    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(true);
    }, this.delay);
  }

  #handleMouseLeave(): void {
    if (!this.openOnHover) return;

    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(false);
    }, this.closeDelay);
  }

  #handleFocusIn(_event: FocusEvent): void {
    this.#setOpen(true);
    addPreviouslyFocusedElement(getActiveElement(getDocument(this)));
  }

  #handleFocusOut = (event: FocusEvent): void => {
    if (getPreviouslyFocusedElement() === this.#triggerElement?.firstElementChild) {
      const popup = this.#popupElement?.firstElementChild as HTMLElement;
      if (popup) {
        addPreviouslyFocusedElement(event.relatedTarget as Element | null);
        popup.focus();
      }
    } else {
      this.#setOpen(false);
    }
  };
}

export class MediaPopoverTrigger extends HTMLElement {
  connectedCallback(): void {
    this.style.display = 'contents';

    const triggerElement = this.firstElementChild as HTMLElement;
    if (triggerElement) {
      triggerElement.setAttribute('aria-haspopup', 'true');
      triggerElement.setAttribute('aria-expanded', 'false');

      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const rootElement = this.closest('media-popover-root') as MediaPopoverRoot;
            let popupElement = rootElement.querySelector('media-popover-popup') as MediaPopoverPopup;

            if (!popupElement) {
              const portalElement = rootElement.querySelector('media-popover-portal') as MediaPopoverPortal;
              if (!portalElement) {
                return;
              }

              popupElement = portalElement.querySelector('media-popover-popup') as MediaPopoverPopup;
              if (!popupElement) {
                return;
              }
            }

            const attributeName = mutation.attributeName;
            if (!attributeName || !attributeName.startsWith('data-')) {
              return;
            }

            const attributeValue = triggerElement.getAttribute(attributeName);
            if (attributeValue !== null) {
              popupElement.setAttribute(attributeName, attributeValue);
            } else {
              popupElement.removeAttribute(attributeName);
            }
          }
        });
      });

      mutationObserver.observe(triggerElement, {
        attributes: true,
      });
    }
  }
}

export class MediaPopoverPortal extends HTMLElement {
  #portal: HTMLElement | null = null;
  #childrenRefs: HTMLElement[] = [];
  #tabbableChildren: Element[] = [];

  connectedCallback(): void {
    this.style.display = 'contents';
    this.#setupPortal();
  }

  disconnectedCallback(): void {
    this.#cleanupPortal();
  }

  querySelector(selector: string): HTMLElement | null {
    return this.#portal?.querySelector(selector) ?? null;
  }

  handleEvent(event: Event): void {
    this.dispatchEvent(new Event(event.type, { bubbles: true }));
  }

  #setupPortal(): void {
    const portalId = this.getAttribute('root-id') ?? '@default_portal_id';
    if (!portalId) return;

    /* @TODO We need to make sure portal logic is non-brittle longer term (CJP) */
    // NOTE: Hacky solution in part to ensure styling propogates from skin to container's baked in portal (TL;DR - Shadow DOM vs. Light DOM CSS) (CJP)
    const portalContainer
      = ((this.getRootNode() as ShadowRoot | Document).getElementById(portalId)
        ?? (this.getRootNode() as ShadowRoot | Document)
          .querySelector('media-container')
          ?.shadowRoot
          ?.getElementById(portalId))
        ? (this.getRootNode() as ShadowRoot | Document).querySelector('media-container')
        : undefined;
    if (!portalContainer) return;

    this.#portal = document.createElement('div');
    this.#portal.slot = 'portal';
    this.#portal.id = uniqueId();

    const beforeGuard = createFocusGuard();
    beforeGuard.addEventListener('focusin', (_event: FocusEvent) => {

    });

    const afterGuard = createFocusGuard();
    afterGuard.addEventListener('focusin', (_event: FocusEvent) => {

    });

    this.#childrenRefs = Array.from(this.children) as HTMLElement[];

    this.#portal.append(beforeGuard, ...this.children, afterGuard);
    portalContainer.append(this.#portal);

    // console.log(this.#childrenRefs);
    this.#childrenRefs.forEach((child) => {
      const tabbableElements = tabbable(child, {
        includeContainer: true,
      });
      // console.log(tabbableElements);
      tabbableElements.forEach((element: Element) => {
        element.setAttribute('tabindex', '-1');
        this.#tabbableChildren.push(element);
      });
    });
  }

  #cleanupPortal(): void {
    if (!this.#portal) return;

    // Move children back to the portal element
    this.append(...this.#portal.children);
    this.#portal.remove();
    this.#portal = null;
  }
}

function createFocusGuard(): HTMLElement {
  const focusGuard = document.createElement('span');
  focusGuard.setAttribute('tabindex', '-1');
  focusGuard.setAttribute('data-focus-guard', '');
  return focusGuard;
}

const LIST_LIMIT = 20;
let previouslyFocusedElements: Element[] = [];

function clearDisconnectedPreviouslyFocusedElements() {
  previouslyFocusedElements = previouslyFocusedElements.filter(el => el.isConnected);
}

function addPreviouslyFocusedElement(element: Element | null): void {
  clearDisconnectedPreviouslyFocusedElements();
  if (element && element.localName !== 'body') {
    previouslyFocusedElements.push(element);
    if (previouslyFocusedElements.length > LIST_LIMIT) {
      previouslyFocusedElements = previouslyFocusedElements.slice(-LIST_LIMIT);
    }
  }
}

function getPreviouslyFocusedElement(): Element | undefined {
  clearDisconnectedPreviouslyFocusedElements();
  return previouslyFocusedElements[previouslyFocusedElements.length - 1];
}

export class MediaPopoverPositioner extends HTMLElement {
  connectedCallback(): void {
    this.style.display = 'contents';

    const popup = this.firstElementChild as HTMLElement;
    if (popup) {
      Object.assign(popup.style, {
        position: 'absolute',
        top: '0',
        left: '0',
      });
    }
  }

  get side(): Placement {
    return this.getAttribute('side') as Placement;
  }

  get sideOffset(): number {
    return Number.parseInt(this.getAttribute('side-offset') ?? '0', 10);
  }
}

export class MediaPopoverPopup extends HTMLElement {
  connectedCallback(): void {
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
  }
}

if (!globalThis.customElements.get('media-popover-root')) {
  globalThis.customElements.define('media-popover-root', MediaPopoverRoot);
}

if (!globalThis.customElements.get('media-popover-trigger')) {
  globalThis.customElements.define('media-popover-trigger', MediaPopoverTrigger);
}

if (!globalThis.customElements.get('media-popover-portal')) {
  globalThis.customElements.define('media-popover-portal', MediaPopoverPortal);
}

if (!globalThis.customElements.get('media-popover-positioner')) {
  globalThis.customElements.define('media-popover-positioner', MediaPopoverPositioner);
}

if (!globalThis.customElements.get('media-popover-popup')) {
  globalThis.customElements.define('media-popover-popup', MediaPopoverPopup);
}

export const Popover: {
  Root: typeof MediaPopoverRoot;
  Trigger: typeof MediaPopoverTrigger;
  Portal: typeof MediaPopoverPortal;
  Positioner: typeof MediaPopoverPositioner;
  Popup: typeof MediaPopoverPopup;
} = {
  Root: MediaPopoverRoot,
  Trigger: MediaPopoverTrigger,
  Portal: MediaPopoverPortal,
  Positioner: MediaPopoverPositioner,
  Popup: MediaPopoverPopup,
};

export default Popover;
