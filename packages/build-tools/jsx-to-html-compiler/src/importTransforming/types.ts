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
}
