import ReactDOM from 'react-dom/client';

import { defaultSkinIcons, MediaProvider, MediaSkinDefault, Video } from '@vjs-10/react';

import './globals.css';

function DemoPlayer() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="space-y-12 w-full">
        <MediaProvider>
          <div className="w-full max-w-4xl mx-auto">
            <MediaSkinDefault icons={defaultSkinIcons} className="rounded-4xl aspect-video">
              {/* @ts-ignore -- types are incorrect */}
              {/* <Video
                muted
                src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4"
              /> */}
              {/* @ts-ignore -- types are incorrect */}
              <Video muted src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8" />
            </MediaSkinDefault>
          </div>
        </MediaProvider>

        <MediaProvider>
          <div className="w-full max-w-4xl mx-auto">
            <MediaSkinDefault icons={defaultSkinIcons} className="aspect-video">
              {/* @ts-ignore -- types are incorrect */}
              <Video muted src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8" />
            </MediaSkinDefault>
          </div>
        </MediaProvider>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<DemoPlayer />);
