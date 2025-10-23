import { defineVjsPlayer } from '@videojs/html';

defineVjsPlayer();

document.body.innerHTML = /* html */ `
  <media-provider>
    <div style="width: 100%; max-width: 800px; margin: 0 auto;">
      <media-skin-default>
        <video slot="media" src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" muted></video>
      </media-skin-default>
    </div>
    </media-skin-default>
  </media-provider>
`;
