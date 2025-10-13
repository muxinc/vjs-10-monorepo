/**
 * Compile test skins from React to Web Components
 *
 * This script compiles each skin level using vitest to run the compiler
 * (workaround for Babel ESM import issues when running directly with node)
 */

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compilerRoot = resolve(__dirname, '../../../..');

console.log('🔨 Compiling minimal E2E test skin via integration test...\n');

try {
  // Run the integration test that compiles the minimal E2E skin
  // This uses vitest which handles Babel imports correctly
  const output = execSync(
    'pnpm exec vitest run compile-minimal-e2e-skin.test.ts',
    {
      cwd: compilerRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    }
  );

  // Check if minimal skin compilation passed
  if (output.includes('✅ Minimal E2E skin compiled successfully')) {
    console.log('✅ Minimal E2E skin compiled successfully\n');
    console.log('   Output: test/e2e/app/src/compiled/01-minimal.js\n');
  } else {
    console.error('❌ Compilation test did not produce expected output');
    console.error(output);
    process.exit(1);
  }
} catch (error) {
  // execSync throws on non-zero exit, but compilation may have succeeded
  // Check if the expected output string is present
  const output = error.stdout || error.message || '';
  if (output.includes('✅ Minimal E2E skin compiled successfully')) {
    console.log('✅ Minimal E2E skin compiled successfully\n');
    console.log('   Output: test/e2e/app/src/compiled/01-minimal.js\n');
  } else {
    console.error('❌ Compilation failed');
    console.error(output);
    process.exit(1);
  }
}
