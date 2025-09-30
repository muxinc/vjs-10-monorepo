import { describe, it, expect } from 'vitest';
import { parseReactComponent } from '../src/parser.js';

describe('parseReactComponent', () => {
  it('extracts JSX from arrow function with implicit return', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => <div>Hello</div>;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
    expect(jsx?.openingElement.name).toMatchObject({ type: 'JSXIdentifier', name: 'div' });
  });

  it('extracts JSX from arrow function with block and return', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => {
        return <div>Hello</div>;
      };
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from React.FC with explicit types', () => {
    const source = `
      import * as React from 'react';

      export const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <div>{children}</div>;
      };
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from function declaration', () => {
    const source = `
      import * as React from 'react';

      function Component() {
        return <div>Hello</div>;
      }

      export default Component;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
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

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.children.length).toBeGreaterThan(0);
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

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();
    expect(jsx?.openingElement.attributes.length).toBeGreaterThan(0);
  });

  it('returns null for non-component files', () => {
    const source = `
      const foo = 'bar';
      export default foo;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).toBeNull();
  });

  it('returns null for components without JSX', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => {
        return null;
      };
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).toBeNull();
  });
});
