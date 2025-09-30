/**
 * Style Comparator: Compares computed styles between React and WC versions
 *
 * Handles style normalization and reports meaningful differences.
 */

import type { Locator } from '@playwright/test';

/**
 * Critical style properties to compare
 */
export const CRITICAL_STYLE_PROPERTIES = {
  layout: [
    'position',
    'display',
    'flexDirection',
    'alignItems',
    'justifyContent',
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
  ],
  spacing: [
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'gap',
  ],
  visual: [
    'backgroundColor',
    'color',
    'opacity',
    'borderRadius',
    'borderWidth',
    'borderColor',
    'boxShadow',
    'backdropFilter',
  ],
  transform: ['transform', 'transitionProperty', 'transitionDuration'],
} as const;

/**
 * Computed style map
 */
export type ComputedStyleMap = Record<string, string>;

/**
 * Style comparison result
 */
export interface StyleComparisonResult {
  /** Whether styles match */
  matches: boolean;
  /** Properties that differ */
  differences: StyleDifference[];
  /** Total properties compared */
  totalCompared: number;
  /** Percentage match (0-100) */
  matchPercentage: number;
}

/**
 * Individual style difference
 */
export interface StyleDifference {
  property: string;
  reactValue: string;
  wcValue: string;
  category: keyof typeof CRITICAL_STYLE_PROPERTIES;
}

/**
 * Style Comparator class
 */
export class StyleComparator {
  /**
   * Get computed styles for an element
   */
  async getComputedStyles(locator: Locator, properties: string[]): Promise<ComputedStyleMap> {
    return await locator.evaluate((el, props) => {
      const computed = window.getComputedStyle(el);
      const result: Record<string, string> = {};
      for (const prop of props) {
        result[prop] = computed.getPropertyValue(this.camelToKebab(prop));
      }
      return result;
    }, properties);
  }

  /**
   * Get all critical computed styles
   */
  async getAllCriticalStyles(locator: Locator): Promise<ComputedStyleMap> {
    const allProperties = Object.values(CRITICAL_STYLE_PROPERTIES).flat();
    return this.getComputedStyles(locator, allProperties);
  }

  /**
   * Compare computed styles between two elements
   */
  async compareStyles(
    reactLocator: Locator,
    wcLocator: Locator,
    propertiesToCompare?: string[]
  ): Promise<StyleComparisonResult> {
    const properties = propertiesToCompare || Object.values(CRITICAL_STYLE_PROPERTIES).flat();

    const [reactStyles, wcStyles] = await Promise.all([
      this.getComputedStyles(reactLocator, properties),
      this.getComputedStyles(wcLocator, properties),
    ]);

    const differences: StyleDifference[] = [];

    for (const property of properties) {
      const reactValue = this.normalizeValue(reactStyles[property] || '');
      const wcValue = this.normalizeValue(wcStyles[property] || '');

      if (!this.valuesMatch(reactValue, wcValue, property)) {
        differences.push({
          property,
          reactValue: reactStyles[property] || '(none)',
          wcValue: wcStyles[property] || '(none)',
          category: this.getPropertyCategory(property),
        });
      }
    }

    const totalCompared = properties.length;
    const matchPercentage = ((totalCompared - differences.length) / totalCompared) * 100;

    return {
      matches: differences.length === 0,
      differences,
      totalCompared,
      matchPercentage,
    };
  }

  /**
   * Normalize a style value for comparison
   */
  private normalizeValue(value: string): string {
    // Normalize color values: rgb(255, 255, 255) → #ffffff
    if (value.startsWith('rgb')) {
      return this.rgbToHex(value);
    }

    // Normalize pixel values: remove 'px'
    if (value.endsWith('px')) {
      return Number.parseFloat(value).toString();
    }

    // Normalize whitespace
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if two values match (with tolerance)
   */
  private valuesMatch(value1: string, value2: string, property: string): boolean {
    // Exact match
    if (value1 === value2) return true;

    // Numeric values with tolerance (for sub-pixel rendering)
    const num1 = Number.parseFloat(value1);
    const num2 = Number.parseFloat(value2);
    if (!isNaN(num1) && !isNaN(num2)) {
      return Math.abs(num1 - num2) < 1; // 1px tolerance
    }

    // Special cases for known acceptable differences
    if (property === 'display') {
      // 'block' and 'flow-root' are often equivalent
      if ((value1 === 'block' && value2 === 'flow-root') || (value1 === 'flow-root' && value2 === 'block')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(rgb: string): string {
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return rgb;

    const r = Number.parseInt(match[1] || '0');
    const g = Number.parseInt(match[2] || '0');
    const b = Number.parseInt(match[3] || '0');

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Get the category for a property
   */
  private getPropertyCategory(property: string): keyof typeof CRITICAL_STYLE_PROPERTIES {
    for (const [category, props] of Object.entries(CRITICAL_STYLE_PROPERTIES)) {
      if (props.includes(property as any)) {
        return category as keyof typeof CRITICAL_STYLE_PROPERTIES;
      }
    }
    return 'visual'; // default
  }

  /**
   * Format comparison result for logging
   */
  formatComparisonResult(result: StyleComparisonResult, elementId: string): string {
    const lines: string[] = [];
    lines.push(`\n=== Style Comparison: ${elementId} ===`);
    lines.push(
      `Match: ${result.matchPercentage.toFixed(1)}% (${result.totalCompared - result.differences.length}/${result.totalCompared})`
    );

    if (result.differences.length > 0) {
      lines.push(`\nDifferences (${result.differences.length}):`);
      for (const diff of result.differences) {
        lines.push(`  [${diff.category}] ${diff.property}:`);
        lines.push(`    React: ${diff.reactValue}`);
        lines.push(`    WC:    ${diff.wcValue}`);
      }
    }

    return lines.join('\n');
  }
}
