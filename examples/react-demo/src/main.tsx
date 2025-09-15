import React from 'react';
import ReactDOM from 'react-dom/client';
import { MediaProvider, Video, MediaSkinDefault } from '@vjs-10/react';

const DemoPlayer = () => {
  return (
    <MediaProvider>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <MediaSkinDefault>
          {/* @ts-ignore */}
          {/* <Video
            muted
            src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4"
          /> */}
          <Video
            muted
            src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8"
          />
        </MediaSkinDefault>
      </div>
    </MediaProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<DemoPlayer />);
