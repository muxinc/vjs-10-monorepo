/**
 * Simple script to compile MediaSkinDefault for E2E testing
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileSkin } from './dist/pipelines/compileSkin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const skinPath =
    '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/MediaSkinDefault.tsx';
  const stylesPath =
    '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/styles.ts';

  console.log('Reading source files...');
  const skinSource = readFileSync(skinPath, 'utf-8');
  const stylesSource = readFileSync(stylesPath, 'utf-8');

  const outputDir = resolve(__dirname, 'test/e2e/equivalence/fixtures/compiled');
  mkdirSync(outputDir, { recursive: true });

  const config = {
    skinSource,
    stylesSource,
    paths: {
      skinPath,
      stylesPath,
      outputPath: resolve(outputDir, 'MediaSkinDefault.js'),
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

  console.log('Compiling MediaSkinDefault...');
  const result = await compileSkin(config);

  // Create browser-compatible version
  const browserCode = `
// MediaSkinDefault - Compiled for E2E Testing
// Base class stub
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

${result.code.replace(/^import .+\n/gm, '')}
`;

  const outputPath = resolve(outputDir, 'MediaSkinDefault.browser.js');
  writeFileSync(outputPath, browserCode, 'utf-8');

  console.log(`✅ Compiled successfully!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${browserCode.length} bytes`);
}

main().catch(console.error);
