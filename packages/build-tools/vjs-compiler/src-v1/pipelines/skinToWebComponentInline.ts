import type { CompilationOutput, CompilerConfig } from '../config/index.js';
import type { CompilationPipeline } from './types.js';

import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

import { compileSkinToHTML } from '../compileSkin.js';
import { cssModulesToVanillaCSS } from '../cssProcessing/index.js';
import { discoverDependencies } from '../dependencies/index.js';
import { defaultImportMappings } from '../importTransforming/index.js';
import { toKebabCase } from '../utils/naming.js';

/**
 * Pipeline: skin + web-component + inline
 *
 * Compiles a React skin component to an HTML/Web Component with inline CSS.
 *
 * Input:  React skin (.tsx) with CSS imports
 * Output: Single .ts file with web component class and inline <style>
 *
 * Process:
 * 1. Discover CSS dependencies from imports
 * 2. Read and merge all CSS files
 * 3. Transform React JSX → HTML template
 * 4. Generate web component module with inline styles
 */
export const skinToWebComponentInline: CompilationPipeline = {
  id: 'skin-web-component-inline',
  name: 'React Skin → Web Component (Inline CSS)',

  async compile(entryFile: string, config: CompilerConfig): Promise<CompilationOutput> {
    // 1. Discover CSS dependencies
    const deps = discoverDependencies(entryFile);

    // 2. Read and merge CSS Modules files
    let cssModulesContent = '';
    if (deps.css.length > 0) {
      cssModulesContent = deps.css
        .map((cssPath) => {
          try {
            return readFileSync(cssPath, 'utf-8');
          } catch (error) {
            console.warn(`Warning: Could not read CSS file: ${cssPath}`);
            return '';
          }
        })
        .join('\n');
    }

    // 3. Read source file
    const source = readFileSync(entryFile, 'utf-8');

    // 4. Compile to HTML web component with CSS transformation
    const result = await compileSkinToHTML(source, {
      importMappings: config.options?.importMappings
        ? {
            ...defaultImportMappings,
            packageMappings: config.options.importMappings,
          }
        : defaultImportMappings,
      styleProcessor: (context) => {
        // 5. Transform CSS Modules to vanilla CSS using component map
        if (!cssModulesContent) {
          return '';
        }
        return cssModulesToVanillaCSS({
          css: cssModulesContent,
          componentMap: context.componentMap,
        });
      },
      serializeOptions: {
        ...(config.options?.indent !== undefined && { indent: config.options.indent }),
        ...(config.options?.indentSize !== undefined && { indentSize: config.options.indentSize }),
      },
    });

    if (!result) {
      throw new Error(`Failed to compile skin: ${entryFile}`);
    }

    // 6. Generate output path
    const baseName = basename(entryFile, extname(entryFile));
    const kebabName = toKebabCase(baseName);
    const outputPath = `${kebabName}.ts`;

    return {
      files: [
        {
          path: outputPath,
          content: result.code,
          type: 'ts',
        },
      ],
    };
  },
};
