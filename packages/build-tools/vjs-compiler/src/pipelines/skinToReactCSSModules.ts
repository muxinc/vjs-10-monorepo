import { basename, dirname, extname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import type { CompilerConfig, CompilationOutput } from '../config/index.js';
import type { CompilationPipeline } from './types.js';
import { compileReactToReactWithCSSModules } from '../transforms/index.js';
import { compileTailwindToCSS } from '../cssProcessing/index.js';

/**
 * Pipeline: skin + react + css-modules
 *
 * Compiles a React skin with Tailwind classes to React with CSS Modules.
 *
 * Input:  React skin (.tsx) with Tailwind CSS classes
 * Output: React component (.tsx) + CSS Modules file (.module.css)
 *
 * Process:
 * 1. Discover CSS dependencies
 * 2. Transform React component (Tailwind classes → CSS Module classes)
 * 3. Generate CSS Module file from Tailwind classes
 * 4. Output both files
 */
export const skinToReactCSSModules: CompilationPipeline = {
  id: 'skin-react-css-modules',
  name: 'React Skin (Tailwind) → React Skin (CSS Modules)',

  async compile(entryFile: string, _config: CompilerConfig): Promise<CompilationOutput> {
    // 1. Read source file
    const source = readFileSync(entryFile, 'utf-8');

    // 2. Compile React + Tailwind → React + CSS Modules
    const transformedComponent = compileReactToReactWithCSSModules(source);

    if (!transformedComponent) {
      throw new Error(`Failed to compile skin to CSS Modules: ${entryFile}`);
    }

    // 3. Generate output paths
    const baseName = basename(entryFile, extname(entryFile));
    const componentPath = `${baseName}.tsx`;
    const cssPath = `${baseName}.module.css`;
    const dtsPath = `${baseName}.module.css.d.ts`;

    // 4. Look for styles.ts in the same directory
    const dir = dirname(entryFile);
    const stylesPath = join(dir, 'styles.ts');

    let cssContent = `/* No styles.ts found - placeholder CSS */\n`;
    let dtsContent = `declare const styles: {};\nexport default styles;\n`;
    let warnings: string[] = [];

    if (existsSync(stylesPath)) {
      try {
        // Load the styles module dynamically
        const stylesModule = await import(pathToFileURL(stylesPath).href);
        const stylesObject = stylesModule.default || stylesModule.styles || stylesModule;

        if (stylesObject && typeof stylesObject === 'object') {
          // Compile Tailwind to CSS Modules
          const result = await compileTailwindToCSS({
            stylesObject,
            warnings: true,
          });

          cssContent = result.css;
          dtsContent = result.dts;
          warnings = result.warnings;

          if (warnings.length > 0) {
            console.warn(`⚠️  Unresolved Tailwind tokens in ${stylesPath}:`);
            warnings.forEach(w => console.warn(`  ${w}`));
          }
        } else {
          console.warn(`⚠️  Could not load styles object from ${stylesPath}`);
        }
      } catch (error) {
        console.warn(`⚠️  Error compiling Tailwind CSS: ${error instanceof Error ? error.message : error}`);
      }
    }

    return {
      files: [
        {
          path: componentPath,
          content: transformedComponent,
          type: 'tsx',
        },
        {
          path: cssPath,
          content: cssContent,
          type: 'css',
        },
        {
          path: dtsPath,
          content: dtsContent,
          type: 'dts',
        },
      ],
    };
  },
};
