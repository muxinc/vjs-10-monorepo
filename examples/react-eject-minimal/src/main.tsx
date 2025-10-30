import { MediaProvider, Video } from '@videojs/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import MinimalSkin from './MinimalSkin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MediaProvider>
      <MinimalSkin>
        <Video
          // @ts-expect-error -- types are incorrect
          src="https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA.m3u8"
          poster="https://image.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/thumbnail.webp"
          playsInline
        />
      </MinimalSkin>
    </MediaProvider>
  </StrictMode>,
);
