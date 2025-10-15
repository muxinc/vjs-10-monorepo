/**
 * Compile test skins from React to Web Components
 *
 * Automatically discovers and compiles all skins in src/skins/
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileSkin } from '@vjs-10/vjs-compiler';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKINS_DIR = resolve(__dirname, '../src/skins');

console.log('🔨 Compiling E2E test skins...\n');

/**
 * Convert skin directory name to component name
 * Examples:
 *   jsx-single-style-key → MediaSkinJSXSingleStyleKey
 *   hover-pseudo-class → MediaSkinHoverPseudoClass
 *   production → MediaSkinProduction
 */
function skinDirToComponentName(dirName) {
  // Special case: production skin
  if (dirName === 'production') {
    return 'MediaSkinProduction';
  }

  // Split on hyphens and capitalize each word
  const words = dirName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );

  return `MediaSkin${words.join('')}`;
}

/**
 * Compile a single test skin
 */
async function compileSingleSkin(skinName, skinFileName) {
  const skinPath = resolve(__dirname, `../src/skins/${skinName}/${skinFileName}.tsx`);
  const stylesPath = resolve(__dirname, `../src/skins/${skinName}/styles.ts`);
  const outputPath = resolve(__dirname, `../src/compiled/${skinName}.js`);

  const skinSource = readFileSync(skinPath, 'utf-8');

  // Try to load styles.ts if it exists
  let stylesSource;
  try {
    stylesSource = readFileSync(stylesPath, 'utf-8');
  } catch (error) {
    // Styles file doesn't exist - use undefined
    stylesSource = undefined;
  }

  const config = {
    skinSource,
    stylesSource,
    paths: {
      skinPath,
      stylesPath: stylesSource ? stylesPath : undefined,
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
      // Use class-only strategy for simpler testing (all style keys become class selectors)
      // This avoids element selector complexity and lets us focus on Tailwind compilation
      selectorStrategy: 'class-only',
    },
  };

  try {
    const result = await compileSkin(config);

    // Write output
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, result.code, 'utf-8');

    console.log(`✅ ${skinName} compiled successfully`);
    console.log(`   Size: ${result.code.length} bytes`);
    console.log(`   Output: ${outputPath}\n`);
  } catch (error) {
    console.error(`❌ ${skinName} compilation failed:`, error.message);
    throw error;
  }
}

async function compileSkins() {
  // Auto-discover all skin directories
  const skinDirs = readdirSync(SKINS_DIR)
    .filter(name => {
      const fullPath = resolve(SKINS_DIR, name);
      return statSync(fullPath).isDirectory();
    })
    .sort();

  console.log(`Found ${skinDirs.length} skins to compile\n`);

  let successCount = 0;
  let failCount = 0;

  // Compile each skin
  for (const skinDir of skinDirs) {
    // Find the actual TSX file instead of inferring the name
    const skinDirPath = resolve(SKINS_DIR, skinDir);
    const tsxFiles = readdirSync(skinDirPath).filter(f => f.endsWith('.tsx'));

    if (tsxFiles.length === 0) {
      console.error(`❌ ${skinDir}: No .tsx file found`);
      failCount++;
      continue;
    }

    if (tsxFiles.length > 1) {
      console.error(`❌ ${skinDir}: Multiple .tsx files found: ${tsxFiles.join(', ')}`);
      failCount++;
      continue;
    }

    const componentName = tsxFiles[0].replace('.tsx', '');

    try {
      await compileSingleSkin(skinDir, componentName);
      successCount++;
    } catch (error) {
      console.error(`\n❌ Failed to compile ${skinDir}:`, error.message);
      failCount++;
      // Continue with other skins instead of failing completely
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully compiled: ${successCount}/${skinDirs.length} skins`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}/${skinDirs.length} skins`);
  }
  console.log('='.repeat(60));
}

compileSkins().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
