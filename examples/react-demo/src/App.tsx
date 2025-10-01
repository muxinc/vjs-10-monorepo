import { MediaProvider, MediaSkinDefault, Video } from '@vjs-10/react';

import './globals.css';
import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';

const skins = [{
  key: 'default',
  name: 'Default',
  component: MediaSkinDefault,
}] as const;

type SkinKey = (typeof skins)[number]['key'];

const mediaSources = [{
  key: '1',
  name: 'Mux 1',
  value: 'https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8'
}, {
  key: '2',
  name: 'Mux 2',
  value: 'https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8'
}, {
  key: '3',
  name: 'Mux 3',
  value: 'https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4'
}] as const;

type MediaSourceKey = (typeof mediaSources)[number]['key'];

function getParam<T>(key: string, defaultValue: T): T {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) as T || defaultValue;
}
function setParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search}` : '');
  window.history.replaceState(null, '', url);
}

const DEFAULT_SKIN: SkinKey = 'default';
const DEFAULT_MEDIA_SOURCE: MediaSourceKey = '1';

export default function App(): JSX.Element {
  const [skinKey, setSkinKey] = useState<SkinKey>(getParam('skin', DEFAULT_SKIN));
  const [mediaSourceKey, setMediaSourceKey] = useState<MediaSourceKey>(getParam('source', DEFAULT_MEDIA_SOURCE));

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

  return (
    <>
      <header className="fixed top-0 inset-x-0 after:h-px after:absolute after:inset-x-0 after:top-full after:bg-black/5 py-3 px-6 flex items-center justify-between bg-white backdrop-blur-2xl backdrop-saturate-100 shadow shadow-black/10">
        <div>
          <h1 className="font-medium text-lg tracking-tight leading-none">Skins</h1>
          <small className='text-zinc-400 text-xs font-medium'>A playground for the Video.js skins.</small>
        </div>

        <nav className='flex items-center gap-3'>
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
        </nav>
      </header>

      <main className="min-h-screen flex justify-center items-center bg-radial bg-size-[16px_16px] from-zinc-300 via-10% via-transparent to-transparent">
        <div className='w-full max-w-4xl mx-auto p-6'>
          <MediaProvider key={key}>
            <Skin className="rounded-4xl">
              {/* @ts-ignore -- types are incorrect */}
              <Video muted src={mediaSource} />
            </Skin>
          </MediaProvider>
        </div>
      </main>
    </>
  );
}

