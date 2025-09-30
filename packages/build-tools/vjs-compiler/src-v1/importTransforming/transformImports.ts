import type { ImportInfo } from '../skinGeneration/types.js';
import type { ImportMappingConfig } from './types.js';

import { toKebabCase } from '../utils/naming.js';
import { defaultImportMappings } from './mappings.js';

/**
 * Transform React imports to HTML imports
 *
 * @param imports - Imports extracted from React skin
 * @param config - Optional import mapping configuration
 * @returns Array of transformed import statements as strings
 */
export function transformImports(imports: ImportInfo[], config: ImportMappingConfig = defaultImportMappings): string[] {
  const transformedImports: string[] = [];
  const {
    packageMappings,
    excludePatterns,
    shouldExclude: shouldExcludeFn = defaultShouldExclude,
    transformRelativeImport: transformRelativeImportFn = defaultTransformRelativeImport,
  } = config;
  const iconPackages = new Set<string>();

  for (const imp of imports) {
    // Skip React core library imports (but not packages like '@vjs-10/react-icons')
    if (imp.source === 'react') {
      continue;
    }

    // Skip excluded patterns
    if (shouldExcludeFn(imp.source, excludePatterns)) {
      continue;
    }

    // Transform package name if mapping exists
    let transformedSource = imp.source;
    let isIconImport = false;

    for (const [reactPkg, htmlPkg] of Object.entries(packageMappings)) {
      if (imp.source === reactPkg) {
        transformedSource = htmlPkg;
        // Check if this is an icon package
        if (reactPkg.includes('icons')) {
          isIconImport = true;
          iconPackages.add(htmlPkg);
        }
        break;
      }
      // Handle scoped paths like '@vjs-10/react/components'
      if (imp.source.startsWith(`${reactPkg}/`)) {
        transformedSource = imp.source.replace(reactPkg, htmlPkg);
        break;
      }
    }

    // Skip individual icon imports - we'll add the package import once
    if (isIconImport) {
      continue;
    }

    // Transform relative component imports
    if (imp.source.startsWith('.') && !imp.source.includes('/styles')) {
      transformedSource = transformRelativeImportFn(imp.source);
    }

    // For side-effect imports (component registration)
    // Icons are already side-effect imports, but components need transformation
    if (transformedSource === imp.source && imp.source.startsWith('.')) {
      // This is a local component import - make it a side-effect import
      transformedImports.push(`import '${transformedSource}';`);
    } else {
      // Other package imports - just import the package
      transformedImports.push(`import '${transformedSource}';`);
    }
  }

  // Add icon package imports (consolidated)
  for (const iconPkg of iconPackages) {
    transformedImports.push(`import '${iconPkg}';`);
  }

  // Add base MediaSkin import
  // FIXME: This path is hardcoded for compiled/inline/ output directory
  // Need to implement proper relative path calculation based on output location
  transformedImports.unshift(`import { MediaSkin } from '../../../media-skin';`);

  return transformedImports;
}

/**
 * Default implementation: Check if an import should be excluded
 */
export function defaultShouldExclude(source: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // For patterns ending in '/', require exact prefix match
    if (pattern.endsWith('/')) {
      return source.startsWith(pattern) || source === pattern.slice(0, -1);
    }
    // For other patterns, check if they're contained
    return source.includes(pattern);
  });
}

/**
 * Default implementation: Transform a relative component import path
 * Example: '../../components/PlayButton' → '../components/media-play-button'
 * Example: '../../components/MediaContainer' → '../media-container'
 */
export function defaultTransformRelativeImport(source: string): string {
  // Extract the component name from the path
  const parts = source.split('/');
  const lastPart = parts[parts.length - 1];

  if (!lastPart) {
    return source;
  }

  // Transform the component name to kebab-case with media- prefix
  const kebabName = toKebabCase(lastPart);
  const mediaKebabName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  // Special case: MediaContainer goes to root, not components/
  // FIXME: Path hardcoded for compiled/inline/ output directory
  if (lastPart === 'MediaContainer') {
    return `../../../${mediaKebabName}`;
  }

  // For component imports, assume they go to ../../../components/
  // FIXME: Path hardcoded for compiled/inline/ output directory
  // Need to implement proper relative path calculation based on output location
  if (source.includes('/components/')) {
    return `../../../components/${mediaKebabName}`;
  }

  // Default transformation
  return source;
}
