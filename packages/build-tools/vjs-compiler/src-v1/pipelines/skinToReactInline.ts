import type { CompilationOutput, CompilerConfig } from '../config/index.js';
import type { CompilationPipeline } from './types.js';

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';

import { compileTailwindToCSS } from '../cssProcessing/index.js';
import { parseReactSource } from '../parsing/index.js';
import { extractStylesObject } from '../styleProcessing/index.js';
import { compileReactToReactWithCSSModules } from '../transforms/index.js';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Convert kebab-case to PascalCase
 * e.g., "play-icon" → "PlayIcon", "volume-high-icon" → "VolumeHighIcon"
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Remove duplicate border-radius declarations where 'inherit' overrides explicit values.
 * This fixes a Tailwind CSS generation bug where arbitrary values like `after:rounded-[inherit]`
 * incorrectly generate a non-modified `border-radius: inherit` declaration.
 *
 * Strategy: Within each CSS rule, if we find multiple border-radius declarations,
 * keep only the non-inherit one (e.g., `calc(infinity * 1px)`).
 */
function removeDuplicateBorderRadius(css: string): string {
  // Match CSS rules with their content
  const rulePattern = /([^{]+)\{([^}]+)\}/g;

  return css.replace(rulePattern, (match, selector, content) => {
    // Check if this rule has multiple border-radius declarations
    const borderRadiusPattern = /border-radius:\s*([^;]+);/g;
    const matches: RegExpMatchArray[] = Array.from(content.matchAll(borderRadiusPattern));

    if (matches.length <= 1) {
      // No duplicates, return as-is
      return match;
    }

    // Find the non-inherit value (if any)
    const nonInheritMatch = matches.find((m) => m[1] && !m[1].includes('inherit'));

    if (nonInheritMatch && nonInheritMatch[1]) {
      // Remove all border-radius declarations
      let newContent = content.replace(borderRadiusPattern, '');
      // Add back only the non-inherit one at the end
      newContent = `${newContent.trim()}\n  border-radius: ${nonInheritMatch[1]};`;
      return `${selector}{${newContent}\n}`;
    }

    // If all are inherit, keep the last one
    return match;
  });
}

/**
 * Fix IconButton grid-area bug where Tailwind incorrectly extracts grid-area from
 * [&_svg]:[grid-area:1/1] and applies it to the parent .IconButton class.
 *
 * The source: `[&_svg]:[grid-area:1/1]` should generate: `.IconButton svg { grid-area: 1/1; }`
 * But Tailwind also generates: `.IconButton { grid-area: 1/1; }` (incorrect!)
 *
 * Fix: Remove grid-area from .IconButton, ensure it's only on .IconButton svg
 */
function fixIconButtonGridArea(css: string): string {
  // Match .IconButton rule block
  const iconButtonPattern = /(\.IconButton\s*\{[^}]*)(grid-area:\s*1\/1;)([^}]*\})/g;

  // Remove grid-area from .IconButton
  let fixed = css.replace(iconButtonPattern, (_match, before, _gridArea, after) => {
    return before + after;
  });

  // Ensure .IconButton svg has grid-area: 1/1
  // Check if it already exists
  if (!fixed.includes('.IconButton svg') || !fixed.match(/\.IconButton svg[^}]*grid-area:/)) {
    // Add the rule if missing (shouldn't happen, but safeguard)
    const iconButtonSvgPattern = /(\.IconButton svg\s*\{[^}]*)\}/g;
    fixed = fixed.replace(iconButtonSvgPattern, '$1  grid-area: 1/1;\n}');
  }

  return fixed;
}

/**
 * Transform group-hover selectors from Tailwind's :where(.group\/name) format
 * to proper descendant selectors that work without the group class.
 *
 * Examples:
 * - `.Controls:where(.group\/root):hover` → `.MediaContainer:hover .Controls`
 * - `.SliderThumb:where(.group\/slider):hover` → `.SliderRoot:hover .SliderThumb`
 * - `.FullscreenEnterIcon:where(.group\/button):hover` → `.Button:hover .FullscreenEnterIcon`
 */
