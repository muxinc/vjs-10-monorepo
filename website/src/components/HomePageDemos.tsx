import type { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx';
import { useState } from 'react';
import HomePageBaseDemo from './HomePageBaseDemo';
import HomePageEjectDemo from './HomePageEjectDemo';
import ToggleGroup from './ToggleGroup';

export type Framework = 'html' | 'react';
export type Skin = 'frosted' | 'minimal';
export type Media = 'video' | 'hls-video';

export default function HomePageDemos({ className }: { className?: string }) {
  const [framework, setFramework] = useState<Framework>('react');
  const [skin, setSkin] = useState<Skin>('frosted');
  const [media, setMedia] = useState<Media>('video');

  return (
    <section
      className={clsx('grid gap-x-9 gap-y-6 lg:grid-cols-2', className)}
    >
      <section className="grid grid-rows-subgrid row-span-2">
        <header className="max-w-3xl">
          <h2 className="text-h5 font-semibold lg:text-h4 mb-1">Assemble your player</h2>
          <p>Feel at home with your framework, skin, and media source</p>
        </header>
        <HomePageBaseDemo framework={framework} skin={skin} media={media} className="lg:h-88" />
      </section>
      <div className="col-span-full flex flex-col sm:flex-row sm:gap-20 sm:items-center justify-center lg:hidden">
        <Controls framework={framework} setFramework={setFramework} skin={skin} setSkin={setSkin} media={media} setMedia={setMedia} />
      </div>
      <section className="grid grid-rows-subgrid row-span-2">
        <header className="max-w-3xl">
          <h2 className="text-h5 font-semibold lg:text-h4 mb-1">Take full control</h2>
          <p>
            Make your player truly your own with fully-editable components
          </p>
        </header>
        <HomePageEjectDemo framework={framework} skin={skin} media={media} className="lg:h-88" />
      </section>
      <div className="col-span-full flex flex-col sm:flex-row sm:gap-20 sm:items-center justify-center">
        <Controls framework={framework} setFramework={setFramework} skin={skin} setSkin={setSkin} media={media} setMedia={setMedia} />
      </div>
    </section>
  );
}

interface ControlsProps {
  framework: Framework;
  setFramework: Dispatch<SetStateAction<Framework>>;
  skin: Skin;
  setSkin: Dispatch<SetStateAction<Skin>>;
  media: Media;
  setMedia: Dispatch<SetStateAction<Media>>;
}
function Controls({
  framework,
  setFramework,
  skin,
  setSkin,
  media,
  setMedia,
}: ControlsProps) {
  return (
    <>
      <ToggleGroup
        value={framework}
        onChange={setFramework}
        options={[
          { value: 'react', label: 'React' },
          { value: 'html', label: 'HTML' },
        ]}
        aria-label="Select framework"
      />

      <ToggleGroup
        value={skin}
        onChange={setSkin}
        options={[
          { value: 'frosted', label: 'Frosted' },
          { value: 'minimal', label: 'Minimal' },
        ]}
        aria-label="Select skin"
      />

      <ToggleGroup
        value={media}
        onChange={setMedia}
        options={[
          { value: 'video', label: '<video />' },
          { value: 'hls-video', label: 'HLS' },
        ]}
        aria-label="Select media element"
      />
    </>
  );
}
