import type { Media, Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { framework, media, skin } from '@/stores/homePageDemos';
import ClientCode from '../ClientCode';

// eslint-disable-next-line unused-imports/no-unused-vars
function generateHTMLCode(skin: Skin, media: Media): string {
  return `Coming soon`;
}

// eslint-disable-next-line unused-imports/no-unused-vars
function generateReactCode(skin: Skin, media: Media): string {
  return `Coming soon`;
}

interface Props {
  className?: string;
}
export default function EjectDemo({ className }: Props) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);
  const $media = useStore(media);

  const code = $framework === 'html'
    ? generateHTMLCode($skin, $media)
    : generateReactCode($skin, $media);

  const lang = $framework === 'html' ? 'html' : 'tsx';

  return (
    <ClientCode code={code} lang={lang} className={className} />
  );
}
