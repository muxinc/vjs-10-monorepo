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
// Handle both:
// 1. Vitest/esbuild: _traverse is already the function (default export resolved)
// 2. Node ESM: _traverse is object with .default property (needs manual access)
export const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as typeof import('@babel/traverse').default;
export const generate = (typeof _generate === 'function' ? _generate : (_generate as any).default) as typeof import('@babel/generator').default;
