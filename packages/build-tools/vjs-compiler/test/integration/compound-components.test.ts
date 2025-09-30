/**
 * Integration test for Compound Components Support
 *
 * Tests transformation of JSX member expressions like <TimeRange.Root>
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('compound Components', () => {
  it('transforms simple compound components (TimeRange.Root)', async () => {
    const skinSource = `
      import { TimeRange } from '@vjs-10/react';
      import styles from './styles';

      export default function CompoundSkin() {
        return (
          <TimeRange.Root className={styles.RangeRoot}>
            <TimeRange.Track />
          </TimeRange.Root>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        RangeRoot: 'relative flex',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/CompoundSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate element name transformation
    expect(result.code).toMatch(/<media-time-range-root>/);
    expect(result.code).toMatch(/<\/media-time-range-root>/);
    expect(result.code).toMatch(/<media-time-range-track/);

    // Validate CSS selector for nested component
    // RangeRoot used on TimeRange.Root should generate element selector
    expect(result.code).toMatch(/media-time-range-root\s*\{/);
    expect(result.code).toMatch(/position:\s*relative/);
    expect(result.code).toMatch(/display:\s*flex/);
  });

  it('handles multiple compound components from same namespace', async () => {
    const skinSource = `
      import { TimeRange } from '@vjs-10/react';
      import styles from './styles';

      export default function MultiCompoundSkin() {
        return (
          <TimeRange.Root className={styles.RangeRoot}>
            <TimeRange.Track className={styles.RangeTrack} />
            <TimeRange.Handle className={styles.RangeHandle} />
          </TimeRange.Root>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        RangeRoot: 'relative',
        RangeTrack: 'flex-1',
        RangeHandle: 'rounded-full',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/MultiCompoundSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate all element names transformed
    expect(result.code).toMatch(/<media-time-range-root>/);
    expect(result.code).toMatch(/<media-time-range-track/);
    expect(result.code).toMatch(/<media-time-range-handle/);

    // Validate CSS selectors
    expect(result.code).toMatch(/media-time-range-root\s*\{/);
    expect(result.code).toMatch(/media-time-range-track\s*\{/);
    expect(result.code).toMatch(/media-time-range-handle\s*\{/);
  });

  it('handles mix of simple and compound components', async () => {
    const skinSource = `
      import { MediaContainer, TimeRange, PlayButton } from '@vjs-10/react';
      import styles from './styles';

      export default function MixedSkin() {
        return (
          <MediaContainer className={styles.Container}>
            <TimeRange.Root className={styles.RangeRoot}>
              <TimeRange.Track className={styles.RangeTrack} />
            </TimeRange.Root>
            <PlayButton className={styles.Button} />
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
        RangeRoot: 'flex',
        RangeTrack: 'overflow-hidden',
        Button: 'p-2',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/MixedSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate simple components
    expect(result.code).toMatch(/<media-container>/);
    expect(result.code).toMatch(/<media-play-button/);

    // Validate compound components
    expect(result.code).toMatch(/<media-time-range-root>/);
    expect(result.code).toMatch(/<media-time-range-track/);

    // Validate CSS selectors
    expect(result.code).toMatch(/media-container\s*\{/);
    expect(result.code).toMatch(/media-time-range-root\s*\{/);
    expect(result.code).toMatch(/media-time-range-track\s*\{/);
    expect(result.code).toMatch(/media-play-button\s*\{/);
  });

  it('handles deeply nested compound components (TimeRange.Root.Track)', async () => {
    const skinSource = `
      import { TimeRange } from '@vjs-10/react';
      import styles from './styles';

      export default function DeeplySkin() {
        return (
          <TimeRange.Root.Track className={styles.RangeRootTrack} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        RangeRootTrack: 'flex-1',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/DeeplySkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate deeply nested transformation
    // TimeRange.Root.Track → TimeRangeRootTrack → time-range-root-track → media-time-range-root-track
    expect(result.code).toMatch(/<media-time-range-root-track/);
    expect(result.code).toMatch(/media-time-range-root-track\s*\{/);
  });
});
