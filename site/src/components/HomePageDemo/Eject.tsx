import type { Skin } from '@/stores/homePageDemos';
import { useStore } from '@nanostores/react';
import { TabsPanel, TabsRoot } from '@/components/Tabs';
import { framework, skin } from '@/stores/homePageDemos';
import {
  generateHTMLCSS,
  generateHTMLJS,
  generateHTMLMarkup,
  generateReactComponent,
  generateReactCSS as genReactCSS,
} from '@/utils/ejectCodeGenerator';
import ClientCode from '../Code/ClientCode';

function generateReactCode(skin: Skin): string {
  return generateReactComponent(skin);
}

function generateReactCSS(skin: Skin): string {
  return genReactCSS(skin);
}

function generateHTMLCode(skin: Skin): string {
  return generateHTMLMarkup(skin);
}

function generateCSS(skin: Skin): string {
  return generateHTMLCSS(skin);
}

function generateJS(skin: Skin): string {
  return generateHTMLJS(skin);
}

export default function EjectDemo({ className }: { className?: string }) {
  const $framework = useStore(framework);
  const $skin = useStore(skin);

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
          <ClientCode code={generateHTMLCode($skin)} lang="html" />
        </TabsPanel>
        <TabsPanel tabsId="eject-html" value="css">
          <ClientCode code={generateCSS($skin)} lang="css" />
        </TabsPanel>
        <TabsPanel tabsId="eject-html" value="javascript">
          <ClientCode code={generateJS($skin)} lang="javascript" />
        </TabsPanel>
      </TabsRoot>
    );
  }

  return (
    <TabsRoot
      id="eject-react"
      aria-label="React implementation"
      titles={{ react: 'React', css: 'CSS' }}
      className={className}
      maxWidth={false}
    >
      <TabsPanel tabsId="eject-react" value="react">
        <ClientCode code={generateReactCode($skin)} lang="tsx" />
      </TabsPanel>
      <TabsPanel tabsId="eject-react" value="css">
        <ClientCode code={generateReactCSS($skin)} lang="css" />
      </TabsPanel>
    </TabsRoot>
  );
}
