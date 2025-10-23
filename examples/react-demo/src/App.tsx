import type { ChangeEventHandler } from 'react';

import { FrostedSkin, MediaProvider, MinimalSkin, Video } from '@videojs/react';
import { FullscreenEnterAltIcon, FullscreenExitAltIcon } from '@videojs/react/icons';
import clsx from 'clsx';

// import FrostedSkin from './skins/frosted/FrostedSkin';
// import MinimalSkin from './skins/toasted/MinimalSkin';

// NOTE: Commented out imports are for testing locally/externally defined skins.
// import { MediaProvider, Video } from '@videojs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFullscreen } from './hooks/useFullscreen';
import '@videojs/react/skins/frosted.css';
import '@videojs/react/skins/minimal.css';
import './globals.css';

const skins = [
  {
    key: 'frosted',
    name: 'Frosted',
    component: FrostedSkin,
  },
  {
    key: 'minimal',
    name: 'Minimal',
    component: MinimalSkin,
  },
] as const;

type SkinKey = (typeof skins)[number]['key'];

const mediaSources = [
  {
    key: '1',
    name: 'Mux 1',
    value: 'https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8',
  },
  {
    key: '2',
    name: 'Mux 2',
    value: 'https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8',
  },
  {
    key: '3',
    name: 'Mux 3',
    value: 'https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4',
  },
  {
    key: '4',
    name: 'Mux 4',
    value: 'https://stream.mux.com/lyrKpPcGfqyzeI00jZAfW6MvP6GNPrkML.m3u8',
  },
] as const;

type MediaSourceKey = (typeof mediaSources)[number]['key'];

function getParam<T>(key: string, defaultValue: T): T {
  const params = new URLSearchParams(window.location.search);
  return (params.get(key) as T) || defaultValue;
}
function setParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search}` : '');
  window.history.replaceState(null, '', url);
}

const DEFAULT_SKIN: SkinKey = 'frosted';
const DEFAULT_MEDIA_SOURCE: MediaSourceKey = '1';

export default function App(): JSX.Element {
  const [skinKey, setSkinKey] = useState<SkinKey>(() => getParam('skin', DEFAULT_SKIN));
  const [mediaSourceKey, setMediaSourceKey] = useState<MediaSourceKey>(() => getParam('source', DEFAULT_MEDIA_SOURCE));
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);

  const mediaSource = useMemo(() => {
    let match = mediaSources.find(m => m.key === mediaSourceKey);
    if (!match) {
      match = mediaSources.find(m => m.key === DEFAULT_MEDIA_SOURCE)!;
      setMediaSourceKey(match.key);
    }
    return match.value;
  }, [mediaSourceKey]);

  const Skin = useMemo(() => {
    let match = skins.find(s => s.key === skinKey);
    if (!match) {
      match = skins.find(s => s.key === DEFAULT_SKIN)!;
      setSkinKey(match.key);
    }
    return match.component;
  }, [skinKey]);

  const onChangeSkin: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    const value = event.target.value as SkinKey;
    setSkinKey(value);
    setParam('skin', value);
  }, []);
  const onChangeMediaSource: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    const value = event.target.value as MediaSourceKey;
    setMediaSourceKey(value);
    setParam('source', value);
  }, []);

  // Force a re-render on changes.
  const key = `${skinKey}-${mediaSourceKey}`;

  const skinClassName = useMemo(() => {
    switch (skinKey) {
      case 'frosted':
        return 'rounded-4xl shadow shadow-lg shadow-black/15';
      case 'minimal':
        return 'rounded-2xl shadow shadow-lg shadow-black/15';
      default:
        return '';
    }
  }, [skinKey]);

  const playbackId = mediaSource.match(/stream\.mux\.com\/([^./]+)/)?.[1];
  const poster = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.webp` : undefined;

  return (
    <div
      ref={containerRef}
      className={clsx('', {
        'bg-black text-stone-200 h-screen': isFullscreen,
        'min-h-screen bg-white text-stone-700 dark:bg-black dark:text-stone-200': !isFullscreen,
      })}
    >
      <header className={clsx(
        'fixed top-0 z-10 inset-x-0 bg-white dark:bg-stone-800 shadow shadow-black/10 after:h-px after:absolute after:inset-x-0 after:top-full after:bg-black/5 transition-transform',
        {
          '-translate-y-full': isFullscreen,
        },
      )}
      >
        <div className="grid grid-cols-5 h-2" aria-hidden="true">
          <div className="bg-yellow-500"></div>
          <div className="bg-orange-500"></div>
          <div className="bg-red-500"></div>
          <div className="bg-purple-500"></div>
          <div className="bg-blue-500"></div>
        </div>

        <div className="py-3 px-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-medium text-lg tracking-tight leading-tight dark:text-white">Playground</h1>
            <small className="block text-stone-400 text-sm">Test out the various skins for Video.js.</small>
          </div>

          <nav className="flex items-center gap-3">
            <select value={mediaSourceKey} onChange={onChangeMediaSource}>
              {mediaSources.map(({ key, name }) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <select value={skinKey} onChange={onChangeSkin}>
              {skins.map(({ key, name }) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <button type="button" className="p-2" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitAltIcon /> : <FullscreenEnterAltIcon />}
              <span className="sr-only">Toggle fullscreen</span>
            </button>
          </nav>
        </div>
      </header>

      <main className={clsx(
        'min-h-screen flex justify-center items-center',
        {
          'bg-radial bg-size-[16px_16px] from-stone-300 dark:from-stone-700 via-10% via-transparent to-transparent': !isFullscreen,
        },
      )}
      >
        <div className="w-full max-w-5xl mx-auto p-6">
          <MediaProvider key={key}>
            <Skin className={skinClassName}>
              {/* @ts-expect-error -- types are incorrect */}
              <Video src={mediaSource} poster={poster} />
            </Skin>
          </MediaProvider>
        </div>
      </main>
    </div>
  );
}
