import type { ParsedReactSource } from '../parsing/index.js';
import type { CompileOptions } from '../types.js';

import { JSX_ONLY_CONFIG, parseReactSource } from '../parsing/index.js';
import { serializeToHTML } from '../serializer.js';
import { transformJSXToHTML } from '../transformer.js';

/**
 * Compiles React JSX component source code to HTML string
 *
 * @param sourceCode - The React component source code
 * @param options - Compilation options
 * @returns The HTML string representation
 */
export function compileJSXToHTML(sourceCode: string, options: CompileOptions = {}): string | null {
  // Step 1: Parse the React component and extract JSX
  const parsed = parseReactSource(sourceCode, JSX_ONLY_CONFIG);

  if (!parsed.jsx) {
    return null;
  }

  return compileJSXToHTMLFromParsed(parsed, options);
}

/**
 * Compiles parsed React source to HTML string
 *
 * This variant accepts pre-parsed source, enabling composition
 * with other transforms without re-parsing.
 *
 * @param parsed - Pre-parsed React source with JSX
 * @param options - Compilation options
 * @returns The HTML string representation
 */
export function compileJSXToHTMLFromParsed(parsed: ParsedReactSource, options: CompileOptions = {}): string | null {
  if (!parsed.jsx) {
    return null;
  }

  // Step 2: Transform JSX to HTML-compatible structure
  const transformedJSX = transformJSXToHTML(parsed.jsx);

  // Step 3: Serialize to HTML string
  const html = serializeToHTML(transformedJSX, options);

  return html;
}
