#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import nested from 'postcss-nested';
import prefixSelector from 'postcss-prefix-selector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const inputFile = 'src/styles/vjs-input.css';
const tempFile = 'src/styles/vjs-temp.css';
const outputFile = 'src/styles/vjs.css';

console.log('🎨 Compiling VJS styles...');

try {
  // Step 1: Run Tailwind CLI
  console.log('  → Running Tailwind CSS compiler...');
  execSync(
    `npx @tailwindcss/cli -i ${inputFile} -o ${tempFile}`,
    { cwd: rootDir, stdio: 'inherit' },
  );

  // Step 2: Read compiled CSS
  const tempPath = join(rootDir, tempFile);
  const css = readFileSync(tempPath, 'utf-8');

  // Step 3: Post-process with PostCSS to scope selectors
  console.log('  → Scoping selectors to .vjs...');
  const result = await postcss([
    nested(),
    prefixSelector({
      prefix: '.vjs',
      transform(prefix, selector, prefixedSelector) {
        // this is supposed to happen automatically, but isn't... idk
        if (selector === 'body' || selector === 'html' || selector === ':root') {
          return prefix;
        } else if (selector === ':host') {
          return selector;
        } else {
          return prefixedSelector;
        }
      },
    }),
  ]).process(css, { from: tempFile, to: outputFile });

  // Step 3.5: For reasons I don't fully understand, we're getting duplicate .vjs classes
  //           e.g., .vjs .vjs or .vjs .vjs .vjs
  //           let's just regex them to oblivion
  result.css = result.css.replace(/(\.vjs\s+)+/g, '.vjs ');

  // Step 4: Write output
  const outputPath = join(rootDir, outputFile);
  writeFileSync(outputPath, result.css, 'utf-8');

  // Step 5: Clean up temp file
  if (existsSync(tempPath)) {
    unlinkSync(tempPath);
  }

  console.log(`✅ VJS styles compiled to ${outputFile}`);
} catch (error) {
  console.error('❌ Failed to compile VJS styles:', error.message);
  process.exit(1);
}
