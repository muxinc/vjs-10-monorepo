#!/usr/bin/env node
/**
 * VJS Compiler V2 CLI
 *
 * Provides command-line interface for the v2 compiler (compileSkin API)
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import process from 'node:process';

import { compileSkin } from './pipelines/compileSkin.js';
import type { CompileSkinConfig } from './types.js';

function printUsage() {
  console.error('VJS Compiler V2 CLI');
  console.error('');
  console.error('Usage: vjs-compiler compile <skin-file> [options]');
  console.error('');
  console.error('Required Options:');
  console.error('  --type <type>           Module type (currently only "skin" supported)');
  console.error('  --format <format>       Output format: react | web-component');
  console.error('  --css <strategy>        CSS strategy: inline | css-modules | tailwind');
  console.error('  --out-dir <dir>         Output directory');
  console.error('');
  console.error('Optional:');
  console.error('  --styles <file>         Styles file (defaults to styles.ts in same directory)');
  console.error('  --import-mode <mode>    Import mode: relative | package (default: relative)');
  console.error('  --selector <strategy>   Selector strategy: optimize | class-only (default: optimize)');
  console.error('  --package-mapping       Package mapping in format: source=target');
  console.error('                         (can be specified multiple times)');
  console.error('                         Example: --package-mapping @vjs-10/react=@vjs-10/html');
  console.error('');
  console.error('Examples:');
  console.error('  # Compile skin to web component with inline styles');
  console.error('  vjs-compiler compile src/MediaSkinDefault.tsx \\');
  console.error('    --type skin --format web-component --css inline --out-dir dist');
  console.error('');
  console.error('  # With package mappings for cross-package imports');
  console.error('  vjs-compiler compile src/MediaSkinDefault.tsx \\');
  console.error('    --type skin --format web-component --css inline --out-dir dist \\');
  console.error('    --import-mode package \\');
  console.error('    --package-mapping @vjs-10/react=@vjs-10/html \\');
  console.error('    --package-mapping @vjs-10/react-icons=@vjs-10/html-icons');
}

interface ParsedArgs {
  command?: string;
  inputFile?: string;
  type?: string;
  format?: string;
  css?: string;
  outDir?: string;
  stylesFile?: string;
  importMode?: string;
  selectorStrategy?: string;
  packageMappings: Map<string, string>;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    packageMappings: new Map(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (!arg.startsWith('--') && !parsed.command) {
      parsed.command = arg;
      continue;
    }

    switch (arg) {
      case '--type': {
        const val = args[++i];
        if (val) parsed.type = val;
        break;
      }
      case '--format': {
        const val = args[++i];
        if (val) parsed.format = val;
        break;
      }
      case '--css': {
        const val = args[++i];
        if (val) parsed.css = val;
        break;
      }
      case '--out-dir': {
        const val = args[++i];
        if (val) parsed.outDir = val;
        break;
      }
      case '--styles': {
        const val = args[++i];
        if (val) parsed.stylesFile = val;
        break;
      }
      case '--import-mode': {
        const val = args[++i];
        if (val) parsed.importMode = val;
        break;
      }
      case '--selector': {
        const val = args[++i];
        if (val) parsed.selectorStrategy = val;
        break;
      }
      case '--package-mapping': {
        const val = args[++i];
        if (val) {
          const [source, target] = val.split('=');
          if (source && target) {
            parsed.packageMappings.set(source, target);
          }
        }
        break;
      }
      default:
        if (!arg.startsWith('--') && parsed.command === 'compile' && !parsed.inputFile) {
          parsed.inputFile = arg;
        }
    }
  }

  return parsed;
}

async function compileCommand(args: ParsedArgs) {
  // Validate required arguments
  if (!args.inputFile) {
    console.error('Error: No input file specified');
    printUsage();
    process.exit(1);
  }

  if (!args.type || !args.format || !args.css || !args.outDir) {
    console.error('Error: Missing required options: --type, --format, --css, --out-dir');
    printUsage();
    process.exit(1);
  }

  if (args.type !== 'skin') {
    console.error('Error: Only --type skin is currently supported');
    process.exit(1);
  }

  if (args.format !== 'web-component') {
    console.error('Error: Only --format web-component is currently supported');
    process.exit(1);
  }

  try {
    // Resolve paths
    const skinPath = resolve(process.cwd(), args.inputFile);

    // Default styles path: look for styles.ts in same directory
    const skinDir = dirname(skinPath);
    const defaultStylesPath = join(skinDir, 'styles.ts');
    const stylesPath = args.stylesFile
      ? resolve(process.cwd(), args.stylesFile)
      : defaultStylesPath;

    // Read source files
    console.error(`Reading ${args.inputFile}...`);
    const skinSource = readFileSync(skinPath, 'utf-8');

    console.error(`Reading styles from ${basename(stylesPath)}...`);
    const stylesSource = readFileSync(stylesPath, 'utf-8');

    // Generate output path
    const skinFilename = basename(skinPath, extname(skinPath));
    const outputExt = '.ts'; // V2 always outputs TypeScript
    const outputFilename = `${skinFilename.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}${outputExt}`;
    const outputPath = join(resolve(process.cwd(), args.outDir), outputFilename);

    // Build config
    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath,
        stylesPath,
        outputPath,
        ...(args.packageMappings.size > 0 && {
          packageMappings: Object.fromEntries(args.packageMappings),
        }),
        // For relative imports, provide a default target package root (current working directory)
        // This allows CLI usage outside of monorepo context
        ...((!args.importMode || args.importMode === 'relative') && {
          targetPackage: {
            name: '@local/package',
            rootPath: process.cwd(),
          },
        }),
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: args.css as any,
        typescript: true,
        importMode: (args.importMode as any) || 'relative',
        selectorStrategy: (args.selectorStrategy as any) || 'optimize',
      },
    };

    console.error('\nCompiling...');
    console.error(`  Input:  ${args.inputFile}`);
    console.error(`  Output: ${outputFilename}`);
    console.error(`  CSS:    ${args.css}`);
    if (args.importMode) {
      console.error(`  Import: ${args.importMode}`);
    }
    if (args.selectorStrategy && args.selectorStrategy !== 'optimize') {
      console.error(`  Selector: ${args.selectorStrategy}`);
    }
    if (args.packageMappings.size > 0) {
      console.error('  Package mappings:');
      for (const [source, target] of args.packageMappings) {
        console.error(`    ${source} → ${target}`);
      }
    }

    const result = await compileSkin(config);

    // Write output
    const outDir = resolve(process.cwd(), args.outDir);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outputPath, result.code, 'utf-8');

    console.error(`\n✅ Compiled successfully`);
    console.error(`   Output: ${outputPath}`);
    console.error(`   Size: ${result.code.length} bytes`);
  } catch (error) {
    console.error('\n❌ Compilation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.command || args.command === 'help' || args.command === '--help' || args.command === '-h') {
    printUsage();
    process.exit(args.command ? 0 : 1);
  }

  switch (args.command) {
    case 'compile':
      await compileCommand(args);
      break;
    default:
      console.error(`Unknown command: ${args.command}`);
      printUsage();
      process.exit(1);
  }
}

main();
