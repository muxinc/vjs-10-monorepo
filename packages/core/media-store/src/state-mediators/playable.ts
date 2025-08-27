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
    mediaEvents: ['play', 'playing', 'pause', 'emptied'],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API (CJP) */
      playrequest: () => false,
      pauserequest: () => true,
    },
  },
};
