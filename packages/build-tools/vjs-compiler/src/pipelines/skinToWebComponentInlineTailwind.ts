import { basename, extname, dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import type { CompilerConfig, CompilationOutput } from '../config/index.js';
import type { CompilationPipeline } from './types.js';
import { compileSkinToHTML } from '../compileSkin.js';
import { compileTailwindToCSS, cssModulesToVanillaCSS } from '../cssProcessing/index.js';
import { extractStylesObject } from '../styleProcessing/index.js';
import { parseReactSource, SKIN_CONFIG } from '../parsing/index.js';
import { toKebabCase } from '../utils/naming.js';
import { defaultImportMappings } from '../importTransforming/index.js';
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Pipeline: skin + web-component + inline (Tailwind)
 *
 * Compiles a React skin component with Tailwind styles to an HTML/Web Component
 * with inline vanilla CSS. This pipeline composes two transformations in memory:
 * 1. Tailwind → CSS Modules
 * 2. CSS Modules → Vanilla CSS
 *
 * Input:  React skin (.tsx) with Tailwind styles in styles.ts
 * Output: Single .ts file with web component class and inline <style>
 *
 * Process:
 * 1. Read source file and extract styles object from AST
 * 2. Compile Tailwind classes → CSS Modules (in memory)
 * 3. Transform React JSX → HTML template
 * 4. Transform CSS Modules → Vanilla CSS using component map
 * 5. Generate web component module with inline styles
 *
 * Note: This pipeline does NOT require temporary files - all transformations
 * happen in memory by composing the two CSS transformation functions.
 */
export const skinToWebComponentInlineTailwind: CompilationPipeline = {
  id: 'skin-web-component-tailwind',
  name: 'React Skin → Web Component (Inline CSS from Tailwind)',

  async compile(entryFile: string, config: CompilerConfig): Promise<CompilationOutput> {
    // 1. Read and parse source file to find styles import
    const source = readFileSync(entryFile, 'utf-8');
    const parsed = parseReactSource(source, SKIN_CONFIG);

    // 2. Resolve styles file path if imported externally
    let stylesFilePath: string | null = null;
    if (parsed.imports && parsed.stylesIdentifier) {
      const stylesImport = parsed.imports.find(
        (imp) => imp.source.includes('styles') && !imp.source.endsWith('.css')
      );
      if (stylesImport) {
        const entryDir = dirname(entryFile);
        // Handle relative imports
        if (stylesImport.source.startsWith('.')) {
          stylesFilePath = resolve(entryDir, stylesImport.source);
          // Try adding .ts/.js extension if needed
          try {
            readFileSync(stylesFilePath, 'utf-8');
          } catch {
            try {
              stylesFilePath = `${stylesFilePath}.ts`;
              readFileSync(stylesFilePath, 'utf-8');
            } catch {
              stylesFilePath = `${stylesFilePath}.js`;
            }
          }
        }
      }
    }

    // 3. Compile to HTML web component with Tailwind → CSS transformation
    const result = await compileSkinToHTML(source, {
      importMappings: config.options?.importMappings ? {
        ...defaultImportMappings,
        packageMappings: config.options.importMappings,
      } : defaultImportMappings,
      styleProcessor: async (context) => {
        // 4. Extract styles object from AST (inline or external file)
        let stylesObject = extractStylesObject(context.stylesNode);

        // If no inline styles, try to load from external file
        if (!stylesObject && stylesFilePath) {
          try {
            const stylesSource = readFileSync(stylesFilePath, 'utf-8');
            // Parse the styles file and look for exported const
            const stylesParsed = parseReactSource(stylesSource, {});

            // Walk the AST to find the styles variable declaration or export
            const ast = stylesParsed.ast;

            traverse(ast, {
              // Look for: const styles = { ... }
              VariableDeclarator(path: any) {
                if (t.isIdentifier(path.node.id) && path.node.id.name === 'styles' && path.node.init) {
                  stylesObject = extractStylesObject(path.node.init);
                }
              },
              // Look for: export default styles (or direct export)
              ExportDefaultDeclaration(path: any) {
                if (t.isIdentifier(path.node.declaration)) {
                  // It's exporting a variable, we should have found it above
                } else if (path.node.declaration) {
                  // It's exporting an expression directly
                  stylesObject = extractStylesObject(path.node.declaration);
                }
              },
            });
          } catch (error) {
            console.warn(`Warning: Could not extract styles from ${stylesFilePath}:`, error);
          }
        }

        if (!stylesObject) {
          return '';
        }

        try {
          // 4. Compile Tailwind → CSS Modules (in memory)
          // Note: This may include nested CSS with & selectors
          const cssModules = await compileTailwindToCSS({
            stylesObject,
            tailwindConfig: config.options?.tailwind?.config,
          });

          // 4.5. Fix known Tailwind compilation issues
          // Some complex arbitrary values don't compile correctly
          // TODO: Remove this workaround once Tailwind handles these cases
          let fixedCSS = cssModules.css;

          // Fix malformed drop-shadow filter (missing closing paren and value)
          // From: filter: drop-shadow(0 1px 0;
          // To: filter: drop-shadow(0 1px 0 rgba(0,0,0,0.2));
          fixedCSS = fixedCSS.replace(
            /filter:\s*drop-shadow\([^)]+;/g,
            'filter: drop-shadow(0 1px 0 rgba(0,0,0,0.2));'
          );

          // 4.6. Flatten nested CSS before transformation
          // The Tailwind output may contain nested selectors with &, which need to be
          // flattened before we can transform class selectors to element selectors
          const postcss = await import('postcss');
          const postcssNested = await import('postcss-nested');
          const flattenResult = await postcss.default([postcssNested.default()]).process(fixedCSS, {
            from: undefined,
            map: false,
          });
          const flattenedCSS = flattenResult.css;

          // 5. Transform CSS Modules → Vanilla CSS using component map
          const vanillaCSS = cssModulesToVanillaCSS({
            css: flattenedCSS,
            componentMap: context.componentMap,
          });

          return vanillaCSS;
        } catch (error) {
          console.error('Error during CSS compilation:', error);
          throw error;
        }
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
