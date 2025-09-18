import { defineVjsPlayer } from '@vjs-10/html';

defineVjsPlayer();

document.body.innerHTML = `
  <media-provider>
    <div style="width: 100%; max-width: 800px; margin: 0 auto;">
      <media-skin-default>
        <video slot="media" src="https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M/high.mp4" muted></video>
      </media-skin-default>
    </div>
    </media-skin-default>
  </media-provider>
`;
