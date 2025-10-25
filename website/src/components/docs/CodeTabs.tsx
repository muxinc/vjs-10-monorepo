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
  return (
    <div className="code-examples">
      {tabs.map((tab, index) => (
        <div key={index} className="code-example-section">
          <h3>{tab.label}</h3>
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
        </div>
      ))}
    </div>
  );
}
