import { FrostedSkin, MediaProvider, MinimalSkin, Video } from '@videojs/react';
import '@videojs/react/skins/frosted.css';
import '@videojs/react/skins/minimal.css';

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-4xl font-extrabold py-2">Frosted Skin</h1>
      <MediaProvider>
        <FrostedSkin>
          {/* @ts-expect-error -- types are incorrect */}
          <Video src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8" playsInline />
        </FrostedSkin>
      </MediaProvider>
      <h1 className="text-4xl font-extrabold py-2">Minimal Skin</h1>
      <MediaProvider>
        <MinimalSkin>
          {/* @ts-expect-error -- types are incorrect */}
          <Video src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8" playsInline />
        </MinimalSkin>
      </MediaProvider>
    </main>
  );
}
