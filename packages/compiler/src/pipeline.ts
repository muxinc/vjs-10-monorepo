/**
 * Compilation Pipeline
 *
 * Orchestrates parsing, transformation, and CSS generation
 */

import type { TransformConfig } from './jsx/types';
import * as t from '@babel/types';
import { generatePlaceholderCSS } from './css/placeholder';
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

  // Step 2: Transform JSX to HTML
  const transformResult = transformJSX(
    parsed.jsxElement,
    t,
    options.transform,
  );

  // Step 3: Generate placeholder CSS
  const cssResult = generatePlaceholderCSS(transformResult.classNames);

  return {
    componentName: parsed.name,
    html: transformResult.html,
    css: cssResult.css,
    classNames: cssResult.classNames,
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

/* HTML Template */
${result.html}

/* CSS */
${result.css}

/* Class Names */
${result.classNames.length > 0 ? result.classNames.join(', ') : 'None'}
`.trim();
}
