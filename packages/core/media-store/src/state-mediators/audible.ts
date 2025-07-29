export const audible = {
  mediaMuted: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.muted ?? false;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      media.muted = value;
    },
    mediaEvents: ['volumechange'],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API or aren't simple 1:1 with getter vs. setter (CJP) */
      mediamuterequest: () => true,
      mediaunmuterequest: () => false,
    },
  },
  mediaVolume: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.volume ?? 1.0;
    },
    set(value: number, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      if (!Number.isFinite(+value)) return;
      media.volume = +value;
    },
    mediaEvents: ['volumechange'],
    actions: {
      /** @TODO Refactor me to play more nicely with side effects that don't/can't correlate with set() API (CJP) */
      mediavolumerequest: ({ detail }: Pick<CustomEvent<any>, 'detail'> = { detail: 0 }) => +detail,
    },
  },
  // NOTE: This could be (re)implemented as "derived state" in some manner (e.g. selectors but also other patterns/conventions) if preferred. (CJP)
  mediaVolumeLevel: {
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