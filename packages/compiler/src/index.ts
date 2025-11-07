/**
 * @videojs/compiler
 *
 * Compile React components to web components
 */

export { generatePlaceholderCSS } from './css/placeholder';
export type { CSSResult } from './css/placeholder';

export { parseComponent } from './jsx/parser';
export type { ParsedComponent } from './jsx/parser';

export { transformJSX } from './jsx/transform';
export type { TransformConfig, TransformResult } from './jsx/types';

export { compile, compileFormatted } from './pipeline';
export type { CompileOptions, CompileResult } from './pipeline';
