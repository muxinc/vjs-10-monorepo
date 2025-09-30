/**
 * Manual inspection: Check production skin output issues
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { readFileSync, writeFileSync } from 'node:fs';
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

const result = await compileSkin(config);

// Write full output to file for inspection
const outputPath = '/tmp/MediaSkinDefault-compiled.ts';
writeFileSync(outputPath, result.code, 'utf-8');
console.log(`✅ Full output written to: ${outputPath}\n`);

// Analyze issues
console.log('=== Issue Analysis ===\n');

// 1. Template literals in HTML
const templateLiterals = result.code.match(/class=\{`[^`]+`\}/g);
if (templateLiterals) {
  console.log(`1. Template literals in class attributes: ${templateLiterals.length} found`);
  console.log('   Examples:');
  templateLiterals.slice(0, 3).forEach((match) => console.log(`   - ${match}`));
}

// 2. JSX expressions in attributes
const jsxExpressions = result.code.match(/\w+=\{\d+\}/g);
if (jsxExpressions) {
  console.log(`\n2. JSX expressions in attributes: ${jsxExpressions.length} found`);
  console.log('   Examples:');
  jsxExpressions.slice(0, 3).forEach((match) => console.log(`   - ${match}`));
}

// 3. Empty JSX expressions
const emptyExpressions = result.code.match(/\{\}/g);
if (emptyExpressions) {
  console.log(`\n3. Empty JSX expressions: ${emptyExpressions.length} found`);
}

// 4. String attributes that should be preserved
const stringAttrs = result.code.match(/\w+="[^"]+"/g);
if (stringAttrs) {
  console.log(`\n4. String attributes (correct): ${stringAttrs.length} found`);
  console.log('   Examples:');
  stringAttrs.slice(0, 5).forEach((match) => console.log(`   - ${match}`));
}

console.log('\n✅ Analysis complete');
