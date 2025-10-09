import type { FC, ReactElement } from 'react';

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export type StateHookFn<TProps = any, TState = any> = (props: TProps) => TState;

export type PropsHookFn<TProps = any, TState = any, TResultProps = any> = (
  props: TProps,
  state: TState
) => TResultProps;

export type RenderFn<TProps = any, TState = any> = (props: TProps, state: TState) => ReactElement;

const Context = createContext<any>(null);

/**
 * Generic factory function to create connected components following the hooks pattern
 * inspired by Adobe React Spectrum and Base UI architectures.
 *
 * @param useStateHook - Hook that provides component state
 * @param usePropsHook - Hook that enhances props with state-derived values
 * @param defaultRender - Default render function for the component
 * @param displayName - Display name for React DevTools
 * @returns Connected component with customizable render prop
 */
export function toConnectedComponent<
  TProps extends Record<string, any>,
  TState,
  TResultProps extends Record<string, any>,
  TRenderFn extends RenderFn<TResultProps, TState>,
>(
  useStateHook: StateHookFn<TProps, TState>,
  usePropsHook: PropsHookFn<TProps, TState, TResultProps>,
  defaultRender: TRenderFn,
  displayName: string,
): ConnectedComponent<TProps, TRenderFn> {
  const ConnectedComponent = forwardRef<any, TProps & { render?: TRenderFn }>(
    ({ render = defaultRender, ...props }, ref) => {
      const connectedState = useStateHook(props as TProps);
      const connectedProps = usePropsHook(props as TProps, connectedState);
      // Add ref to connectedProps if it exists
      const propsWithRef = ref ? { ...connectedProps, ref } : connectedProps;
      return <Context.Provider value={connectedState}>{render(propsWithRef, connectedState)}</Context.Provider>;
    },
  );

  ConnectedComponent.displayName = displayName;

  return ConnectedComponent;
}

/**
 * Type helper to infer the component type from the factory
 */
export type ConnectedComponent<TProps extends Record<string, any>, TRenderFn extends RenderFn<any, any>> = FC<
  TProps & { render?: TRenderFn }
>;

/**
 * Factory function to create context-based components that don't use toConnectedComponent
 * These components rely on context provided by a parent component.
 *
 * @param usePropsHook - Hook that enhances props with context-derived values
 * @param defaultRender - Default render function for the component
 * @param displayName - Display name for React DevTools
 * @returns Context-based component with customizable render prop
 */
export function toContextComponent<
  TProps extends Record<string, any>,
  TResultProps extends Record<string, any>,
  TRenderFn extends (props: TResultProps, context: any) => ReactElement,
>(
  usePropsHook: (props: TProps, context: any) => TResultProps,
  defaultRender: TRenderFn,
  displayName: string,
): ContextComponent<TProps, TRenderFn> {
  const ContextComponent = forwardRef<any, TProps & { render?: TRenderFn }>(
    ({ render = defaultRender, ...props }, ref) => {
      const context = useContext(Context);
      const contextProps = usePropsHook(props as TProps, context);
      // Add ref to contextProps if it exists
      const propsWithRef = ref ? { ...contextProps, ref } : contextProps;
      return render(propsWithRef, context);
    },
  );

  ContextComponent.displayName = displayName;

  return ContextComponent;
}

/**
 * Type helper to infer the context component type from the factory
 */
export type ContextComponent<
  TProps extends Record<string, any>,
  TRenderFn extends (props: any, context: any) => ReactElement,
> = FC<TProps & { render?: TRenderFn }>;

/**
 * Hook that manages a CoreClass instance and triggers re-renders when state changes.
 * Uses useSyncExternalStore for optimal performance with external state subscriptions.
 */
export function useCore<
  T extends {
    subscribe: (callback: (state: any) => void) => () => void;
    getState: () => any;
    setState: (state: any) => void;
  },
>(CoreClass: new () => T, state: any): T {
  const coreRef = useRef<T | null>(null);
  const snapshotRef = useRef<any>(null);

  // Initialize the core instance
  if (!coreRef.current) {
    coreRef.current = new CoreClass();
    snapshotRef.current = coreRef.current.getState();
  }

  useEffect(() => {
    coreRef.current?.setState(state);
  }, [...Object.values(state)]);

  // Use useSyncExternalStore to subscribe to state changes
  useSyncExternalStore(
    useCallback((onStoreChange) => {
      if (!coreRef.current) return () => {};
      return coreRef.current.subscribe((newState) => {
        snapshotRef.current = newState;
        onStoreChange();
      });
    }, []),
    useCallback(() => {
      return snapshotRef.current;
    }, []),
    () => null, // server snapshot
  );

  return coreRef.current;
}
