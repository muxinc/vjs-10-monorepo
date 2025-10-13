/**
 * Babel ESM/CJS Interop Helpers
 *
 * Babel packages are published as CommonJS only, which causes issues
 * when importing from ESM. This module provides correct imports.
 *
 * See: https://github.com/babel/babel/issues/15269
 */

import _traverse from '@babel/traverse';
import _generate from '@babel/generator';

// Re-export with correct types
export const traverse = (_traverse as any).default as typeof import('@babel/traverse').default;
export const generate = (_generate as any).default as typeof import('@babel/generator').default;
