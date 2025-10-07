/**
 * CSS Modules → Vanilla CSS transformation
 * Transforms scoped CSS Modules to vanilla CSS for web components
 */

import postcss, { type Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';

import { toKebabCase } from '../utils/naming.js';

export interface CSSTransformConfig {
  /**
   * CSS Modules content to transform
   */
  css: string;

  /**
   * Map of component names to their web component element names
   * Components in this map will be transformed to element selectors
   * Everything else stays as class selectors
   *
   * Example: { PlayButton: 'media-play-button', PlayIcon: 'media-play-icon' }
   */
  componentMap: Record<string, string>;

  /**
   * Optional transformation settings
   */
  options?: {
    /**
     * Use data attributes instead of element selectors for components
     * e.g., [data-media-button] instead of media-button
     * @default false
     */
    useDataAttributes?: boolean;

    /**
     * Add :host selector for root styles
     * @default false
     */
    hostSelector?: boolean;
  };
}

/**
 * Transform CSS Modules to vanilla CSS for web components
 *
 * Transforms component class selectors to element selectors based on
 * the component map, while preserving non-component classes.
 *
 * @param config - Transformation configuration
 * @returns Transformed vanilla CSS
 */
export function cssModulesToVanillaCSS(config: CSSTransformConfig): string {
  const { css, componentMap, options = {} } = config;
  const { useDataAttributes = false } = options;

  // Parse CSS with PostCSS
  const root = postcss.parse(css);

  // Transform each rule's selectors
  root.walkRules((rule: Rule) => {
    rule.selector = transformSelector(rule.selector, componentMap, useDataAttributes);
  });

  return root.toString();
}

/**
 * Transform a CSS selector based on component mapping
 *
 * @param selector - Original selector from CSS Modules
 * @param componentMap - Map of component names to element names
 * @param useDataAttributes - Whether to use data attributes
 * @returns Transformed selector
 */
function transformSelector(
  selector: string,
  componentMap: Record<string, string>,
  useDataAttributes: boolean
): string {
  const transformed = selectorParser((selectors) => {
    selectors.walk((node) => {
      // Only transform class selectors
      if (node.type !== 'class') {
        return;
      }

      const className = node.value;
      const elementName = componentMap[className];

      if (elementName) {
        if (useDataAttributes) {
          // Transform to data attribute: .PlayButton → [data-media-play-button]
          const attributeNode = selectorParser.attribute({
            attribute: `data-${elementName}`,
            value: undefined,
            raws: {},
          });
          node.replaceWith(attributeNode);
        } else {
          // Transform to element selector: .PlayButton → media-play-button
          const tagNode = selectorParser.tag({
            value: elementName,
          });
          node.replaceWith(tagNode);
        }
      } else {
        // Not a component - convert class name to kebab-case
        // .IconButton → .icon-button
        const kebabClassName = toKebabCase(className);
        node.value = kebabClassName;
      }
    });
  }).processSync(selector);

  return transformed;
}
