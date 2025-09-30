/**
 * Integration test: Compile MediaSkinDefault for E2E testing
 *
 * This test compiles the production skin and writes it to the E2E fixtures directory.
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('compile for E2E Testing', () => {
  it('compiles MediaSkinDefault to E2E fixtures', async () => {
    const skinPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/MediaSkinDefault.tsx'
    );
    const stylesPath = resolve(
      '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/styles.ts'
    );

    const skinSource = readFileSync(skinPath, 'utf-8');
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    // Use a path within the monorepo so relative paths work correctly
    const outputPath = resolve(__dirname, '../e2e/equivalence/fixtures/compiled/MediaSkinDefault.ts');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath,
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
      },
    };

    const result = await compileSkin(config);

    // Create browser-compatible version with stub dependencies
    const browserCode = `
// MediaSkinDefault - Compiled for E2E Testing
// Base class stub for browser testing
class MediaSkin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const constructor = this.constructor;
    if (this.shadowRoot && typeof constructor.getTemplateHTML === 'function') {
      this.shadowRoot.innerHTML = constructor.getTemplateHTML();
    }
  }
}

// Compiled web component (imports removed for browser use)
${result.code.replace(/^import .+\n/gm, '')}
`;

    // Write to E2E fixtures directory
    const outputDir = resolve(__dirname, '../e2e/equivalence/fixtures/compiled');
    mkdirSync(outputDir, { recursive: true });

    const browserOutputPath = resolve(outputDir, 'MediaSkinDefault.browser.js');
    writeFileSync(browserOutputPath, browserCode, 'utf-8');

    console.log(`✅ Compiled MediaSkinDefault for E2E testing`);
    console.log(`   Output: ${browserOutputPath}`);
    console.log(`   Size: ${browserCode.length} bytes`);
  });

  it('compiles MinimalTestSkin to E2E fixtures (Phase 2 package imports)', async () => {
    const skinPath = resolve(__dirname, '../e2e/fixtures/MinimalTestSkin.tsx');
    const stylesPath = resolve(__dirname, '../e2e/fixtures/styles.ts');

    const skinSource = readFileSync(skinPath, 'utf-8');
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    const outputPath = resolve(__dirname, '../e2e/equivalence/fixtures/compiled/MinimalTestSkin.ts');

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath,
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: resolve(__dirname, '../../../react/react'),
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: resolve(__dirname, '../../../html/html'),
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
        importMode: 'package', // Phase 2: Package imports
      },
    };

    const result = await compileSkin(config);

    // Create browser-compatible version with stub dependencies
    const browserCode = `
// MinimalTestSkin - Compiled for E2E Testing (Phase 2: Package Imports)
// Base class stub for browser testing
class MediaSkin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const constructor = this.constructor;
    if (this.shadowRoot && typeof constructor.getTemplateHTML === 'function') {
      this.shadowRoot.innerHTML = constructor.getTemplateHTML();
    }
  }

  static getTemplateHTML() {
    return '';
  }
}

// Stub web components for dependencies
class MediaContainer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<slot></slot>';
  }
}
class MediaPlayButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<slot></slot>';
  }
}
class MediaPlayIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '▶';
  }
}
class MediaPauseIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '⏸';
  }
}

// Register stubs
if (!customElements.get('media-container')) {
  customElements.define('media-container', MediaContainer);
}
if (!customElements.get('media-play-button')) {
  customElements.define('media-play-button', MediaPlayButton);
}
if (!customElements.get('media-play-icon')) {
  customElements.define('media-play-icon', MediaPlayIcon);
}
if (!customElements.get('media-pause-icon')) {
  customElements.define('media-pause-icon', MediaPauseIcon);
}

// Compiled web component (imports removed for browser use)
${result.code.replace(/^import .+\n/gm, '')}
`;

    // Write to E2E fixtures directory
    const outputDir = resolve(__dirname, '../e2e/equivalence/fixtures/compiled');
    mkdirSync(outputDir, { recursive: true });

    const browserOutputPath = resolve(outputDir, 'MinimalTestSkin.browser.js');
    writeFileSync(browserOutputPath, browserCode, 'utf-8');

    console.log(`✅ Compiled MinimalTestSkin for E2E testing (Phase 2)`);
    console.log(`   Output: ${browserOutputPath}`);
    console.log(`   Size: ${browserCode.length} bytes`);
    console.log(`   Import mode: package`);
  });
});
