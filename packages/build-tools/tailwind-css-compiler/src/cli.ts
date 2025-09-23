#!/usr/bin/env node
import type { CompilerConfig } from './types.js';

import { resolve } from 'path';

import { TailwindCSSCompiler } from './compiler.js';
import { createFileWriterCallback, createConsoleOutputCallback } from './side-effects.js';

/**
 * CLI for the Tailwind CSS compiler
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Default configuration
  const config: CompilerConfig = {
    sources: ['packages/react/**/*.tsx', 'packages/react/**/*.ts', 'examples/**/*.tsx', 'examples/**/*.ts'],
    outputDir: './dist/css',
    generateVanilla: true,
    generateModules: true,
  };

  // Parse command line arguments
  let configPath: string | undefined;
  let outputToStdout = false;

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
      case '--stdout':
        outputToStdout = true;
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
    // Choose output callback based on CLI options
    const outputCallback = outputToStdout
      ? createConsoleOutputCallback(config.generateVanilla, config.generateModules)
      : createFileWriterCallback(config.outputDir);

    const compiler = new TailwindCSSCompiler(config, outputCallback);
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
  --stdout                  Output CSS to stdout instead of files
  --help, -h                Show this help

Examples:
  tailwind-css-compiler
  tailwind-css-compiler --output ./build/css
  tailwind-css-compiler --sources "src/**/*.tsx,src/**/*.ts"
  tailwind-css-compiler --config ./compiler.config.js
  tailwind-css-compiler --stdout > output.css
`);
}

// Run if called directly (ESM version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
