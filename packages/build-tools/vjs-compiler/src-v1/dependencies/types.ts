/**
 * Dependencies discovered from analyzing a source file
 */
export interface FileDependencies {
  /**
   * CSS/style file dependencies
   */
  css: string[];

  /**
   * Component file dependencies (for potential future use)
   */
  components: string[];
}
