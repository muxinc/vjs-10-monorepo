import { defineVjsPlayer } from '@videojs/html';

import '@videojs/html/skins/frosted';

defineVjsPlayer();

document.body.innerHTML = /* html */ `
  <media-provider>
    <div style="display: grid; place-items: center; min-height: 100vh;">
      <media-skin-frosted style="border-radius: 2rem; width: 100%; max-width: 800px; margin: 2rem auto;">
        <video slot="media" src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" muted></video>
      </media-skin-frosted>
    </div>
  </media-provider>
`;
