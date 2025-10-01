#!/usr/bin/env node

import { readFileSync } from 'fs';
import { compileSkinToHTML } from './index.js';

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: jsx-to-html <input-file.tsx>');
    console.error('');
    console.error('Options:');
    console.error('  --indent <number>      Starting indentation level (default: 0)');
    console.error('  --indent-size <number> Spaces per indent level (default: 2)');
    process.exit(1);
  }

  let inputFile: string | null = null;
  let indent = 0;
  let indentSize = 2;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) continue;

    if (arg === '--indent' && i + 1 < args.length) {
      const nextArg = args[i + 1];
      if (nextArg) {
        indent = parseInt(nextArg, 10);
        i++;
      }
    } else if (arg === '--indent-size' && i + 1 < args.length) {
      const nextArg = args[i + 1];
      if (nextArg) {
        indentSize = parseInt(nextArg, 10);
        i++;
      }
    } else if (!arg.startsWith('--')) {
      inputFile = arg;
    }
  }

  if (!inputFile) {
    console.error('Error: No input file specified');
    process.exit(1);
  }

  try {
    // Read the input file
    const sourceCode = readFileSync(inputFile, 'utf-8');

    // Compile skin to HTML module
    const module = compileSkinToHTML(sourceCode, {
      serializeOptions: { indent, indentSize },
    });

    if (module === null) {
      console.error('Error: Could not compile skin component');
      process.exit(1);
    }

    // Output the module
    console.log(module);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
