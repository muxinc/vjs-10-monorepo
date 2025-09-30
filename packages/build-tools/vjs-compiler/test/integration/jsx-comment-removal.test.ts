/**
 * Integration test for JSX comment removal
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('jSX Comment Removal', () => {
  it('removes JSX comments from output', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function CommentSkin() {
        return (
          <MediaContainer className={styles.Container}>
            {/* This is a JSX comment */}
            <div className={styles.Content}>
              {/* Another comment */}
              Content here
            </div>
            {/* Final comment */}
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
        Content: 'flex',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/CommentSkin.tsx',
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

    // Validate JSX comments are removed from output
    expect(result.code).not.toContain('This is a JSX comment');
    expect(result.code).not.toContain('Another comment');
    expect(result.code).not.toContain('Final comment');

    // Should not have empty expression containers
    expect(result.code).not.toContain('{}');

    // But should have the actual content
    expect(result.code).toContain('Content here');
    expect(result.code).toContain('<media-container>');
    expect(result.code).toContain('<div class="content">');
  });

  it('removes comments but preserves content', async () => {
    const skinSource = `
      import { MediaContainer, PlayButton } from '@vjs-10/react';
      import styles from './styles';

      export default function MixedSkin() {
        return (
          <MediaContainer className={styles.Container}>
            {/* Comment before button */}
            <PlayButton className={styles.Button} />
            {/* Comment after button */}
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
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

    // Comments removed
    expect(result.code).not.toContain('Comment before button');
    expect(result.code).not.toContain('Comment after button');
    expect(result.code).not.toContain('{}');

    // Content preserved
    expect(result.code).toContain('<media-play-button');
  });
});
