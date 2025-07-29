import { defineVjsPlayer } from '@vjs-10/html';

defineVjsPlayer();

document.body.innerHTML = `
  <media-provider>
    <media-skin-default>
      <video slot="media" src="https://www.w3schools.com/html/mov_bbb.mp4" muted></video>
    </media-skin-default>
  </media-provider>
`;