'use client';

/** @TODO !!! Revisit for SSR (CJP) */
import type { MediaStore } from '@vjs-10/media-store';
import type { Context, ReactNode } from 'react';

import { createMediaStore } from '@vjs-10/media-store';

import { createContext, useContext, useMemo } from 'react';

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
export const MediaContext: Context<any | null> = createContext<any | null>(null);

export function MediaProvider({ children }: { children: ReactNode }): JSX.Element {
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

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMediaStore(): MediaStore {
  return useContext(MediaContext);
}

export function useMediaDispatch(): ((value: any) => unknown) {
  const store = useContext(MediaContext);
  const dispatch = store?.dispatch ?? identity;
  return (value: any) => {
    return dispatch(value);
  };
}

export function useMediaRef() {
  const dispatch = useMediaDispatch();

  return (element: any): void => {
    // NOTE: This should get invoked with `null` when using as a `ref` callback whenever
    // the corresponding react media element instance (e.g. a `<video>`) is being removed.
    /*
    { type: 'mediastateownerchangerequest', detail: media }
    */
    dispatch({ type: 'mediastateownerchangerequest', detail: element });
  };
}

export const refEquality = (a: any, b: any): boolean => a === b;

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Slightly modified version of React's shallowEqual, with optimizations for Arrays
 * so we may treat them specifically as unequal if they are not a) both arrays
 * or b) don't contain the same (shallowly compared) elements.
 */
export function shallowEqual(objA: any, objB: any): boolean {
  // Using Object.is as a first pass, as it covers a lot of the "simple" cases that are
  // more complex than strict equality and is a built-in. For discussion, see, e.g.:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
  if (Object.is(objA, objB)) {
    return true;
  }

  // Since we've done an Object.is() check immediately above, we can safely assume non-objects (or null-valued objects)
  // are not equal, so can early bail for those as well.
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  if (Array.isArray(objA)) {
    // Early "cheap" array compares
    if (!Array.isArray(objB) || objA.length !== objB.length) return false;
    // Shallow compare for arrays
    return objA.some((vVal, i) => objB[i] === vVal);
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    // NOTE: Since we've already guaranteed the keys list lengths are the same, we can safely cast to string here (CJP)
    if (
      !hasOwnProperty.call(objB, keysA[i] as string)
      || !Object.is(objA[keysA[i] as string], objB[keysA[i] as string])
    ) {
      return false;
    }
  }

  return true;
}

export function useMediaSelector<S = any,>(selector: (state: any) => S, equalityFn: (a: S, b: S) => boolean = refEquality): S {
  const store = useContext(MediaContext);
  const selectedState = useSyncExternalStoreWithSelector(
    store?.subscribe ?? identity,
    store?.getState ?? identity,
    store?.getState ?? identity,
    selector,
    equalityFn,
  ) as S;

  return selectedState;
}
