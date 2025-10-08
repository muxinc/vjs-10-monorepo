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

    // Validate CSS selectors are generated with proper categories
    expect(result.code).toContain('media-container {'); // Component Selector ID → element selector
    expect(result.code).toContain('.controls {'); // Generic Selector → class selector
    // Button is on PlayButton - should be Component Selector ID but we don't have categorization data for it yet

    // Validate HTML structure - Component Selector IDs should NOT have class attributes
    expect(result.code).toMatch(/<media-container>/); // No class attribute
    expect(result.code).toMatch(/<div class="controls">/); // Generic selector needs class
    expect(result.code).toMatch(/<media-play-button>/); // Component Selector ID - no class

    // Phase 3: Validate actual CSS properties are being generated
    expect(result.code).toMatch(/position:\s*relative/); // from 'relative'
    expect(result.code).toMatch(/display:\s*flex/); // from 'flex'

    // TODO: Some utilities not generating (p-2, rounded, gap-2)
    // This may require additional Tailwind v4 configuration or theme setup

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

    // Validate all style selectors are present with proper categories
    expect(result.code).toContain('media-container {'); // Component Selector ID → element selector
    expect(result.code).toContain('.header {'); // Generic Selector → class selector
    expect(result.code).toContain('.content {'); // Generic Selector → class selector

    // Validate HTML structure
    expect(result.code).toMatch(/<media-container>/); // Component Selector ID - no class
    expect(result.code).toMatch(/<div class="header">/); // Generic selector needs class
    expect(result.code).toMatch(/<div class="content">/); // Generic selector needs class

    // Phase 3: Validate basic CSS properties are being generated
    expect(result.code).toMatch(/position:\s*relative/); // from 'relative'
    expect(result.code).toMatch(/display:\s*flex/); // from 'flex'

    // TODO: Spacing utilities (px-4, py-2) and flex-1, overflow not generating yet
  });
});
