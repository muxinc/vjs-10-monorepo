import { FullscreenButton } from '@vjs-10/react';
import { FullscreenEnterIcon, FullscreenExitIcon } from '@vjs-10/react-icons';
import './FullscreenButton.css';

/**
 * Basic FullscreenButton example demonstrating:
 * - Icon switching based on fullscreen state
 * - Data attribute state selectors
 * - Enter/exit fullscreen functionality
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicFullscreenButton() {
  return (
    <FullscreenButton className="example-fullscreen-button">
      <FullscreenEnterIcon className="fullscreen-enter-icon" />
      <FullscreenExitIcon className="fullscreen-exit-icon" />
    </FullscreenButton>
  );
}
