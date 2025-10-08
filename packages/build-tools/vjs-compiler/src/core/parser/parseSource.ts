/**
 * Parse TypeScript/TSX source code using Babel
 */

import { parse } from '@babel/parser';
import type * as t from '@babel/types';

/**
 * Parse TypeScript/TSX source code to Babel AST
 *
 * @param source - Source code string
 * @returns Babel AST
 */
export function parseSource(source: string): t.File {
  return parse(source, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      // Support for decorators if needed in future
      ['decorators', { decoratorsBeforeExport: true }],
    ],
  });
}
