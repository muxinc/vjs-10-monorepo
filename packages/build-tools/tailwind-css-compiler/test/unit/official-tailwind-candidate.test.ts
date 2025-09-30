import { expect, it } from 'vitest';
import { parseCandidate, createSimplifiedDesignSystem } from '../../src/tailwind-ast/index.js';

// Mock classes for testing - simplified versions of official Tailwind classes
class Utilities {
  private utilities = new Map<string, { kind: 'static' | 'functional'; fn: Function }>();

  static(name: string, fn: Function) {
    this.utilities.set(name, { kind: 'static', fn });
  }

  functional(name: string, fn: Function) {
    this.utilities.set(name, { kind: 'functional', fn });
  }

  has(name: string, kind: 'static' | 'functional'): boolean {
    const utility = this.utilities.get(name);
    return utility?.kind === kind;
  }

  getUtilities() {
    return this.utilities;
  }
}

class Variants {
  private variants = new Map<string, { kind: 'static' | 'functional' | 'compound'; fn: Function }>();

  static(name: string, fn: Function) {
    this.variants.set(name, { kind: 'static', fn });
  }

  functional(name: string, fn: Function) {
    this.variants.set(name, { kind: 'functional', fn });
  }

  compound(name: string, compounds: any, fn: Function) {
    this.variants.set(name, { kind: 'compound', fn });
  }

  has(name: string): boolean {
    return this.variants.has(name);
  }

  kind(name: string): 'static' | 'functional' | 'compound' | undefined {
    return this.variants.get(name)?.kind;
  }

  compoundsWith(root: string, subVariant: any): boolean {
    // Simplified implementation - in real Tailwind this is more complex
    return root === 'group' || root === 'peer';
  }

  getVariants() {
    return this.variants;
  }
}

// Mock compounds
const Compounds = {
  StyleRules: 'StyleRules'
};

function run(
  candidate: string,
  {
    utilities,
    variants,
    prefix,
  }: { utilities?: Utilities; variants?: Variants; prefix?: string } = {},
) {
  utilities ??= new Utilities();
  variants ??= new Variants();

  // Create enhanced design system based on our simplified one
  const designSystem = createSimplifiedDesignSystem();
  designSystem.theme.prefix = prefix ?? null;

  // Enhance our design system with test-specific utilities and variants
  const originalUtilitiesHas = designSystem.utilities.has;
  designSystem.utilities.has = (name: string, kind: 'static' | 'functional'): boolean => {
    return utilities!.has(name, kind) || originalUtilitiesHas.call(designSystem.utilities, name, kind);
  };

  const originalVariantsHas = designSystem.variants.has;
  designSystem.variants.has = (name: string): boolean => {
    return variants!.has(name) || originalVariantsHas.call(designSystem.variants, name);
  };

  const originalVariantsKind = designSystem.variants.kind;
  designSystem.variants.kind = (name: string): 'static' | 'functional' | 'compound' => {
    const testKind = variants!.kind(name);
    if (testKind) return testKind;
    return originalVariantsKind.call(designSystem.variants, name);
  };

  const originalCompoundsWith = designSystem.variants.compoundsWith;
  designSystem.variants.compoundsWith = (root: string, subVariant: any): boolean => {
    if (variants!.has(root)) {
      return variants!.compoundsWith(root, subVariant);
    }
    return originalCompoundsWith.call(designSystem.variants, root, subVariant);
  };

  return Array.from(parseCandidate(candidate, designSystem));
}

// Start with basic tests to ensure our infrastructure works

it('should skip unknown utilities', () => {
  expect(run('unknown-utility')).toEqual([]);
});

it('should skip unknown variants', () => {
  expect(run('unknown-variant:flex')).toEqual([]);
});

it('should parse a simple utility', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const result = run('flex', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: 'flex',
    root: 'flex',
    variants: [],
  }]);
});

it('should parse a simple utility that should be important', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const result = run('flex!', { utilities });

  expect(result).toEqual([{
    important: true,
    kind: 'static',
    raw: 'flex!',
    root: 'flex',
    variants: [],
  }]);
});

it('should parse a simple utility that can be negative', () => {
  const utilities = new Utilities();
  utilities.functional('-translate-x', () => []);

  const result = run('-translate-x-4', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: null,
    raw: '-translate-x-4',
    root: '-translate-x',
    value: {
      fraction: null,
      kind: 'named',
      value: '4',
    },
    variants: [],
  }]);
});

it('should parse a simple utility with a variant', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const variants = new Variants();
  variants.static('hover', () => {});

  const result = run('hover:flex', { utilities, variants });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: 'hover:flex',
    root: 'flex',
    variants: [
      {
        kind: 'static',
        root: 'hover',
      },
    ],
  }]);
});

it('should parse a simple utility with stacked variants', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const variants = new Variants();
  variants.static('hover', () => {});
  variants.static('focus', () => {});

  const result = run('focus:hover:flex', { utilities, variants });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: 'focus:hover:flex',
    root: 'flex',
    variants: [
      {
        kind: 'static',
        root: 'hover',
      },
      {
        kind: 'static',
        root: 'focus',
      },
    ],
  }]);
});

