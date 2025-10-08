/**
 * Transform imports from React to web component format
 */

import * as path from 'path';
import type { ImportDeclaration, PathContext } from '../../types.js';
import { calculateImportPath, isRelativePath, isVJSPackage, toKebabCase } from './transformPaths.js';

/**
 * Transformed import information
 */
export interface TransformedImport {
  type: 'side-effect' | 'named' | 'default';
  path: string;
  specifiers?: string[];
}

/**
 * Transform import declarations from React to web component format
 *
 * Rules:
 * - React imports → eliminated
 * - Type-only imports → eliminated
 * - Styles imports → eliminated (CSS will be inlined)
 * - VJS component imports → side-effect imports with transformed paths
 * - External VJS packages → preserve (Phase 15 will transform package names)
 *
 * @param imports - Array of import declarations
 * @param pathContext - Path context for import resolution
 * @returns Array of transformed imports
 */
export function transformImports(
  imports: ImportDeclaration[],
  pathContext: PathContext
): TransformedImport[] {
  const transformed: TransformedImport[] = [];

  for (const imp of imports) {
    // Skip React framework imports
    if (imp.source === 'react' || imp.source.startsWith('react/')) {
      continue;
    }

    // Skip type-only imports
    if (imp.isTypeOnly) {
      continue;
    }

    // Skip styles imports
    if (imp.source.includes('/styles') || imp.source.endsWith('/styles')) {
      continue;
    }

    // Transform VJS component imports
    if (isRelativePath(imp.source)) {
      // Relative import - calculate new path
      const newPath = calculateImportPath(imp.source, pathContext);

      // Web components use side-effect imports (self-registering)
      transformed.push({
        type: 'side-effect',
        path: newPath,
      });
    } else if (isVJSPackage(imp.source)) {
      // VJS package import - transform each component import individually
      // import { MediaContainer, PlayButton } from '@vjs-10/react'
      // → import '../../../components/media-container'
      // → import '../../../components/media-play-button'
      for (const specifier of imp.specifiers) {
        const componentPath = calculateComponentImportPath(specifier, pathContext);
        transformed.push({
          type: 'side-effect',
          path: componentPath,
        });
      }
    } else {
      // External non-VJS package - preserve for now
      transformed.push({
        type: 'side-effect',
        path: imp.source,
      });
    }
  }

  return transformed;
}

/**
 * Calculate import path for a component from a VJS package
 *
 * Example: MediaContainer → ../../../components/media-container
 *
 * @param componentName - Component name (e.g. MediaContainer, PlayButton)
 * @param pathContext - Path context for import resolution
 * @returns Relative import path from output to target component
 */
function calculateComponentImportPath(componentName: string, pathContext: PathContext): string {
  // Convert component name to kebab-case
  const kebabName = toKebabCase(componentName);
  const webComponentName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  // Assume components are in components/ directory
  const targetAbsolute = path.join(pathContext.targetPackage.rootPath, 'components', webComponentName);

  // Calculate relative from output
  const relativeFromOutput = path.relative(path.dirname(pathContext.outputPath), targetAbsolute);

  // Ensure Unix-style path separators
  return relativeFromOutput.split(path.sep).join('/');
}

/**
 * Generate import statements from transformed imports
 *
 * @param imports - Array of transformed imports
 * @returns Import statements as string
 */
export function generateImportStatements(imports: TransformedImport[]): string {
  const statements: string[] = [];

  for (const imp of imports) {
    if (imp.type === 'side-effect') {
      statements.push(`import '${imp.path}';`);
    } else if (imp.type === 'named' && imp.specifiers) {
      statements.push(`import { ${imp.specifiers.join(', ')} } from '${imp.path}';`);
    } else if (imp.type === 'default') {
      // Not used in Phase 1, but included for completeness
      statements.push(`import ${imp.specifiers?.[0]} from '${imp.path}';`);
    }
  }

  return statements.join('\n');
}
