import { basename, dirname, extname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

import type { CompilerConfig, CompilationOutput } from '../config/index.js';
import type { CompilationPipeline } from './types.js';
import { compileReactToReactWithCSSModules } from '../transforms/index.js';
import { compileTailwindToCSS } from '../cssProcessing/index.js';
import { extractStylesObject } from '../styleProcessing/index.js';
import { parseReactSource } from '../parsing/index.js';
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Extract class names from CSS and generate a styles object
 * that maps class names to themselves (for CSS Modules compatibility)
 */
function generateStylesObject(css: string): string {
  const classNames = new Set<string>();
  // Match .ClassName { pattern
  const classRegex = /\.([a-zA-Z_][\w-]*)\s*\{/g;
  let match;

  while ((match = classRegex.exec(css)) !== null) {
    classNames.add(match[1]);
  }

  // Generate object literal
  const entries = Array.from(classNames)
    .sort()
    .map(name => `  ${name}: '${name}'`)
    .join(',\n');

  return `{\n${entries}\n}`;
}

/**
 * Pipeline: skin + react + inline
 *
 * Compiles a React skin with Tailwind classes to React with inline <style> tag.
 *
 * Input:  React skin (.tsx) with Tailwind CSS classes
 * Output: Single React component (.tsx) with inline <style> tag
 *
 * Process:
 * 1. Discover CSS dependencies
 * 2. Transform React component (Tailwind classes → CSS Module classes)
 * 3. Generate vanilla CSS from Tailwind classes
 * 4. Inject <style> tag into component
 * 5. Output single .tsx file
 *
 * Key difference from web-component pipeline:
 * - Keeps class selectors as-is (.Controls, .Button, etc.)
 * - Does NOT translate to element selectors (media-controls, media-button)
 * - Output is React component, not web component
 */
export const skinToReactInline: CompilationPipeline = {
  id: 'skin-react-inline',
  name: 'React Skin (Tailwind) → React Skin (Inline CSS)',

  async compile(entryFile: string, _config: CompilerConfig): Promise<CompilationOutput> {
    // 1. Read source file
    const source = readFileSync(entryFile, 'utf-8');

    // 2. Compile React + Tailwind → React + CSS Modules
    const transformedComponent = compileReactToReactWithCSSModules(source);

    if (!transformedComponent) {
      throw new Error(`Failed to compile skin to CSS Modules: ${entryFile}`);
    }

    // 3. Generate output path
    const baseName = basename(entryFile, extname(entryFile));
    const componentPath = `${baseName}.tsx`;

    // 4. Look for styles.ts in the same directory and extract styles from AST
    const dir = dirname(entryFile);
    const stylesPath = join(dir, 'styles.ts');

    let cssContent = '';
    let warnings: string[] = [];
    let stylesObject: Record<string, string> | null = null;

    if (existsSync(stylesPath)) {
      try {
        // Read and parse the styles file
        const stylesSource = readFileSync(stylesPath, 'utf-8');
        const stylesParsed = parseReactSource(stylesSource, {});

        // Walk the AST to find the styles variable declaration or export
        traverse(stylesParsed.ast, {
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

        if (stylesObject) {
          // Compile Tailwind to CSS Modules
          const result = await compileTailwindToCSS({
            stylesObject,
            warnings: true,
          });

          // Get CSS content (already resolved, no need to transform selectors)
          cssContent = result.css;
          warnings = result.warnings;

          if (warnings.length > 0) {
            console.warn(`⚠️  Unresolved Tailwind tokens in ${stylesPath}:`);
            warnings.forEach(w => console.warn(`  ${w}`));
          }
        } else {
          console.warn(`⚠️  Could not extract styles object from ${stylesPath}`);
        }
      } catch (error) {
        console.warn(`⚠️  Error compiling Tailwind CSS: ${error instanceof Error ? error.message : error}`);
      }
    }

    // 5. Inject inline style tag into component
    let finalComponent = transformedComponent;

    if (cssContent) {
      // Replace the styles import with inline CSS constant and styles object
      finalComponent = finalComponent.replace(
        /^import\s+styles\s+from\s+['"]\.\/[^'"]+\.module\.css['"];?\s*$/m,
        `// Inline CSS\nconst inlineStyles = \`${cssContent.replace(/`/g, '\\`')}\`;\n\n// Create styles object for className references\nconst styles: Record<string, string> = ${generateStylesObject(cssContent)};`
      );

      // Find the return statement and inject the style tag
      // Look for "return <" pattern
      const returnMatch = finalComponent.match(/return\s*</);
      if (returnMatch) {
        const insertPos = returnMatch.index! + 'return '.length;
        const styleElement = `<>\n    <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />\n    `;
        const closeFragment = `\n  </>`;

        // Find the end of the return statement (the closing tag and semicolon)
        const afterReturn = finalComponent.slice(insertPos);
        // Find the semicolon after the JSX (simplified - assumes return <...>; pattern)
        const returnEndMatch = afterReturn.match(/;\s*$/m);

        if (returnEndMatch) {
          const returnEnd = insertPos + returnEndMatch.index!;
          finalComponent =
            finalComponent.slice(0, insertPos) +
            styleElement +
            finalComponent.slice(insertPos, returnEnd) +
            closeFragment +
            finalComponent.slice(returnEnd);
        }
      }
    } else {
      // No CSS, just remove the import
      finalComponent = finalComponent.replace(
        /^import\s+styles\s+from\s+['"]\.\/[^'"]+\.module\.css['"];?\s*$/m,
        '// No styles found\nconst styles: Record<string, string> = {};'
      );
    }

    return {
      files: [
        {
          path: componentPath,
          content: finalComponent,
          type: 'tsx',
        },
      ],
    };
  },
};
