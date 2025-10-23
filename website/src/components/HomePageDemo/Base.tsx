import type { Media, Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { framework, media, skin } from '@/stores/homePageDemos';
import ClientCode from '../ClientCode';

function generateHTMLCode(skin: Skin, media: Media): string {
  const skinTag = `${skin}-skin`;
  const mediaTag = media;
  const videoExtension = media === 'hls-video' ? 'm3u8' : 'mp4';

  return `<video-provider>
  <${skinTag}>
    <${mediaTag} src="https://example.com/video.${videoExtension}"></${mediaTag}>
  </${skinTag}>
</video-provider>`;
}

function generateReactCode(skin: Skin, media: Media): string {
  const skinComponent = skin === 'frosted' ? 'FrostedSkin' : 'MinimalSkin';
  const mediaComponent = media === 'video' ? 'Video' : 'HLSVideo';
  const skinImport = skin === 'frosted' ? 'frosted' : 'minimal';
  const videoExtension = media === 'hls-video' ? 'm3u8' : 'mp4';

  return `import { VideoProvider, ${mediaComponent} } from '@videojs/react';
import { ${skinComponent} } from '@videojs/react/skins/${skinImport}';

export const VideoPlayer = () => {
  return (
    <VideoProvider>
      <${skinComponent}>
        <${mediaComponent} src="https://example.com/video.${videoExtension}" />
      </${skinComponent}>
    </VideoProvider>
  );
};`;
}

interface Props {
  className?: string;
}
export default function BaseDemo({ className }: Props) {
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
