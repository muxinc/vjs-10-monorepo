import { MediaProvider, MediaSkinDefault, Video } from '@vjs-10/react';
import clsx from 'clsx';
import { PLAYBACK_ID } from './config';
import '@/styles/player.css';

export default function HeroVideo({ className }: { className?: string }) {
  return (
    <MediaProvider>
      <MediaSkinDefault className={clsx('vjs', className)}>
        <Video
          // @ts-expect-error -- types are incorrect
          src={`https://stream.mux.com/${PLAYBACK_ID}.m3u8`}
          poster={`https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp`}
        />
      </MediaSkinDefault>
    </MediaProvider>
  );
}
