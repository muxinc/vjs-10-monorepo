/**
 * Detects Tailwind classes that cannot be parsed by Tailwind v4
 * and extracts their structure for manual CSS generation
 */

export interface UnparseableClass {
  originalClass: string;
  category: 'descendant-selector' | 'data-attribute-selector' | 'other';
  pattern?: {
    baseSelector?: string; // e.g., "&"
    dataAttribute?: string; // e.g., "data-volume-level"
    dataValue?: string; // e.g., "high"
    targetClass?: string; // e.g., "volume-high-icon" or "icon"
    property?: string; // e.g., "opacity"
    value?: string; // e.g., "100%"
  };
}

/**
 * Detect classes that Tailwind v4 cannot parse
 * These are typically complex arbitrary variants with nested selectors
 */
export function detectUnparseableClasses(stylesObject: Record<string, string>): Map<string, UnparseableClass[]> {
  const unparseableByKey = new Map<string, UnparseableClass[]>();

  for (const [key, classString] of Object.entries(stylesObject)) {
    const classes = classString.split(/\s+/).filter(Boolean);
    const unparseable: UnparseableClass[] = [];

    for (const cls of classes) {
      // Pattern 1: Data attribute selectors with value-based targeting
      // Example: [&[data-volume-level="high"]_.volume-high-icon]:opacity-100
      const dataAttrMatch = cls.match(/^\[&\[data-([^=]+)="([^"]+)"\]_\.([^\]]+)\]:([^-]+)-(.+)$/);

      if (
        dataAttrMatch &&
        dataAttrMatch[1] &&
        dataAttrMatch[2] &&
        dataAttrMatch[3] &&
        dataAttrMatch[4] &&
        dataAttrMatch[5]
      ) {
        unparseable.push({
          originalClass: cls,
          category: 'data-attribute-selector',
          pattern: {
            baseSelector: '&',
            dataAttribute: `data-${dataAttrMatch[1]}`,
            dataValue: dataAttrMatch[2],
            targetClass: dataAttrMatch[3],
            property: mapTailwindPropertyToCSS(dataAttrMatch[4]),
            value: mapTailwindValueToCSS(dataAttrMatch[4], dataAttrMatch[5]),
          },
        });
        continue;
      }

      // Pattern 2: Simple descendant selector with class
      // Example: [&_.icon]:opacity-0
      const simpleDescendantMatch = cls.match(/^\[&_\.([^\]]+)\]:([^-]+)-(.+)$/);

      if (simpleDescendantMatch && simpleDescendantMatch[1] && simpleDescendantMatch[2] && simpleDescendantMatch[3]) {
        unparseable.push({
          originalClass: cls,
          category: 'descendant-selector',
          pattern: {
            baseSelector: '&',
            targetClass: simpleDescendantMatch[1],
            property: mapTailwindPropertyToCSS(simpleDescendantMatch[2]),
            value: mapTailwindValueToCSS(simpleDescendantMatch[2], simpleDescendantMatch[3]),
          },
        });
        continue;
      }

      // Pattern 3: Other complex arbitrary selectors
      // Mark them as unparseable but don't attempt to extract structure
      if (cls.startsWith('[&')) {
        unparseable.push({
          originalClass: cls,
          category: 'other',
        });
      }
    }

    if (unparseable.length > 0) {
      unparseableByKey.set(key, unparseable);
    }
  }

  return unparseableByKey;
}

/**
 * Map Tailwind utility prefix to CSS property
 */
function mapTailwindPropertyToCSS(utility: string): string {
  const map: Record<string, string> = {
    opacity: 'opacity',
    color: 'color',
    bg: 'background-color',
    translate: 'translate',
    scale: 'scale',
    w: 'width',
    h: 'height',
  };
  return map[utility] || utility;
}

/**
 * Map Tailwind value to CSS value
 */
function mapTailwindValueToCSS(utility: string, value: string): string {
  // Handle opacity percentages
  if (utility === 'opacity') {
    if (value === '0') return '0%';
    if (value === '100') return '100%';
    if (value === '50') return '50%';
  }

  // Handle other percentages
  if (value === '100') return '100%';

  // Handle pixel values
  if (/^\d+px$/.test(value)) return value;

  // Pass through as-is for other values
  return value;
}
