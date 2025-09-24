import type { Variant } from './candidate.js'
import { parseVariant } from './candidate.js'

// Simplified DesignSystem interface for our use cases
export interface DesignSystem {
  theme: {
    prefix?: string
  }
  utilities: {
    has(name: string, kind: 'static' | 'functional'): boolean
  }
  variants: {
    has(name: string): boolean
    kind(name: string): 'static' | 'functional' | 'compound'
    compoundsWith(root: string, subVariant: Variant): boolean
  }
  parseVariant(variant: string): Variant | null
}

// Create a simplified DesignSystem mock that supports all VJS-10 use cases
export function createSimplifiedDesignSystem(): DesignSystem {
  // Standard Tailwind utilities we encounter in our codebase
  const utilities = new Set([
    // Layout & spacing
    'relative', 'absolute', 'static', 'fixed', 'sticky',
    'inset', 'top', 'right', 'bottom', 'left',
    'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'hidden', 'table', 'table-cell', 'table-row',
    'overflow', 'overflow-x', 'overflow-y', 'overflow-clip', 'overflow-hidden', 'overflow-visible', 'overflow-scroll', 'overflow-auto',
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
    'w', 'h', 'min-w', 'min-h', 'max-w', 'max-h',
    'size',

    // Typography
    'text', 'font', 'leading', 'tracking', 'text-shadow',
    'antialiased', 'subpixel-antialiased',
    'tabular-nums', 'font-sans', 'font-serif', 'font-mono',

    // Colors & backgrounds
    'bg', 'text', 'border', 'ring', 'shadow',
    'opacity', 'bg-opacity', 'text-opacity',
    'from', 'via', 'to', 'bg-gradient-to-t', 'bg-gradient-to-b', 'bg-gradient-to-r', 'bg-gradient-to-l',

    // Borders & effects
    'border', 'border-t', 'border-r', 'border-b', 'border-l',
    'border-x', 'border-y', 'rounded', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l',
    'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl', 'rounded-full',
    'ring', 'ring-inset', 'ring-offset',
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'drop-shadow',

    // Layout & positioning
    'z', 'flex', 'flex-1', 'flex-grow', 'flex-shrink', 'flex-none',
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline',
    'gap', 'gap-x', 'gap-y',
    'grid', 'grid-cols', 'grid-rows', 'col-span', 'row-span',

    // Interactions
    'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text',
    'cursor-move', 'cursor-help', 'cursor-not-allowed',
    'pointer-events-none', 'pointer-events-auto',
    'select-none', 'select-text', 'select-all', 'select-auto',

    // Transforms & transitions
    'transform', 'scale', 'rotate', 'translate', 'skew',
    'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
    'duration', 'delay',
    'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',

    // Backdrop filters
    'backdrop-blur', 'backdrop-brightness', 'backdrop-contrast', 'backdrop-grayscale',
    'backdrop-hue-rotate', 'backdrop-invert', 'backdrop-opacity', 'backdrop-saturate', 'backdrop-sepia',

    // Filters
    'blur', 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia',

    // Accessibility
    'sr-only', 'not-sr-only',

    // Grid areas (for our complex selectors)
    'grid-area',

    // Animation
    'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',

    // Will-change
    'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',

    // Origin
    'origin-center', 'origin-top', 'origin-top-right', 'origin-right', 'origin-bottom-right',
    'origin-bottom', 'origin-bottom-left', 'origin-left', 'origin-top-left',

    // Outline offset
    '-outline-offset-1', '-outline-offset-2', '-outline-offset-4', '-outline-offset-8',
    'outline-offset-0', 'outline-offset-1', 'outline-offset-2', 'outline-offset-4', 'outline-offset-8',
  ])

  const functionalUtilities = new Set([
    // All utilities that can take values
    'bg', 'text', 'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
    'w', 'h', 'min-w', 'min-h', 'max-w', 'max-h', 'size',
    'font', 'text', 'leading', 'tracking',
    'border', 'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y',
    'rounded', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l',
    'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl',
    'shadow', 'ring', 'opacity', 'z', 'gap', 'gap-x', 'gap-y',
    'grid-cols', 'grid-rows', 'col-span', 'row-span',
    'scale', 'rotate', 'translate', 'skew', 'duration', 'delay',
    'backdrop-blur', 'backdrop-brightness', 'backdrop-contrast', 'backdrop-saturate',
    'blur', 'brightness', 'contrast', 'saturate', 'inset', 'top', 'right', 'bottom', 'left'
  ])

  const variants = new Set([
    // Pseudo-classes
    'hover', 'focus', 'focus-visible', 'focus-within', 'active', 'visited',
    'target', 'first', 'last', 'only', 'odd', 'even',
    'first-of-type', 'last-of-type', 'only-of-type',
    'empty', 'disabled', 'enabled', 'checked', 'indeterminate',
    'default', 'required', 'valid', 'invalid', 'in-range', 'out-of-range',
    'placeholder-shown', 'autofill', 'read-only',

    // Pseudo-elements
    'before', 'after', 'first-letter', 'first-line', 'marker', 'selection',
    'file', 'backdrop', 'placeholder',

    // Media queries
    'sm', 'md', 'lg', 'xl', '2xl',
    'dark', 'light',
    'motion-safe', 'motion-reduce',
    'contrast-more', 'contrast-less',
    'print', 'screen',

    // Container queries
    '@container', '@',

    // Group/peer variants (compound)
    'group', 'peer',

    // ARIA states
    'aria-checked', 'aria-disabled', 'aria-expanded', 'aria-hidden',
    'aria-pressed', 'aria-readonly', 'aria-required', 'aria-selected',

    // Data attributes
    'data-active', 'data-disabled', 'data-focus', 'data-hover'
  ])

  const functionalVariants = new Set([
    '@container', '@', // for container queries like @7xl, @sm, etc.
    'group', 'peer', // for modifiers like group/button, peer/input
    'aria', 'data', // for aria-*, data-*
  ])

  const compoundVariants = new Set([
    'group', 'peer'
  ])

  return {
    theme: {
      prefix: undefined
    },
    utilities: {
      has(name: string, kind: 'static' | 'functional'): boolean {
        if (kind === 'static') {
          return utilities.has(name) && !functionalUtilities.has(name)
        } else {
          return functionalUtilities.has(name) || utilities.has(name)
        }
      }
    },
    variants: {
      has(name: string): boolean {
        return variants.has(name) || variants.has(name.split('-')[0]) || name.startsWith('@')
      },
      kind(name: string): 'static' | 'functional' | 'compound' {
        if (compoundVariants.has(name)) return 'compound'
        if (functionalVariants.has(name) || name.startsWith('@')) return 'functional'
        return 'static'
      },
      compoundsWith(root: string, subVariant: Variant): boolean {
        // Allow group-* and peer-* compounds
        if (root === 'group' || root === 'peer') {
          return true
        }
        return false
      }
    },
    parseVariant(variant: string): Variant | null {
      return parseVariant(variant, this)
    }
  }
}