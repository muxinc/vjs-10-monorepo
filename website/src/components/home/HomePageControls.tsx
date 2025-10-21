import { useStore } from '@nanostores/react';
import clsx from 'clsx';
import { framework, media, skin } from '@/stores/homePageDemos';
import ToggleGroup from '../ToggleGroup';

export default function HomePageControls({ className }: { className?: string }) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);
  const $media = useStore(media);

  return (
    <section className={clsx('flex flex-col sm:flex-row sm:gap-20 items-center justify-center', className)}>
      <ToggleGroup
        className="mx-auto sm:mx-0 col-span-full grid grid-cols-2 justify-center sm:flex"
        value={$skin}
        onChange={value => skin.set(value)}
        options={[
          { value: 'frosted', label: 'Frosted' },
          { value: 'minimal', label: 'Minimal' },
        ]}
        aria-label="Select skin"
      />

      <ToggleGroup
        className="mx-auto sm:mx-0 col-span-full grid grid-cols-2 justify-center sm:flex"
        value={$framework}
        onChange={value => framework.set(value)}
        options={[
          { value: 'react', label: 'React' },
          { value: 'html', label: 'HTML' },
        ]}
        aria-label="Select framework"
      />

      <ToggleGroup
        className="mx-auto sm:mx-0 col-span-full grid grid-cols-2 justify-center sm:flex"
        value={$media}
        onChange={value => media.set(value)}
        options={[
          { value: 'video', label: 'Simple' },
          { value: 'hls-video', label: 'HLS' },
        ]}
        aria-label="Select media element"
      />
    </section>
  );
}
