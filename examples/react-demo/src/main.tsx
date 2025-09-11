import React from 'react';
import ReactDOM from 'react-dom/client';
import { MediaProvider, Video, MediaSkinDefault } from '@vjs-10/react';

const DemoPlayer = () => {
  return (
    <MediaProvider>
      <MediaSkinDefault>
        {/* @ts-ignore */}
        {/* <Video
          muted
          src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4"
        /> */}
        <Video
          style={{ display: 'block', width: '100%', maxWidth: '600px', aspectRatio: '16/9' }}
          muted
          src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8"
        />
      </MediaSkinDefault>
    </MediaProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<DemoPlayer />);
