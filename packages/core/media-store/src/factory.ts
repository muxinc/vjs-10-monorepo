import { map, subscribeKeys } from 'nanostores';

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
  actions: { [k: string]: (val: CustomEvent<any>) => ReturnType<FacadeGetter<T, D>> };
};

export type StateMediator = {
  mediaPaused: FacadeProp<HTMLMediaElement['paused']>;
  mediaMuted: FacadeProp<HTMLMediaElement['muted']>;
  mediaVolume: FacadeProp<HTMLMediaElement['volume']>;
  mediaVolumeLevel: ReadonlyFacadeProp<'high' | 'medium' | 'low' | 'off'>;
};

export function createMediaStore({
  // media,
  stateMediator,
}: {
  media?: any;
  stateMediator: Partial<StateMediator> & Pick<StateMediator, 'mediaPaused'>;
}) {
  const stateOwners: any = {};
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
    dispatch(action: any) {
      const { type, detail } = action;

      if (type === 'mediaelementchangerequest') {
        updateStateOwners({ media: detail });
      } else {
        for (const stateObject of Object.values(stateMediator).filter(
          (stateMediator) => 'set' in stateMediator,
        )) {
          const { set, actions } = stateObject;
          if (type in actions) {
            /** @TODO FIXME ASAP!!! (CJP) */
            // @ts-ignore
            set(actions[type as keyof typeof actions](), stateOwners);
          }
        }
      }
    },

    getState() {
      return store.get();
    },

    subscribeKeys(keys: string[], callback: (state: any) => void) {
      subscribeKeys(store, keys, callback);
    },

    // NOTE: In the POC architecture using nano-stores, subscribe is simply subscribeKeys across all keys. (CJP)
    subscribe(callback: (state: any) => void) {
      subscribeKeys(store, keys, callback);
    }
  };
}

function getInitialState(
  stateMediator: Partial<StateMediator> & Pick<StateMediator, 'mediaPaused'>,
  stateOwners: any,
) {
  let initialState: any = {};
  for (const [stateName, { get }] of Object.entries(stateMediator)) {
    initialState[stateName] = get(stateOwners);
  }
  return initialState;
}