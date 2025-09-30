import { describe, it, expect } from 'vitest';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { transformJSXToHTML } from '../src/transformer.js';
import { parseReactComponent } from '../src/parser.js';

describe('transformJSXToHTML', () => {
  it('transforms simple component names to custom elements', () => {
    const source = `
      export const Component = () => <PlayButton>Click</PlayButton>;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    expect(transformed.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-play-button',
    });
    expect(transformed.closingElement?.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-play-button',
    });
  });

  it('transforms compound component names (member expressions)', () => {
    const source = `
      export const Component = () => (
        <TimeRange.Root>
          <TimeRange.Track />
        </TimeRange.Root>
      );
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    expect(transformed.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-time-range-root',
    });

    const firstChild = transformed.children.find((child) =>
      t.isJSXElement(child)
    ) as t.JSXElement;
    expect(firstChild.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-time-range-track',
    });
  });

  it('preserves built-in HTML elements', () => {
    const source = `
      export const Component = () => (
        <div>
          <span>Text</span>
          <button>Click</button>
        </div>
      );
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    expect(transformed.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'div',
    });
  });

  it('transforms className to class', () => {
    const source = `
      export const Component = () => <div className="container">Hello</div>;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    const classAttr = transformed.openingElement.attributes.find(
      (attr) => t.isJSXAttribute(attr) && attr.name.name === 'class'
    );
    expect(classAttr).toBeDefined();
  });

  it('transforms camelCase attributes to kebab-case', () => {
    const source = `
      export const Component = () => <div showRemaining dataTestId="test">Hello</div>;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    const attrs = transformed.openingElement.attributes.filter(t.isJSXAttribute);

    const showRemainingAttr = attrs.find((attr) => attr.name.name === 'show-remaining');
    expect(showRemainingAttr).toBeDefined();

    const dataTestIdAttr = attrs.find((attr) => attr.name.name === 'data-test-id');
    expect(dataTestIdAttr).toBeDefined();
  });

  it('replaces {children} with slot element', () => {
    const source = `
      export const Component = ({ children }) => <div>{children}</div>;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    const slotChild = transformed.children.find((child) =>
      t.isJSXElement(child)
    ) as t.JSXElement;

    expect(slotChild).toBeDefined();
    expect(slotChild.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'slot',
    });

    const nameAttr = slotChild.openingElement.attributes.find(
      (attr) =>
        t.isJSXAttribute(attr) &&
        attr.name.name === 'name' &&
        t.isStringLiteral(attr.value) &&
        attr.value.value === 'media'
    );
    expect(nameAttr).toBeDefined();
  });

  it('converts self-closing tags to explicit closing', () => {
    const source = `
      export const Component = () => <PlayIcon />;
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);
    expect(transformed.openingElement.selfClosing).toBe(false);
    expect(transformed.closingElement).toBeDefined();
    expect(transformed.closingElement?.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-play-icon',
    });
  });

  it('handles nested transformations', () => {
    const source = `
      export const Component = () => (
        <MediaContainer className="wrapper">
          <PlayButton>
            <PlayIcon />
            <PauseIcon />
          </PlayButton>
        </MediaContainer>
      );
    `;

    const jsx = parseReactComponent(source);
    expect(jsx).not.toBeNull();

    const transformed = transformJSXToHTML(jsx!);

    // Check root element
    expect(transformed.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-container',
    });

    // Check class attribute
    const classAttr = transformed.openingElement.attributes.find(
      (attr) => t.isJSXAttribute(attr) && attr.name.name === 'class'
    );
    expect(classAttr).toBeDefined();

    // Check nested PlayButton
    const playButton = transformed.children.find((child) =>
      t.isJSXElement(child)
    ) as t.JSXElement;
    expect(playButton.openingElement.name).toMatchObject({
      type: 'JSXIdentifier',
      name: 'media-play-button',
    });
  });
});
