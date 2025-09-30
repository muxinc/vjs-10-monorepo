/**
 * Manual test: Try to compile MediaSkinDefault production skin
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

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

console.log('Attempting to compile MediaSkinDefault...\n');

try {
  const result = await compileSkin(config);
  console.log('✅ Compilation succeeded!\n');
  console.log('=== GENERATED CODE (first 100 lines) ===\n');
  console.log(result.code.split('\n').slice(0, 100).join('\n'));
  console.log('\n... (truncated)');
} catch (error) {
  console.error('❌ Compilation failed:');
  console.error(error);
}
