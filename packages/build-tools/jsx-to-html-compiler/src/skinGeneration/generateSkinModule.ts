import type { SkinModuleData } from './types.js';

/**
 * Generate a complete HTML/Web Component skin module
 *
 * Creates a TypeScript module with:
 * - Imports
 * - getTemplateHTML() function
 * - Class definition extending MediaSkin
 * - customElements.define() registration
 *
 * @param data - All data needed to generate the module
 * @returns Complete TypeScript module as a string
 */
export function generateSkinModule(data: SkinModuleData): string {
  const { imports, html, styles, className, elementName } = data;

  const lines: string[] = [];

  // 1. Imports
  for (const imp of imports) {
    lines.push(imp);
  }
  lines.push(''); // Blank line after imports

  // 2. getTemplateHTML function
  lines.push('export function getTemplateHTML() {');
  lines.push('  return /* html */ `');
  lines.push('    ${MediaSkin.getTemplateHTML()}');

  // Add styles if present
  if (styles && styles.trim()) {
    lines.push('    <style>');
    // Indent the styles
    const styleLines = styles.split('\n');
    for (const line of styleLines) {
      if (line.trim()) {
        lines.push(`      ${line}`);
      }
    }
    lines.push('    </style>');
  } else {
    // Empty style tag as placeholder
    lines.push('    <style>');
    lines.push('      /* TODO: Add skin styles here */');
    lines.push('    </style>');
  }

  // Add HTML (indented)
  const htmlLines = html.split('\n');
  for (const line of htmlLines) {
    if (line.trim()) {
      lines.push(`    ${line}`);
    }
  }

  lines.push('  `;');
  lines.push('}');
  lines.push(''); // Blank line

  // 3. Class definition
  lines.push(`export class ${className} extends MediaSkin {`);
  lines.push('  static getTemplateHTML: () => string = getTemplateHTML;');
  lines.push('}');
  lines.push(''); // Blank line

  // 4. Custom element registration
  lines.push(`customElements.define('${elementName}', ${className});`);
  lines.push(''); // Final newline

  return lines.join('\n');
}
