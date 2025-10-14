/**
 * React test page for Level 3: Responsive Skin
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaProvider, SimpleVideo } from '@vjs-10/react';
import MediaSkinResponsive from '../skins/03-responsive/MediaSkinResponsive';
import '../globals.css';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Level 3: Responsive Skin (React)</h1>
      <p>
        Testing: Responsive design, transitions, transforms, and hover states
      </p>

      <MediaProvider>
        <MediaSkinResponsive>
          <SimpleVideo src="/blue-30s-110hz.mp4" />
        </MediaSkinResponsive>
      </MediaProvider>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>Expected Features:</h3>
        <ul>
          <li>Play/pause button with hover scale effect</li>
          <li>Smooth transitions (300ms duration)</li>
          <li>Backdrop blur effect on overlay</li>
          <li>Icon opacity transitions (200ms duration)</li>
          <li>Responsive padding (currently base only - breakpoints not yet supported)</li>
        </ul>
        <h3>Known Limitations:</h3>
        <ul>
          <li>Responsive breakpoints (sm:, md:, lg:) don't generate yet</li>
          <li>Arbitrary custom colors don't generate yet</li>
          <li>See TAILWIND_V4_FINDINGS.md for details</li>
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
