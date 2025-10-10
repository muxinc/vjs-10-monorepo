/**
 * Integration test: Compile simplified demo app skins
 *
 * Purpose: Validate compiler can handle demo app skins with simpler import patterns
 * These skins use ONLY features that work today (no arbitrary variants)
 *
 * Why demo skins?
 * - Simpler import mapping: @vjs-10/react → @vjs-10/html
 * - Avoid relative path complexity
 * - Self-contained test cases
 * - Baseline for arbitrary variant work (Phase 2)
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('compile Demo App Skins', () => {
  it('compiles frosted-simple skin (baseline without arbitrary variants)', async () => {
    const skinPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/examples/react-demo/src/skins/frosted-simple/MediaSkinDefault.tsx'
    );
    const stylesPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/examples/react-demo/src/skins/frosted-simple/styles.ts'
    );

    const skinSource = readFileSync(skinPath, 'utf-8');
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath: resolve(__dirname, '../fixtures/compiled/demo-frosted-simple.ts'),
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
        typescript: false,
        importMode: 'package', // Use package imports
      },
    };

    const result = await compileSkin(config);

    // Should compile successfully
    expect(result.code).toBeTruthy();
    expect(result.code.length).toBeGreaterThan(0);

    // Should have MediaSkin import
    expect(result.code).toContain('import { MediaSkin }');

    // Should have component imports from @vjs-10/html
    expect(result.code).toContain("from '@vjs-10/html'");

    // Should have icon imports from @vjs-10/html-icons (subpath imports)
    expect(result.code).toMatch(/@vjs-10\/html-icons\/media-\w+-icon/);

    // Should have base template inclusion
    expect(result.code).toContain('${MediaSkin.getTemplateHTML()}');

    // Should have MediaSkinDefault class
    expect(result.code).toContain('class MediaSkinDefault extends MediaSkin');

    // Should have custom element registration
    expect(result.code).toContain("customElements.define('media-skin-default', MediaSkinDefault)");

    // Should have getTemplateHTML function
    expect(result.code).toContain('export function getTemplateHTML()');

    // Should contain CSS (even if simplified)
    expect(result.code).toContain('<style>');

    // Should have kebab-case custom elements
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('<media-play-button');

    // Should NOT contain React imports (removed in transformation)
    expect(result.code).not.toContain('from \'react\'');
    expect(result.code).not.toContain('PropsWithChildren');

    // Should NOT contain styles import (CSS inlined)
    expect(result.code).not.toContain('from \'./styles\'');

    console.log('✅ Frosted-simple skin compiled successfully');
    console.log(`   Size: ${result.code.length} bytes`);
  });

  it('compiles toasted-simple skin (baseline without arbitrary variants)', async () => {
    const skinPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/examples/react-demo/src/skins/toasted-simple/MediaSkinToasted.tsx'
    );
    const stylesPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/examples/react-demo/src/skins/toasted-simple/styles.ts'
    );

    const skinSource = readFileSync(skinPath, 'utf-8');
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath: resolve(__dirname, '../fixtures/compiled/demo-toasted-simple.ts'),
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
        typescript: false,
        importMode: 'package', // Use package imports
      },
    };

    const result = await compileSkin(config);

    // Should compile successfully
    expect(result.code).toBeTruthy();
    expect(result.code.length).toBeGreaterThan(0);

    // Should have MediaSkin import
    expect(result.code).toContain('import { MediaSkin }');

    // Should have component imports from @vjs-10/html
    expect(result.code).toContain("from '@vjs-10/html'");

    // Should have icon imports from @vjs-10/html-icons (subpath imports)
    expect(result.code).toMatch(/@vjs-10\/html-icons\/media-\w+-icon/);

    // Should have base template inclusion
    expect(result.code).toContain('${MediaSkin.getTemplateHTML()}');

    // Should have MediaSkinToasted class
    expect(result.code).toContain('class MediaSkinToasted extends MediaSkin');

    // Should have custom element registration
    expect(result.code).toContain("customElements.define('media-skin-toasted', MediaSkinToasted)");

    // Should have getTemplateHTML function
    expect(result.code).toContain('export function getTemplateHTML()');

    // Should contain CSS (even if simplified)
    expect(result.code).toContain('<style>');

    // Should have kebab-case custom elements
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('<media-play-button');

    // Should NOT contain React imports (removed in transformation)
    expect(result.code).not.toContain('from \'react\'');
    expect(result.code).not.toContain('PropsWithChildren');

    // Should NOT contain styles import (CSS inlined)
    expect(result.code).not.toContain('from \'./styles\'');

    console.log('✅ Toasted-simple skin compiled successfully');
    console.log(`   Size: ${result.code.length} bytes`);
  });
});
