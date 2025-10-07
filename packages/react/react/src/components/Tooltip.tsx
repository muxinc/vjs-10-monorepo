import type { Placement } from '@floating-ui/react';
import type { ReactNode } from 'react';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

interface UpdatePositioningProps {
  side: Placement;
  sideOffset: number;
  collisionPadding: number;
}

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: ReturnType<typeof useFloating>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  context: ReturnType<typeof useFloating>['context'];
  updatePositioning: (props: UpdatePositioningProps) => void;
  arrowRef: React.MutableRefObject<HTMLElement | null>;
}

interface TooltipRootProps {
  delay?: number;
  closeDelay?: number;
  children: ReactNode;
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
  container?: HTMLElement | ShadowRoot | React.MutableRefObject<HTMLElement | ShadowRoot | null> | null;
  id?: string;
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

function TooltipRoot({ delay = 600, closeDelay = 0, children }: TooltipRootProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('top');
  const [sideOffset, setSideOffset] = useState(0);
  const [collisionPadding, setCollisionPadding] = useState(0);
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, context } = useFloating({
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

  const hover = useHover(context, {
    delay: {
      open: delay,
      close: closeDelay,
    },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const updatePositioning = ({ side, sideOffset, collisionPadding }: UpdatePositioningProps) => {
    setPlacement(side);
    setSideOffset(sideOffset);
    setCollisionPadding(collisionPadding);
  };

  const value: TooltipContextType = {
    open,
    setOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    context,
    updatePositioning,
    arrowRef,
  };

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

function TooltipTrigger({ children }: TooltipTriggerProps): JSX.Element {
  const { refs, getReferenceProps } = useTooltipContext();

  return React.cloneElement(React.Children.only(children) as JSX.Element, {
    ref: refs.setReference,
    ...getReferenceProps(),
  });
}

function TooltipPositioner({ side = 'top', sideOffset = 0, collisionPadding = 0, children }: TooltipPositionerProps): JSX.Element | null {
  const { open, refs, floatingStyles, updatePositioning } = useTooltipContext();

  // Update positioning when props change
  useEffect(() => {
    updatePositioning({ side, sideOffset, collisionPadding });
  }, [side, sideOffset, collisionPadding, updatePositioning]);

  if (!open) {
    return null;
  }

  const positionerContextValue: TooltipPositionerContextType = {
    side,
  };

  return (
    <TooltipPositionerContext.Provider value={positionerContextValue}>
      <div ref={refs.setFloating} style={floatingStyles}>
        {children}
      </div>
    </TooltipPositionerContext.Provider>
  );
}

function TooltipPopup({ className = '', children }: TooltipPopupProps): JSX.Element {
  const { getFloatingProps } = useTooltipContext();
  const { refs } = useTooltipContext();
  const triggerElement = refs.reference.current as HTMLElement | null;

  // Copy data attributes from trigger element
  const dataAttributes = triggerElement
    ? Object.fromEntries(
        Array.from(triggerElement.attributes)
          .filter((attr) => attr.name.startsWith('data-'))
          .map((attr) => [attr.name, attr.value])
      )
    : {};

  return (
    <div className={className} {...getFloatingProps()} {...dataAttributes}>
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
      ref={arrowRef as React.RefObject<HTMLDivElement>}
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

function TooltipPortal({ children, container, id }: TooltipPortalProps): JSX.Element {
  return <FloatingPortal root={container as HTMLElement} id={id as string}>{children}</FloatingPortal>;
}

// Export compound component
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
