import { MediaProvider, MediaSkinDefault, Video } from '@vjs-10/react';
import { PLAYBACK_ID } from './config';
import '@/styles/vjs.css';

export default function HeroVideo({ className }: { className?: string }) {
  return (
    <MediaProvider>
      <MediaSkinDefault className={className}>
        <Video
          // @ts-expect-error -- types are incorrect
          src={`https://stream.mux.com/${PLAYBACK_ID}.m3u8`}
          poster={`https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?time=0`}
          playsInline
        />
      </MediaSkinDefault>
    </MediaProvider>
  );
}
