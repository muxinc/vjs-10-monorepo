import { Video, VideoProvider } from '@videojs/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import FrostedSkin from './FrostedSkin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoProvider>
      <FrostedSkin>
        <Video
          // @ts-expect-error -- types are incorrect
          src="https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA.m3u8"
          poster="https://image.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/thumbnail.webp"
          playsInline
        />
      </FrostedSkin>
    </VideoProvider>
  </StrictMode>,
);
