import type * as t from '@babel/types';

/**
 * Context provided to style processors
 */
export interface StyleContext {
  /**
   * The styles import/object from the React component
   * This could be:
   * - An object literal: const styles = { ... }
   * - A CSS Module import: import styles from './styles.module.css'
   * - A utility object: import styles from './styles'
   */
  stylesNode: t.Node | null;

  /**
   * The component name (for scoping if needed)
   */
  componentName: string;

  /**
   * Map of component names to their web component element names
   * Used for CSS transformation (e.g., class selectors → element selectors)
   * Example: { PlayButton: 'media-play-button', PlayIcon: 'media-play-icon' }
   */
  componentMap: Record<string, string>;
}

/**
 * Function that processes styles and returns CSS string
 *
 * @param context - Context about the styles and component
 * @returns CSS string to be placed in <style> tag, or empty string
 */
export type StyleProcessor = (context: StyleContext) => string;
