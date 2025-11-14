import { useStore } from '@nanostores/react';
import { FrostedSkin, HlsVideo, MinimalSkin, VideoProvider } from '@videojs/react';
import { useEffect, useState } from 'react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { skin } from '@/stores/homePageDemos';
import '@videojs/react/skins/frosted.css';

export default function HeroVideo({ className, poster }: { className?: string; poster: string }) {
  const $skin = useStore(skin);
  const [isMinimalLoaded, setIsMinimalLoaded] = useState(false);
  const SkinComponent = $skin === 'minimal' && isMinimalLoaded ? MinimalSkin : FrostedSkin;

  // Load minimal skin later, to optimize initial load
  useEffect(() => {
    const loadMinimal = async () => {
      await import('@videojs/react/skins/minimal.css');
      setIsMinimalLoaded(true);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(loadMinimal);
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback support
      const timeout = setTimeout(loadMinimal, 200);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <VideoProvider>
      <SkinComponent className={className}>
        <HlsVideo
          // @ts-expect-error -- types are incorrect
          src={VJS8_DEMO_VIDEO.hls}
          poster={poster}
          playsInline
        />
      </SkinComponent>
    </VideoProvider>
  );
}
