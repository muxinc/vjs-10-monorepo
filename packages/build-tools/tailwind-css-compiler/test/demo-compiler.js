const { TailwindCSSCompiler } = require('../dist/index.js');
const path = require('path');
const fs = require('fs');

async function runDemo() {
  // Create temp directory if it doesn't exist
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const outputDir = path.join(tempDir, 'demo-output');

  const inputFile = path.join(__dirname, 'fixtures/components/MediaSkinTailwind.tsx');
  console.log('📁 Input file:', inputFile);
  console.log('📁 File exists:', fs.existsSync(inputFile));

  const compiler = new TailwindCSSCompiler({
    outputDir,
    sources: [inputFile],
    generateVanilla: true,
    generateModules: true
  });

  console.log('🔄 Generating CSS with compiler...');

  try {
    await compiler.compile();
    console.log('✅ CSS generation completed!');

    // Read and display the generated CSS files
    const modulesFile = path.join(outputDir, 'MediaSkinTailwind.module.css');
    const vanillaFile = path.join(outputDir, 'MediaSkinTailwind.css');

    if (fs.existsSync(modulesFile)) {
      console.log('\n📄 CSS Modules output:');
      console.log('---------------------');
      console.log(fs.readFileSync(modulesFile, 'utf8').substring(0, 1500) + '...');
    }

    if (fs.existsSync(vanillaFile)) {
      console.log('\n📄 Vanilla CSS output:');
      console.log('---------------------');
      console.log(fs.readFileSync(vanillaFile, 'utf8').substring(0, 1500) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runDemo();