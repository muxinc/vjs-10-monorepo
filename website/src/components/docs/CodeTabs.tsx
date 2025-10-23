import * as Tabs from '@base-ui-components/react/tabs';
import { useState } from 'react';
import './CodeTabs.css';

interface CodeTab {
  label: string;
  componentCode: string;
  cssCode: string;
  filename: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
}

export function CodeTabs({ tabs }: CodeTabsProps) {
  const [value, setValue] = useState(0);

  return (
    <Tabs.Root value={value} onValueChange={setValue}>
      <Tabs.List className="code-tabs-list">
        {tabs.map((tab, index) => (
          <Tabs.Tab key={index} value={index} className="code-tabs-tab">
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((tab, index) => (
        <Tabs.Panel key={index} value={index} className="code-tabs-panel">
          <div>
            <h4>Component</h4>
            <pre>
              <code className="language-tsx">{tab.componentCode}</code>
            </pre>
            <h4>
              Styles (
              {tab.filename}
              )
            </h4>
            <pre>
              <code className="language-css">{tab.cssCode}</code>
            </pre>
          </div>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
