/**
 * Mapping configuration for transforming imports
 */
export interface ImportMappingConfig {
  /**
   * Package name mappings (React → HTML)
   * Example: { '@vjs-10/react-icons': '@vjs-10/html-icons' }
   */
  packageMappings: Record<string, string>;

  /**
   * Component name transformations
   * Example: { 'PlayButton': 'media-play-button' }
   */
  componentMappings?: Record<string, string>;

  /**
   * Patterns to exclude from imports (e.g., styles)
   * Example: ['./styles', '.module.css', '.css']
   */
  excludePatterns: string[];

  /**
   * Function to determine if an import should be excluded
   * @param source - Import source string
   * @param patterns - Exclusion patterns to check against
   * @returns true if import should be excluded
   */
  shouldExclude?: (source: string, patterns: string[]) => boolean;

  /**
   * Function to transform relative import paths
   * @param source - Relative import path
   * @returns Transformed import path
   */
  transformRelativeImport?: (source: string) => string;
}
