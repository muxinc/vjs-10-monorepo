import type { Placement } from '@floating-ui/react';
import type { ReactNode } from 'react';

import React, { createContext, useContext, useEffect, useState } from 'react';

import {
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

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: ReturnType<typeof useFloating>['floatingStyles'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  context: ReturnType<typeof useFloating>['context'];
  updatePositioning: (placement: Placement, sideOffset: number) => void;
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
  container?: HTMLElement | ShadowRoot | React.MutableRefObject<HTMLElement | ShadowRoot | null> | null;
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

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(sideOffset), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: openOnHover,
    delay: {
      open: delay,
      close: closeDelay,
    },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const updatePositioning = (newPlacement: Placement, newSideOffset: number) => {
    setPlacement(newPlacement);
    setSideOffset(newSideOffset);
  };

  const value: PopoverContextType = {
    open,
    setOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    context,
    updatePositioning,
  };

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

function PopoverTrigger({ children }: PopoverTriggerProps): JSX.Element {
  const { refs, getReferenceProps } = usePopoverContext();

  return React.cloneElement(React.Children.only(children) as JSX.Element, {
    ref: refs.setReference,
    ...getReferenceProps(),
  });
}

function PopoverPositioner({ side = 'top', sideOffset = 5, children }: PopoverPositionerProps): JSX.Element | null {
  const { open, refs, floatingStyles, updatePositioning } = usePopoverContext();

  // Update positioning when props change
  useEffect(() => {
    updatePositioning(side, sideOffset);
  }, [side, sideOffset, updatePositioning]);

  if (!open) {
    return null;
  }

  return (
    <div ref={refs.setFloating} style={floatingStyles}>
      {children}
    </div>
  );
}

function PopoverPopup({ className, children }: PopoverPopupProps): JSX.Element {
  const { getFloatingProps } = usePopoverContext();

  return (
    <div className={className} {...getFloatingProps()}>
      {children}
    </div>
  );
}

function PopoverPortal({ children, container }: PopoverPortalProps): JSX.Element {
  return <FloatingPortal root={container as HTMLElement}>{children}</FloatingPortal>;
}

// Export compound component
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
