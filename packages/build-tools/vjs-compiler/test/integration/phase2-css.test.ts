/**
 * Integration test for Phase 2: CSS transformation
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { compileSkin } from '../../src/pipelines/compileSkin.js';
import type { CompileSkinConfig } from '../../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../fixtures');

describe('Phase 2: CSS Transformation', () => {
  it('compiles skin with Tailwind CSS styles', async () => {
    // Read fixture files
    const skinSource = readFileSync(join(fixturesDir, 'minimal-skin.tsx'), 'utf-8');
    const stylesSource = readFileSync(join(fixturesDir, 'minimal-styles.ts'), 'utf-8');

    // Setup compilation config
    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/packages/react/react/src/skins/minimal/MediaSkinMinimal.tsx',
        stylesPath: '/packages/react/react/src/skins/minimal/styles.ts',
        outputPath: '/packages/html/html/src/skins/compiled/inline/media-skin-minimal.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/packages/react/react/src',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/packages/html/html/src',
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

    // Compile
    const result = await compileSkin(config);

    // Validate result structure
    expect(result.code).toBeTruthy();
    expect(result.componentName).toBe('MinimalSkin');
    expect(result.tagName).toBe('minimal-skin');

    // Validate CSS is present
    expect(result.code).toContain('<style>');
    expect(result.code).not.toContain('/* Empty for now - Phase 2 will add CSS */');

    // Validate CSS classes are generated
    expect(result.code).toContain('.Container');
    expect(result.code).toContain('.Controls');
    expect(result.code).toContain('.Button');

    // Phase 2: Just validate that Tailwind class names are captured in comments
    // Full processing will be implemented in later phases
    expect(result.code).toContain('/* Tailwind classes: relative */');
    expect(result.code).toContain('/* Tailwind classes: flex gap-2 */');
    expect(result.code).toContain('/* Tailwind classes: p-2 rounded */');

  });

  it('handles empty styles gracefully', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';

      export default function EmptySkin() {
        return (
          <MediaContainer>
            <div>Content</div>
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {};
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/packages/react/react/src/skins/test/Test.tsx',
        stylesPath: '/packages/react/react/src/skins/test/styles.ts',
        outputPath: '/packages/html/html/src/skins/compiled/inline/test.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/packages/react/react/src',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/packages/html/html/src',
        },
      },
      moduleType: 'skin',
      input: { format: 'react', typescript: true },
      output: { format: 'web-component', css: 'inline', typescript: true },
    };

    const result = await compileSkin(config);

    // Should compile without error
    expect(result.code).toBeTruthy();
    // CSS section should still exist but be empty
    expect(result.code).toContain('<style>');
  });

  it('processes multiple Tailwind utility classes', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function StyledSkin() {
        return (
          <MediaContainer className={styles.Container}>
            <div className={styles.Header}>Header</div>
            <div className={styles.Content}>Content</div>
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative w-full h-full',
        Header: 'flex items-center justify-between px-4 py-2',
        Content: 'flex-1 overflow-auto',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/packages/react/react/src/skins/test/Test.tsx',
        stylesPath: '/packages/react/react/src/skins/test/styles.ts',
        outputPath: '/packages/html/html/src/skins/compiled/inline/test.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/packages/react/react/src',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/packages/html/html/src',
        },
      },
      moduleType: 'skin',
      input: { format: 'react', typescript: true },
      output: { format: 'web-component', css: 'inline', typescript: true },
    };

    const result = await compileSkin(config);

    // Validate all style classes are present
    expect(result.code).toContain('.Container');
    expect(result.code).toContain('.Header');
    expect(result.code).toContain('.Content');

    // Phase 2: Validate Tailwind classes are captured
    expect(result.code).toContain('/* Tailwind classes: relative w-full h-full */');
    expect(result.code).toContain('/* Tailwind classes: flex items-center justify-between px-4 py-2 */');
    expect(result.code).toContain('/* Tailwind classes: flex-1 overflow-auto */');
  });
});
