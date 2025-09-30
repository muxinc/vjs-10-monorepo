import * as React from 'react';

export function Component() {
  return (
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
}
