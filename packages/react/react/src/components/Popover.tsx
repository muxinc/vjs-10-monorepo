import type { OpenChangeReason, Placement } from '@floating-ui/react';
import type { MutableRefObject, ReactNode } from 'react';

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStatus,
} from '@floating-ui/react';

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openReason: OpenChangeReason | null;
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: ReturnType<typeof useFloating>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  context: ReturnType<typeof useFloating>['context'];
  updatePositioning: (placement: Placement, sideOffset: number) => void;
  transitionStatus: ReturnType<typeof useTransitionStatus>['status'];
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
  className?: string;
  children: ReactNode;
}

interface PopoverPortalProps {
  children: ReactNode;
  root?: HTMLElement | ShadowRoot | MutableRefObject<HTMLElement | ShadowRoot | null> | null;
  rootId?: string;
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
  const [openReason, setOpenReason] = useState<OpenChangeReason | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (open, _event, reason) => {
      setOpen(open);
      setOpenReason(reason || null);
    },
    placement,
    middleware: [offset(sideOffset), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { status: transitionStatus } = useTransitionStatus(context);

  const hover = useHover(context, {
    enabled: openOnHover,
    mouseOnly: true,
    delay: {
      open: delay,
      close: closeDelay,
    },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const updatePositioning = useCallback((newPlacement: Placement, newSideOffset: number) => {
    setPlacement(newPlacement);
    setSideOffset(newSideOffset);
  }, []);

  const value: PopoverContextType = useMemo(() => ({
    open,
    setOpen,
    openReason,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    context,
    updatePositioning,
    transitionStatus,
  }), [open, openReason, refs, floatingStyles, getReferenceProps, getFloatingProps, context, updatePositioning, transitionStatus]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

function PopoverTrigger({ children }: PopoverTriggerProps): JSX.Element {
  const { refs, getReferenceProps, open } = usePopoverContext();

  // eslint-disable-next-line react/no-clone-element, react/no-children-only
  return cloneElement(Children.only(children) as JSX.Element, {
    ref: refs.setReference,
    ...getReferenceProps(),
    'data-popup-open': open ? '' : undefined,
  });
}

function PopoverPositioner({ side = 'top', sideOffset = 5, children }: PopoverPositionerProps): JSX.Element | null {
  const { refs, floatingStyles, updatePositioning } = usePopoverContext();

  // Update positioning when props change
  useEffect(() => {
    updatePositioning(side, sideOffset);
  }, [side, sideOffset, updatePositioning]);

  return (
    <div ref={refs.setFloating} style={floatingStyles}>
      {children}
    </div>
  );
}

function PopoverPopup({ className, children }: PopoverPopupProps): JSX.Element {
  const { getFloatingProps, context, openReason, transitionStatus } = usePopoverContext();
  const { refs, placement } = context;
  const triggerElement = refs.reference.current as HTMLElement | null;

  // Copy data attributes from trigger element
  const dataAttributes = triggerElement?.attributes
    ? Object.fromEntries(
        Array.from(triggerElement.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => [attr.name, attr.value]),
      )
    : {};

  return (
    <FloatingFocusManager
      disabled={openReason === 'hover'}
      context={context}
      modal={false}
      initialFocus={context.refs.reference as MutableRefObject<HTMLElement>}
    >
      <div
        className={className}
        {...getFloatingProps()}
        {...dataAttributes}
        data-side={placement}
        data-starting-style={transitionStatus === 'initial' ? '' : undefined}
        data-open={transitionStatus === 'initial' || transitionStatus === 'open' ? '' : undefined}
        data-ending-style={transitionStatus === 'close' || transitionStatus === 'unmounted' ? '' : undefined}
        data-closed={transitionStatus === 'close' || transitionStatus === 'unmounted' ? '' : undefined}
      >
        {children}
      </div>
    </FloatingFocusManager>
  );
}

function PopoverPortal({ children, root, rootId = '@default_portal_id' }: PopoverPortalProps): JSX.Element {
  return (
    <FloatingPortal root={root as HTMLElement} id={rootId as string}>
      {children}
    </FloatingPortal>
  );
}

// Export compound component
// eslint-disable-next-line react-refresh/only-export-components
export const Popover: {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Positioner: typeof PopoverPositioner;
  Popup: typeof PopoverPopup;
  Portal: typeof PopoverPortal;
} = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Portal: PopoverPortal,
};

export default Popover;
