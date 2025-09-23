import type { CoreCompilerOptions } from './core-compiler.js';
import type { OutputCallback } from './side-effects.js';
import type { CompilerConfig, ParsedFile } from './types.js';

import { glob } from 'glob';

import { ASTParser, extractComponentName } from './ast-parser.js';
import { compileFromUsages } from './core-compiler.js';
import { createFileWriterCallback } from './side-effects.js';

export class TailwindCSSCompiler {
  private parser = new ASTParser();
  private config: CompilerConfig;
  private outputCallback: OutputCallback;

  constructor(config: CompilerConfig, outputCallback?: OutputCallback) {
    this.config = config;

    // Default to file writer callback if none provided
    if (outputCallback) {
      this.outputCallback = outputCallback;
    } else {
      const { vanillaFilename, modulesFilename } = this.getDefaultFilenames();
      this.outputCallback = createFileWriterCallback(this.config.outputDir, vanillaFilename, modulesFilename);
    }
  }

  /**
   * Run the complete compilation process
   */
  async compile(): Promise<void> {
    console.log('🚀 Starting Tailwind CSS compilation...');

    // Step 1: Parse source files and extract className usage
    const parsedFiles = await this.parseSourceFiles();
    const allUsages = parsedFiles.flatMap((file) => file.usages);

    console.log(`📄 Parsed ${parsedFiles.length} files`);
    console.log(`🎯 Found ${allUsages.length} className usages`);

    if (allUsages.length === 0) {
      console.log('⚠️  No className usages found. Skipping CSS generation.');
      return;
    }

    // Step 2: Use the new pure compilation function
    const coreOptions: CoreCompilerOptions = {
      mappings: this.config.mappings ?? [],
      generateVanilla: this.config.generateVanilla,
      generateModules: this.config.generateModules,
      componentMappings: this.getComponentMappings(),
      elementMappings: this.getElementMappings(),
    };

    console.log('🎨 Generating CSS...');
    const output = await compileFromUsages(allUsages, coreOptions);

    // Step 3: Use callback to handle output (side effects)
    await this.outputCallback(output);

    console.log('✅ Compilation complete!');
  }

  /**
   * Parse all source files and extract className usages
   */
  private async parseSourceFiles(): Promise<ParsedFile[]> {
    const files = await this.findSourceFiles();
    const parsedFiles: ParsedFile[] = [];

    for (const file of files) {
      try {
        const parsed = this.parser.parseFile(file);
        if (parsed.usages.length > 0) {
          parsedFiles.push(parsed);
          console.log(`  📝 ${file}: ${parsed.usages.length} usages`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${file}:`, error);
      }
    }

    return parsedFiles;
  }

  /**
   * Find all source files based on patterns
   */
  private async findSourceFiles(): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.config.sources) {
      const files = await glob(pattern);
      allFiles.push(...files);
    }

    // Remove duplicates
    return [...new Set(allFiles)];
  }

  /**
   * Get default filenames (used during construction)
   */
  private getDefaultFilenames(): { vanillaFilename: string; modulesFilename: string } {
    // Use generic naming since we don't have parsed files at construction time
    return {
      vanillaFilename: 'vanilla.css',
      modulesFilename: 'modules.css',
    };
  }


  /**
   * Update the output callback (useful for testing or different output strategies)
   */
  setOutputCallback(callback: OutputCallback): void {
    this.outputCallback = callback;
  }


  /**
   * Get component-specific selector mappings
   */
  private getComponentMappings(): Record<string, string> {
    return {
      PlayButton: 'media-play-button',
      MuteButton: 'media-mute-button',
      FullscreenButton: 'media-fullscreen-button',
      VolumeRange: 'media-volume-range',
      TimeRange: 'media-time-range',
      CurrentTimeDisplay: 'media-current-time-display',
      DurationDisplay: 'media-duration-display',
      MediaContainer: 'media-container',
    };
  }

  /**
   * Get element-specific selector mappings
   */
  private getElementMappings(): Record<string, string> {
    return {
      '.button': '.control-button',
      '.icon': '.icon',
      '.display': '.time-display',
      '.range': '.range-control',
    };
  }
}
