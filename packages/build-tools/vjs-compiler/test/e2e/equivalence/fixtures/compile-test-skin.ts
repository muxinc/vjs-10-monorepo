/**
 * Script to compile MediaSkinDefault for E2E equivalence testing
 */

import type { CompileSkinConfig } from '../../../../src/types.js';

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileSkin } from '../../../../src/pipelines/compileSkin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function compileTestSkin() {
  const skinPath = resolve(
    '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/MediaSkinDefault.tsx'
  );
  const stylesPath = resolve(
    '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/styles.ts'
  );

  const skinSource = readFileSync(skinPath, 'utf-8');
  const stylesSource = readFileSync(stylesPath, 'utf-8');

  const outputPath = resolve(__dirname, 'compiled/MediaSkinDefault.js');

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
      typescript: false, // Output as JS for direct browser use
    },
  };

  console.log('Compiling MediaSkinDefault for E2E testing...');
  const result = await compileSkin(config);

  // Write output
  writeFileSync(outputPath, result.code, 'utf-8');
  console.log(`✅ Compiled to: ${outputPath}`);
  console.log(`   ${result.code.length} bytes`);

  // Also write a browser-compatible version with removed imports
  const browserCode = result.code
    // Remove all imports for now (we'll mock the dependencies)
    .replace(/^import .+\n/gm, '')
    // Add a simple stub for missing dependencies
    .replace(
      /^/,
      `
// Stub dependencies for E2E testing
class MediaSkin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot && typeof this.constructor.getTemplateHTML === 'function') {
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML();
    }
  }
}

`
    );

  const browserOutputPath = resolve(__dirname, 'compiled/MediaSkinDefault.browser.js');
  writeFileSync(browserOutputPath, browserCode, 'utf-8');
  console.log(`✅ Browser version: ${browserOutputPath}`);
}

compileTestSkin().catch(console.error);
