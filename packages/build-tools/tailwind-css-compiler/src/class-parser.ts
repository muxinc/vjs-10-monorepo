import { parseCandidate, createSimplifiedDesignSystem } from './tailwind-ast/index.js'
import type { Candidate, Variant } from './tailwind-ast/index.js'
import type { ArbitraryValue, ContainerQuery, ClassUsage, EnhancedClassUsage } from './types.js'

/**
 * Enhanced class parsing result with container query and arbitrary value support
 */
export interface ParsedClasses {
  /** Simple utilities that can use @apply */
  simpleClasses: string[]
  /** Container declarations like @container/name */
  containerDeclarations: string[]
  /** Container query usages like @7xl/root:text-lg */
  containerQueries: ContainerQuery[]
  /** Arbitrary value usages like text-[0.9375rem] */
  arbitraryValues: ArbitraryValue[]
}

// Create the design system once and reuse it
const designSystem = createSimplifiedDesignSystem()

/**
 * Parse space-separated class string into categorized parts using official Tailwind parsing
 */
export function parseEnhancedClassString(classString: string): ParsedClasses {
  const classes = classString.split(/\s+/).filter((cls) => cls)

  const result: ParsedClasses = {
    simpleClasses: [],
    containerDeclarations: [],
    containerQueries: [],
    arbitraryValues: [],
  }

  for (const cls of classes) {
    // Parse the class using official Tailwind parsing
    const candidates = Array.from(parseCandidate(cls, designSystem))

    if (candidates.length === 0) {
      // If no candidates were parsed, it might be an invalid class or unsupported pattern
      // For now, try to handle container declarations manually as they're special
      if (isContainerDeclaration(cls)) {
        result.containerDeclarations.push(cls)
        continue
      }

      // Skip unknown classes but don't throw an error
      console.log('UNPARSEABLE CLASS (adding as simple):', cls)
      result.simpleClasses.push(cls)
      continue
    }

    // Process the first candidate (there's usually only one)
    const candidate = candidates[0]

    // Categorize based on the parsed candidate
    if (isContainerDeclaration(cls)) {
      result.containerDeclarations.push(cls)
    } else if (isContainerQuery(candidate)) {
      const parsed = parseContainerQueryFromCandidate(candidate, cls)
      if (parsed) {
        result.containerQueries.push(parsed)
      } else {
        result.simpleClasses.push(cls)
      }
    } else if (hasArbitraryValue(candidate)) {
      const parsed = parseArbitraryValueFromCandidate(candidate, cls)
      if (parsed) {
        result.arbitraryValues.push(parsed)
      } else {
        result.simpleClasses.push(cls)
      }
    } else {
      // Everything else is a simple class that can use @apply
      result.simpleClasses.push(cls)
    }
  }

  return result
}

/**
 * Check if a class is a container declaration (e.g., @container/root)
 */
function isContainerDeclaration(cls: string): boolean {
  return /^@container(\/\w+)?$/.test(cls)
}

/**
 * Check if a parsed candidate represents a container query
 */
function isContainerQuery(candidate: Candidate): boolean {
  // Container queries have variants that start with @ and have functional variant modifiers
  return candidate.variants.some(variant =>
    variant.kind === 'functional' &&
    variant.root.startsWith('@') &&
    variant.modifier !== null
  )
}

/**
 * Check if a parsed candidate has arbitrary values
 */
function hasArbitraryValue(candidate: Candidate): boolean {
  if (candidate.kind === 'arbitrary') return true
  if (candidate.kind === 'functional' && candidate.value?.kind === 'arbitrary') return true

  // Check if any variant has arbitrary values
  return candidate.variants.some(variant =>
    (variant.kind === 'functional' || variant.kind === 'compound') &&
    variant.value?.kind === 'arbitrary'
  )
}

/**
 * Parse a container query from a parsed candidate
 */
function parseContainerQueryFromCandidate(candidate: Candidate, originalClass: string): ContainerQuery | null {
  // Look for @-variants in the candidate
  for (const variant of candidate.variants) {
    if (variant.kind === 'functional' && variant.root.startsWith('@') && variant.modifier?.kind === 'named') {
      // This is a container query like @7xl/root:text-lg
      // Extract breakpoint from variant root (remove @), container from modifier, utility from candidate root+value
      const breakpoint = variant.root.slice(1) // Remove @ prefix
      const container = variant.modifier.value

      // Build utility string from candidate
      let utility = candidate.root
      if (candidate.kind === 'functional' && candidate.value) {
        if (candidate.value.kind === 'named') {
          utility += `-${candidate.value.value}`
        } else if (candidate.value.kind === 'arbitrary') {
          utility += `-[${candidate.value.value}]`
        }
      }

      return {
        breakpoint,
        container,
        utility,
      }
    }
  }

  return null
}

/**
 * Parse arbitrary values from a parsed candidate
 */
function parseArbitraryValueFromCandidate(candidate: Candidate, originalClass: string): ArbitraryValue | null {
  // Handle arbitrary properties like [color:red]
  if (candidate.kind === 'arbitrary') {
    return {
      property: candidate.property,
      value: candidate.value,
      originalClass,
    }
  }

  // Handle functional utilities with arbitrary values like text-[14px]
  if (candidate.kind === 'functional' && candidate.value?.kind === 'arbitrary') {
    const property = mapUtilityToProperty(candidate.root, candidate.value.value)
    return {
      property,
      value: candidate.value.value,
      originalClass,
    }
  }

  return null
}

/**
 * Map utility root names to CSS properties
 */
function mapUtilityToProperty(root: string, value: string): string {
  const propertyMap: Record<string, string> = {
    'text': 'font-size',
    'font': isNumeric(value) ? 'font-weight' : 'font-family',
    'w': 'width',
    'h': 'height',
    'bg': isColorValue(value) ? 'background-color' : 'background',
    'p': 'padding',
    'px': 'padding-left',
    'py': 'padding-top',
    'pt': 'padding-top',
    'pr': 'padding-right',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'm': 'margin',
    'mx': 'margin-left',
    'my': 'margin-top',
    'mt': 'margin-top',
    'mr': 'margin-right',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'tracking': 'letter-spacing',
    'leading': 'line-height',
    'rounded': 'border-radius',
    'shadow': 'box-shadow',
    'ring': 'box-shadow',
    'opacity': 'opacity',
    'z': 'z-index',
  }

  return propertyMap[root] || root
}

/**
 * Check if a value looks numeric
 */
function isNumeric(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value)
}

/**
 * Check if a value looks like a color
 */
function isColorValue(value: string): boolean {
  return value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')
}

/**
 * Transform a ClassUsage into an EnhancedClassUsage by parsing the classes
 */
export function enhanceClassUsage(usage: ClassUsage): EnhancedClassUsage {
  const classString = usage.classes.join(' ')
  const parsed = parseEnhancedClassString(classString)

  return {
    ...usage,
    simpleClasses: parsed.simpleClasses,
    containerDeclarations: parsed.containerDeclarations,
    containerQueries: parsed.containerQueries,
    arbitraryValues: parsed.arbitraryValues,
  }
}

/**
 * Transform multiple ClassUsages into EnhancedClassUsages
 */
export function enhanceClassUsages(usages: ClassUsage[]): EnhancedClassUsage[] {
  return usages.map(enhanceClassUsage)
}