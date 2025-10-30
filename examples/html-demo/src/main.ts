import '@videojs/html/skins/frosted';
import '@videojs/html/skins/minimal';

document.body.innerHTML = /* html */ `
  <div style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; gap: 2rem; padding: 1rem; ">
    <media-provider>
      <media-skin-frosted style="border-radius: 2rem; width: 100%; max-width: 960px; margin: 2rem auto; aspect-ratio: 16/9">
        <video slot="media" src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" playsinline poster="https://image.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/thumbnail.webp"></video>
      </media-skin-frosted>
    </media-provider>

    <media-provider>
      <media-skin-minimal style="border-radius: 0.75rem; width: 100%; max-width: 960px; margin: 2rem auto; aspect-ratio: 16/9">
        <video slot="media" src="https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4" playsinline poster="https://image.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/thumbnail.webp"></video>
      </media-skin-minimal>
    </media-provider>
  </div>
`;
