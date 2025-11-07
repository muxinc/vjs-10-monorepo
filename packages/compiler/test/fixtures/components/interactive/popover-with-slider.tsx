/**
 * Popover - With VolumeSlider Content
 *
 * NOTE: This will compile but produce incorrect structure in v0.1
 * React uses nested compound components, HTML uses flat commandfor pattern
 */

import { MuteButton, Popover, VolumeSlider } from '@videojs/react';

export default function TestFixture() {
  return (
    <Popover.Root openOnHover delay={200} closeDelay={100}>
      <Popover.Trigger>
        <MuteButton className="btn" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={12}>
          <Popover.Popup className="popup">
            <VolumeSlider.Root className="slider" orientation="vertical">
              <VolumeSlider.Track className="track">
                <VolumeSlider.Progress className="progress" />
              </VolumeSlider.Track>
              <VolumeSlider.Thumb className="thumb" />
            </VolumeSlider.Root>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
