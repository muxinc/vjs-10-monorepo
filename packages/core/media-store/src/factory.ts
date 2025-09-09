import { getKey, map, subscribeKeys } from 'nanostores';

export type StateOwners = {
  media?: any;
};

export type EventOrAction<D = undefined> = {
  type: string;
  detail?: D;
  target?: EventTarget;
};

export type FacadeGetter<T, D = T> = (
  stateOwners: StateOwners,
  event?: EventOrAction<D>,
) => T;

export type FacadeSetter<T> = (value: T, stateOwners: StateOwners) => void;

export type StateOwnerUpdateHandler<T> = (
  handler: (value: T) => void,
  stateOwners: StateOwners,
) => void;

export type ReadonlyFacadeProp<T, D = T> = {
  get: FacadeGetter<T, D>;
  mediaEvents?: string[];
};

export type FacadeProp<T, S = T, D = T> = ReadonlyFacadeProp<T, D> & {
  set: FacadeSetter<S>;
  /** @TODO We probably need to refactor this for more complex cases where we can't simply translate to a setter */
  actions: {
    [k: string]: (
      val: Pick<CustomEvent<any>, 'type' | 'detail'>,
    ) => ReturnType<FacadeGetter<T, D>>;
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
};

export function createMediaStore({
  // media,
  stateMediator,
}: {
  media?: any;
  stateMediator: Partial<StateMediator> & Pick<StateMediator, 'paused'>;
}) {
  const stateOwners: StateOwners = {};
  const store = map<any>({});
  const stateUpdateHandlers: Record<string, () => void> = {};
  const keys = Object.keys(stateMediator);

  function updateStateOwners(nextStateOwners: any) {
    if (nextStateOwners.media === stateOwners.media) {
      return;
    }

    let media = stateOwners.media;
    if (media) {
      for (const { mediaEvents = [] } of Object.values(stateMediator)) {
        for (const mediaEvent of mediaEvents) {
          media.removeEventListener(
            mediaEvent,
            stateUpdateHandlers[mediaEvent],
          );
          delete stateUpdateHandlers[mediaEvent];
        }
      }
    }

    Object.assign(stateOwners, nextStateOwners);

    media = stateOwners.media;
    store.set(getInitialState(stateMediator, stateOwners));

    if (media) {
      for (const [stateName, stateObject] of Object.entries(stateMediator)) {
        const { get, mediaEvents = [] } = stateObject;
        for (const mediaEvent of mediaEvents) {
          stateUpdateHandlers[mediaEvent] = () =>
            store.setKey(stateName, get(stateOwners));
          media.addEventListener(mediaEvent, stateUpdateHandlers[mediaEvent]);
        }
      }
    }
  }

  return {
    dispatch(action: Pick<CustomEvent<any>, 'type' | 'detail'>) {
      const { type, detail } = action;

      if (type === 'mediaelementchangerequest') {
        updateStateOwners({ media: detail });
      } else {
        for (const stateObject of Object.values(stateMediator).filter(
          (
            stateMediatorEntry,
          ): stateMediatorEntry is FacadeProp<any, any, any> =>
            'set' in stateMediatorEntry,
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

    getState() {
      return store.get();
    },

    getKeys(keys: string[]) {
      return keys.reduce((acc, k) => {
        acc[k] = getKey(store, k);
        return acc;
      }, {} as { [k: string]: any });
    },

    subscribeKeys(keys: string[], callback: (state: any) => void) {
      subscribeKeys(store, keys, callback);
    },

    // NOTE: In the POC architecture using nano-stores, subscribe is simply subscribeKeys across all keys. (CJP)
    subscribe(callback: (state: any) => void) {
      subscribeKeys(store, keys, callback);
    },
  };
}

function getInitialState(
  stateMediator: Partial<StateMediator> & Pick<StateMediator, 'paused'>,
  stateOwners: any,
) {
  let initialState: any = {};
  for (const [stateName, { get }] of Object.entries(stateMediator)) {
    initialState[stateName] = get(stateOwners);
  }
  return initialState;
}