it('should parse a utility with an arbitrary value', () => {
  const utilities = new Utilities();
  utilities.functional('bg', () => []);

  const result = run('bg-[#0088cc]', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: null,
    raw: 'bg-[#0088cc]',
    root: 'bg',
    value: {
      dataType: null,
      kind: 'arbitrary',
      value: '#0088cc',
    },
    variants: [],
  }]);
});

it('should parse arbitrary properties', () => {
  const result = run('[color:red]');

  expect(result).toEqual([{
    important: false,
    kind: 'arbitrary',
    modifier: null,
    property: 'color',
    raw: '[color:red]',
    value: 'red',
    variants: [],
  }]);
});

it('should parse arbitrary properties with a modifier', () => {
  const result = run('[color:red]/50');

  expect(result).toEqual([{
    important: false,
    kind: 'arbitrary',
    modifier: {
      kind: 'named',
      value: '50',
    },
    property: 'color',
    raw: '[color:red]/50',
    value: 'red',
    variants: [],
  }]);
});

// Test underscore to space conversion
it('should replace `_` with ` `', () => {
  const utilities = new Utilities();
  utilities.functional('content', () => []);

  const result = run('content-["hello_world"]', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: null,
    raw: 'content-["hello_world"]',
    root: 'content',
    value: {
      dataType: null,
      kind: 'arbitrary',
      value: '"hello world"',
    },
    variants: [],
  }]);
});

// Test escaped underscores
it('should not replace `\\_` with ` ` (when it is escaped)', () => {
  const utilities = new Utilities();
  utilities.functional('content', () => []);

  const result = run('content-["hello\\_world"]', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: null,
    raw: 'content-["hello\\_world"]',
    root: 'content',
    value: {
      dataType: null,
      kind: 'arbitrary',
      value: '"hello_world"',
    },
    variants: [],
  }]);
});

// More comprehensive tests from official test suite

it('should parse a utility with a modifier', () => {
  const utilities = new Utilities();
  utilities.functional('bg', () => []);

  const result = run('bg-red-500/50', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: {
      kind: 'named',
      value: '50',
    },
    raw: 'bg-red-500/50',
    root: 'bg',
    value: {
      fraction: 'red-500/50',
      kind: 'named',
      value: 'red-500',
    },
    variants: [],
  }]);
});

it('should parse a utility with an arbitrary modifier', () => {
  const utilities = new Utilities();
  utilities.functional('bg', () => []);

  const result = run('bg-red-500/[50%]', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'functional',
    modifier: {
      kind: 'arbitrary',
      value: '50%',
    },
    raw: 'bg-red-500/[50%]',
    root: 'bg',
    value: {
      fraction: null,
      kind: 'named',
      value: 'red-500',
    },
    variants: [],
  }]);
});

it('should parse a simple utility with an arbitrary variant', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const result = run('[&_p]:flex', { utilities });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: '[&_p]:flex',
    root: 'flex',
    variants: [
      {
        kind: 'arbitrary',
        relative: false,
        selector: '& p',
      },
    ],
  }]);
});

it('should parse a simple utility with a parameterized variant', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const variants = new Variants();
  variants.functional('data', () => {});

  const result = run('data-[disabled]:flex', { utilities, variants });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: 'data-[disabled]:flex',
    root: 'flex',
    variants: [
      {
        kind: 'functional',
        modifier: null,
        root: 'data',
        value: {
          kind: 'arbitrary',
          value: 'disabled',
        },
      },
    ],
  }]);
});

it('should parse compound variants', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  const variants = new Variants();
  variants.compound('group', Compounds.StyleRules, () => {});

  const result = run('group-[&_p]/parent-name:flex', { utilities, variants });

  expect(result).toEqual([{
    important: false,
    kind: 'static',
    raw: 'group-[&_p]/parent-name:flex',
    root: 'flex',
    variants: [
      {
        kind: 'compound',
        modifier: {
          kind: 'named',
          value: 'parent-name',
        },
        root: 'group',
        variant: {
          kind: 'arbitrary',
          relative: false,
          selector: '& p',
        },
      },
    ],
  }]);
});

it('should not parse unknown utilities', () => {
  expect(run('unknown-utility')).toEqual([]);
});

it('should not parse unknown variants', () => {
  expect(run('unknown-variant:flex')).toEqual([]);
});

it('should not parse a partial utility', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);
  utilities.functional('bg', () => []);

  expect(run('flex-', { utilities })).toEqual([]);
  expect(run('bg-', { utilities })).toEqual([]);
});

it('should not parse static utilities with a modifier', () => {
  const utilities = new Utilities();
  utilities.static('flex', () => []);

  expect(run('flex/foo', { utilities })).toEqual([]);
});

it('should skip arbitrary properties that start with an uppercase letter', () => {
  expect(run('[Color:red]')).toEqual([]);
});

it('should skip arbitrary properties that do not have a property and value', () => {
  expect(run('[color]')).toEqual([]);
});