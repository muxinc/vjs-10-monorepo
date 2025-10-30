import type { Placement } from '@floating-ui/dom';
import type { MediaContainerElement } from '@/media/media-container';

import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { uniqueId } from '@videojs/utils';

export class TooltipRootElement extends HTMLElement {
  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #arrowElement: HTMLElement | null = null;
  #pointerPosition = { x: 0, y: 0 };
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';

  constructor() {
    super();

    if (globalThis.matchMedia?.('(hover: hover)')?.matches) {
      this.addEventListener('pointerenter', this);
      this.addEventListener('pointerleave', this);
      this.addEventListener('pointermove', this);
    }
  }

  handleEvent(event: Event): void {
    if (event.type === 'pointerenter') {
      this.#handlePointerEnter();
    } else if (event.type === 'pointerleave') {
      this.#handlePointerLeave(event as PointerEvent);
    } else if (event.type === 'pointermove') {
      this.#handlePointerMove(event as PointerEvent);
    }
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
    return ['delay', 'close-delay', 'track-cursor-axis'];
  }

  get delay(): number {
    return Number.parseInt(this.getAttribute('delay') ?? '0', 10);
  }

  get closeDelay(): number {
    return Number.parseInt(this.getAttribute('close-delay') ?? '0', 10);
  }

  get trackCursorAxis(): 'x' | 'y' | 'both' | undefined {
    const value = this.getAttribute('track-cursor-axis');
    return value === 'x' || value === 'y' || value === 'both' ? value : undefined;
  }

  get #triggerElement(): TooltipTriggerElement | null {
    return this.querySelector('media-tooltip-trigger') as TooltipTriggerElement | null;
  }

  get #portalElement(): TooltipPortalElement | null {
    return this.querySelector('media-tooltip-portal') as TooltipPortalElement | null;
  }

  get #positionerElement(): TooltipPositionerElement | null {
    return this.#portalElement?.querySelector('media-tooltip-positioner') as TooltipPositionerElement | null;
  }

  get #popupElement(): TooltipPopupElement | null {
    return this.#portalElement?.querySelector('media-tooltip-popup') as TooltipPopupElement | null;
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
      triggerElement.toggleAttribute('data-popup-open', this.#open);
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
    const mediaContainer = this.closest('media-container') as MediaContainerElement;

    this.#arrowElement = popup.querySelector('media-tooltip-arrow') as HTMLElement;

    const updatePosition = () => {
      const middleware = [
        offset(sideOffset),
        flip(),
        shift({
          boundary: mediaContainer,
          padding: collisionPadding,
        }),
      ];

      if (this.#arrowElement) {
        middleware.push(arrow({ element: this.#arrowElement }));
      }

      const referenceElement = this.trackCursorAxis
        ? {
            getBoundingClientRect: () => {
              const triggerRect = trigger.getBoundingClientRect();

              if (this.trackCursorAxis === 'x') {
                return {
                  width: 0,
                  height: 0,
                  top: triggerRect.top,
                  right: this.#pointerPosition.x,
                  bottom: triggerRect.bottom,
                  left: this.#pointerPosition.x,
                  x: this.#pointerPosition.x,
                  y: triggerRect.top,
                };
              } else if (this.trackCursorAxis === 'y') {
                return {
                  width: 0,
                  height: 0,
                  top: this.#pointerPosition.y,
                  right: triggerRect.right,
                  bottom: this.#pointerPosition.y,
                  left: triggerRect.left,
                  x: triggerRect.left,
                  y: this.#pointerPosition.y,
                };
              } else {
                // Track both axes (trackCursorAxis === 'both')
                return {
                  width: 0,
                  height: 0,
                  top: this.#pointerPosition.y,
                  right: this.#pointerPosition.x,
                  bottom: this.#pointerPosition.y,
                  left: this.#pointerPosition.x,
                  x: this.#pointerPosition.x,
                  y: this.#pointerPosition.y,
                };
              }
            },
          }
        : trigger;

      computePosition(referenceElement, popup, {
        placement,
        middleware,
      }).then(({ x, y, middlewareData, placement: computedPlacement }: { x: number; y: number; middlewareData: any; placement: Placement }) => {
        Object.assign(popup.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        popup.setAttribute('data-side', computedPlacement);

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

    if (!this.trackCursorAxis) {
      this.#cleanup = autoUpdate(trigger, popup, updatePosition);
    }
  }

  #updatePosition(): void {
    if (this.#open && this.trackCursorAxis) {
      this.#setupFloating();
    }
  }

  #clearHoverTimeout(): void {
    if (this.#hoverTimeout) {
      clearTimeout(this.#hoverTimeout);
      this.#hoverTimeout = null;
    }
  }

  #handlePointerEnter(): void {
    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(true);
    }, this.delay);
  }

  #handlePointerLeave(_event: PointerEvent): void {
    this.#clearHoverTimeout();
    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(false);
    }, this.closeDelay);
  }

  #handlePointerMove(event: PointerEvent): void {
    if (this.trackCursorAxis) {
      this.#pointerPosition = { x: event.clientX, y: event.clientY };

      if (this.#open) {
        this.#updatePosition();
      }
    }
  }
}

export class TooltipTriggerElement extends HTMLElement {
  connectedCallback(): void {
    this.style.display = 'contents';

    const triggerElement = this.firstElementChild as HTMLElement;
    if (triggerElement) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const rootElement = this.closest('media-tooltip') as TooltipRootElement;
            let popupElement = rootElement.querySelector('media-tooltip-popup') as TooltipPopupElement;

            if (!popupElement) {
              const portalElement = rootElement.querySelector('media-tooltip-portal') as TooltipPortalElement;
              if (!portalElement) {
                return;
              }

              popupElement = portalElement.querySelector('media-tooltip-popup') as TooltipPopupElement;
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

export class TooltipPortalElement extends HTMLElement {
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

export class TooltipPositionerElement extends HTMLElement {
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
    return Number.parseInt(this.getAttribute('side-offset') ?? '0', 10);
  }

  get collisionPadding(): number {
    return Number.parseInt(this.getAttribute('collision-padding') ?? '0', 10);
  }
}

export class TooltipPopupElement extends HTMLElement {
  connectedCallback(): void {
    this.setAttribute('role', 'tooltip');
  }
}

export class TooltipArrowElement extends HTMLElement {
  connectedCallback(): void {
    this.setAttribute('aria-hidden', 'true');
  }
}

export const TooltipElement: {
  Root: typeof TooltipRootElement;
  Trigger: typeof TooltipTriggerElement;
  Portal: typeof TooltipPortalElement;
  Positioner: typeof TooltipPositionerElement;
  Popup: typeof TooltipPopupElement;
  Arrow: typeof TooltipArrowElement;
} = {
  Root: TooltipRootElement,
  Trigger: TooltipTriggerElement,
  Portal: TooltipPortalElement,
  Positioner: TooltipPositionerElement,
  Popup: TooltipPopupElement,
  Arrow: TooltipArrowElement,
};
