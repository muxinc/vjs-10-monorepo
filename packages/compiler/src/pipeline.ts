/**
 * Compilation Pipeline
 *
 * Orchestrates parsing, transformation, and CSS generation
 */

import type { TransformConfig } from './jsx/types';
import * as t from '@babel/types';
import { generatePlaceholderCSS } from './css/placeholder';
import { transformImports } from './imports/transform';
import { parseComponent } from './jsx/parser';
import { transformJSX } from './jsx/transform';

export interface CompileResult {
  /** Component name */
  componentName: string;
  /** Transformed HTML */
  html: string;
  /** Generated CSS */
  css: string;
  /** Extracted class names */
  classNames: string[];
  /** Transformed imports */
  imports: string[];
  /** Removed imports */
  removedImports: string[];
}

export interface CompileOptions {
  /** Transformation config */
  transform?: TransformConfig;
}

/**
 * Compile React component source to web component
 */
export function compile(
  source: string,
  options: CompileOptions = {},
): CompileResult {
  // Step 1: Parse component
  const parsed = parseComponent(source);

  if (!parsed.jsxElement) {
    throw new Error(`No JSX element found in component "${parsed.name}"`);
  }

  // Step 2: Transform imports
  const importResult = transformImports(parsed.ast.program, t);

  // Step 3: Transform JSX to HTML
  const transformResult = transformJSX(
    parsed.jsxElement,
    t,
    options.transform,
  );

  // Step 4: Generate placeholder CSS
  const cssResult = generatePlaceholderCSS(transformResult.classNames);

  return {
    componentName: parsed.name,
    html: transformResult.html,
    css: cssResult.css,
    classNames: cssResult.classNames,
    imports: importResult.imports,
    removedImports: importResult.removedImports,
  };
}

/**
 * Compile with formatted output for easier reading
 */
export function compileFormatted(
  source: string,
  options: CompileOptions = {},
): string {
  const result = compile(source, options);

  return `
/**
 * Component: ${result.componentName}
 */

/* Imports */
${result.imports.length > 0 ? result.imports.join('\n') : '// None'}

/* Removed Imports */
${result.removedImports.length > 0 ? `// ${result.removedImports.join(', ')}` : '// None'}

/* HTML Template */
${result.html}

/* CSS */
${result.css}

/* Class Names */
${result.classNames.length > 0 ? result.classNames.join(', ') : 'None'}
`.trim();
}
