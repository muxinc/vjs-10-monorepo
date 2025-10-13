import type { Placement } from '@floating-ui/react';
import type { MutableRefObject, ReactNode, RefObject } from 'react';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClientPoint,
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
  useRef,
  useState,
} from 'react';

interface UpdatePositioningProps {
  side: Placement;
  sideOffset: number;
  collisionPadding: number;
}

interface TooltipContextType {
  arrowRef: MutableRefObject<HTMLElement | null>;
  context: ReturnType<typeof useFloating>['context'];
  transitionStatus: ReturnType<typeof useTransitionStatus>['status'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  updatePositioning: (props: UpdatePositioningProps) => void;
  trackCursorAxis?: 'x' | 'y' | 'both' | undefined;
}

interface TooltipRootProps {
  delay?: number;
  closeDelay?: number;
  children: ReactNode;
  trackCursorAxis?: 'x' | 'y' | 'both';
}

interface TooltipTriggerProps {
  children: ReactNode;
}

interface TooltipPositionerProps {
  side?: Placement;
  sideOffset?: number;
  collisionPadding?: number;
  children: ReactNode;
}

interface TooltipPopupProps {
  className?: string;
  children: ReactNode;
}

interface TooltipArrowProps {
  className?: string;
  children: ReactNode;
}

interface TooltipPortalProps {
  children: ReactNode;
  root?: HTMLElement | ShadowRoot | MutableRefObject<HTMLElement | ShadowRoot | null> | null;
  rootId?: string;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

interface TooltipPositionerContextType {
  side: Placement;
}

const TooltipPositionerContext = createContext<TooltipPositionerContextType | null>(null);

function useTooltipContext(): TooltipContextType {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip components must be used within TooltipRoot');
  }
  return context;
}

function useTooltipPositionerContext(): TooltipPositionerContextType {
  const context = useContext(TooltipPositionerContext);
  if (!context) {
    throw new Error('TooltipArrow must be used within TooltipPositioner');
  }
  return context;
}

function TooltipRoot({ delay = 0, closeDelay = 0, trackCursorAxis, children }: TooltipRootProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('top');
  const [sideOffset, setSideOffset] = useState(0);
  const [collisionPadding, setCollisionPadding] = useState(0);
  const arrowRef = useRef<HTMLElement | null>(null);

  const { context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(sideOffset),
      flip(),
      shift({ padding: collisionPadding }),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { status: transitionStatus } = useTransitionStatus(context);

  const hover = useHover(context, {
    restMs: 300,
    delay: {
      open: delay,
      close: closeDelay,
    },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  // Use client point hook when trackCursorAxis is enabled
  const clientPoint = useClientPoint(context, {
    axis: trackCursorAxis || 'both',
    enabled: !!trackCursorAxis,
  });

  // Combine interactions based on whether cursor tracking is enabled
  const interactions = trackCursorAxis
    ? [hover, focus, dismiss, role, clientPoint]
    : [hover, focus, dismiss, role];

  const { getReferenceProps, getFloatingProps } = useInteractions(interactions);

  const updatePositioning = useCallback(({ side, sideOffset, collisionPadding }: UpdatePositioningProps) => {
    setPlacement(side);
    setSideOffset(sideOffset);
    setCollisionPadding(collisionPadding);
  }, []);

  const value: TooltipContextType = useMemo(() => ({
    getReferenceProps,
    getFloatingProps,
    context,
    updatePositioning,
    arrowRef,
    transitionStatus,
    trackCursorAxis,
  };
  }), [getReferenceProps, getFloatingProps, context, updatePositioning, transitionStatus, trackCursorAxis]);

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

function TooltipTrigger({ children }: TooltipTriggerProps): JSX.Element {
  const { context, getReferenceProps } = useTooltipContext();
  const { refs, open } = context;

  // eslint-disable-next-line react/no-clone-element, react/no-children-only
  return cloneElement(Children.only(children) as JSX.Element, {
    ref: refs.setReference,
    ...getReferenceProps(),
    'data-popup-open': open ? '' : undefined,
  });
}

function TooltipPositioner({
  side = 'top',
  sideOffset = 0,
  collisionPadding = 0,
  children,
}: TooltipPositionerProps): JSX.Element | null {
  const { context, updatePositioning, trackCursorAxis } = useTooltipContext();
  const { refs, floatingStyles } = context;

  // Update positioning when props change
  useEffect(() => {
    updatePositioning({ side, sideOffset, collisionPadding });
  }, [side, sideOffset, collisionPadding, updatePositioning]);

  const positionerContextValue: TooltipPositionerContextType = useMemo(() => ({
    side,
  }), [side]);

  return (
    <TooltipPositionerContext.Provider value={positionerContextValue}>
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          pointerEvents: trackCursorAxis ? 'none' : undefined,
        }}
      >
        {children}
      </div>
    </TooltipPositionerContext.Provider>
  );
}

function TooltipPopup({ className = '', children }: TooltipPopupProps): JSX.Element | null {
  const { context, getFloatingProps, transitionStatus } = useTooltipContext();
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
  );
}

function TooltipArrow({ className = '', children }: TooltipArrowProps): JSX.Element {
  const { arrowRef, context } = useTooltipContext();
  const { side } = useTooltipPositionerContext();

  // Get arrow positioning data from floating-ui
  const { x: arrowX, y: arrowY } = context.middlewareData.arrow || { x: 0, y: 0 };

  return (
    <div
      ref={arrowRef as RefObject<HTMLDivElement>}
      className={className}
      aria-hidden="true"
      data-side={side}
      style={{
        left: arrowX != null ? `${arrowX}px` : undefined,
        top: arrowY != null ? `${arrowY}px` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function TooltipPortal({ children, root, rootId = '@default_portal_id' }: TooltipPortalProps): JSX.Element {
  return (
    <FloatingPortal root={root as HTMLElement} id={rootId as string}>
      {children}
    </FloatingPortal>
  );
}

// Export compound component
// eslint-disable-next-line react-refresh/only-export-components
export const Tooltip: {
  Root: typeof TooltipRoot;
  Trigger: typeof TooltipTrigger;
  Positioner: typeof TooltipPositioner;
  Popup: typeof TooltipPopup;
  Arrow: typeof TooltipArrow;
  Portal: typeof TooltipPortal;
} = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  Portal: TooltipPortal,
};

export default Tooltip;
