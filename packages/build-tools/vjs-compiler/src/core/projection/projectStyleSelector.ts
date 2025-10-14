/**
 * Project style selectors based on their category
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 3: Projection - transform selectors based on categorization
 *
 * Architectural Principle: Functional Over Declarative
 * Uses projection functions to answer "what selector should be generated?"
 *
 * Architectural Principle: Push Assumptions to Boundaries
 * Projection strategy is passed as configuration, not hardcoded
 */

import type { SelectorStrategy, StyleKeyUsage } from '../../types.js';

/**
 * Projection result for a style selector
 */
export interface SelectorProjection {
  /** CSS selector to generate (e.g., 'media-container', '.button', '.controls') */
  cssSelector: string;
  /** Whether to add class attribute in JSX */
  needsClassAttribute: boolean;
  /** Class name to add to JSX (if needsClassAttribute is true) */
  className?: string;
  /** Reason for this projection (for debugging) */
  reason: string;
}

/**
 * Options for selector projection
 */
export interface ProjectionOptions {
  /** Selector projection strategy (defaults to 'optimize') */
  selectorStrategy?: SelectorStrategy;
}

/**
 * Project a style key to CSS selector based on its category
 *
 * @param styleKey - Style key usage with category
 * @param options - Projection options (strategy, etc.)
 * @returns Projection describing selector and JSX transformation
 */
export function projectStyleSelector(styleKey: StyleKeyUsage, options?: ProjectionOptions): SelectorProjection {
  const strategy = options?.selectorStrategy ?? 'optimize';
  const { key, usedOn, category } = styleKey;

  if (!category) {
    // Fallback if no category (shouldn't happen)
    return {
      cssSelector: `.${toKebabCase(key)}`,
      needsClassAttribute: true,
      className: toKebabCase(key),
      reason: 'No category - defaulting to class selector',
    };
  }

  // Use category-specific projection functions
  switch (category) {
    case 'component-selector-id':
      return projectComponentSelectorIdentifier(key, usedOn, strategy);

    case 'nested-component-selector':
      return projectNestedComponentSelector(key, usedOn, strategy);

    case 'component-type-selector':
      return projectComponentTypeSelector(key, usedOn);

    case 'generic-selector':
      return projectGenericSelector(key);

    default:
      // Exhaustiveness check
      const _exhaustive: never = category;
      return {
        cssSelector: `.${toKebabCase(key)}`,
        needsClassAttribute: true,
        className: toKebabCase(key),
        reason: `Unknown category: ${_exhaustive}`,
      };
  }
}

/**
 * Projection: Component Selector Identifier
 * Example: styles.PlayButton on <PlayButton>
 *
 * Strategy 'optimize': Use element selector (no class needed)
 * Strategy 'class-only': Use class selector (always add class)
 */
function projectComponentSelectorIdentifier(key: string, usedOn: string[], strategy: SelectorStrategy): SelectorProjection {
  const componentName = usedOn[0];
  if (!componentName) {
    // Shouldn't happen, but fallback
    return {
      cssSelector: `.${toKebabCase(key)}`,
      needsClassAttribute: true,
      className: toKebabCase(key),
      reason: 'Component Selector ID with no component - fallback to class',
    };
  }

  // Strategy: class-only - always use class selectors
  if (strategy === 'class-only') {
    const className = toKebabCase(key);
    return {
      cssSelector: `.${className}`,
      needsClassAttribute: true,
      className,
      reason: `Component Selector ID (class-only): ${key} on ${componentName}`,
    };
  }

  // Strategy: optimize - use element selector (no class attribute)
  // Convert component name to custom element name
  // PlayButton → play-button → media-play-button
  // MediaContainer → media-container
  const kebabName = toKebabCase(componentName);
  const elementName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  return {
    cssSelector: elementName,
    needsClassAttribute: false,
    reason: `Component Selector ID (optimize): ${key} matches ${componentName}`,
  };
}

/**
 * Projection: Nested Component Selector
 * Example: styles.RangeRoot on <TimeRange.Root>
 *
 * Strategy 'optimize': Use element selector with compound name (no class needed)
 * Strategy 'class-only': Use class selector (always add class)
 */
function projectNestedComponentSelector(key: string, usedOn: string[], strategy: SelectorStrategy): SelectorProjection {
  const componentName = usedOn[0];
  if (!componentName) {
    // Shouldn't happen, but fallback
    return {
      cssSelector: `.${toKebabCase(key)}`,
      needsClassAttribute: true,
      className: toKebabCase(key),
      reason: 'Nested Component Selector with no component - fallback to class',
    };
  }

  // Strategy: class-only - always use class selectors
  if (strategy === 'class-only') {
    const className = toKebabCase(key);
    return {
      cssSelector: `.${className}`,
      needsClassAttribute: true,
      className,
      reason: `Nested Component Selector (class-only): ${key} on ${componentName}`,
    };
  }

  // Strategy: optimize - use element selector (no class attribute)
  // Convert compound component to custom element name
  // TimeRange.Root → TimeRangeRoot → time-range-root → media-time-range-root
  const flattenedName = componentName.replace(/\./g, ''); // Remove dots
  const kebabName = toKebabCase(flattenedName);
  const elementName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  return {
    cssSelector: elementName,
    needsClassAttribute: false,
    reason: `Nested Component Selector (optimize): ${key} matches compound ${componentName}`,
  };
}

/**
 * Projection: Component Type Selector
 * Example: styles.Button on <PlayButton>, <PauseButton>
 * Decision: Use class selector (shared across components)
 */
function projectComponentTypeSelector(key: string, usedOn: string[]): SelectorProjection {
  const className = toKebabCase(key);

  return {
    cssSelector: `.${className}`,
    needsClassAttribute: true,
    className,
    reason: `Component Type Selector: ${key} shared across ${usedOn.join(', ')}`,
  };
}

/**
 * Projection: Generic Selector
 * Example: styles.Controls on <div>
 * Decision: Use class selector (no component relationship)
 */
function projectGenericSelector(key: string): SelectorProjection {
  const className = toKebabCase(key);

  return {
    cssSelector: `.${className}`,
    needsClassAttribute: true,
    className,
    reason: `Generic Selector: ${key} has no component relationship`,
  };
}

/**
 * Convert PascalCase to kebab-case
 * PlayButton → play-button
 * MediaContainer → media-container
 * TimeRange.Root → time-range.root (preserves dots)
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
