import type { ComputePositionReturn, Placement } from '@videojs/utils/dom';

import {
  autoUpdate,
  computePosition,
  contains,
  getDocument,
  getDocumentOrShadowRoot,
  offset,
  safePolygon,
  shift,
} from '@videojs/utils/dom';

type Prettify<T> = {
  [K in keyof T]: T[K];
};

type FloatingContext = Prettify<ComputePositionReturn> & {
  elements: {
    domReference: HTMLElement;
    floating: HTMLElement;
  };
};

export class PopoverElement extends HTMLElement {
  #open = false;
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #abortController: AbortController | null = null;
  #floatingContext: FloatingContext | null = null;

  connectedCallback(): void {
    this.#abortController ??= new AbortController();
    const { signal } = this.#abortController;

    const trigger = this.#triggerElement as HTMLElement;
    if (trigger) {
      if (globalThis.matchMedia?.('(hover: hover)')?.matches) {
        trigger.addEventListener('pointerenter', this, { signal });
        trigger.addEventListener('pointerleave', this, { signal });
      }

      trigger.addEventListener('focusin', this, { signal });
      trigger.addEventListener('focusout', this, { signal });
    }

    this.addEventListener('pointerenter', this, { signal });
    this.addEventListener('focusout', this, { signal });
  }

  disconnectedCallback(): void {
    this.#clearHoverTimeout();
    this.#cleanup?.();

    this.#abortController?.abort();
    this.#abortController = null;
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'pointerenter':
        this.#handlePointerEnter(event as PointerEvent);
        break;
      case 'pointerleave':
        this.#handlePointerLeave(event as PointerEvent);
        break;
      case 'pointermove':
        this.#handlePointerMove(event as PointerEvent);
        break;
      case 'focusin':
        this.#handleFocusIn(event as FocusEvent);
        break;
      case 'focusout':
        this.#handleFocusOut(event as FocusEvent);
        break;
      default:
        break;
    }
  }

  static get observedAttributes(): string[] {
    return ['open-on-hover', 'delay', 'close-delay', 'side', 'side-offset'];
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

  get side(): Placement {
    return this.getAttribute('side') as Placement;
  }

  get sideOffset(): number {
    return Number.parseInt(this.getAttribute('side-offset') ?? '0', 10);
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
      this.#setupFloating();

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
  }

  #setupFloating(): void {
    const trigger = this.#triggerElement as HTMLElement;
    if (!trigger) return;

    const placement = this.side ?? 'top';
    const sideOffset = this.sideOffset;

    const updatePosition = () => {
      computePosition(trigger, this, {
        placement,
        middleware: [offset(sideOffset), shift()],
        strategy: 'fixed',
      }).then((data: ComputePositionReturn) => {
        this.#floatingContext = {
          ...data,
          elements: {
            domReference: trigger,
            floating: this,
          },
        };

        Object.assign(this.style, {
          left: `${data.x}px`,
          top: `${data.y}px`,
        });
      });
    };

    updatePosition();
    this.#cleanup = autoUpdate(trigger, this, updatePosition);
  }

  #clearHoverTimeout(): void {
    if (this.#hoverTimeout) {
      globalThis.clearTimeout(this.#hoverTimeout);
      this.#hoverTimeout = null;
    }
  }

  #handlePointerEnter(event: PointerEvent): void {
    if (!this.openOnHover) return;

    this.#clearHoverTimeout();

    if (event.currentTarget === this) {
      this.#addPointerMoveListener();
    }

    if (this.#open) {
      return;
    }

    this.#hoverTimeout = globalThis.setTimeout(() => {
      this.#setOpen(true);
    }, this.delay);
  }

  #handlePointerLeave(_event: PointerEvent): void {
    this.#addPointerMoveListener();
  }

  #addPointerMoveListener(): void {
    if (!globalThis.matchMedia?.('(hover: hover)')?.matches) return;

    const { signal } = this.#abortController as AbortController;
    getDocument(this).documentElement.addEventListener('pointermove', this, { signal });
  }

  #handlePointerMove(event: PointerEvent): void {
    if (!this.openOnHover || !this.#floatingContext) return;

    const close = safePolygon({ blockPointerEvents: true })({
      ...this.#floatingContext,
      x: event.clientX,
      y: event.clientY,
      onClose: () => {
        getDocument(this).documentElement.removeEventListener('pointermove', this);

        this.#clearHoverTimeout();
        this.#hoverTimeout = globalThis.setTimeout(() => {
          this.#setOpen(false);
        }, this.closeDelay);
      },
    });
    close(event);
  }

  #handleFocusIn(_event: FocusEvent): void {
    this.#setOpen(true);
  }

  #handleFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && contains(this, relatedTarget)) return;

    this.#setOpen(false);
  };
}
