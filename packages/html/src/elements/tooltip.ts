import type { MediaContainerElement } from '@/media/media-container';

import {
  getBoundingClientRectWithoutTransform,
  getDocumentOrShadowRoot,
  getInBoundsAdjustments,
} from '@videojs/utils/dom';

type Placement = 'top' | 'top-start' | 'top-end';

export class TooltipElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['id', 'delay', 'close-delay', 'track-cursor-axis', 'side', 'side-offset', 'collision-padding'];
  }

  #open = false;
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #pointerPosition = { x: 0, y: 0 };
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';
  #abortController: AbortController | null = null;

  constructor() {
    super();

    const resizeObserver = new ResizeObserver(() => this.#checkCollision());
    resizeObserver.observe(this);
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
    if (name === 'id') {
      this.style.setProperty('position-anchor', `--${newValue}`);
    }
    const [side, alignment] = this.side.split('-');
    this.style.setProperty('top', `calc(anchor(${side}) - ${this.sideOffset}px)`);

    if (this.trackCursorAxis) {
      this.style.setProperty('translate', `-50% -100%`);
    } else {
      this.style.setProperty('translate', `0 -100%`);
      this.style.setProperty('justify-self', alignment === 'start'
        ? 'anchor-start'
        : alignment === 'end'
          ? 'anchor-end'
          : 'anchor-center');
    }
  }

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
      this.#transitionStatus = 'initial';
      this.#updateVisibility();

      this.showPopover();

      requestAnimationFrame(() => {
        this.#transitionStatus = 'open';
        this.#updateVisibility();
        this.#checkCollision();
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
    }
  }

  #updateVisibility(): void {
    this.toggleAttribute('data-starting-style', this.#transitionStatus === 'initial');
    this.toggleAttribute('data-open', this.#transitionStatus === 'initial' || this.#transitionStatus === 'open');
    this.toggleAttribute(
      'data-ending-style',
      this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted',
    );
    this.toggleAttribute('data-closed', this.#transitionStatus === 'close' || this.#transitionStatus === 'unmounted');

    const triggerElement = this.#triggerElement as HTMLElement;
    if (triggerElement) {
      triggerElement.toggleAttribute('data-popup-open', this.#open);
    }
  }

  #updatePosition(): void {
    if (this.#open && this.trackCursorAxis) {
      this.style.setProperty('left', `${this.#pointerPosition.x}px`);
      this.#checkCollision();
    }
  }

  #checkCollision(): void {
    const mediaContainer = this.closest('media-container') as MediaContainerElement;
    if (!mediaContainer || !this.#open) return;

    const popupRect = getBoundingClientRectWithoutTransform(this);
    const boundsRect = getBoundingClientRectWithoutTransform(mediaContainer);
    const { x } = getInBoundsAdjustments(popupRect, boundsRect, this.collisionPadding);

    if (x !== 0) {
      if (this.trackCursorAxis) {
        const currentLeft = Number.parseFloat(this.style.left || '0');
        this.style.setProperty('left', `${currentLeft + x}px`);
      } else {
        this.style.setProperty('translate', `${x}px -100%`);
      }
    } else {
      if (this.trackCursorAxis) {
        this.style.setProperty('translate', '-50% -100%');
      } else {
        this.style.setProperty('translate', '0 -100%');
      }
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
