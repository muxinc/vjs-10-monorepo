/**
 * E2E Test: Compile MinimalTestSkin
 *
 * Purpose: Validate import transformations with external test skin
 *
 * This test validates:
 * 1. @vjs-10/react → @vjs-10/html component imports
 * 2. @vjs-10/react-icons → @vjs-10/html-icons imports (with side-effect registration)
 * 3. Relative path calculation from external location
 * 4. Generated code is valid TypeScript
 * 5. CSS generation (minimal validation)
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('e2E: Compile MinimalTestSkin', () => {
  it('compiles external test skin with @vjs-10 scoped imports (relative paths)', async () => {
    const skinPath = join(__dirname, 'fixtures/MinimalTestSkin.tsx');
    const stylesPath = join(__dirname, 'fixtures/styles.ts');
    const outputPath = join(__dirname, 'fixtures/compiled/MinimalTestSkin.ts');

    const skinSource = await readFile(skinPath, 'utf-8');
    const stylesSource = await readFile(stylesPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath,
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: join(__dirname, '../../../../react/react'),
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: join(__dirname, '../../../../html/html'),
        },
      },
      moduleType: 'skin',
      input: { format: 'react', typescript: true },
      output: { format: 'web-component', css: 'inline', typescript: true },
    };

    const result = await compileSkin(config);

    // Validation Level 1: Syntactic Validity
    expect(result.code).toBeTruthy();
    expect(result.code.length).toBeGreaterThan(100);

    // Should have valid imports (not absolute paths)
    // Note: V2 compiler uses relative paths, not @vjs-10 scoped imports
    expect(result.code).toMatch(/import.*media-skin/);
    expect(result.code).toMatch(/import.*media-play-button/);
    expect(result.code).toMatch(/import.*media-container/);
    expect(result.code).not.toMatch(/import.*\/Users\//); // No absolute paths

    // Should transform MediaContainer
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('</media-container>');

    // Should transform PlayButton
    expect(result.code).toContain('<media-play-button');
    expect(result.code).toContain('</media-play-button>');

    // Should have icon imports (side-effect imports for WC registration)
    expect(result.code).toMatch(/import.*media-play-icon/);
    expect(result.code).toMatch(/import.*media-pause-icon/);

    // Should have base template
    expect(result.code).toContain('MediaSkin.getTemplateHTML()');

    // Should have class definition
    expect(result.code).toContain('class MinimalTestSkin extends MediaSkin');

    // Should have custom element registration
    expect(result.code).toContain('customElements.define');

    // Should generate some CSS
    expect(result.code).toMatch(/<style>/);
    expect(result.code).toMatch(/<\/style>/);

    // Log the generated code for manual inspection
    console.log('\n=== Generated MinimalTestSkin (Relative Paths) ===\n');
    console.log(result.code);
    console.log('\n=================================\n');
  });

  it('compiles external test skin with package imports (Phase 2)', async () => {
    const skinPath = join(__dirname, 'fixtures/MinimalTestSkin.tsx');
    const stylesPath = join(__dirname, 'fixtures/styles.ts');
    const outputPath = join(__dirname, 'fixtures/compiled/MinimalTestSkin-package.ts');

    const skinSource = await readFile(skinPath, 'utf-8');
    const stylesSource = await readFile(stylesPath, 'utf-8');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath,
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: join(__dirname, '../../../../react/react'),
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: join(__dirname, '../../../../html/html'),
        },
        // Phase 2.2: Package mappings for multi-package discovery
        packageMappings: {
          '@vjs-10/react': '@vjs-10/html',
          '@vjs-10/react-icons': '@vjs-10/html-icons',
        },
      },
      moduleType: 'skin',
      input: { format: 'react', typescript: true },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
        importMode: 'package', // Phase 2: Package imports
      },
    };

    const result = await compileSkin(config);

    // Validation Level 1: Syntactic Validity
    expect(result.code).toBeTruthy();
    expect(result.code.length).toBeGreaterThan(100);

    // Should have package imports (Phase 2)
    expect(result.code).toMatch(/import.*@vjs-10\/html/);
    expect(result.code).toMatch(/import.*@vjs-10\/html-icons/);
    expect(result.code).not.toMatch(/import.*\/\.\.\//); // No relative paths
    expect(result.code).not.toMatch(/import.*\/Users\//); // No absolute paths

    // Should have MediaSkin named import from package
    expect(result.code).toContain("import { MediaSkin } from '@vjs-10/html'");

    // Phase 2.1: Components use named-from-main strategy
    // Discovery found that @vjs-10/html exports components from main package
    // So we import the package once, not individual component subpaths
    expect(result.code).toContain("import '@vjs-10/html'");

    // Phase 2.1: Icons also use named-from-main strategy
    // Discovery found that @vjs-10/html-icons exports icons from main package
    expect(result.code).toContain("import '@vjs-10/html-icons'");

    // Should NOT have subpath imports (those don't exist in package.json)
    expect(result.code).not.toMatch(/@vjs-10\/html\/components\/media-container/);
    expect(result.code).not.toMatch(/@vjs-10\/html\/components\/media-play-button/);
    expect(result.code).not.toMatch(/@vjs-10\/html-icons\/media-play-icon/);
    expect(result.code).not.toMatch(/@vjs-10\/html-icons\/media-pause-icon/);

    // Should transform JSX correctly
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('</media-container>');
    expect(result.code).toContain('<media-play-button');
    expect(result.code).toContain('</media-play-button>');

    // Should have base template
    expect(result.code).toContain('MediaSkin.getTemplateHTML()');

    // Should have class definition
    expect(result.code).toContain('class MinimalTestSkin extends MediaSkin');

    // Should have custom element registration
    expect(result.code).toContain('customElements.define');

    // Should generate CSS
    expect(result.code).toMatch(/<style>/);
    expect(result.code).toMatch(/<\/style>/);

    // Log the generated code for manual inspection
    console.log('\n=== Generated MinimalTestSkin (Package Imports) ===\n');
    console.log(result.code.split('\n').slice(0, 15).join('\n')); // First 15 lines (imports)
    console.log('\n=================================\n');
  });
});
