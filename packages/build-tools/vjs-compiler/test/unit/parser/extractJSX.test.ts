import { describe, expect, it } from 'vitest';
import { parseSource } from '../../../src/core/parser/parseSource.js';
import { extractJSX, extractComponentName } from '../../../src/core/parser/extractJSX.js';

describe('extractJSX', () => {
  it('extracts JSX from function declaration', () => {
    const source = `
      export default function Component() {
        return <div>Hello</div>;
      }
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from arrow function', () => {
    const source = `
      export default () => <div>Hello</div>;
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from arrow function with block', () => {
    const source = `
      export default () => {
        return <div>Hello</div>;
      };
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from parenthesized expression', () => {
    const source = `
      export default function Component() {
        return (
          <div>Hello</div>
        );
      }
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from identifier export', () => {
    const source = `
      function Component() {
        return <div>Hello</div>;
      }

      export default Component;
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts JSX from const arrow function export', () => {
    const source = `
      const Component = () => <div>Hello</div>;

      export default Component;
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
  });

  it('extracts nested JSX structure', () => {
    const source = `
      export default function Component() {
        return (
          <div>
            <span>Nested</span>
          </div>
        );
      }
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).not.toBeNull();
    expect(jsx?.type).toBe('JSXElement');
    expect(jsx?.children).toBeDefined();
  });

  it('returns null for non-JSX function', () => {
    const source = `
      export default function Component() {
        return 42;
      }
    `;

    const ast = parseSource(source);
    const jsx = extractJSX(ast);

    expect(jsx).toBeNull();
  });
});

describe('extractComponentName', () => {
  it('extracts name from function declaration', () => {
    const source = `
      export default function MinimalSkin() {
        return <div />;
      }
    `;

    const ast = parseSource(source);
    const name = extractComponentName(ast);

    expect(name).toBe('MinimalSkin');
  });

  it('extracts name from identifier export', () => {
    const source = `
      function MinimalSkin() {
        return <div />;
      }

      export default MinimalSkin;
    `;

    const ast = parseSource(source);
    const name = extractComponentName(ast);

    expect(name).toBe('MinimalSkin');
  });

  it('returns null for anonymous function', () => {
    const source = `
      export default function() {
        return <div />;
      }
    `;

    const ast = parseSource(source);
    const name = extractComponentName(ast);

    expect(name).toBeNull();
  });

  it('returns null for arrow function', () => {
    const source = `
      export default () => <div />;
    `;

    const ast = parseSource(source);
    const name = extractComponentName(ast);

    expect(name).toBeNull();
  });
});
