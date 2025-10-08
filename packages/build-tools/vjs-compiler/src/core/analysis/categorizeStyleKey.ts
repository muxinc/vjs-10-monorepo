/**
 * Categorize style keys based on relationship to component names
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 2: Categorization - classify style keys based on naming patterns
 *
 * Architectural Principle: Functional Over Declarative
 * Uses predicate functions to answer questions about style keys
 */

import type { StyleKeyUsage, SelectorCategory } from '../../types.js';

/**
 * Categorize a style key based on its relationship to component names
 *
 * @param styleKey - Style key usage information
 * @param componentNames - All component names in the module
 * @returns Selector category
 */
export function categorizeStyleKey(
  styleKey: StyleKeyUsage,
  componentNames: string[]
): SelectorCategory {
  const { key, usedOn } = styleKey;

  // Component Selector Identifier: exact match to a component name
  // Example: styles.PlayButton on <PlayButton>
  if (isComponentSelectorIdentifier(key, usedOn, componentNames)) {
    return 'component-selector-id';
  }

  // Nested Component Selector: matches compound component pattern
  // Example: styles.RangeRoot on <TimeRange.Root>
  if (isNestedComponentSelector(key, usedOn)) {
    return 'nested-component-selector';
  }

  // Component Type Selector: suffix pattern (shared across components)
  // Example: styles.Button on <PlayButton>, <PauseButton>
  if (isComponentTypeSelector(key, usedOn, componentNames)) {
    return 'component-type-selector';
  }

  // Generic Selector: no component relationship
  // Example: styles.Controls on <div>
  return 'generic-selector';
}

/**
 * Predicate: Is this a Component Selector Identifier?
 * Style key is used on exactly one component (single-component styling)
 *
 * Design principle: If a style key is used on only ONE VJS component,
 * it should use an element selector (no class needed), regardless
 * of whether the names match exactly. This is a unique identifier
 * for that component in this context.
 *
 * Examples:
 * - styles.PlayButton on <PlayButton> ✓ (exact match)
 * - styles.Container on <MediaContainer> ✓ (single component usage)
 * - styles.Button on <PlayButton> AND <PauseButton> ✗ (multiple usage)
 * - styles.Controls on <div> ✗ (not a component)
 */
function isComponentSelectorIdentifier(
  _key: string,
  usedOn: string[],
  componentNames: string[]
): boolean {
  // Must be used on exactly one element
  if (usedOn.length !== 1) {
    return false;
  }

  const usedOnElement = usedOn[0];
  if (!usedOnElement) {
    return false;
  }

  // Check if it's used on a compound component (belongs to nested category)
  if (usedOnElement.includes('.')) {
    return false; // Let nested component selector handle this
  }

  // Check if the element it's used on is actually a component
  // (not a div, span, etc.)
  if (!componentNames.includes(usedOnElement)) {
    return false; // Not used on a component → generic selector
  }

  // Used on exactly one component = Component Selector ID
  return true;
}

/**
 * Predicate: Is this a Nested Component Selector?
 * Style key matches compound component pattern
 */
function isNestedComponentSelector(key: string, usedOn: string[]): boolean {
  // Must be used on exactly one component
  if (usedOn.length !== 1) {
    return false;
  }

  const componentName = usedOn[0];
  if (!componentName) {
    return false;
  }

  // Check if applied to compound component
  if (!componentName.includes('.')) {
    return false;
  }

  // Check if key matches the compound pattern
  // TimeRange.Root → RangeRoot (remove namespace, concat)
  // TimeRange.Track → RangeTrack
  const normalized = normalizeCompoundName(componentName);
  return key === normalized;
}

/**
 * Predicate: Is this a Component Type Selector?
 * Style key is a suffix of component names (shared styling)
 */
function isComponentTypeSelector(
  key: string,
  usedOn: string[],
  _componentNames: string[]
): boolean {
  // Must be used on at least one component
  if (usedOn.length === 0) {
    return false;
  }

  // Check if any component has this key as a suffix
  for (const componentName of usedOn) {
    if (!componentName) continue;

    // Handle compound components: TimeRange.Root → Root
    const simpleName = componentName.includes('.')
      ? componentName.split('.').pop() || ''
      : componentName;

    // Check if style key is a suffix
    // PlayButton ends with Button ✓
    // PauseButton ends with Button ✓
    if (simpleName.endsWith(key)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalize compound component name for matching
 * TimeRange.Root → RangeRoot
 * TimeRange.Track → RangeTrack
 */
function normalizeCompoundName(componentName: string): string {
  const parts = componentName.split('.');
  if (parts.length < 2) {
    return componentName;
  }

  // Get namespace (first part) and member (rest)
  const [namespace, ...members] = parts;
  if (!namespace) return componentName;

  // Remove common prefixes from namespace
  // TimeRange → Range
  const simplifiedNamespace = namespace
    .replace(/^Media/, '')
    .replace(/^Time/, '');

  // Concat: Range + Root = RangeRoot
  return simplifiedNamespace + members.join('');
}
