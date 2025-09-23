import ReactDOM from 'react-dom/client';

import { MediaProvider, MediaSkinDefaultTest as MediaSkinDefault, Video } from '@vjs-10/react';

import './globals.css';

function DemoPlayer() {
  return (
    <div style={{ padding: 10 }}>
      <MediaProvider>
        <MediaSkinDefault>
          {/* @ts-ignore -- types are incorrect */}
          {/* <Video
              muted
              src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4"
            /> */}
          {/* @ts-ignore -- types are incorrect */}
          <Video muted src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8" />
        </MediaSkinDefault>
      </MediaProvider>

      <MediaProvider>
        <MediaSkinDefault>
          {/* @ts-ignore -- types are incorrect */}
          <Video muted src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8" />
        </MediaSkinDefault>
      </MediaProvider>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<DemoPlayer />);
