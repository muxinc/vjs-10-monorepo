/**
 * Integration test: Attempt to compile MediaSkinDefault production skin
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('production Skin Compilation', () => {
  it('compiles MediaSkinDefault (exploratory)', async () => {
    const skinPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/MediaSkinDefault.tsx'
    );
    const stylesPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/styles.ts'
    );

    const skinSource = readFileSync(skinPath, 'utf-8');
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath: '/tmp/MediaSkinDefault.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/html/html',
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

    // This test is exploratory - we expect it to surface missing features
    const result = await compileSkin(config);

    // Basic validation
    expect(result.code).toContain('MediaSkinDefault');
    expect(result.code).toContain('media-container');

    // Find the HTML template section
    const lines = result.code.split('\n');

    // Log first 20 lines (should show imports)
    console.log('\n=== Generated Code (first 20 lines - imports) ===');
    console.log(lines.slice(0, 20).join('\n'));

    const styleEndIndex = lines.findIndex((l) => l.includes('</style>'));

    // Log HTML output (50 lines after styles)
    console.log('\n=== Generated HTML (50 lines starting from template) ===');
    console.log(lines.slice(styleEndIndex, styleEndIndex + 50).join('\n'));
  });
});
