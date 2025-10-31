import type { Placement } from '@floating-ui/dom';
import type { MediaContainerElement } from '@/media/media-container';

import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { getDocumentOrShadowRoot } from '@videojs/utils/dom';

export class TooltipElement extends HTMLElement {
  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #arrowElement: HTMLElement | null = null;
  #pointerPosition = { x: 0, y: 0 };
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';
  #abortController: AbortController | null = null;

  connectedCallback(): void {
    this.setAttribute('role', 'tooltip');

    this.#abortController ??= new AbortController();
    const { signal } = this.#abortController;

    const trigger = this.#triggerElement as HTMLElement;
    if (trigger) {
      if (globalThis.matchMedia?.('(hover: hover)')?.matches) {
        trigger.addEventListener('pointerenter', this, { signal });
        trigger.addEventListener('pointerleave', this, { signal });
        trigger.addEventListener('pointermove', this, { signal });
      }
    }

    this.#updateVisibility();
  }

  disconnectedCallback(): void {
    this.#clearHoverTimeout();
    this.#cleanup?.();
    this.#abortController?.abort();
    this.#abortController = null;

    this.#transitionStatus = 'unmounted';
    this.#updateVisibility();
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'pointerenter':
        this.#handlePointerEnter();
        break;
      case 'pointerleave':
        this.#handlePointerLeave(event as PointerEvent);
        break;
      case 'pointermove':
        this.#handlePointerMove(event as PointerEvent);
        break;
      default:
        break;
    }
  }

  static get observedAttributes(): string[] {
    return ['delay', 'close-delay', 'track-cursor-axis', 'side', 'side-offset', 'collision-padding'];
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

  get side(): Placement {
    return (this.getAttribute('side') as Placement) ?? 'top';
  }

  get sideOffset(): number {
    return Number.parseInt(this.getAttribute('side-offset') ?? '0', 10);
  }

  get collisionPadding(): number {
    return Number.parseInt(this.getAttribute('collision-padding') ?? '0', 10);
  }

  get #triggerElement(): HTMLElement | null {
    return getDocumentOrShadowRoot(this)?.querySelector(`[commandfor="${this.id}"]`) as HTMLElement | null;
  }

  #setOpen(open: boolean): void {
    if (this.#open === open) return;

    this.#open = open;

    if (open) {
      this.#setupFloating();

      this.#transitionStatus = 'initial';
      this.#updateVisibility();

      this.showPopover();

      requestAnimationFrame(() => {
        this.#transitionStatus = 'open';
        this.#updateVisibility();
      });
    } else {
      this.#transitionStatus = 'close';
      this.#updateVisibility();

      const transitions = this.getAnimations().filter(anim => anim instanceof CSSTransition);
      if (transitions.length > 0) {
        Promise.all(transitions.map(t => t.finished))
          .then(() => this.hidePopover())
          .catch(() => this.hidePopover());
      } else {
        this.hidePopover();
      }

      this.#cleanup?.();
      this.#cleanup = null;
    }
  }

  #updateVisibility(): void {
    this.toggleAttribute('data-starting-style', this.#transitionStatus === 'initial');
    this.toggleAttribute('data-open', this.#transitionStatus === 'initial' || this.#transitionStatus === 'open');
    this.toggleAttribute('data-ending-style', this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted');
    this.toggleAttribute('data-closed', this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted');

    const triggerElement = this.#triggerElement as HTMLElement;
    if (triggerElement) {
      triggerElement.toggleAttribute('data-popup-open', this.#open);
    }
  }

  #setupFloating(): void {
    const trigger = this.#triggerElement as HTMLElement;
    if (!trigger) return;

    const placement = this.side;
    const sideOffset = this.sideOffset;
    const collisionPadding = this.collisionPadding;
    const mediaContainer = this.closest('media-container') as MediaContainerElement;

    this.#arrowElement = this.querySelector('media-tooltip-arrow') as HTMLElement;

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

      computePosition(referenceElement, this, {
        placement,
        middleware,
        strategy: 'fixed',
      }).then(({ x, y, middlewareData }: { x: number; y: number; middlewareData: any }) => {
        Object.assign(this.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

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
      this.#cleanup = autoUpdate(trigger, this, updatePosition);
    }
  }

  #updatePosition(): void {
    if (this.#open && this.trackCursorAxis) {
      this.#setupFloating();
    }
  }

  #clearHoverTimeout(): void {
    if (this.#hoverTimeout) {
      globalThis.clearTimeout(this.#hoverTimeout);
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
