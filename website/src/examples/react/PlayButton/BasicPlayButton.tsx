import { PlayButton } from '@vjs-10/react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import './PlayButton.css';

/**
 * Basic PlayButton example demonstrating:
 * - Icon switching based on paused state
 * - Regular CSS for styling (compatible with Astro)
 * - Data attribute selectors for state-based styling
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicPlayButton() {
  return (
    <PlayButton className="example-play-button">
      <PlayIcon className="play-icon" />
      <PauseIcon className="pause-icon" />
    </PlayButton>
  );
}
