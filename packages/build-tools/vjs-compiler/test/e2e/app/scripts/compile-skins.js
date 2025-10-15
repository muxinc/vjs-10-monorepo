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

console.log('🔨 Compiling E2E test skins...\n');

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
  // Compile all test skins in progression order
  await compileSingleSkin('00-structural', 'MediaSkinStructural');
  await compileSingleSkin('01-minimal', 'MediaSkinMinimal');
  await compileSingleSkin('02-interactive', 'MediaSkinInteractive');
  await compileSingleSkin('03-hover', 'MediaSkinHover');
  await compileSingleSkin('04-arbitrary', 'MediaSkinArbitrary');
  await compileSingleSkin('05-responsive', 'MediaSkinResponsiveSimple');
  await compileSingleSkin('06-combined', 'MediaSkinCombined');
  await compileSingleSkin('07-color-opacity', 'MediaSkinColorOpacity');
  await compileSingleSkin('08-before-after', 'MediaSkinBeforeAfter');
  await compileSingleSkin('09-has-selector', 'MediaSkinHasSelector');
  await compileSingleSkin('10-named-groups', 'MediaSkinNamedGroups');
  await compileSingleSkin('11-aria-states', 'MediaSkinAriaStates');
  await compileSingleSkin('12-container-queries', 'MediaSkinContainerQueries');
  // Note: 07-semantic-colors is intentionally excluded (documents known limitation)
}

compileSkins().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
