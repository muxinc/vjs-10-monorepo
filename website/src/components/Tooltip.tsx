import type { ReactElement, ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import clsx from 'clsx';
import { cloneElement } from 'react';

export interface TooltipProviderProps {
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
}

export function TooltipProvider({ children, delay = 600, closeDelay = 0 }: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
      {children}
    </BaseTooltip.Provider>
  );
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  sideOffset = 5,
  className,
}: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={props => cloneElement(children, props)} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup
            className={clsx(
              'bg-dark-100 text-light-80 text-sm px-3 py-2 rounded-lg shadow-lg',
              'z-50 max-w-xs',
              className,
            )}
          >
            {content}
            <BaseTooltip.Arrow className="fill-dark-100" />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
