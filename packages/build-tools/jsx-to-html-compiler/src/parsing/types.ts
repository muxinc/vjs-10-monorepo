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
 * Configuration for what to extract during parsing
 */
export interface ParseConfig {
  /**
   * Extract the JSX return value from the component
   */
  extractJSX?: boolean;

  /**
   * Extract the component name from exports
   */
  extractComponentName?: boolean;

  /**
   * Extract all import statements
   */
  extractImports?: boolean;

  /**
   * Extract styles reference (imports or inline objects)
   */
  extractStyles?: boolean;
}

/**
 * Result of parsing React source code
 * Fields are populated based on ParseConfig
 */
export interface ParsedReactSource {
  /**
   * The JSX element (root return value)
   * Present if extractJSX is true
   */
  jsx?: t.JSXElement;

  /**
   * The component name (e.g., "MediaSkinDefault")
   * Present if extractComponentName is true
   */
  componentName?: string;

  /**
   * All imports from the source file
   * Present if extractImports is true
   */
  imports?: ImportInfo[];

  /**
   * Reference to the styles import/object (if any)
   * Present if extractStyles is true
   */
  stylesNode?: t.Node | null;

  /**
   * Name of the styles identifier (e.g., "styles")
   * Present if extractStyles is true and styles were found
   */
  stylesIdentifier?: string | null;

  /**
   * The complete parsed AST
   * Always present
   */
  ast: t.File;
}
