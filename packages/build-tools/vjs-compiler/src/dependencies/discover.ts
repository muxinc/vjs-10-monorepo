import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import type { FileDependencies } from './types.js';
import { parseReactSource, SKIN_CONFIG } from '../parsing/index.js';

/**
 * Discover file dependencies by analyzing imports in a source file
 *
 * @param entryFile - Absolute path to the entry file
 * @returns Discovered dependencies with absolute paths
 */
export function discoverDependencies(entryFile: string): FileDependencies {
  // Read and parse the source file
  const source = readFileSync(entryFile, 'utf-8');
  const parsed = parseReactSource(source, SKIN_CONFIG);

  if (!parsed.imports) {
    return { css: [], components: [] };
  }

  // Filter imports to find CSS files
  const cssImports = parsed.imports.filter((imp) => {
    const src = imp.source;
    return (
      src.endsWith('.css') ||
      src.endsWith('.module.css') ||
      src.endsWith('.scss') ||
      src.endsWith('.sass') ||
      src.endsWith('.less')
    );
  });

  // Resolve relative paths to absolute paths
  const entryDir = dirname(entryFile);
  const cssPaths = cssImports
    .filter((imp) => imp.source.startsWith('.')) // Only relative imports
    .map((imp) => resolve(entryDir, imp.source));

  // Could discover component dependencies here in the future
  const componentImports = parsed.imports.filter((imp) => {
    const src = imp.source;
    return src.startsWith('.') && (src.endsWith('.tsx') || src.endsWith('.jsx') || !src.includes('.'));
  });

  const componentPaths = componentImports.map((imp) => {
    const src = imp.source;
    // Handle imports without extensions
    if (!src.includes('.')) {
      // Try .tsx first, could be made smarter
      return resolve(entryDir, `${src}.tsx`);
    }
    return resolve(entryDir, src);
  });

  return {
    css: cssPaths,
    components: componentPaths,
  };
}

/**
 * Check if an import source refers to a CSS file
 */
export function isCSSImport(source: string): boolean {
  return (
    source.endsWith('.css') ||
    source.endsWith('.module.css') ||
    source.endsWith('.scss') ||
    source.endsWith('.sass') ||
    source.endsWith('.less')
  );
}
