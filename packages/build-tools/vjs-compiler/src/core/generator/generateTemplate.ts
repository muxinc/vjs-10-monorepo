/**
 * Generate HTML template string from transformed JSX
 */

import * as t from '@babel/types';
import generate from '@babel/generator';

/**
 * Generate HTML template string from JSX element
 *
 * Converts Babel JSX AST back to HTML string for web component template
 *
 * @param jsx - Transformed JSX element
 * @returns HTML template string
 */
export function generateTemplate(jsx: t.JSXElement): string {
  // Generate code from JSX AST
  const { code } = generate(jsx, {
    // Output compact HTML (no unnecessary whitespace)
    compact: false,
    // Don't include comments
    comments: false,
  });

  // Clean up JSX syntax artifacts
  return cleanJSXArtifacts(code);
}

/**
 * Clean up JSX syntax artifacts from generated code
 *
 * Converts JSX-specific syntax to valid HTML:
 * - Remove trailing semicolons
 * - Convert self-closing tags to proper HTML format
 *
 * @param code - Generated JSX code
 * @returns Cleaned HTML code
 */
function cleanJSXArtifacts(code: string): string {
  let cleaned = code;

  // Remove trailing semicolon if present
  cleaned = cleaned.replace(/;$/, '');

  // The JSX should already have been transformed to non-self-closing
  // by transformJSX, so no additional cleanup needed here

  return cleaned;
}

/**
 * Format template with proper indentation
 *
 * Adds consistent 4-space indentation to template HTML
 *
 * @param html - HTML template string
 * @returns Formatted HTML with indentation
 */
export function formatTemplate(html: string): string {
  // Split into lines
  const lines = html.split('\n');

  // Add 4-space indentation to each line
  const indented = lines.map((line) => (line.trim() ? `    ${line}` : '')).join('\n');

  return indented;
}
