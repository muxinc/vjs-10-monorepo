/**
 * React test page for Level 0: Structural Skin
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaProvider, SimpleVideo } from '@vjs-10/react';
import MediaSkinStructural from '../skins/00-structural/MediaSkinStructural';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Level 0: Structural Skin (React)</h1>
      <p>
        Testing: Pure structure with no styling
      </p>

      <MediaProvider>
        <MediaSkinStructural>
          <SimpleVideo src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" />
        </MediaSkinStructural>
      </MediaProvider>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>Expected Features:</h3>
        <ul>
          <li>Single play button (no positioning/styling)</li>
          <li>Play and pause icons</li>
          <li>NO className attributes anywhere</li>
          <li>Pure DOM structure only</li>
        </ul>
        <h3>Notes:</h3>
        <ul>
          <li>Uses SimpleVideo component for native MP4 support</li>
          <li>Video may not be visible without styling (expected for structural test)</li>
        </ul>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
