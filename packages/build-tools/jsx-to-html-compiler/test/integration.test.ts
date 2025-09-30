import { describe, it, expect } from 'vitest';
import { compileJSXToHTML } from '../src/index.js';

describe('compileJSXToHTML - Integration Tests', () => {
  it('compiles a simple React component to HTML', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div className="container">
          <h1>Hello World</h1>
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<div class="container">');
    expect(html).toContain('<h1>');
    expect(html).toContain('Hello World');
    expect(html).toContain('</h1>');
    expect(html).toContain('</div>');
  });

  it('compiles custom components with media- prefix', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <MediaContainer>
          <PlayButton>
            <PlayIcon />
          </PlayButton>
        </MediaContainer>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-container>');
    expect(html).toContain('<media-play-button>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
    expect(html).toContain('</media-play-button>');
    expect(html).toContain('</media-container>');
  });

  it('compiles compound components', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <TimeRange.Root>
          <TimeRange.Track>
            <TimeRange.Progress />
            <TimeRange.Pointer />
          </TimeRange.Track>
          <TimeRange.Thumb />
        </TimeRange.Root>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-time-range-root>');
    expect(html).toContain('<media-time-range-track>');
    expect(html).toContain('<media-time-range-progress></media-time-range-progress>');
    expect(html).toContain('<media-time-range-pointer></media-time-range-pointer>');
    expect(html).toContain('</media-time-range-track>');
    expect(html).toContain('<media-time-range-thumb></media-time-range-thumb>');
    expect(html).toContain('</media-time-range-root>');
  });

  it('replaces {children} with slot element', () => {
    const source = `
      import * as React from 'react';

      export const Component = ({ children }) => (
        <MediaContainer>
          {children}
          <div>Controls</div>
        </MediaContainer>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<slot name="media" slot="media"></slot>');
    expect(html).not.toContain('{children}');
  });

  it('preserves JSX expression attributes', () => {
    const source = `
      import * as React from 'react';
      import styles from './styles.module.css';

      export const Component = () => (
        <div className={styles.Container}>
          <button className={\`\${styles.Button} \${styles.Primary}\`}>
            Click
          </button>
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('class={styles.Container}');
    expect(html).toContain('class={`${styles.Button} ${styles.Primary}`}');
  });

  it('handles mixed built-in and custom elements', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div className="wrapper">
          <PlayButton>
            <span>Play</span>
            <PlayIcon />
          </PlayButton>
          <section>
            <DurationDisplay />
          </section>
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<div class="wrapper">');
    expect(html).toContain('<media-play-button>');
    expect(html).toContain('<span>Play</span>');
    expect(html).toContain('<media-play-icon></media-play-icon>');
    expect(html).toContain('<section>');
    expect(html).toContain('<media-duration-display></media-duration-display>');
  });

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

  it('converts boolean attributes correctly', () => {
    const source = `
      import * as React from 'react';

      export const Component = () => (
        <div>
          <button disabled>Click</button>
          <CurrentTimeDisplay showRemaining />
        </div>
      );
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('disabled');
    expect(html).toContain('show-remaining');
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

  it('compiles real-world skin example', () => {
    const source = `
      import * as React from 'react';
      import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
      import PlayButton from '../components/PlayButton';
      import { MediaContainer } from '../components/MediaContainer';

      export const MediaSkin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
          <MediaContainer>
            {children}
            <div className="controls">
              <PlayButton className="play-btn">
                <PlayIcon />
                <PauseIcon />
              </PlayButton>
            </div>
          </MediaContainer>
        );
      };
    `;

    const html = compileJSXToHTML(source);
    expect(html).not.toBeNull();
    expect(html).toContain('<media-container>');
    expect(html).toContain('<slot name="media" slot="media"></slot>');
    expect(html).toContain('<div class="controls">');
    expect(html).toContain('<media-play-button class="play-btn">');
    expect(html).toContain('<media-play-icon></media-play-icon>');
    expect(html).toContain('<media-pause-icon></media-pause-icon>');
  });
});
