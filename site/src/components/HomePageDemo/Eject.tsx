import type { Media, Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { TabsPanel, TabsRoot } from '@/components/Tabs';
import { framework, media, skin } from '@/stores/homePageDemos';
import ClientCode from '../Code/ClientCode';

function generateHTMLCode(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

function generateReactCode(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

function generateCSSModuleCode(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

function generateCSS(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

function generateJS(_skin: Skin, _media: Media): string {
  return 'Coming soon';
}

export default function EjectDemo({ className }: { className?: string }) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);
  const $media = useStore(media);

  if ($framework === 'html') {
    return (
      <TabsRoot
        id="eject-html"
        aria-label="HTML implementation"
        titles={{ html: 'HTML', css: 'CSS', javascript: 'JavaScript' }}
        className={className}
        maxWidth={false}
      >
        <TabsPanel tabsId="eject-html" value="html">
          <ClientCode code={generateHTMLCode($skin, $media)} lang="html" />
        </TabsPanel>
        <TabsPanel tabsId="eject-html" value="css">
          <ClientCode code={generateCSS($skin, $media)} lang="css" />
        </TabsPanel>
        <TabsPanel tabsId="eject-html" value="javascript">
          <ClientCode code={generateJS($skin, $media)} lang="javascript" />
        </TabsPanel>
      </TabsRoot>
    );
  }

  return (
    <TabsRoot
      id="eject-react"
      aria-label="React implementation"
      titles={{ react: 'React', css: 'CSS Module' }}
      className={className}
      maxWidth={false}
    >
      <TabsPanel tabsId="eject-react" value="react">
        <ClientCode code={generateReactCode($skin, $media)} lang="tsx" />
      </TabsPanel>
      <TabsPanel tabsId="eject-react" value="css">
        <ClientCode code={generateCSSModuleCode($skin, $media)} lang="css" />
      </TabsPanel>
    </TabsRoot>
  );
}
