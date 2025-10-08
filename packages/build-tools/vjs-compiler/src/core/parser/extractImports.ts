/**
 * Extract import declarations from source code
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ImportDeclaration } from '../../types.js';

/**
 * Extract all import declarations from AST
 *
 * @param ast - Babel AST
 * @returns Array of import declarations
 */
export function extractImports(ast: t.File): ImportDeclaration[] {
  const imports: ImportDeclaration[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const node = path.node;
      const source = node.source.value;
      const specifiers: string[] = [];
      let defaultImport: string | undefined;
      const isTypeOnly = node.importKind === 'type';

      // Process import specifiers
      for (const specifier of node.specifiers) {
        // import { A, B } from '...'
        if (t.isImportSpecifier(specifier)) {
          const imported = specifier.imported;
          const localName = specifier.local.name;

          // Handle: import { A } from '...' vs import { A as B } from '...'
          const importedName = t.isIdentifier(imported) ? imported.name : imported.value;
          specifiers.push(importedName);
        }
        // import Default from '...'
        else if (t.isImportDefaultSpecifier(specifier)) {
          defaultImport = specifier.local.name;
        }
        // import * as Namespace from '...'
        else if (t.isImportNamespaceSpecifier(specifier)) {
          // For namespace imports, we'll store the alias as a special marker
          // This will be useful for compound components (TimeRange.Root)
          defaultImport = specifier.local.name;
        }
      }

      imports.push({
        source,
        specifiers,
        defaultImport,
        isTypeOnly,
      });
    },
  });

  return imports;
}
