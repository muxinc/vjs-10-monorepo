#!/usr/bin/env node

import { TailwindCSSCompiler } from './compiler.js';
import { CompilerConfig } from './types.js';
import { resolve } from 'path';

/**
 * CLI for the Tailwind CSS compiler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Default configuration
  const config: CompilerConfig = {
    sources: [
      'packages/react/**/*.tsx',
      'packages/react/**/*.ts',
      'examples/**/*.tsx',
      'examples/**/*.ts'
    ],
    outputDir: './dist/css',
    generateVanilla: true,
    generateModules: true
  };

  // Parse command line arguments
  let configPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--config':
      case '-c':
        configPath = args[++i];
        break;
      case '--output':
      case '-o':
        const outputValue = args[++i];
        if (outputValue) {
          config.outputDir = outputValue;
        }
        break;
      case '--sources':
      case '-s':
        const sourcesValue = args[++i];
        if (sourcesValue) {
          config.sources = sourcesValue.split(',');
        }
        break;
      case '--no-vanilla':
        config.generateVanilla = false;
        break;
      case '--no-modules':
        config.generateModules = false;
        break;
      case '--tailwind-config':
        const tailwindConfigValue = args[++i];
        if (tailwindConfigValue) {
          config.tailwindConfig = tailwindConfigValue;
        }
        break;
    }
  }

  // Load custom config if provided
  if (configPath) {
    try {
      const customConfig = require(resolve(configPath));
      Object.assign(config, customConfig);
    } catch (error) {
      console.error(`❌ Failed to load config from ${configPath}:`, error);
      process.exit(1);
    }
  }

  // Run the compiler
  try {
    const compiler = new TailwindCSSCompiler(config);
    await compiler.compile();
  } catch (error) {
    console.error('❌ Compilation failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📦 @vjs-10/tailwind-css-compiler

Usage: tailwind-css-compiler [options]

Options:
  --config, -c <path>       Path to config file
  --output, -o <dir>        Output directory (default: ./dist/css)
  --sources, -s <patterns>  Comma-separated source patterns
  --no-vanilla              Skip vanilla CSS generation
  --no-modules              Skip CSS modules generation
  --tailwind-config <path>  Path to tailwind config
  --help, -h                Show this help

Examples:
  tailwind-css-compiler
  tailwind-css-compiler --output ./build/css
  tailwind-css-compiler --sources "src/**/*.tsx,src/**/*.ts"
  tailwind-css-compiler --config ./compiler.config.js
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };