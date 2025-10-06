/**
 * Converts a PascalCase or camelCase string to kebab-case
 * Examples:
 *   PlayButton → play-button
 *   CurrentTimeDisplay → current-time-display
 *   showRemaining → show-remaining
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// HTML built-in elements (lowercase) that should not be prefixed
const HTML_ELEMENTS = new Set([
  'div',
  'span',
  'button',
  'input',
  'a',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
  'form',
  'label',
  'select',
  'option',
  'textarea',
  'img',
  'video',
  'audio',
  'canvas',
  'svg',
  'path',
  'slot', // Web Components slot
]);

/**
 * Converts a JSX component name to an HTML custom element name
 * Handles both simple identifiers and member expressions
 * Leaves built-in HTML elements unchanged
 *
 * Examples:
 *   PlayButton → media-play-button
 *   TimeRange.Root → media-time-range-root
 *   VolumeHighIcon → media-volume-high-icon
 *   div → div (unchanged)
 */
export function toCustomElementName(name: string): string {
  // Check if it's a built-in HTML element (exact match)
  if (HTML_ELEMENTS.has(name)) {
    return name;
  }

  // Handle member expressions: TimeRange.Root → TimeRange-Root
  const withDashes = name.replace(/\./g, '-');

  // Convert to kebab-case
  const kebab = toKebabCase(withDashes);

  // Check if the kebab-case version is a built-in element
  if (HTML_ELEMENTS.has(kebab)) {
    return kebab;
  }

  // Add media- prefix if not already present
  return kebab.startsWith('media-') ? kebab : `media-${kebab}`;
}

/**
 * Converts a JSX attribute name to an HTML attribute name
 * Special cases: className → class
 * Otherwise: camelCase → kebab-case
 *
 * Examples:
 *   className → class
 *   showRemaining → show-remaining
 *   aria-label → aria-label (already kebab-case)
 */
export function toAttributeName(name: string): string {
  if (name === 'className') {
    return 'class';
  }

  // Already kebab-case (e.g., aria-label, data-*)
  if (name.includes('-')) {
    return name;
  }

  return toKebabCase(name);
}
