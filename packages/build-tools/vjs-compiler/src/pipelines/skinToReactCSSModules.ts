import { basename, extname } from 'node:path';
import { readFileSync } from 'node:fs';

import type { CompilerConfig, CompilationOutput } from '../config/index.js';
import type { CompilationPipeline } from './types.js';
import { compileReactToReactWithCSSModules } from '../transforms/index.js';

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

  compile(entryFile: string, _config: CompilerConfig): CompilationOutput {
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

    // 4. For now, generate placeholder CSS
    // TODO: Integrate with tailwind-css-compiler to generate actual CSS
    const cssContent = `/* TODO: Generate CSS from Tailwind classes */\n`;

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
      ],
    };
  },
};
