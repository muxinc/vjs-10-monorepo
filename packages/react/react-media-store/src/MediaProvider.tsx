'use client';
/** @TODO !!! Revisit for SSR (CJP) */
import type { Context, ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import { createMediaStore } from '@vjs-10/media-store';
import { useSyncExternalStoreWithSelector } from './useSyncExternalStoreWithSelector.js';

const identity = (x?: any) => x;

/**
 * @description The {@link https://react.dev/learn/passing-data-deeply-with-context#context-an-alternative-to-passing-props|React Context}
 * used "under the hood" for media ui state updates, state change requests, and the hooks and providers that integrate with this context.
 * It is unlikely that you will/should be using `MediaContext` directly.
 *
 * @see {@link MediaProvider}
 * @see {@link useMediaDispatch}
 * @see {@link useMediaSelector}
 */
export const MediaContext: Context<any | null> = createContext<any | null>(
  null,
);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => createMediaStore(), []);
  // useEffect(() => {
  //   value?.dispatch({
  //     type: 'documentelementchangerequest',
  //     detail: globalThis.document,
  //   });
  //   return () => {
  //     value?.dispatch({
  //       type: 'documentelementchangerequest',
  //       detail: undefined,
  //     });
  //   };
  // }, []);
  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

export const useMediaStore = () => {
  const store = useContext(MediaContext);
  return store;
};

export const useMediaDispatch = () => {
  const store = useContext(MediaContext);
  const dispatch = store?.dispatch ?? identity;
  return (value: any) => {
    return dispatch(value);
  };
};

export const useMediaRef = () => {
  const dispatch = useMediaDispatch();
  return (mediaEl: any | null | undefined) => {
    // NOTE: This should get invoked with `null` when using as a `ref` callback whenever
    // the corresponding react media element instance (e.g. a `<video>`) is being removed.
    /*
    { type: 'mediaelementchangerequest', detail: media }
    */
    dispatch({ type: 'mediaelementchangerequest', detail: mediaEl });
  };
};

const refEquality = (a: any, b: any) => a === b;

export const useMediaSelector = <S = any,>(
  selector: (state: any) => S,
  equalityFn = refEquality,
) => {
  const store = useContext(MediaContext);
  const selectedState = useSyncExternalStoreWithSelector(
    store?.subscribe ?? identity,
    store?.getState ?? identity,
    store?.getState ?? identity,
    selector,
    equalityFn,
  ) as S;

  return selectedState;
};
