import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

import type { CompilationOutput } from './core-compiler.js';

/**
 * Callback for handling compilation output
 */
export type OutputCallback = (output: CompilationOutput) => void | Promise<void>;

/**
 * Side effect callback that writes CSS output to files
 */
export function createFileWriterCallback(
  outputDir: string,
  vanillaFilename: string = 'vanilla.css',
  modulesFilename: string = 'modules.css'
): OutputCallback {
  return (output: CompilationOutput) => {
    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true });

    if (output.vanilla && output.stats.vanillaGenerated) {
      const vanillaPath = `${outputDir}/${vanillaFilename}`;
      writeFileSync(vanillaPath, output.vanilla);
      console.log(`✅ Generated vanilla CSS: ${vanillaPath}`);
    }

    if (output.modules && output.stats.modulesGenerated) {
      const modulesPath = `${outputDir}/${modulesFilename}`;
      writeFileSync(modulesPath, output.modules);
      console.log(`✅ Generated CSS modules: ${modulesPath}`);
    }
  };
}

/**
 * Side effect callback that outputs CSS to stdout/stderr
 */
export function createConsoleOutputCallback(
  outputVanilla: boolean = true,
  outputModules: boolean = true
): OutputCallback {
  return (output: CompilationOutput) => {
    if (output.vanilla && output.stats.vanillaGenerated && outputVanilla) {
      console.log('=== VANILLA CSS ===');
      console.log(output.vanilla);
      console.log('=== END VANILLA CSS ===\n');
    }

    if (output.modules && output.stats.modulesGenerated && outputModules) {
      console.log('=== CSS MODULES ===');
      console.log(output.modules);
      console.log('=== END CSS MODULES ===\n');
    }

    // Output stats to stderr so it doesn't interfere with CSS output
    console.error(`📊 Compilation stats: ${output.stats.usageCount} usages processed`);
    if (output.stats.vanillaGenerated) console.error('✅ Vanilla CSS generated');
    if (output.stats.modulesGenerated) console.error('✅ CSS modules generated');
  };
}

/**
 * Side effect callback that writes to specific file paths
 */
export function createCustomFileWriterCallback(options: {
  vanillaPath?: string;
  modulesPath?: string;
}): OutputCallback {
  return (output: CompilationOutput) => {
    if (output.vanilla && output.stats.vanillaGenerated && options.vanillaPath) {
      // Ensure directory exists
      mkdirSync(dirname(options.vanillaPath), { recursive: true });
      writeFileSync(options.vanillaPath, output.vanilla);
      console.log(`✅ Generated vanilla CSS: ${options.vanillaPath}`);
    }

    if (output.modules && output.stats.modulesGenerated && options.modulesPath) {
      // Ensure directory exists
      mkdirSync(dirname(options.modulesPath), { recursive: true });
      writeFileSync(options.modulesPath, output.modules);
      console.log(`✅ Generated CSS modules: ${options.modulesPath}`);
    }
  };
}

/**
 * Composite callback that runs multiple callbacks in sequence
 */
export function createCompositeCallback(...callbacks: OutputCallback[]): OutputCallback {
  return async (output: CompilationOutput) => {
    for (const callback of callbacks) {
      await callback(output);
    }
  };
}