import * as React from 'react';

import { TimeRange } from '../components/TimeRange';

export function Component() {
  return (
    <TimeRange.Root className="time-range">
      <TimeRange.Track>
        <TimeRange.Progress />
        <TimeRange.Pointer />
      </TimeRange.Track>
      <TimeRange.Thumb />
    </TimeRange.Root>
  );
}
