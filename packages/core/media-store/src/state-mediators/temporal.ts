const isValidNumber = (value: any): value is number => {
  return (
    typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  );
};

export const temporal = {
  currentTime: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.currentTime ?? 0;
    },
    set(value: number, stateOwners: any) {
      const { media } = stateOwners;
      if (!media || !isValidNumber(value)) return;
      media.currentTime = value;
    },
    mediaEvents: ['timeupdate', 'loadedmetadata'],
    actions: {
      /** @TODO Support more sophisticated seeking patterns like seek-to-live, relative seeking, etc. (CJP) */
      seekrequest: (
        { detail }: Pick<CustomEvent<any>, 'detail'> = { detail: 0 },
      ) => +detail,
    },
  },

  duration: {
    get(stateOwners: any) {
      const { media } = stateOwners;

      // Return 0 if no media or invalid duration
      if (
        !media?.duration ||
        Number.isNaN(media.duration) ||
        !Number.isFinite(media.duration)
      ) {
        return 0;
      }

      return media.duration;
    },
    mediaEvents: ['loadedmetadata', 'durationchange', 'emptied'],
  },

  seekable: {
    get(stateOwners: any): [number, number] | undefined {
      const { media } = stateOwners;

      if (!media?.seekable?.length) return undefined;

      const start = media.seekable.start(0);
      const end = media.seekable.end(media.seekable.length - 1);

      // Account for cases where metadata has an "empty" seekable range
      if (!start && !end) return undefined;

      return [Number(start.toFixed(3)), Number(end.toFixed(3))];
    },
    mediaEvents: ['loadedmetadata', 'emptied', 'progress', 'seekablechange'],
  },
};
