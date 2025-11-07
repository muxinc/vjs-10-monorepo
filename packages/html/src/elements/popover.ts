import { contains, getDocument, getDocumentOrShadowRoot, safePolygon } from '@videojs/utils/dom';

type Placement = 'top' | 'bottom' | 'left' | 'right';

export class PopoverElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['id', 'open-on-hover', 'delay', 'close-delay', 'side', 'side-offset'];
  }

  #open = false;
  #transitionStatus: 'initial' | 'open' | 'close' | 'unmounted' = 'initial';
  #hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  #cleanup: (() => void) | null = null;
  #abortController: AbortController | null = null;

  attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
    if (name === 'id') {
      this.style.setProperty('position-anchor', `--${newValue}`);
    }

    this.style.setProperty('top', `calc(anchor(${this.side}) - ${this.sideOffset}px)`);
    this.style.setProperty('translate', `0 -100%`);
    this.style.setProperty('justify-self', 'anchor-center');
  }

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
    if (!this.openOnHover || !this.#triggerElement) return;

    const close = safePolygon({ blockPointerEvents: true })({
      placement: this.side,
      elements: {
        domReference: this.#triggerElement,
        floating: this,
      },
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
