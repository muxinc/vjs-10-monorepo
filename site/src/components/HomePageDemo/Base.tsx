import type { Media, Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { TabsPanel, TabsRoot } from '@/components/Tabs';
import { framework, media, skin } from '@/stores/homePageDemos';
import ClientCode from '../Code/ClientCode';

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

function generateCSS(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

function generateJS(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

export default function BaseDemo({ className }: { className?: string }) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);
  const $media = useStore(media);

  if ($framework === 'html') {
    return (
      <TabsRoot
        id="base-html"
        aria-label="HTML implementation"
        defaultValue="html"
        titles={{ html: 'HTML', css: 'CSS', javascript: 'JavaScript' }}
        className={className}
      >
        <TabsPanel tabsId="base-html" value="html">
          <ClientCode code={generateHTMLCode($skin, $media)} lang="html" />
        </TabsPanel>
        <TabsPanel tabsId="base-html" value="css">
          <ClientCode code={generateCSS($skin, $media)} lang="css" />
        </TabsPanel>
        <TabsPanel tabsId="base-html" value="javascript">
          <ClientCode code={generateJS($skin, $media)} lang="javascript" />
        </TabsPanel>
      </TabsRoot>
    );
  }

  return (
    <TabsRoot
      id="base-react"
      aria-label="React implementation"
      defaultValue="react"
      titles={{ react: 'React' }}
      className={className}
    >
      <TabsPanel tabsId="base-react" value="react">
        <ClientCode code={generateReactCode($skin, $media)} lang="tsx" />
      </TabsPanel>
    </TabsRoot>
  );
}
