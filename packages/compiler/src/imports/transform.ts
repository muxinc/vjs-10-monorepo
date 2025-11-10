/**
 * Import Transformation
 *
 * Transforms React imports to HTML web component imports:
 * - Remove React/framework imports
 * - Transform @videojs/react → @videojs/html/define
 * - Transform style imports (.ts → .css)
 */

import type * as BabelTypes from '@babel/types';

export interface ImportTransformResult {
  /** Transformed import statements */
  imports: string[];
  /** Imports that were removed */
  removedImports: string[];
}

/**
 * Transform import declarations
 */
export function transformImports(
  program: BabelTypes.Program,
  t: typeof BabelTypes,
): ImportTransformResult {
  const imports: string[] = [];
  const removedImports: string[] = [];

  for (const statement of program.body) {
    if (!t.isImportDeclaration(statement)) {
      continue;
    }

    const source = statement.source.value;

    // Remove React imports
    if (source === 'react' || source.startsWith('react/')) {
      removedImports.push(source);
      continue;
    }

    // Transform @videojs/react imports
    if (source === '@videojs/react') {
      const transformed = transformVideoJSComponentImports(statement, t);
      imports.push(...transformed);
      continue;
    }

    // Transform @videojs/react/icons
    if (source === '@videojs/react/icons') {
      imports.push(`import '@videojs/html/icons';`);
      continue;
    }

    // Transform @videojs/react/store (remove - not needed in HTML)
    if (source === '@videojs/react/store') {
      removedImports.push(source);
      continue;
    }

    // Transform style imports (.ts → .css)
    if (source.includes('/styles') && !source.endsWith('.css')) {
      const cssSource = source.endsWith('.ts') || source.endsWith('.tsx')
        ? source.replace(/\.tsx?$/, '.css')
        : `${source}.css`;
      imports.push(`import styles from '${cssSource}';`);
      continue;
    }

    // Keep other imports as-is (for now)
    imports.push(generateImportStatement(statement, t));
  }

  return { imports, removedImports };
}

/**
 * Transform @videojs/react component imports to HTML define imports
 */
function transformVideoJSComponentImports(
  importDecl: BabelTypes.ImportDeclaration,
  t: typeof BabelTypes,
): string[] {
  const imports: string[] = [];

  for (const specifier of importDecl.specifiers) {
    if (!t.isImportSpecifier(specifier) && !t.isImportDefaultSpecifier(specifier)) {
      continue;
    }

    const importedName = t.isImportSpecifier(specifier)
      ? (t.isIdentifier(specifier.imported) ? specifier.imported.name : '')
      : specifier.local.name;

    // Map component name to HTML element name
    const elementName = componentNameToElementName(importedName);

    // Generate side-effect import for element definition
    imports.push(`import '@videojs/html/define/${elementName}';`);
  }

  return imports;
}

/**
 * Map React component name to HTML element name
 */
function componentNameToElementName(componentName: string): string {
  // Convert PascalCase to kebab-case
  const kebab = componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  // Don't double-prefix if already starts with media
  if (kebab.startsWith('media-')) {
    return kebab;
  }

  return `media-${kebab}`;
}

/**
 * Generate import statement string from AST node
 */
function generateImportStatement(
  importDecl: BabelTypes.ImportDeclaration,
  t: typeof BabelTypes,
): string {
  const source = importDecl.source.value;

  // Type-only imports
  if (importDecl.importKind === 'type') {
    const specifiers = importDecl.specifiers
      .map((spec) => {
        if (t.isImportSpecifier(spec)) {
          return t.isIdentifier(spec.imported) ? spec.imported.name : '';
        }
        return '';
      })
      .filter(Boolean)
      .join(', ');

    return `import type { ${specifiers} } from '${source}';`;
  }

  // Side-effect imports
  if (importDecl.specifiers.length === 0) {
    return `import '${source}';`;
  }

  // Default imports
  if (t.isImportDefaultSpecifier(importDecl.specifiers[0])) {
    const name = importDecl.specifiers[0].local.name;
    return `import ${name} from '${source}';`;
  }

  // Named imports
  const specifiers = importDecl.specifiers
    .map((spec) => {
      if (t.isImportSpecifier(spec)) {
        return t.isIdentifier(spec.imported) ? spec.imported.name : '';
      }
      return '';
    })
    .filter(Boolean)
    .join(', ');

  return `import { ${specifiers} } from '${source}';`;
}
