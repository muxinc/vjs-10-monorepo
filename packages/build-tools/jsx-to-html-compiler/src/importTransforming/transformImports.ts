import { toKebabCase } from '../utils/naming.js';
import type { ImportInfo } from '../skinGeneration/types.js';
import type { ImportMappingConfig } from './types.js';
import { defaultImportMappings } from './mappings.js';

/**
 * Transform React imports to HTML imports
 *
 * @param imports - Imports extracted from React skin
 * @param config - Optional import mapping configuration
 * @returns Array of transformed import statements as strings
 */
export function transformImports(
  imports: ImportInfo[],
  config: ImportMappingConfig = defaultImportMappings
): string[] {
  const transformedImports: string[] = [];
  const { packageMappings, excludePatterns } = config;

  for (const imp of imports) {
    // Skip excluded patterns
    if (shouldExclude(imp.source, excludePatterns)) {
      continue;
    }

    // Transform package name if mapping exists
    let transformedSource = imp.source;
    for (const [reactPkg, htmlPkg] of Object.entries(packageMappings)) {
      if (imp.source === reactPkg) {
        transformedSource = htmlPkg;
        break;
      }
      // Handle scoped paths like '@vjs-10/react/components'
      if (imp.source.startsWith(`${reactPkg}/`)) {
        transformedSource = imp.source.replace(reactPkg, htmlPkg);
        break;
      }
    }

    // Transform relative component imports
    if (imp.source.startsWith('.') && !imp.source.includes('/styles')) {
      transformedSource = transformRelativeImport(imp.source);
    }

    // For side-effect imports (component registration)
    // Icons are already side-effect imports, but components need transformation
    if (transformedSource === imp.source && imp.source.startsWith('.')) {
      // This is a local component import - make it a side-effect import
      transformedImports.push(`import '${transformedSource}';`);
    } else {
      // Icons and other package imports - just import the package
      transformedImports.push(`import '${transformedSource}';`);
    }
  }

  // Add base MediaSkin import
  transformedImports.unshift(`import { MediaSkin } from '../media-skin';`);

  return transformedImports;
}

/**
 * Check if an import should be excluded
 */
function shouldExclude(source: string, patterns: string[]): boolean {
  return patterns.some((pattern) => source.includes(pattern));
}

/**
 * Transform a relative component import path
 * Example: '../../components/PlayButton' → '../components/media-play-button'
 */
function transformRelativeImport(source: string): string {
  // Extract the component name from the path
  const parts = source.split('/');
  const lastPart = parts[parts.length - 1];

  if (!lastPart) {
    return source;
  }

  // Transform the component name to kebab-case
  const kebabName = toKebabCase(lastPart);

  // For component imports, assume they go to ../components/
  // This may need to be more sophisticated based on actual structure
  if (source.includes('/components/')) {
    return `../components/${kebabName}`;
  }

  // Default transformation
  return source;
}
