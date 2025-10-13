/**
 * Integration test: Compile minimal E2E baseline skin
 *
 * Purpose: Establish absolute minimum viable compilation for E2E validation
 *
 * This test compiles the simplest possible skin:
 * - Single PlayButton with icons
 * - Inline Tailwind classes (no separate styles file)
 * - No hover states, no data attributes, no complex variants
 * - Defined in E2E app fixtures (not in react package)
 *
 * Why this skin?
 * - Complete control over input (not dependent on main react package)
 * - Simplest possible baseline for validation
 * - Can iterate without affecting production code
 * - Clear success criteria: if this doesn't work, nothing will
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('compile Minimal E2E Skin', () => {
  it('compiles 01-minimal skin (absolute baseline)', async () => {
    const skinPath = resolve(
      __dirname,
      '../e2e/app/src/skins/01-minimal/MediaSkinMinimal.tsx'
    );

    const skinSource = readFileSync(skinPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource: undefined, // No separate styles file - everything is inline
      paths: {
        skinPath,
        stylesPath: undefined,
        outputPath: resolve(__dirname, '../e2e/app/src/compiled/01-minimal.js'),
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
        importMode: 'package',
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

    // Should have icon imports
    expect(result.code).toMatch(/@vjs-10\/html-icons/);

    // Should have base template inclusion
    expect(result.code).toContain('${MediaSkin.getTemplateHTML()}');

    // Should have MediaSkinMinimal class
    expect(result.code).toContain('class MediaSkinMinimal extends MediaSkin');

    // Should have custom element registration
    expect(result.code).toContain("customElements.define('media-skin-minimal', MediaSkinMinimal)");

    // Should have getTemplateHTML function
    expect(result.code).toContain('export function getTemplateHTML()');

    // Should contain CSS
    expect(result.code).toContain('<style>');

    // Should have kebab-case custom elements
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('<media-play-button');

    // Should have both icons
    expect(result.code).toContain('<media-play-icon');
    expect(result.code).toContain('<media-pause-icon');

    // Should NOT contain React imports
    expect(result.code).not.toContain('from \'react\'');
    expect(result.code).not.toContain('PropsWithChildren');

    // Should NOT contain JSX syntax in HTML
    expect(result.code).not.toMatch(/class=\{/);
    expect(result.code).not.toMatch(/className=\{/);

    // Write output to disk for E2E app to use
    mkdirSync(dirname(config.paths.outputPath), { recursive: true });
    writeFileSync(config.paths.outputPath, result.code, 'utf-8');

    console.log('✅ Minimal E2E skin compiled successfully');
    console.log(`   Size: ${result.code.length} bytes`);
    console.log(`   Output: ${config.paths.outputPath}`);
  });
});
