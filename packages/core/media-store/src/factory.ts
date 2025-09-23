import { getKey, map, subscribeKeys } from 'nanostores';

export type StateOwners = {
  media?: any;
  container?: any;
};

export type EventOrAction<D = undefined> = {
  type: string;
  detail?: D;
  target?: EventTarget;
};

export type FacadeGetter<T, D = T> = (stateOwners: StateOwners, event?: EventOrAction<D>) => T;

export type FacadeSetter<T> = (value: T, stateOwners: StateOwners) => void;

export type StateOwnerUpdateHandler<T> = (
  handler: (value?: T) => void,
  stateOwners: StateOwners
) => (() => void) | void;

export type ReadonlyFacadeProp<T, D = T> = {
  get: FacadeGetter<T, D>;
  stateOwnersUpdateHandlers?: StateOwnerUpdateHandler<T>[];
};

export type FacadeProp<T, S = T, D = T> = ReadonlyFacadeProp<T, D> & {
  set: FacadeSetter<S>;
  /** @TODO We probably need to refactor this for more complex cases where we can't simply translate to a setter */
  actions: {
    [k: string]: (val: Pick<CustomEvent<any>, 'type' | 'detail'>) => ReturnType<FacadeGetter<T, D>>;
  };
};

export type StateMediator = {
  paused: FacadeProp<HTMLMediaElement['paused']>;
  muted: FacadeProp<HTMLMediaElement['muted']>;
  volume: FacadeProp<HTMLMediaElement['volume']>;
  volumeLevel: ReadonlyFacadeProp<'high' | 'medium' | 'low' | 'off'>;
  currentTime: FacadeProp<HTMLMediaElement['currentTime']>;
  duration: ReadonlyFacadeProp<HTMLMediaElement['duration']>;
  seekable: ReadonlyFacadeProp<[number, number] | undefined>;
  fullscreen: FacadeProp<boolean>;
};

export interface MediaStore {
  dispatch(action: Pick<CustomEvent<any>, 'type' | 'detail'>): void;
  getState(): any;
  getKeys(keys: string[]): Record<string, any>;
  subscribeKeys(keys: string[], callback: (state: any) => void): void;
  subscribe(callback: (state: any) => void): void;
}

export function createMediaStore({
  // media,
  stateMediator,
}: {
  media?: any;
  container?: any;
  stateMediator: Partial<StateMediator> & Pick<StateMediator, 'paused'>;
}): MediaStore {
  const stateOwners: StateOwners = {};
  const store = map<any>({});
  const stateUpdateHandlerCleanups: Record<string, (() => void)[]> = {};
  const keys = Object.keys(stateMediator);

  function updateStateOwners(nextStateOwners: any) {
    // Check if any state owner has changed
    const hasChanges = Object.entries(nextStateOwners).some(
      ([key, value]) => stateOwners[key as keyof StateOwners] !== value
    );

    if (!hasChanges) {
      return;
    }

    // Clean up existing handlers
    Object.entries(stateUpdateHandlerCleanups).forEach(([stateName, cleanups]) => {
      cleanups.forEach((cleanup) => cleanup?.());
      stateUpdateHandlerCleanups[stateName] = [];
    });

    Object.assign(stateOwners, nextStateOwners);
    store.set(getInitialState(stateMediator, stateOwners));

    // Set up new handlers
    Object.entries(stateMediator).forEach(([stateName, stateObject]) => {
      const { get, stateOwnersUpdateHandlers = [] } = stateObject;

      if (!stateUpdateHandlerCleanups[stateName]) {
        stateUpdateHandlerCleanups[stateName] = [];
      }

      // Create handler that updates the store
      const updateHandler = (value?: any) => {
        const nextValue = value !== undefined ? value : get(stateOwners);
        store.setKey(stateName, nextValue);
      };

      // Execute each stateOwnersUpdateHandler
      stateOwnersUpdateHandlers.forEach((setupHandler) => {
        const cleanup = setupHandler(updateHandler, stateOwners);
        if (typeof cleanup === 'function') {
          stateUpdateHandlerCleanups[stateName]?.push(cleanup);
        }
      });
    });
  }

  return {
    dispatch(action: Pick<CustomEvent<any>, 'type' | 'detail'>): void {
      const { type, detail } = action;

      if (type === 'mediastateownerchangerequest') {
        updateStateOwners({ media: detail });
      } else if (type === 'containerstateownerchangerequest') {
        updateStateOwners({ container: detail });
      } else {
        for (const stateObject of Object.values(stateMediator).filter(
          (stateMediatorEntry): stateMediatorEntry is FacadeProp<any, any, any> => 'set' in stateMediatorEntry
        )) {
          const { set, actions } = stateObject;
          if (actions[type]) {
            const actionFn = actions[type];
            const actionValue = actionFn(action);
            (set as FacadeSetter<any>)(actionValue, stateOwners);
          }
        }
      }
    },

    getState(): any {
      return store.get();
    },

    getKeys(keys: string[]): Record<string, any> {
      return keys.reduce(
        (acc, k) => {
          acc[k] = getKey(store, k);
          return acc;
        },
        {} as { [k: string]: any }
      );
    },

    subscribeKeys(keys: string[], callback: (state: any) => void): void {
      subscribeKeys(store, keys, callback);
    },

    // NOTE: In the POC architecture using nano-stores, subscribe is simply subscribeKeys across all keys. (CJP)
    subscribe(callback: (state: any) => void): void {
      subscribeKeys(store, keys, callback);
    },
  };
}

function getInitialState(stateMediator: Partial<StateMediator> & Pick<StateMediator, 'paused'>, stateOwners: any) {
  let initialState: any = {};
  for (const [stateName, { get }] of Object.entries(stateMediator)) {
    initialState[stateName] = get(stateOwners);
  }
  return initialState;
}
