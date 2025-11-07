/**
 * Tooltip - With Button Trigger
 *
 * NOTE: This will compile but produce incorrect structure in v0.1
 * React uses nested compound components, HTML uses flat commandfor pattern
 */

import { PlayButton, Tooltip } from '@videojs/react';
import { PlayIcon } from '@videojs/react/icons';

export default function TestFixture() {
  return (
    <Tooltip.Root delay={500}>
      <Tooltip.Trigger>
        <PlayButton className="btn">
          <PlayIcon className="icon" />
        </PlayButton>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={12}>
          <Tooltip.Popup className="popup">
            <span>Play</span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
