/**
 * Generate complete web component module code
 */

import type { OutputContext, PathContext } from '../../types.js';
import type { TransformedImport } from '../transformer/transformImports.js';

import { generateImportStatements } from '../transformer/transformImports.js';
import { formatTemplate } from './generateTemplate.js';

/**
 * Module generation options
 */
export interface GenerateModuleOptions {
  componentName: string;
  imports: TransformedImport[];
  templateHTML: string;
  css?: string | undefined;
  includeBaseTemplate?: boolean;
  output?: OutputContext;
  paths?: PathContext;
}

/**
 * Generate complete web component module
 *
 * Creates a self-registering web component module with:
 * - Import statements
 * - Component class extending MediaSkin
 * - Template function with HTML and CSS
 * - Self-registration via side-effect
 *
 * @param options - Module generation options
 * @returns Complete module code as string
 */
export function generateModule(options: GenerateModuleOptions): string {
  const { componentName, imports, templateHTML, css = '', includeBaseTemplate = false, output, paths } = options;

  // Generate web component tag name (MediaSkinMinimal → media-skin-minimal)
  const tagName = componentNameToTagName(componentName);

  // Determine import mode
  const importMode = output?.importMode || 'relative';

  // Add MediaSkin base class import (required for web components)
  // Path depends on import mode:
  // - Phase 1 (relative): '../../../media-skin'
  // - Phase 2 (package): '@vjs-10/html'
  const mediaSkinImport: TransformedImport = {
    type: 'named',
    path: importMode === 'package' && paths ? paths.targetPackage.name : '../../../media-skin',
    specifiers: ['MediaSkin'],
  };

  // Combine MediaSkin import with other imports
  const allImports = [mediaSkinImport, ...imports];

  // Generate import statements
  const importStatements = generateImportStatements(allImports);

  // Generate CSS block (empty for Phase 1)
  const cssBlock = css
    ? `      ${css.split('\n').join('\n      ')}`
    : '      /* Empty for now - Phase 2 will add CSS */';

  // Generate base template call if requested
  const baseTemplateCall = includeBaseTemplate ? '${MediaSkin.getTemplateHTML()}\n    ' : '';

  // Format template HTML with indentation
  const formattedHTML = formatTemplate(templateHTML);

  // Generate complete module
  return `${importStatements}

export class ${componentName} extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export function getTemplateHTML() {
  return /* html */ \`
    ${baseTemplateCall}<style>
${cssBlock}
    </style>

${formattedHTML}
  \`;
}

// Self-register the component
if (!customElements.get('${tagName}')) {
  customElements.define('${tagName}', ${componentName});
}
`;
}

/**
 * Convert component class name to web component tag name
 *
 * Examples:
 * - MediaSkinMinimal → media-skin-minimal
 * - MediaSkinDefault → media-skin-default
 *
 * @param componentName - Component class name
 * @returns Web component tag name
 */
function componentNameToTagName(componentName: string): string {
  return (
    componentName
      // Insert hyphen before uppercase letters (except at start)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Handle consecutive uppercase letters
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      // Convert to lowercase
      .toLowerCase()
  );
}
