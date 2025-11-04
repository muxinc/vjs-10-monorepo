import '@videojs/html/skins/frosted';
import '@videojs/html/skins/minimal';

document.body.innerHTML = /* html */ `
  <div style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; gap: 2rem; padding: 1rem; ">
    <video-provider>
      <media-skin-frosted style="border-radius: 2rem; width: 100%; max-width: 960px; margin: 2rem auto; aspect-ratio: 16/9">
        <video
          slot="media"
          src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/high.mp4"
          poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
          playsinline
        ></video>
      </media-skin-frosted>
    </video-provider>

    <video-provider>
      <media-skin-minimal style="border-radius: 0.75rem; width: 100%; max-width: 960px; margin: 2rem auto; aspect-ratio: 16/9">
        <video
          slot="media"
          src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/high.mp4"
          poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
          playsinline
        ></video>
      </media-skin-minimal>
    </video-provider>
  </div>
`;
