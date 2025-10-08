import { describe, expect, it } from 'vitest';

import { JSX_ONLY_CONFIG, parseReactSource } from '../src/parsing/index.js';

describe('parseReactSource', () => {
  it('extracts JSX from arrow function with implicit return', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => <div>Hello</div>;
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.type).toBe('JSXElement');
    expect(parsed.jsx?.openingElement.name).toMatchObject({ type: 'JSXIdentifier', name: 'div' });
  });

  it('extracts JSX from arrow function with block and return', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => {
        return <div>Hello</div>;
      };
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from React.FC with explicit types', () => {
    const source = `
      import * as React from 'react';

      export const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <div>{children}</div>;
      };
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from function declaration', () => {
    const source = `
      import * as React from 'react';

      function Component() {
        return <div>Hello</div>;
      }

      export default Component;
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.type).toBe('JSXElement');
  });

  it('extracts complex JSX with nested elements', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <h1>Title</h1>
          <button>Click</button>
        </div>
      );
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.children.length).toBeGreaterThan(0);
  });

  it('handles JSX with props', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div className="container" data-testid="test">
          <button disabled>Click</button>
        </div>
      );
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).not.toBeNull();
    expect(parsed.jsx?.openingElement.attributes.length).toBeGreaterThan(0);
  });

  it('returns undefined jsx for non-component files', () => {
    const source = `
      const foo = 'bar';
      export default foo;
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).toBeUndefined();
  });

  it('returns undefined jsx for components without JSX', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => {
        return null;
      };
    `;

    const parsed = parseReactSource(source, JSX_ONLY_CONFIG);
    expect(parsed.jsx).toBeUndefined();
  });
});
