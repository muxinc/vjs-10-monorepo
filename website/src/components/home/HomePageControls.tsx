import { useStore } from '@nanostores/react';
import { framework, media, skin } from '@/stores/homePageDemos';
import ToggleGroup from '../ToggleGroup';

export default function HomePageControls() {
  const $framework = useStore(framework);
  const $skin = useStore(skin);
  const $media = useStore(media);

  return (
    <>
      <ToggleGroup
        value={$skin}
        onChange={value => skin.set(value)}
        options={[
          { value: 'frosted', label: 'Frosted' },
          { value: 'minimal', label: 'Minimal' },
        ]}
        aria-label="Select skin"
      />

      <ToggleGroup
        value={$framework}
        onChange={value => framework.set(value)}
        options={[
          { value: 'react', label: 'React' },
          { value: 'html', label: 'HTML' },
        ]}
        aria-label="Select framework"
      />

      <ToggleGroup
        value={$media}
        onChange={value => media.set(value)}
        options={[
          { value: 'video', label: 'Simple' },
          { value: 'hls-video', label: 'HLS' },
        ]}
        aria-label="Select media element"
      />
    </>
  );
}
