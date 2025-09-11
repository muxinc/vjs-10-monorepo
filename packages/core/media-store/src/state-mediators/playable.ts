export const playable = {
  paused: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.paused ?? true;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      media?.[value ? 'pause' : 'play']();
    },
    stateOwnersUpdateHandlers: [
      (handler: (value?: boolean) => void, stateOwners: any) => {
        const { media } = stateOwners;
        if (!media) return;
        
        const eventHandler = () => handler();
        const events = ['play', 'playing', 'pause', 'emptied'];
        events.forEach(event => media.addEventListener(event, eventHandler));
        
        return () => events.forEach(event => media.removeEventListener(event, eventHandler));
      }
    ],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API (CJP) */
      playrequest: () => false,
      pauserequest: () => true,
    },
  },
};
