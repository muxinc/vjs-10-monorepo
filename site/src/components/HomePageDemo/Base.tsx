import type { Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { TabsPanel, TabsRoot } from '@/components/Tabs';
import { framework, skin } from '@/stores/homePageDemos';
import ClientCode from '../Code/ClientCode';

function generateHTMLCode(skin: Skin): string {
  const skinTag = `${skin}-skin`;

  return `<video-provider>
  <${skinTag}>
    <video src="https://example.com/video.mp4"></video>
  </${skinTag}>
</video-provider>`;
}

function generateReactCode(skin: Skin): string {
  const skinComponent = skin === 'frosted' ? 'FrostedSkin' : 'MinimalSkin';
  const skinImport = skin === 'frosted' ? 'frosted' : 'minimal';

  return `import { VideoProvider, Video } from '@videojs/react';
import { ${skinComponent} } from '@videojs/react/skins/${skinImport}';

export const VideoPlayer = () => {
  return (
    <VideoProvider>
      <${skinComponent}>
        <Video src="https://example.com/video.mp4" />
      </${skinComponent}>
    </VideoProvider>
  );
};`;
}

function generateJS(_skin: Skin): string {
  return `import '@videojs/html/skins/frosted';`;
}

export default function BaseDemo({ className }: { className?: string }) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);

  if ($framework === 'html') {
    return (
      <TabsRoot
        id="base-html"
        aria-label="HTML implementation"
        titles={{ html: 'HTML', javascript: 'JavaScript' }}
        className={className}
        maxWidth={false}
      >
        <TabsPanel tabsId="base-html" value="html">
          <ClientCode code={generateHTMLCode($skin)} lang="html" />
        </TabsPanel>
        <TabsPanel tabsId="base-html" value="javascript">
          <ClientCode code={generateJS($skin)} lang="javascript" />
        </TabsPanel>
      </TabsRoot>
    );
  }

  return (
    <TabsRoot
      id="base-react"
      aria-label="React implementation"
      titles={{ react: 'React' }}
      className={className}
      maxWidth={false}
    >
      <TabsPanel tabsId="base-react" value="react">
        <ClientCode code={generateReactCode($skin)} lang="tsx" />
      </TabsPanel>
    </TabsRoot>
  );
}
