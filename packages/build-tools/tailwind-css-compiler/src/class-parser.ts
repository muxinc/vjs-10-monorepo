import { parseClassString as parseClasses } from '@toddledev/tailwind-parser';
import type { ArbitraryValue, ContainerQuery, ClassUsage, EnhancedClassUsage } from './types.js';

/**
 * Enhanced class parsing result with container query and arbitrary value support
 */
export interface ParsedClasses {
  /** Simple utilities that can use @apply */
  simpleClasses: string[];
  /** Container declarations like @container/name */
  containerDeclarations: string[];
  /** Container query usages like @7xl/root:text-lg */
  containerQueries: ContainerQuery[];
  /** Arbitrary value usages like text-[0.9375rem] */
  arbitraryValues: ArbitraryValue[];
}

/**
 * Parse space-separated class string into categorized parts
 */
export function parseEnhancedClassString(classString: string): ParsedClasses {
  const classes = classString.split(/\s+/).filter((cls) => cls);

  const result: ParsedClasses = {
    simpleClasses: [],
    containerDeclarations: [],
    containerQueries: [],
    arbitraryValues: [],
  };

  for (const cls of classes) {
    if (isContainerDeclaration(cls)) {
      result.containerDeclarations.push(cls);
    } else if (isContainerQuery(cls)) {
      const parsed = parseContainerQuery(cls);
      if (parsed) {
        result.containerQueries.push(parsed);
      }
    } else if (isComplexUtility(cls)) {
      // Complex utilities that need special handling - skip for now
      console.log('SKIPPING COMPLEX UTILITY:', cls);
    } else if (isArbitraryValue(cls)) {
      const parsed = parseArbitraryValue(cls);
      if (parsed) {
        result.arbitraryValues.push(parsed);
      }
    } else {
      // Simple class that can use @apply
      result.simpleClasses.push(cls);
    }
  }

  return result;
}

/**
 * Check if a class is a container declaration (e.g., @container/root)
 */
function isContainerDeclaration(cls: string): boolean {
  return /^@container(\/\w+)?$/.test(cls);
}

/**
 * Check if a class is a container query usage (e.g., @7xl/root:text-lg)
 */
function isContainerQuery(cls: string): boolean {
  return /^@\w+\/\w+:.+/.test(cls);
}

/**
 * Check if a class contains arbitrary values (e.g., text-[0.9375rem])
 */
function isArbitraryValue(cls: string): boolean {
  return /\[.+\]/.test(cls);
}

/**
 * Check if a class is a complex utility that needs special handling
 */
function isComplexUtility(cls: string): boolean {
  // Group variants (group/name, group-hover/name, etc.)
  if (/^group(\/\w+|$)/.test(cls)) return true;
  if (/^group-\w+(\/\w+|$)/.test(cls)) return true;

  // Complex selectors with & (including [&:fullscreen] patterns)
  if (cls.includes('&')) return true;
  if (cls.includes('[&')) return true;

  // Pseudo-selectors that need special handling
  if (cls.includes(':not(') || cls.includes('[data-')) return true;

  // Other patterns that typically don't work with @apply
  if (cls.includes('before:') || cls.includes('after:')) return true;
  if (cls.includes('::')) return true;

  return false;
}

/**
 * Parse a container query class into its components
 */
function parseContainerQuery(cls: string): ContainerQuery | null {
  const match = cls.match(/^@(\w+)\/(\w+):(.+)$/);
  if (!match) return null;

  const [, breakpoint, container, utility] = match;
  return {
    breakpoint,
    container,
    utility,
  };
}

/**
 * Parse an arbitrary value class into CSS property and value
 */
function parseArbitraryValue(cls: string): ArbitraryValue | null {
  try {
    // Use the @toddledev/tailwind-parser library to parse the class
    const parsed = parseClasses(cls);

    // The parser should return an object with style
    if (parsed && typeof parsed === 'object' && parsed.style) {
      const styles = parsed.style as Record<string, string | number>;
      const firstRule = Object.entries(styles)[0];

      if (firstRule) {
        const [property, value] = firstRule;
        // Only trust the library if it returns sensible results for the given class
        // If it's returning generic/wrong styles like flex-direction for font-[510], fall back to manual parsing
        if (cls.startsWith('font-[') && property !== 'font-weight' && property !== 'font-family') {
          return parseArbitraryValueManual(cls);
        }
        if (cls.startsWith('text-[') && property !== 'font-size') {
          return parseArbitraryValueManual(cls);
        }
        if (cls.startsWith('w-[') && property !== 'width') {
          return parseArbitraryValueManual(cls);
        }
        if (cls.startsWith('h-[') && property !== 'height') {
          return parseArbitraryValueManual(cls);
        }
        if (cls.startsWith('bg-[') && !property.includes('background')) {
          return parseArbitraryValueManual(cls);
        }
        if (cls.startsWith('tracking-[') && property !== 'letter-spacing') {
          return parseArbitraryValueManual(cls);
        }

        return {
          property: property,
          value: String(value),
          originalClass: cls,
        };
      }
    }
  } catch (error) {
    // Library parsing failed, fall back to manual parsing
  }

  // Fallback to manual parsing for common patterns
  return parseArbitraryValueManual(cls);
}

/**
 * Manual fallback parser for arbitrary values
 */
function parseArbitraryValueManual(cls: string): ArbitraryValue | null {
  // Common patterns for arbitrary values
  const patterns = [
    // text-[value] -> font-size
    { regex: /^text-\[(.+)\]$/, property: 'font-size' },
    // font-\[value\] -> font-weight (if numeric) or font-family
    { regex: /^font-\[(.+)\]$/, property: 'font-weight' },
    // w-[value] -> width
    { regex: /^w-\[(.+)\]$/, property: 'width' },
    // h-[value] -> height
    { regex: /^h-\[(.+)\]$/, property: 'height' },
    // bg-\[value\] -> background-color
    { regex: /^bg-\[(.+)\]$/, property: 'background-color' },
    // p-[value] -> padding
    { regex: /^p-\[(.+)\]$/, property: 'padding' },
    // m-[value] -> margin
    { regex: /^m-\[(.+)\]$/, property: 'margin' },
    // tracking-[value] -> letter-spacing
    { regex: /^tracking-\[(.+)\]$/, property: 'letter-spacing' },
  ];

  for (const { regex, property } of patterns) {
    const match = cls.match(regex);
    if (match) {
      return {
        property,
        value: match[1],
        originalClass: cls,
      };
    }
  }

  return null;
}

/**
 * Transform a ClassUsage into an EnhancedClassUsage by parsing the classes
 */
export function enhanceClassUsage(usage: ClassUsage): EnhancedClassUsage {
  const classString = usage.classes.join(' ');
  const parsed = parseEnhancedClassString(classString);

  return {
    ...usage,
    simpleClasses: parsed.simpleClasses,
    containerDeclarations: parsed.containerDeclarations,
    containerQueries: parsed.containerQueries,
    arbitraryValues: parsed.arbitraryValues,
  };
}

/**
 * Transform multiple ClassUsages into EnhancedClassUsages
 */
export function enhanceClassUsages(usages: ClassUsage[]): EnhancedClassUsage[] {
  return usages.map(enhanceClassUsage);
}