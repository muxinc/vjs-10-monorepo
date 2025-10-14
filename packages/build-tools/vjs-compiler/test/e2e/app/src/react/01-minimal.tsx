/**
 * React test page for Level 1: Minimal Skin
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaProvider, SimpleVideo } from '@vjs-10/react';
import MediaSkinMinimal from '../skins/01-minimal/MediaSkinMinimal';
import '../globals.css';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Level 1: Minimal Skin (React)</h1>
      <p>
        Testing: Basic compilation, single button, simple utilities
      </p>

      <MediaProvider>
        <MediaSkinMinimal>
          <SimpleVideo src="/blue-30s-440hz.mp4" />
        </MediaSkinMinimal>
      </MediaProvider>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>Expected Features:</h3>
        <ul>
          <li>Single play button centered on video</li>
          <li>White background with slight transparency</li>
          <li>Rounded (circular) button</li>
          <li>Hover effect (fully opaque on hover)</li>
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
