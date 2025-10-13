/**
 * Compile test skins from React to Web Components
 *
 * Directly uses the compiler to transform E2E test skins.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileSkin } from '@vjs-10/vjs-compiler';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔨 Compiling minimal E2E test skin...\n');

async function compileSkins() {
  // Compile 01-minimal skin
  const skinPath = resolve(__dirname, '../src/skins/01-minimal/MediaSkinMinimal.tsx');
  const outputPath = resolve(__dirname, '../src/compiled/01-minimal.js');

  const skinSource = readFileSync(skinPath, 'utf-8');

  const config = {
    skinSource,
    stylesSource: undefined, // Inline styles
    paths: {
      skinPath,
      stylesPath: undefined,
      outputPath,
      // External compilation: no sourcePackage/targetPackage needed
      packageMappings: {
        '@vjs-10/react': '@vjs-10/html',
        '@vjs-10/react-icons': '@vjs-10/html-icons',
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
      importMode: 'package',
    },
  };

  try {
    const result = await compileSkin(config);

    // Write output
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, result.code, 'utf-8');

    console.log('✅ Minimal E2E skin compiled successfully');
    console.log(`   Size: ${result.code.length} bytes`);
    console.log(`   Output: ${outputPath}\n`);
  } catch (error) {
    console.error('❌ Compilation failed:', error.message);
    process.exit(1);
  }
}

compileSkins().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
