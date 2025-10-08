/**
 * Unit tests for JSX usage analysis
 */

import { describe, expect, it } from 'vitest';
import { parseSource } from '../../../src/core/parser/parseSource.js';
import { analyzeJSXUsage } from '../../../src/core/analysis/analyzeJSXUsage.js';

describe('analyzeJSXUsage', () => {
  it('identifies simple component usage', () => {
    const source = `
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton />;
      }
    `;

    const ast = parseSource(source);
    const usage = analyzeJSXUsage(ast, ['PlayButton']);

    expect(usage).toHaveLength(1);
    expect(usage[0]).toMatchObject({
      name: 'PlayButton',
      usageType: 'jsx-element',
    });
    expect(usage[0]?.jsxElements).toHaveLength(1);
  });

  it('identifies compound component usage', () => {
    const source = `
      import { TimeRange } from './components';

      export default function Skin() {
        return (
          <TimeRange.Root>
            <TimeRange.Track />
            <TimeRange.Progress />
          </TimeRange.Root>
        );
      }
    `;

    const ast = parseSource(source);
    const usage = analyzeJSXUsage(ast, ['TimeRange']);

    expect(usage).toHaveLength(1);
    expect(usage[0]).toMatchObject({
      name: 'TimeRange',
      usageType: 'compound-member',
    });
    expect(usage[0]?.members).toContain('Root');
    expect(usage[0]?.members).toContain('Track');
    expect(usage[0]?.members).toContain('Progress');
    expect(usage[0]?.jsxElements).toHaveLength(3);
  });

  it('identifies multiple component usage', () => {
    const source = `
      import { PlayButton, PauseButton, MediaContainer } from './components';

      export default function Skin() {
        return (
          <MediaContainer>
            <PlayButton />
            <PauseButton />
          </MediaContainer>
        );
      }
    `;

    const ast = parseSource(source);
    const usage = analyzeJSXUsage(ast, ['PlayButton', 'PauseButton', 'MediaContainer']);

    expect(usage).toHaveLength(3);

    const playButton = usage.find((u) => u.name === 'PlayButton');
    expect(playButton?.usageType).toBe('jsx-element');

    const pauseButton = usage.find((u) => u.name === 'PauseButton');
    expect(pauseButton?.usageType).toBe('jsx-element');

    const container = usage.find((u) => u.name === 'MediaContainer');
    expect(container?.usageType).toBe('jsx-element');
  });

  it('marks unused imports as unknown', () => {
    const source = `
      import { PlayButton } from './components';
      import { config } from './config';

      export default function Skin() {
        return <PlayButton />;
      }
    `;

    const ast = parseSource(source);
    const usage = analyzeJSXUsage(ast, ['PlayButton', 'config']);

    expect(usage).toHaveLength(2);

    const playButton = usage.find((u) => u.name === 'PlayButton');
    expect(playButton?.usageType).toBe('jsx-element');

    const configUsage = usage.find((u) => u.name === 'config');
    expect(configUsage?.usageType).toBe('unknown');
  });

  it('handles nested compound components', () => {
    const source = `
      import { TimeRange } from './components';

      export default function Skin() {
        return <TimeRange.Root.Container />;
      }
    `;

    const ast = parseSource(source);
    const usage = analyzeJSXUsage(ast, ['TimeRange']);

    expect(usage[0]).toMatchObject({
      name: 'TimeRange',
      usageType: 'compound-member',
    });
    expect(usage[0]?.members).toContain('Root.Container');
  });
});
