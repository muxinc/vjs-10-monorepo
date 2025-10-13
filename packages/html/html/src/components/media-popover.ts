import type { Placement } from '@floating-ui/dom';

import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

import { uniqueId } from '../utils/element-utils';

export class MediaPopoverRoot extends HTMLElement {
  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;

  constructor() {
    super();
    this.addEventListener('mouseenter', this.#handleMouseEnter.bind(this));
    this.addEventListener('mouseleave', this.#handleMouseLeave.bind(this));
  }

  connectedCallback(): void {
    this.#updateVisibility();
  }

  disconnectedCallback(): void {
    this.#clearHoverTimeout();
    this.#cleanup?.();
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
    this.#updateVisibility();

    if (open) {
      this.#setupFloating();
    } else {
      this.#cleanup?.();
      this.#cleanup = null;
    }
  }

  #updateVisibility(): void {
    this.toggleAttribute('data-open', this.#open);
    this.style.display = 'contents';

    if (this.#popupElement) {
      this.#popupElement.style.display = this.#open ? 'block' : 'none';
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
}

export class MediaPopoverTrigger extends HTMLElement {
  connectedCallback(): void {
    this.style.display = 'contents';

    const triggerElement = this.firstElementChild as HTMLElement;
    if (triggerElement) {
      triggerElement.setAttribute('aria-haspopup', 'true');
      triggerElement.setAttribute('aria-expanded', 'false');
    }
  }
}

export class MediaPopoverPortal extends HTMLElement {
  #portal: HTMLElement | null = null;

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
    portalContainer.append(this.#portal);

    this.#portal.append(...this.children);
  }

  #cleanupPortal(): void {
    if (!this.#portal) return;

    // Move children back to the portal element
    this.append(...this.#portal.children);
    this.#portal.remove();
    this.#portal = null;
  }
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