function transformGroupHoverSelectors(css: string): string {
  // Map group names to their parent container selectors
  const groupMappings: Record<string, string> = {
    'group\\/root': '.MediaContainer',
    'group\\/button': '.Button',
    'group\\/slider': '.SliderRoot',
  };

  let transformed = css;

  // Transform each group-hover pattern
  for (const [groupName, parentSelector] of Object.entries(groupMappings)) {
    // Escape the forward slash for regex (it appears as \/ in CSS)
    const escapedGroupName = groupName.replace(/\//g, '\\\\/');

    // Pattern: .ChildClass:where(.group\/name):hover
    // Replace with: .ParentClass:hover .ChildClass
    const groupPattern = new RegExp(`\\.([a-zA-Z][\\w-]*):where\\(\\.${escapedGroupName}\\):hover`, 'g');

    transformed = transformed.replace(groupPattern, (_match, childClass) => {
      return `${parentSelector}:hover .${childClass}`;
    });

    // Also handle focus-within variant
    const focusWithinPattern = new RegExp(`\\.([a-zA-Z][\\w-]*):where\\(\\.${escapedGroupName}\\):focus-within`, 'g');

    transformed = transformed.replace(focusWithinPattern, (_match, childClass) => {
      return `${parentSelector}:focus-within .${childClass}`;
    });

    // Also handle active variant
    const activePattern = new RegExp(`\\.([a-zA-Z][\\w-]*):where\\(\\.${escapedGroupName}\\):active`, 'g');

    transformed = transformed.replace(activePattern, (_match, childClass) => {
      return `${parentSelector}:active .${childClass}`;
    });

    // Handle complex selectors with descendant combinators
    // Pattern: .ChildClass:where(.group\/name):hover * .GrandchildClass
    const complexPattern = new RegExp(
      `\\.([a-zA-Z][\\w-]*):where\\(\\.${escapedGroupName}\\):hover (\\* )?\\.([a-zA-Z][\\w-]*)`,
      'g'
    );

    transformed = transformed.replace(complexPattern, (_match, childClass, star, grandchildClass) => {
      return `${parentSelector}:hover .${childClass} ${star || ''}.${grandchildClass}`;
    });
  }

  return transformed;
}

/**
 * Extract class names from CSS and generate a styles object
 * that maps class names to themselves (for CSS Modules compatibility)
 *
 * Also generates PascalCase aliases for kebab-case names to match
 * the naming convention used in styles.ts (e.g., PlayIcon → play-icon)
 */
function generateStylesObject(css: string): string {
  const classNames = new Set<string>();

  // Match all .ClassName patterns in selectors, not just those immediately before {
  // This catches: .Button, .Button:hover, .Button[data-paused], .Parent .Child, etc.
  const classRegex = /\.([a-z_][\w-]*)/gi;
  let match;

  while ((match = classRegex.exec(css)) !== null) {
    classNames.add(match[1]);
  }

  const entries: string[] = [];

  // Generate entries for each class name
  Array.from(classNames)
    .sort()
    .forEach((name) => {
      // Always add the original name
      entries.push(`  '${name}': '${name}'`);

      // If it's kebab-case (contains hyphen), also add PascalCase variant
      // e.g., 'play-icon' → both 'play-icon' and 'PlayIcon' keys
      if (name.includes('-')) {
        const pascalName = toPascalCase(name);
        entries.push(`  '${pascalName}': '${name}'`);
      }
    });

  return `{\n${entries.join(',\n')}\n}`;
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

          // Get CSS content and apply transformations
          let transformedCSS = result.css;
          transformedCSS = removeDuplicateBorderRadius(transformedCSS);
          transformedCSS = fixIconButtonGridArea(transformedCSS);
          transformedCSS = transformGroupHoverSelectors(transformedCSS);
          cssContent = transformedCSS;
          warnings = result.warnings;

          if (warnings.length > 0) {
            console.warn(`⚠️  Unresolved Tailwind tokens in ${stylesPath}:`);
            warnings.forEach((w) => console.warn(`  ${w}`));
          }
        } else {
          console.warn(`⚠️  Could not extract styles object from ${stylesPath}`);
        }
      } catch (error) {
        console.warn(`⚠️  Error compiling Tailwind CSS: ${error instanceof Error ? error.message : error}`);
      }
    }

    // 5. Adjust import paths for nested output directory
    // The source file uses ../../components/ but output is in compiled/inline/
    // which adds 2 more directory levels, so we need ../../../../components/
    let finalComponent = transformedComponent;

    // Fix relative import paths: ../../ → ../../../../
    finalComponent = finalComponent.replace(
      /from\s+['"](\.\.(\/\.\.)+)(\/[^'"]+)['"]/g,
      (_match, dots, _middle, rest) => {
        // Count the number of ../ in the original path
        const levels = (dots.match(/\.\./g) || []).length;
        // Add 2 more levels for compiled/inline/
        const newDots = '../'.repeat(levels + 2);
        return `from '${newDots}${rest.slice(1)}'`;
      }
    );

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
