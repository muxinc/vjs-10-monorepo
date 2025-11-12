import type { ReactNode } from 'react';

import { contains, safePolygon } from '@videojs/utils/dom';

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

type Placement = 'top' | 'top-start' | 'top-end';

type TransitionStatus = 'initial' | 'open' | 'close' | 'unmounted';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  popupRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  updatePositioning: (placement: Placement, sideOffset: number) => void;
  transitionStatus: TransitionStatus;
  placement: Placement;
  sideOffset: number;
}

interface PopoverRootProps {
  openOnHover?: boolean;
  delay?: number;
  closeDelay?: number;
  children: ReactNode;
}

interface PopoverTriggerProps {
  children: ReactNode;
}

interface PopoverPositionerProps {
  side?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

interface PopoverPopupProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

function usePopoverContext(): PopoverContextType {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within PopoverRoot');
  }
  return context;
}

function PopoverRoot({ openOnHover = false, delay = 0, closeDelay = 0, children }: PopoverRootProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('top');
  const [sideOffset, setSideOffset] = useState(5);
  const [transitionStatus, setTransitionStatus] = useState<TransitionStatus>('initial');
  const popupRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerMoveHandlerRef = useRef<((event: MouseEvent) => void) | null>(null);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const setOpenState = useCallback((newOpen: boolean) => {
    if (open === newOpen) return;

    setOpen(newOpen);

    if (newOpen) {
      setTransitionStatus('initial');
      if (popupRef.current) {
        popupRef.current.showPopover();
      }
      requestAnimationFrame(() => {
        setTransitionStatus('open');
      });
    } else {
      setTransitionStatus('close');
    }
  }, [open]);

  useEffect(() => {
    if (!popupRef.current || open) return;

    const transitions = popupRef.current.getAnimations().filter(anim => anim instanceof CSSTransition);
    if (transitions.length > 0) {
      Promise.all(transitions.map(t => t.finished))
        .then(() => popupRef.current?.hidePopover())
        .catch(() => popupRef.current?.hidePopover());
    } else {
      popupRef.current.hidePopover();
    }
  }, [open, transitionStatus]);

  const updatePositioning = useCallback((newPlacement: Placement, newSideOffset: number) => {
    setPlacement(newPlacement);
    setSideOffset(newSideOffset);
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    const addPointerMoveListener = () => {
      if (!globalThis.matchMedia?.('(hover: hover)')?.matches) return;

      if (!pointerMoveHandlerRef.current) {
        pointerMoveHandlerRef.current = safePolygon({ blockPointerEvents: true })({
          placement,
          elements: {
            domReference: trigger,
            floating: popup,
          },
          x: 0,
          y: 0,
          onClose: () => {
            if (pointerMoveHandlerRef.current) {
              document.documentElement.removeEventListener('pointermove', pointerMoveHandlerRef.current);
            }
            clearHoverTimeout();

            hoverTimeoutRef.current = setTimeout(() => {
              setOpenState(false);
            }, closeDelay);
          },
        });
      }

      // Event listener is automatically removed when AbortController is aborted
      document.documentElement.addEventListener('pointermove', pointerMoveHandlerRef.current, { signal });
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (!openOnHover) return;

      clearHoverTimeout();

      if (event.currentTarget === popup) {
        addPointerMoveListener();
      }

      if (open) {
        return;
      }

      hoverTimeoutRef.current = setTimeout(() => {
        setOpenState(true);
      }, delay);
    };

    const handlePointerLeave = () => {
      if (!openOnHover) return;
      addPointerMoveListener();
    };

    if (globalThis.matchMedia?.('(hover: hover)')?.matches) {
      // Event listeners are automatically removed when AbortController is aborted
      trigger.addEventListener('pointerenter', handlePointerEnter, { signal });
      trigger.addEventListener('pointerleave', handlePointerLeave, { signal });
      popup.addEventListener('pointerenter', handlePointerEnter, { signal });
    }

    const handleFocusIn = () => {
      setOpenState(true);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget && popup && contains(popup, relatedTarget)) return;
      setOpenState(false);
    };

    // Event listeners are automatically removed when AbortController is aborted
    trigger.addEventListener('focusin', handleFocusIn, { signal });
    trigger.addEventListener('focusout', handleFocusOut, { signal });
    popup.addEventListener('focusout', handleFocusOut, { signal });

    return () => {
      abortController.abort();
      clearHoverTimeout();

      if (pointerMoveHandlerRef.current) {
        document.documentElement.removeEventListener('pointermove', pointerMoveHandlerRef.current);
      }

      pointerMoveHandlerRef.current = null;
    };
  }, [openOnHover, delay, closeDelay, open, placement, setOpenState, clearHoverTimeout]);

  useEffect(() => {
    if (!popupRef.current || !triggerRef.current) return;

    const popup = popupRef.current;
    const popupId = popup.id;
    if (popupId) {
      popup.style.setProperty('position-anchor', `--${popupId}`);
    }

    const [side, alignment] = placement.split('-');
    popup.style.setProperty('top', `calc(anchor(${side}) - ${sideOffset}px)`);
    popup.style.setProperty('translate', `0 -100%`);
    popup.style.setProperty('justify-self', alignment === 'start'
      ? 'anchor-start'
      : alignment === 'end'
        ? 'anchor-end'
        : 'anchor-center');
  }, [placement, sideOffset]);

  const value: PopoverContextType = useMemo(() => ({
    open,
    setOpen: setOpenState,
    popupRef,
    triggerRef,
    updatePositioning,
    transitionStatus,
    placement,
    sideOffset,
  }), [open, setOpenState, updatePositioning, transitionStatus, placement, sideOffset]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

function PopoverTrigger({ children }: PopoverTriggerProps): JSX.Element {
  const { triggerRef, open } = usePopoverContext();

  // eslint-disable-next-line react/no-clone-element, react/no-children-only
  return cloneElement(Children.only(children) as JSX.Element, {
    ref: triggerRef,
    'data-popup-open': open ? '' : undefined,
  });
}

function PopoverPositioner({ side = 'top', sideOffset = 5, children }: PopoverPositionerProps): JSX.Element | null {
  const { updatePositioning } = usePopoverContext();

  useEffect(() => {
    updatePositioning(side, sideOffset);
  }, [side, sideOffset, updatePositioning]);

  return <>{children}</>;
}

function PopoverPopup({ id, className, children }: PopoverPopupProps): JSX.Element {
  const { popupRef, triggerRef, transitionStatus, placement } = usePopoverContext();
  const triggerElement = triggerRef.current;

  const uniqueId = useId();
  const popupId = id ?? uniqueId;

  useEffect(() => {
    if (!popupRef.current || !triggerRef.current) return;

    const popup = popupRef.current;
    const trigger = triggerRef.current;

    popup.setAttribute('popover', 'manual');
    trigger.setAttribute('commandfor', popupId);
    trigger.style.setProperty('anchor-name', `--${popupId}`);
  }, [popupId, popupRef, triggerRef]);

  // Copy data attributes from trigger element
  const dataAttributes = useMemo(() => {
    if (!triggerElement?.attributes) return {};
    return Object.fromEntries(
      Array.from(triggerElement.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .map(attr => [attr.name, attr.value]),
    );
  }, [triggerElement]);

  return (
    <div
      ref={popupRef as React.RefObject<HTMLDivElement>}
      id={popupId}
      className={className}
      {...dataAttributes}
      data-side={placement}
      data-starting-style={transitionStatus === 'initial' ? '' : undefined}
      data-open={transitionStatus === 'initial' || transitionStatus === 'open' ? '' : undefined}
      data-ending-style={transitionStatus === 'close' || transitionStatus === 'unmounted' ? '' : undefined}
      data-closed={transitionStatus === 'close' || transitionStatus === 'unmounted' ? '' : undefined}
    >
      {children}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const Popover: {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Positioner: typeof PopoverPositioner;
  Popup: typeof PopoverPopup;
} = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
};

export default Popover;
