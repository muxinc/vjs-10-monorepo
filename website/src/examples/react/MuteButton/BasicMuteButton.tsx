import { MuteButton } from '@vjs-10/react';
import { VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import './MuteButton.css';

/**
 * Basic MuteButton example demonstrating:
 * - Multi-state icon switching (high/medium/low/off)
 * - Volume level data attributes
 * - Smooth icon transitions
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicMuteButton() {
  return (
    <MuteButton className="example-mute-button">
      <VolumeHighIcon className="volume-high-icon" />
      <VolumeLowIcon className="volume-low-icon" />
      <VolumeOffIcon className="volume-off-icon" />
    </MuteButton>
  );
}
