/**
 * React test page for Level 2: Interactive Skin
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaProvider, SimpleVideo } from '@vjs-10/react';
import MediaSkinInteractive from '../skins/02-interactive/MediaSkinInteractive';
import '../globals.css';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Level 2: Interactive Skin (React)</h1>
      <p>
        Testing: State-based styling with data attributes
      </p>

      <MediaProvider>
        <MediaSkinInteractive>
          <SimpleVideo src="/blue-30s-110hz.mp4" />
        </MediaSkinInteractive>
      </MediaProvider>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>Expected Features:</h3>
        <ul>
          <li>Play/pause button centered on video</li>
          <li>Icons toggle based on [data-paused] attribute</li>
          <li>Play icon visible when paused</li>
          <li>Pause icon visible when playing</li>
          <li>Grid layout for overlapping icons</li>
        </ul>
        <h3>Notes:</h3>
        <ul>
          <li>Uses SimpleVideo component for native MP4 support</li>
          <li>Video should load and play successfully</li>
        </ul>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
