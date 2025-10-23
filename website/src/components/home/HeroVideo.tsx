import { useStore } from '@nanostores/react';
import { FrostedSkin, MediaProvider, MinimalSkin, Video } from '@videojs/react';
import { skin } from '@/stores/homePageDemos';
import { PLAYBACK_ID } from './config';
import '@videojs/react/skins/frosted.css';
import '@videojs/react/skins/minimal.css';

export default function HeroVideo({ className, poster }: { className?: string; poster: string }) {
  // Subscribe to skin store for future skin switching functionality
  const $skin = useStore(skin);
  const SkinComponent = $skin === 'frosted' ? FrostedSkin : MinimalSkin;

  return (
    <MediaProvider>
      <SkinComponent className={className}>
        <Video
          // @ts-expect-error -- types are incorrect
          src={`https://stream.mux.com/${PLAYBACK_ID}.m3u8`}
          poster={poster}
          playsInline
        />
      </SkinComponent>
    </MediaProvider>
  );
}
