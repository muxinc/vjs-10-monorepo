import { defineVjsPlayer } from '@videojs/html';

import '@videojs/html/skins/frosted';

defineVjsPlayer();

document.body.innerHTML = /* html */ `
  <media-provider>
    <div style="display: grid; place-items: center; min-height: 100vh;">
      <media-skin-frosted style="border-radius: 2rem; width: 100%; max-width: 960px; margin: 2rem auto; aspect-ratio: 16/9">
        <video slot="media" src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" muted playsinline poster="https://image.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/thumbnail.webp"></video>
      </media-skin-frosted>
    </div>
  </media-provider>
`;
