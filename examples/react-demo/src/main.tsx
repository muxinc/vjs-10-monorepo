import React from 'react';
import ReactDOM from 'react-dom/client';
import { MediaProvider, Video, MediaSkinDefault } from '@vjs-10/react';

const DemoPlayer = () => {
  return (
    <MediaProvider>
      <MediaSkinDefault>
        {/* @ts-ignore */}
        {/* <Video muted src="https://www.w3schools.com/html/mov_bbb.mp4" /> */}
        <Video muted src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8" />
      </MediaSkinDefault>
    </MediaProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DemoPlayer />
);