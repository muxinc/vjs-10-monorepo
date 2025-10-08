/**
 * Integration test for Phase 1: Basic JSX + Import transformation
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

describe('Phase 1: Basic JSX + Import Transformation', () => {
  it('compiles minimal skin component', () => {
    // Read fixture files
    const skinSource = readFileSync(join(fixturesDir, 'minimal-skin.tsx'), 'utf-8');

    // Setup compilation config
    const config: CompileSkinConfig = {
      skinSource,
      stylesSource: '', // Not used in Phase 1
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
    const result = compileSkin(config);

    // Validate result structure
    expect(result.code).toBeTruthy();
    expect(result.componentName).toBe('MinimalSkin');
    expect(result.tagName).toBe('minimal-skin');

    // Validate imports transformation
    expect(result.code).toContain("import '../../../components/media-container");
    expect(result.code).toContain("import '../../../components/media-play-button");
    expect(result.code).not.toContain('react');
    expect(result.code).not.toContain('styles');

    // Validate JSX transformation
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('<media-play-button');
    expect(result.code).toContain('<slot');
    expect(result.code).not.toContain('className');

    // Validate class structure
    expect(result.code).toContain('export class MinimalSkin extends MediaSkin');
    expect(result.code).toContain('static getTemplateHTML = getTemplateHTML');
    expect(result.code).toContain('export function getTemplateHTML()');

    // Validate self-registration
    expect(result.code).toContain("if (!customElements.get('minimal-skin'))");
    expect(result.code).toContain("customElements.define('minimal-skin', MinimalSkin)");

    // Validate no CSS in Phase 1
    expect(result.code).toContain('/* Empty for now - Phase 2 will add CSS */');
  });

  it('handles nested JSX elements', () => {
    const skinSource = `
      import { MediaContainer, PlayButton, VolumeButton } from '@vjs-10/react';

      export default function NestedSkin({ children }) {
        return (
          <MediaContainer>
            {children}
            <div className="controls">
              <div className="playback">
                <PlayButton />
                <VolumeButton />
              </div>
            </div>
          </MediaContainer>
        );
      }
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource: '',
      paths: {
        skinPath: '/packages/react/react/src/skins/nested/MediaSkinNested.tsx',
        stylesPath: '/packages/react/react/src/skins/nested/styles.ts',
        outputPath: '/packages/html/html/src/skins/compiled/inline/media-skin-nested.ts',
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

    const result = compileSkin(config);

    // Validate nested structure preserved
    expect(result.code).toContain('<media-container');
    expect(result.code).toContain('<div class="controls">');
    expect(result.code).toContain('<div class="playback">');
    expect(result.code).toContain('<media-play-button');
    expect(result.code).toContain('<media-volume-button');

    // Validate all imports present
    expect(result.code).toContain('media-container');
    expect(result.code).toContain('media-play-button');
    expect(result.code).toContain('media-volume-button');
  });

  it('transforms className to class', () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';

      export default function ClassNameSkin() {
        return (
          <MediaContainer className="container">
            <div className="controls">
              <button className="play-button">Play</button>
            </div>
          </MediaContainer>
        );
      }
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource: '',
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

    const result = compileSkin(config);

    // Validate className → class transformation
    expect(result.code).not.toContain('className');
    expect(result.code).toContain('class="container"');
    expect(result.code).toContain('class="controls"');
    expect(result.code).toContain('class="play-button"');
  });

  it('replaces {children} with <slot>', () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';

      export default function SlotSkin({ children }) {
        return (
          <MediaContainer>
            {children}
            <div>Controls</div>
          </MediaContainer>
        );
      }
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource: '',
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

    const result = compileSkin(config);

    // Validate {children} → <slot> transformation
    expect(result.code).toContain('<slot name="media" slot="media"></slot>');
    expect(result.code).not.toContain('{children}');
  });
});
