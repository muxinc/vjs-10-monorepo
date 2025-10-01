import * as t from '@babel/types';

/**
 * Import statement information extracted from source
 */
export interface ImportInfo {
  /**
   * The source module path
   * Example: '@vjs-10/react-icons', '../../components/PlayButton'
   */
  source: string;

  /**
   * Named imports from this module
   * Example: ['PlayIcon', 'PauseIcon']
   */
  specifiers: string[];

  /**
   * Whether this is a default import
   */
  isDefault: boolean;
}

/**
 * Metadata extracted from a React skin component
 */
export interface SkinMetadata {
  /**
   * The JSX element (root return value)
   */
  jsx: t.JSXElement;

  /**
   * All imports from the source file
   */
  imports: ImportInfo[];

  /**
   * Reference to the styles import/object (if any)
   */
  stylesNode: t.Node | null;

  /**
   * The component name (e.g., "MediaSkinDefault")
   */
  componentName: string;
}

/**
 * Data needed to generate a skin module
 */
export interface SkinModuleData {
  /**
   * Transformed import statements as strings
   */
  imports: string[];

  /**
   * The HTML string for the template
   */
  html: string;

  /**
   * The CSS string for the <style> tag
   */
  styles: string;

  /**
   * The class name for the web component
   * Example: "MediaSkinDefault"
   */
  className: string;

  /**
   * The custom element name (kebab-case)
   * Example: "media-skin-default"
   */
  elementName: string;
}

/**
 * Formatter function types for customizing module generation
 */
export type ImportsFormatter = (imports: string[]) => string;
export type StylesFormatter = (styles: string) => string;
export type HTMLFormatter = (html: string) => string;

/**
 * Options for customizing skin module generation
 */
export interface GenerateSkinModuleOptions {
  /**
   * Custom formatter for imports block
   * Defaults to joining imports with newlines
   */
  formatImports?: ImportsFormatter;

  /**
   * Custom formatter for styles block
   * Defaults to indented <style> tag with TODO placeholder for empty styles
   */
  formatStyles?: StylesFormatter;

  /**
   * Custom formatter for HTML block
   * Defaults to indented HTML content
   */
  formatHTML?: HTMLFormatter;
}
