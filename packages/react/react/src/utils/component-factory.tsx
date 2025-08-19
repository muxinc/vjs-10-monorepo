import * as React from 'react';

/**
 * Generic types for the component factory pattern
 */
export type StateHookFn<TProps = any, TState = any> = (props: TProps) => TState;

export type PropsHookFn<TProps = any, TState = any, TResultProps = any> = (
  props: TProps,
  state: TState,
) => TResultProps;

export type RenderFn<TProps = any, TState = any> = (
  props: TProps,
  state: TState,
) => React.ReactElement;

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
  TRenderFn extends RenderFn<TResultProps, TState>
>(
  useStateHook: StateHookFn<TProps, TState>,
  usePropsHook: PropsHookFn<TProps, TState, TResultProps>,
  defaultRender: TRenderFn,
  displayName: string,
) => {
  const ConnectedComponent = ({
    render = defaultRender,
    ...props
  }: TProps & { render?: TRenderFn }) => {
    const connectedState = useStateHook(props as TProps);
    const connectedProps = usePropsHook(props as TProps, connectedState);
    return render(connectedProps, connectedState);
  };

  ConnectedComponent.displayName = displayName;
  return ConnectedComponent;
};

/**
 * Type helper to infer the component type from the factory
 */
export type ConnectedComponent<
  TProps extends Record<string, any>,
  TRenderFn extends RenderFn<any, any>
> = React.FC<TProps & { render?: TRenderFn }>;