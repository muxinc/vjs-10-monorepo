import { describe, expect, it } from 'vitest';

import { compileJSXToHTML } from '../src/index.js';
import { loadFixture } from './utils/fixtures.js';
import { validateHTML } from './utils/validator.js';

describe('compileJSXToHTML - Integration Tests with Fixtures', () => {
  it('compiles simple component with built-in elements', async () => {
    const fixture = loadFixture('simple-component');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    // Validate HTML
    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('compiles compound components (member expressions)', async () => {
    const fixture = loadFixture('compound-components');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('replaces {children} with slot element', async () => {
    const fixture = loadFixture('with-children');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('handles attribute transformations and JSX expressions', async () => {
    const fixture = loadFixture('with-attributes');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('handles mixed built-in and custom elements', async () => {
    const fixture = loadFixture('mixed-elements');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });

  it('compiles real-world skin example', async () => {
    const fixture = loadFixture('real-world-skin');
    const html = compileJSXToHTML(fixture.input);

    expect(html).not.toBeNull();
    expect(html).toBe(fixture.expected);

    const validation = await validateHTML(html!);
    expect(validation.valid).toBe(true);
  });
});

describe('compileJSXToHTML - Additional Tests', () => {
  it('removes JSX comments', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          {/* This is a comment */}
          <PlayButton>
            {/* Another comment */}
            <PlayIcon />
          </PlayButton>
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).not.toContain('This is a comment');
    expect(html).not.toContain('Another comment');
    expect(html).not.toContain('{/*');
    expect(html).not.toContain('*/}');
  });

  it('returns null for non-component code', () => {
    const source = `
      const foo = 'bar';
      export default foo;
    `;

    const html = compileJSXToHTML(source);
    expect(html).toBeNull();
  });

  it('handles indentation options', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <button>Click</button>
        </div>
      );
    `;

    const html = compileJSXToHTML(source, { indent: 4, indentSize: 2 });
    expect(html).not.toBeNull();
    expect(html?.startsWith('    <div>')).toBe(true); // 4 spaces initial indent
  });

  it('converts self-closing tags to explicit closing', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <PlayIcon />
          <PauseIcon />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-play-icon></media-play-icon>');
    expect(html).toContain('<media-pause-icon></media-pause-icon>');
    expect(html).not.toContain('/>');
  });

  it('preserves boolean attributes', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <button disabled>Click</button>
          <input checked readOnly />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('disabled');
    expect(html).toContain('checked');
    expect(html).toContain('read-only');
  });

  it('handles nested custom components', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <MediaContainer>
          <div className="overlay">
            <div className="controls">
              <PlayButton>
                <PlayIcon />
              </PlayButton>
            </div>
          </div>
        </MediaContainer>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-container>');
    expect(html).toContain('<div class="overlay">');
    expect(html).toContain('<div class="controls">');
    expect(html).toContain('<media-play-button>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
  });

  it('handles empty elements correctly', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <span></span>
          <PlayIcon />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<span></span>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
  });
});
