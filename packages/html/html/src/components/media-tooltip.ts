import type { Placement } from '@floating-ui/dom';
import type { MediaContainer } from '@/media-container';

import { autoUpdate, computePosition, flip, offset, shift, arrow } from '@floating-ui/dom';
import { uniqueId } from '../utils/element-utils';

export class MediaTooltipRoot extends HTMLElement {
  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #arrowElement: HTMLElement | null = null;

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
  }

  static get observedAttributes(): string[] {
    return ['delay', 'close-delay'];
  }

  get delay(): number {
    return parseInt(this.getAttribute('delay') ?? '600', 10);
  }

  get closeDelay(): number {
    return parseInt(this.getAttribute('close-delay') ?? '0', 10);
  }

  get #triggerElement(): MediaTooltipTrigger | null {
    return this.querySelector('media-tooltip-trigger') as MediaTooltipTrigger | null;
  }

  get #portalElement(): MediaTooltipPortal | null {
    return this.querySelector('media-tooltip-portal') as MediaTooltipPortal | null;
  }

  get #positionerElement(): MediaTooltipPositioner | null {
    return this.#portalElement?.querySelector('media-tooltip-positioner') as MediaTooltipPositioner | null;
  }

  get #popupElement(): MediaTooltipPopup | null {
    return this.#portalElement?.querySelector('media-tooltip-popup') as MediaTooltipPopup | null;
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

    // Update trigger aria-expanded
    const triggerElement = this.#triggerElement?.firstElementChild as HTMLElement;
    if (triggerElement) {
      triggerElement.setAttribute('aria-expanded', this.#open.toString());
    }
  }

  #setupFloating(): void {
    if (!this.#triggerElement || !this.#popupElement) return;

    const trigger = this.#triggerElement.firstElementChild as HTMLElement;
    const popup = this.#popupElement;

    if (!trigger || !popup) return;

    const placement = this.#positionerElement?.side ?? 'top';
    const sideOffset = this.#positionerElement?.sideOffset ?? 0;
    const collisionPadding = this.#positionerElement?.collisionPadding ?? 0;
    const mediaContainer = this.closest('media-container') as MediaContainer;

    this.#arrowElement = popup.querySelector('media-tooltip-arrow') as HTMLElement;

    const updatePosition = () => {
      const middleware = [
        offset(sideOffset),
        flip(),
        shift({
          boundary: mediaContainer,
          padding: collisionPadding 
        }),
      ];

      // Add arrow middleware if arrow element exists
      if (this.#arrowElement) {
        middleware.push(arrow({ element: this.#arrowElement }));
      }

      computePosition(trigger, popup, {
        placement,
        middleware,
      }).then(({ x, y, middlewareData }: { x: number; y: number; middlewareData: any }) => {
        Object.assign(popup.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        // Position arrow if it exists
        if (this.#arrowElement && middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          Object.assign(this.#arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : undefined,
            top: arrowY != null ? `${arrowY}px` : undefined,
          });
        }
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
    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(true);
    }, this.delay);
  }

  #handleMouseLeave(): void {
    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(false);
    }, this.closeDelay);
  }

  #handleFocusIn(): void {
    this.#clearHoverTimeout();
    this.#setOpen(true);
  }

  #handleFocusOut(): void {
    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(false);
    }, this.closeDelay);
  }
}

export class MediaTooltipTrigger extends HTMLElement {
  connectedCallback(): void {
    this.style.display = 'contents';

    const triggerElement = this.firstElementChild as HTMLElement;
    if (triggerElement) {
      triggerElement.setAttribute('aria-describedby', 'tooltip');
      triggerElement.setAttribute('aria-expanded', 'false');

      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const rootElement = this.closest('media-tooltip-root') as MediaTooltipRoot;
            let popupElement = rootElement.querySelector('media-tooltip-popup') as MediaTooltipPopup;

            if (!popupElement) {
              const portalElement = rootElement.querySelector('media-tooltip-portal') as MediaTooltipPortal;
              if (!portalElement) {
                return;
              }

              popupElement = portalElement.querySelector('media-tooltip-popup') as MediaTooltipPopup;
              if (!popupElement) {
                return;
              }
            }
            
            const attributeName = mutation.attributeName;
            if (!attributeName) {
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

export class MediaTooltipPortal extends HTMLElement {
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

  #setupPortal(): void {
    const portalId = this.getAttribute('root-id');
    if (!portalId) return;

    const portalContainer = (this.getRootNode() as ShadowRoot | Document).getElementById(portalId);
    if (!portalContainer) return;

    this.#portal = document.createElement('div');
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

export class MediaTooltipPositioner extends HTMLElement {
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
    return (this.getAttribute('side') as Placement) ?? 'top';
  }

  get sideOffset(): number {
    return parseInt(this.getAttribute('side-offset') ?? '0', 10);
  }

  get collisionPadding(): number {
    return parseInt(this.getAttribute('collision-padding') ?? '0', 10);
  }
}

export class MediaTooltipPopup extends HTMLElement {
  connectedCallback(): void {
    this.setAttribute('role', 'tooltip');
    this.style.display = 'none';
  }
}

export class MediaTooltipArrow extends HTMLElement {
  connectedCallback(): void {
    this.setAttribute('aria-hidden', 'true');
  }
}

if (!globalThis.customElements.get('media-tooltip-root')) {
  globalThis.customElements.define('media-tooltip-root', MediaTooltipRoot);
}

if (!globalThis.customElements.get('media-tooltip-trigger')) {
  globalThis.customElements.define('media-tooltip-trigger', MediaTooltipTrigger);
}

if (!globalThis.customElements.get('media-tooltip-portal')) {
  globalThis.customElements.define('media-tooltip-portal', MediaTooltipPortal);
}

if (!globalThis.customElements.get('media-tooltip-positioner')) {
  globalThis.customElements.define('media-tooltip-positioner', MediaTooltipPositioner);
}

if (!globalThis.customElements.get('media-tooltip-popup')) {
  globalThis.customElements.define('media-tooltip-popup', MediaTooltipPopup);
}

if (!globalThis.customElements.get('media-tooltip-arrow')) {
  globalThis.customElements.define('media-tooltip-arrow', MediaTooltipArrow);
}

export const Tooltip: {
  Root: typeof MediaTooltipRoot;
  Trigger: typeof MediaTooltipTrigger;
  Portal: typeof MediaTooltipPortal;
  Positioner: typeof MediaTooltipPositioner;
  Popup: typeof MediaTooltipPopup;
  Arrow: typeof MediaTooltipArrow;
} = {
  Root: MediaTooltipRoot,
  Trigger: MediaTooltipTrigger,
  Portal: MediaTooltipPortal,
  Positioner: MediaTooltipPositioner,
  Popup: MediaTooltipPopup,
  Arrow: MediaTooltipArrow,
};

export default Tooltip;
