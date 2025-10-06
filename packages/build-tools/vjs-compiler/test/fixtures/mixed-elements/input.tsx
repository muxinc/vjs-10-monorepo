import * as React from 'react';

export const Component = () => (
  <div className="wrapper">
    <PlayButton>
      <span>Play</span>
      <PlayIcon />
    </PlayButton>
    <section>
      <DurationDisplay />
    </section>
  </div>
);
