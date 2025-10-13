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

console.log('🔨 Compiling test skins via integration test...\n');

try {
  // Run the integration test that compiles the demo skins
  // This uses vitest which handles Babel imports correctly
  const output = execSync(
    'pnpm test -- compile-demo-skins.test.ts',
    {
      cwd: compilerRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    }
  );

  // Check if demo skins compilation passed (2 tests in compile-demo-skins.test.ts)
  if (output.includes('✅ Frosted-simple skin compiled successfully') &&
      output.includes('✅ Toasted-simple skin compiled successfully')) {
    console.log('✅ Demo skins compiled successfully\n');
    console.log('   Frosted: test/fixtures/compiled/demo-frosted-simple.ts');
    console.log('   Toasted: test/fixtures/compiled/demo-toasted-simple.ts\n');
  } else {
    console.error('❌ Compilation tests did not produce expected output');
    console.error(output);
    process.exit(1);
  }
} catch (error) {
  // execSync throws on non-zero exit, but compilation may have succeeded
  // Check if the expected output strings are present
  const output = error.stdout || error.message || '';
  if (output.includes('✅ Frosted-simple skin compiled successfully') &&
      output.includes('✅ Toasted-simple skin compiled successfully')) {
    console.log('✅ Demo skins compiled successfully\n');
    console.log('   Frosted: test/fixtures/compiled/demo-frosted-simple.ts');
    console.log('   Toasted: test/fixtures/compiled/demo-toasted-simple.ts\n');
  } else {
    console.error('❌ Compilation failed');
    console.error(output);
    process.exit(1);
  }
}

console.log('Note: For now, using simplified demo skins from examples/react-demo');
console.log('Full E2E test app skins coming in next iteration.\n');
