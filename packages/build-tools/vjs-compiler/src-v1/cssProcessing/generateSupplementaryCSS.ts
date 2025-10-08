/**
 * Generates plain CSS for unparseable Tailwind classes
 * This handles complex selectors that Tailwind v4 cannot parse
 */

import postcss from 'postcss';
import type { UnparseableClass } from './detectUnparseableClasses.js';
import { toKebabCase, toPascalCase } from '../utils/naming.js';

/**
 * Generate plain CSS for unparseable Tailwind classes
 *
 * @param unparseableByKey - Map of style keys to their unparseable classes
 * @param componentMap - Map of PascalCase style keys to kebab-case element names
 * @returns CSS string with rules for unparseable classes
 */
export function generateSupplementaryCSS(
  unparseableByKey: Map<string, UnparseableClass[]>,
  componentMap: Record<string, string>
): string {
  const root = postcss.root();

  for (const [styleKey, unparseables] of unparseableByKey) {
    const baseElement = componentMap[styleKey];

    if (!baseElement) {
      console.warn(`Warning: No component mapping for style key "${styleKey}"`);
      continue;
    }

    for (const unparseable of unparseables) {
      const { pattern } = unparseable;
      if (!pattern) continue;

      const { dataAttribute, dataValue, targetClass, property, value } = pattern;

      let selector: string;

      if (dataAttribute && dataValue && targetClass) {
        // Pattern: media-mute-button[data-volume-level="high"] media-volume-high-icon
        const targetElement = componentMap[toPascalCase(targetClass)];
        if (!targetElement) {
          console.warn(`Warning: No component mapping for target class "${targetClass}"`);
          continue;
        }
        selector = `${baseElement}[${dataAttribute}="${dataValue}"] ${targetElement}`;
      } else if (targetClass) {
        // Pattern: media-mute-button .icon
        // Check if targetClass is a component or just a utility class
        const targetElement = componentMap[toPascalCase(targetClass)];
        if (targetElement) {
          selector = `${baseElement} ${targetElement}`;
        } else {
          // It's a utility class like "icon", not a component
          selector = `${baseElement} .${toKebabCase(targetClass)}`;
        }
      } else {
        continue;
      }

      if (property && value) {
        const rule = postcss.rule({ selector });
        rule.append(postcss.decl({ prop: property, value }));
        root.append(rule);
      }
    }
  }

  return root.toString();
}
