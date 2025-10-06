#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import process from 'node:process';

import type { CompilerConfig } from './config/index.js';
import { getPipeline, getAvailablePipelines } from './pipelines/index.js';

function printUsage() {
  console.error('Usage: vjs-compiler <command> [options]');
  console.error('');
  console.error('Commands:');
  console.error('  compile <input-file>    Compile a single file');
  console.error('  build --config <file>   Build using config file');
  console.error('');
  console.error('Compile Options:');
  console.error('  --type <type>           Input type: skin | component (required)');
  console.error('  --format <format>       Output format: react | web-component (required)');
  console.error('  --css <strategy>        CSS strategy: inline | css-modules | tailwind (required)');
  console.error('  --out-dir <dir>         Output directory (required)');
  console.error('  --indent <number>       Starting indentation level (default: 0)');
  console.error('  --indent-size <number>  Spaces per indent level (default: 2)');
  console.error('');
  console.error('Build Options:');
  console.error('  --config <file>         Path to config file (default: vjs.config.js)');
  console.error('');
  console.error('Examples:');
  console.error('  vjs-compiler compile src/MediaSkin.tsx --type skin --format web-component --css inline --out-dir dist');
  console.error('  vjs-compiler build --config vjs.config.js');
  console.error('');
  console.error('Available pipelines:');
  const pipelines = getAvailablePipelines();
  for (const pipeline of pipelines) {
    console.error(`  - ${pipeline}`);
  }
}

interface ParsedArgs {
  command?: string;
  inputFile?: string;
  configFile?: string;
  type?: string;
  format?: string;
  css?: string;
  outDir?: string;
  indent?: number;
  indentSize?: number;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    indent: 0,
    indentSize: 2,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (!arg.startsWith('--') && !parsed.command) {
      parsed.command = arg;
      continue;
    }

    switch (arg) {
      case '--config': {
        const val = args[++i];
        if (val) parsed.configFile = val;
        break;
      }
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
      case '--indent': {
        const val = args[++i];
        if (val) parsed.indent = Number.parseInt(val, 10);
        break;
      }
      case '--indent-size': {
        const val = args[++i];
        if (val) parsed.indentSize = Number.parseInt(val, 10);
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

async function loadConfig(configPath: string): Promise<CompilerConfig> {
  const absPath = resolve(process.cwd(), configPath);
  try {
    const config = await import(absPath);
    return config.default || config;
  }
  catch (error) {
    throw new Error(`Failed to load config file: ${configPath}\n${error}`);
  }
}

async function compileCommand(args: ParsedArgs) {
  if (!args.inputFile) {
    console.error('Error: No input file specified');
    process.exit(1);
  }

  if (!args.type || !args.format || !args.css || !args.outDir) {
    console.error('Error: Missing required options: --type, --format, --css, --out-dir');
    printUsage();
    process.exit(1);
  }

  const config: CompilerConfig = {
    inputType: args.type as any,
    input: args.inputFile,
    outDir: args.outDir,
    outputFormat: args.format as any,
    cssStrategy: args.css as any,
    options: {
      ...(args.indent !== undefined && { indent: args.indent }),
      ...(args.indentSize !== undefined && { indentSize: args.indentSize }),
    },
  };

  try {
    const entryFile = resolve(process.cwd(), args.inputFile);
    const pipeline = getPipeline(config);

    console.error(`Compiling ${args.inputFile} using pipeline: ${pipeline.name}`);
    const result = await pipeline.compile(entryFile, config);

    // Write output files
    const outDir = resolve(process.cwd(), args.outDir);
    mkdirSync(outDir, { recursive: true });

    for (const file of result.files) {
      const outputPath = join(outDir, file.path);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, file.content, 'utf-8');
      console.error(`✓ ${file.path}`);
    }

    console.error(`\nCompiled successfully to ${args.outDir}`);
  }
  catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function buildCommand(args: ParsedArgs) {
  const configFile = args.configFile || 'vjs.config.js';

  try {
    console.error(`Loading config from ${configFile}...`);
    const config = await loadConfig(configFile);

    const inputs = Array.isArray(config.input) ? config.input : [config.input];
    const pipeline = getPipeline(config);

    console.error(`Using pipeline: ${pipeline.name}`);
    console.error(`Processing ${inputs.length} file(s)...\n`);

    const outDir = resolve(process.cwd(), config.outDir);
    mkdirSync(outDir, { recursive: true });

    for (const input of inputs) {
      const entryFile = resolve(process.cwd(), input);
      console.error(`Compiling ${input}...`);

      const result = await pipeline.compile(entryFile, config);

      for (const file of result.files) {
        const outputPath = join(outDir, file.path);
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, file.content, 'utf-8');
        console.error(`  ✓ ${file.path}`);
      }
    }

    console.error(`\nBuild completed successfully!`);
  }
  catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.command) {
    printUsage();
    process.exit(1);
  }

  switch (args.command) {
    case 'compile':
      await compileCommand(args);
      break;
    case 'build':
      await buildCommand(args);
      break;
    default:
      console.error(`Unknown command: ${args.command}`);
      printUsage();
      process.exit(1);
  }
}

main();
