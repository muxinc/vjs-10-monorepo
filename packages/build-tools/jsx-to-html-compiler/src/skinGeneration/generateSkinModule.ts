import type { SkinModuleData, GenerateSkinModuleOptions } from './types.js';

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
 * @param options - Optional formatting customization
 * @returns Complete TypeScript module as a string
 */
export function generateSkinModule(
  data: SkinModuleData,
  options: GenerateSkinModuleOptions = {}
): string {
  const { imports, html, styles, className, elementName } = data;

  // Use custom formatters if provided, otherwise use defaults
  const importsFormatter = options.formatImports ?? formatImports;
  const stylesFormatter = options.formatStyles ?? formatStyles;
  const htmlFormatter = options.formatHTML ?? formatHTML;

  // Preprocess dynamic parts
  const importsBlock = importsFormatter(imports);
  const stylesBlock = stylesFormatter(styles);
  const htmlBlock = htmlFormatter(html);

  // Single template literal defines the entire module structure
  return `${importsBlock}

export function getTemplateHTML() {
  return /* html */ \`
    \${MediaSkin.getTemplateHTML()}
${stylesBlock}
${htmlBlock}
  \`;
}

export class ${className} extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('${elementName}', ${className});
`;
}

/**
 * Format imports with proper newlines
 */
export function formatImports(imports: string[]): string {
  return imports.join('\n');
}

/**
 * Format styles with proper indentation
 * Returns a <style> tag with either the provided styles or a TODO placeholder
 */
export function formatStyles(styles: string): string {
  if (!styles || !styles.trim()) {
    return `    <style>
      /* TODO: Add skin styles here */
    </style>`;
  }

  const indentedStyles = styles
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `      ${line}`)
    .join('\n');

  return `    <style>
${indentedStyles}
    </style>`;
}

/**
 * Format HTML with proper indentation for template literal
 */
export function formatHTML(html: string): string {
  return html
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `    ${line}`)
    .join('\n');
}
