export const audible = {
  muted: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.muted ?? false;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      media.muted = value;
      if (!value && !media.volume) {
        media.volume = 0.25;
      }
    },
    mediaEvents: ['volumechange'],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API or aren't simple 1:1 with getter vs. setter (CJP) */
      muterequest: () => true,
      unmuterequest: () => false,
    },
  },
  volume: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.volume ?? 1.0;
    },
    set(value: number, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      const numericValue = +value;
      if (!Number.isFinite(numericValue)) return;
      media.volume = numericValue;
      if (numericValue > 0) {
        media.mute = false;
      }
    },
    mediaEvents: ['volumechange'],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API (CJP) */
      volumerequest: (
        { detail }: Pick<CustomEvent<any>, 'detail'> = { detail: 0 },
      ) => +detail,
    },
  },
  // NOTE: This could be (re)implemented as "derived state" in some manner (e.g. selectors but also other patterns/conventions) if preferred. (CJP)
  volumeLevel: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      if (typeof media?.volume == 'undefined') return 'high';
      if (media.muted || media.volume === 0) return 'off';
      if (media.volume < 0.5) return 'low';
      if (media.volume < 0.75) return 'medium';
      return 'high';
    },
    mediaEvents: ['volumechange'],
  },
};
