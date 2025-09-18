import * as React from 'react';

/**
 * Generic types for the component factory pattern
 */
export type StateHookFn<TProps = any, TState = any> = (props: TProps) => TState;

export type PropsHookFn<TProps = any, TState = any, TResultProps = any> = (
  props: TProps,
  state: TState
) => TResultProps;

export type RenderFn<TProps = any, TState = any> = (
  props: TProps,
  state: TState
) => React.ReactElement;

const Context = React.createContext<any | null>(null);

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
export const toConnectedComponent = <
  TProps extends Record<string, any>,
  TState,
  TResultProps extends Record<string, any>,
  TRenderFn extends RenderFn<TResultProps, TState>,
>(
  useStateHook: StateHookFn<TProps, TState>,
  usePropsHook: PropsHookFn<TProps, TState, TResultProps>,
  defaultRender: TRenderFn,
  displayName: string
) => {
  const ConnectedComponent = ({
    render = defaultRender,
    ...props
  }: TProps & { render?: TRenderFn }) => {
    const connectedState = useStateHook(props as TProps);
    const connectedProps = usePropsHook(props as TProps, connectedState);
    return (
      <Context.Provider value={connectedState}>
        {render(connectedProps, connectedState)}
      </Context.Provider>
    );
  };

  ConnectedComponent.displayName = displayName;
  return ConnectedComponent;
};

/**
 * Type helper to infer the component type from the factory
 */
export type ConnectedComponent<
  TProps extends Record<string, any>,
  TRenderFn extends RenderFn<any, any>,
> = React.FC<TProps & { render?: TRenderFn }>;

/**
 * Factory function to create context-based components that don't use toConnectedComponent
 * These components rely on context provided by a parent component.
 *
 * @param usePropsHook - Hook that enhances props with context-derived values
 * @param defaultRender - Default render function for the component
 * @param displayName - Display name for React DevTools
 * @returns Context-based component with customizable render prop
 */
export const toContextComponent = <
  TProps extends Record<string, any>,
  TResultProps extends Record<string, any>,
  TRenderFn extends (props: TResultProps, context: any) => React.ReactElement,
>(
  usePropsHook: (props: TProps, context: any) => TResultProps,
  defaultRender: TRenderFn,
  displayName: string
) => {
  const ContextComponent = ({
    render = defaultRender,
    ...props
  }: TProps & { render?: TRenderFn }) => {
    const context = React.useContext(Context);
    const contextProps = usePropsHook(props as TProps, context);
    return render(contextProps, context);
  };

  ContextComponent.displayName = displayName;
  return ContextComponent;
};

/**
 * Type helper to infer the context component type from the factory
 */
export type ContextComponent<
  TProps extends Record<string, any>,
  TRenderFn extends (props: any, context: any) => React.ReactElement,
> = React.FC<TProps & { render?: TRenderFn }>;
