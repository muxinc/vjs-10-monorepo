/**
 * Core Tailwind → CSS Modules compilation
 * Adapted from vjs-10-monorepo-robots build.ts
 */

import postcss, { type Root, type Rule, type AtRule, type Node, type Container, type ChildNode, type Declaration } from 'postcss';
import postcssNested from 'postcss-nested';
import tailwindcss from '@tailwindcss/postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser, { type FunctionNode, type Node as ValueNode } from 'postcss-value-parser';

import type { TailwindCompilationConfig, CSSModulesOutput } from './types.js';
import { enhanceClassString } from './class-parser.js';
import { resolveCSSVariables } from './resolveCSSVariables.js';

type TailwindConfig = Record<string, unknown>;
type TailwindPluginFactory = (options: { config: TailwindConfig }) => any;

// FIXME: Pull these defaults from Tailwind itself?
const TAILWIND_DEFAULT_VARS: Record<string, string> = {
  '--tw-translate-x': '0px',
  '--tw-translate-y': '0px',
  '--tw-translate-z': '0px',
  '--tw-rotate': '0deg',
  '--tw-skew-x': '0deg',
  '--tw-skew-y': '0deg',
  '--tw-scale-x': '1',
  '--tw-scale-y': '1',
  '--tw-scale-z': '1',
  '--tw-scroll-snap-strictness': 'proximity',
  '--tw-ring-inset': '',
  '--tw-ring-offset-width': '0px',
  '--tw-ring-offset-color': '#fff',
  '--tw-ring-color': 'rgb(59 130 246 / 0.5)',
  '--tw-ring-offset-shadow': '0 0 #0000',
  '--tw-ring-shadow': '0 0 #0000',
  '--tw-shadow': '0 0 #0000',
  '--tw-shadow-colored': '0 0 #0000',
  '--tw-shadow-color': 'rgba(0, 0, 0, 0.2)',
  '--tw-inset-shadow': '0 0 #0000',
  '--tw-gradient-from': 'transparent',
  '--tw-gradient-to': 'transparent',
  '--tw-gradient-stops': 'transparent, transparent',
  '--tw-gradient-position': '',
  '--tw-gradient-from-position': '',
  '--tw-gradient-to-position': '',
  '--tw-gradient-via-stops': '',
  '--tw-backdrop-blur': '',
  '--tw-backdrop-brightness': '',
  '--tw-backdrop-contrast': '',
  '--tw-backdrop-grayscale': '',
  '--tw-backdrop-hue-rotate': '',
  '--tw-backdrop-invert': '',
  '--tw-backdrop-opacity': '',
  '--tw-backdrop-saturate': '',
  '--tw-backdrop-sepia': '',
  '--tw-content': "''",
};

type RuleRecord = {
  rule: Rule;
  ancestors: AtRule[];
};

type RuleParent = Exclude<Rule['parent'], undefined>;

function buildRawContent(entries: [string, string][]): string {
  const rows = entries.map(([key, value]) => {
    const escaped = value.replace(/"/g, '&quot;');
    return `<div data-style="${key}" class="${escaped}"></div>`;
  });
  return rows.join('\n');
}

function decodeCssIdentifier(value: string): string {
  return value.replace(/\\([0-9A-Fa-f]{1,6}\s?|.)/g, (_, escapeSequence: string) => {
    if (escapeSequence.length > 1 && /\s$/.test(escapeSequence)) {
      const hex = escapeSequence.trim();
      if (hex.length === 0) {
        return '';
      }
      const codePoint = parseInt(hex, 16);
      if (!Number.isNaN(codePoint)) {
        return String.fromCodePoint(codePoint);
      }
    }
    switch (escapeSequence) {
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      default:
        return escapeSequence;
    }
  });
}

function collectRuleIndex(root: Root): Map<string, RuleRecord[]> {
  const index = new Map<string, RuleRecord[]>();
  root.walkRules((rule) => {
    const classNames = new Set<string>();
    selectorParser((selectors) => {
      selectors.walkClasses((node) => {
        const raw = node.value;
        classNames.add(raw);
        const decoded = decodeCssIdentifier(raw);
        classNames.add(decoded);
      });
    }).processSync(rule.selector);
    if (classNames.size === 0) return;

    const ancestors: AtRule[] = [];
    let parent = (rule.parent ?? undefined) as RuleParent | undefined;
    while (parent && parent.type !== 'root') {
      if (parent.type === 'atrule') {
        ancestors.unshift(parent as AtRule);
      }
      parent = (parent.parent ?? undefined) as RuleParent | undefined;
    }

    for (const className of classNames) {
      if (!className) continue;
      if (!index.has(className)) index.set(className, []);
      index.get(className)!.push({ rule, ancestors });
    }
  });
  return index;
}

function cloneWithAncestors(record: RuleRecord): Node {
  const clonedRule = record.rule.clone();
  return record.ancestors.reduceRight<Node>((child, ancestor) => {
    const parentClone = ancestor.clone({ nodes: [] });
    parentClone.append(child);
    return parentClone;
  }, clonedRule);
}

function rescopeSelectors(node: Node, fromClass: string, toClass: string): void {
  if ('nodes' in node && Array.isArray(node.nodes)) {
    for (const child of node.nodes) {
      rescopeSelectors(child as Node, fromClass, toClass);
    }
  }
  if (node.type !== 'rule') return;
  const rule = node as Rule;
  const transformed = selectorParser((selectors) => {
    selectors.walkClasses((classNode) => {
      if (classNode.value === fromClass) {
        classNode.value = toClass;
      }
    });
  }).processSync(rule.selector);
  rule.selector = transformed;
}

/**
 * Transform group-hover selectors from :where(.group\/name) format to descendant selectors
 * Example: .Controls:where(.group\/root):hover → .MediaContainer:hover .Controls
 */
function transformGroupHoverSelectorsInAST(root: Root, groupNameToClass: Map<string, string>): void {
  root.walkRules((rule) => {
    let transformed = rule.selector;

    // Pattern: .ChildClass:is(:where(.group\/groupName):pseudoClass *)
    // This matches Tailwind v4's group-hover output format
    const groupPattern = /\.([a-zA-Z][\w-]*):is\(:where\(\.group\\\/([^)]+)\):(hover|focus-within|active)\s+\*\)/g;

    transformed = transformed.replace(groupPattern, (_match, childClass, groupName, pseudoClass) => {
      const parentClass = groupNameToClass.get(groupName);
      if (parentClass) {
        // Transform to: .ParentClass:pseudoClass .ChildClass
        return `.${parentClass}:${pseudoClass} .${childClass}`;
      }
      return _match; // Keep original if we can't map the group
    });

    if (transformed !== rule.selector) {
      rule.selector = transformed;
    }
  });
}

function simplifySelectors(root: Root): void {
  root.walkRules((rule) => {
    const simplified = selectorParser((selectors) => {
      selectors.walkPseudos((pseudo) => {
        if (pseudo.value !== ':is' && pseudo.value !== ':where') return;
        if (!pseudo.nodes || pseudo.nodes.length !== 1) return;
        const innerSelector = pseudo.nodes[0];
        if (!innerSelector || innerSelector.type !== 'selector') return;
        const replacement = innerSelector.nodes.map((child) => child.clone());
        if (replacement.length === 0) {
          pseudo.remove();
        } else {
          pseudo.replaceWith(...replacement);
        }
      });

      selectors.walk((node) => {
        if (node.type !== 'universal') return;
        const parent = node.parent;
        if (!parent || parent.type !== 'selector') return;
        const nodes = parent.nodes;
        const index = nodes.indexOf(node);
        if (index === -1) return;
        const isLast = index === nodes.length - 1;
        if (!isLast) return;
        const prev = nodes[index - 1];
        if (prev && prev.type === 'combinator' && prev.value.trim() === '') {
          prev.remove();
        }
        node.remove();
      });
    }).processSync(rule.selector);

    rule.selector = simplified.replace(/\s+/g, ' ').trim();
  });
}

/**
 * Remove rules with orphaned & selectors that weren't properly flattened.
 * These are invalid CSS and occur when postcss-nested can't find a parent context.
 */
function removeOrphanedAmpersandSelectors(root: Root): void {
  const rulesToRemove: Rule[] = [];

  root.walkRules((rule) => {
    // Check if selector starts with &
    if (rule.selector.trim().startsWith('&')) {
      rulesToRemove.push(rule);
    }
  });

  // Remove all orphaned rules
  for (const rule of rulesToRemove) {
    rule.remove();
  }
}

function mergeDuplicateRules(container: Container): void {
  const seen = new Map<string, Rule>();
  container.each((node) => {
    if (node.type === 'rule') {
      const existing = seen.get(node.selector);
      if (existing) {
        node.each((child) => {
          existing.append(child.clone());
        });
        node.remove();
      } else {
        seen.set(node.selector, node);
      }
    } else if (node.type === 'atrule') {
      mergeDuplicateRules(node);
    }
  });
}

function collectGlobalTailwindVariables(root: Root): Map<string, string> {
  const globals = new Map<string, string>();
  root.walkRules((rule) => {
    if (!rule.selector.includes(':root') && !rule.selector.includes(':host')) return;
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        globals.set(decl.prop, decl.value);
      }
    });
  });
  return globals;
}

function extractVarArguments(node: FunctionNode): { name: string; fallback?: string } {
  let name = '';
  let fallback = '';
  let inFallback = false;

  for (const child of node.nodes ?? []) {
    if (child.type === 'div' && child.value === ',') {
      inFallback = true;
      continue;
    }
    if (!inFallback) {
      name += valueParser.stringify(child);
    } else {
      fallback += valueParser.stringify(child);
    }
  }

  const trimmedName = name.trim();
  const trimmedFallback = fallback.trim();
  return trimmedFallback
    ? { name: trimmedName, fallback: trimmedFallback }
    : { name: trimmedName };
}

function resolveTailwindVariables(root: Root, globalVariables: Map<string, string>): void {
  root.walkRules((rule) => {
    const variables = new Map<string, string>();
    const variableDecls: Declaration[] = [];

    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith('--tw-')) return;
      variables.set(decl.prop, decl.value);
      variableDecls.push(decl);
    });

    const memo = new Map<string, string>();
    const resolving = new Set<string>();

    const resolveValueString = (input: string): string => {
      if (!input.includes('var(--tw-')) {
        return input;
      }

      const parsed = valueParser(input);
      interface Replacement {
        start: number;
        end: number;
        value: string;
      }
      const replacements: Replacement[] = [];

      parsed.walk((node: ValueNode) => {
        if (node.type !== 'function' || node.value !== 'var') return;
        const fnNode = node as FunctionNode;
        const { name, fallback } = extractVarArguments(fnNode);
        if (!name.startsWith('--tw-')) return;
        const resolved = resolveVariable(name, fallback);
        replacements.push({
          start: fnNode.sourceIndex,
          end: fnNode.sourceIndex + valueParser.stringify(fnNode).length,
          value: resolved,
        });
      });

      if (replacements.length === 0) {
        return input;
      }

      let result = input;
      replacements.sort((a, b) => b.start - a.start);
      for (const replacement of replacements) {
        result =
          result.slice(0, replacement.start) +
          replacement.value +
          result.slice(replacement.end);
      }

      return result;
    };

    function resolveVariable(name: string, fallback?: string): string {
      const normalized = name.startsWith('--') ? name : `--${name}`;
      if (!normalized.startsWith('--tw-')) {
        return fallback ? resolveValueString(fallback) : '';
      }

      if (memo.has(normalized)) {
        return memo.get(normalized)!;
      }

      if (resolving.has(normalized)) {
        return '';
      }

      resolving.add(normalized);
      const raw = variables.get(normalized);
      const defaultValue = TAILWIND_DEFAULT_VARS[normalized];
      let resolved: string;
      if (raw === undefined) {
        const globalValue = globalVariables.get(normalized);
        if (globalValue !== undefined) {
          resolved = resolveValueString(globalValue);
        } else if (defaultValue !== undefined) {
          resolved = resolveValueString(defaultValue);
        } else {
          resolved = fallback ? resolveValueString(fallback) : '';
        }
      } else {
        resolved = resolveValueString(raw);
      }
      memo.set(normalized, resolved);
      resolving.delete(normalized);
      return resolved;
    }

    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        return;
      }

      if (!decl.value.includes('var(--tw-')) return;
      const resolved = resolveValueString(decl.value).trim();
      if (resolved === '') {
        if (decl.prop === 'content') {
          decl.value = "''";
        } else {
          decl.remove();
        }
        return;
      }
      decl.value = resolved;
    });

    for (const variableDecl of variableDecls) {
      variableDecl.remove();
    }

    if (rule.nodes.length === 0) {
      rule.remove();
    }
  });

  root.walkAtRules((atRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) {
      atRule.remove();
    }
  });
}

function dedupeDeclarations(container: Container): void {
  container.walkRules((rule) => {
    const seen = new Set<string>();
    const propDecls = new Map<string, Declaration[]>();

    // First pass: collect all declarations by property
    rule.walkDecls((decl) => {
      const key = `${decl.prop}::${decl.value}`;
      if (seen.has(key)) {
        decl.remove();
      } else {
        seen.add(key);

        // Track declarations for the same property
        if (!propDecls.has(decl.prop)) {
          propDecls.set(decl.prop, []);
        }
        propDecls.get(decl.prop)!.push(decl);
      }
    });

    // Second pass: handle duplicate properties with different values
    // For properties like border-radius, keep non-inherit values over inherit
    for (const [_prop, decls] of propDecls) {
      if (decls.length > 1) {
        // Check if we have both inherit and non-inherit values
        const nonInheritDecls = decls.filter(d => d.value !== 'inherit');
        const inheritDecls = decls.filter(d => d.value === 'inherit');

        if (nonInheritDecls.length > 0 && inheritDecls.length > 0) {
          // Remove inherit declarations when we have explicit values
          inheritDecls.forEach(d => d.remove());
        }
      }
    }
  });
}

function cleanupDeclarationValues(container: Container): void {
  container.walkDecls((decl) => {
    if (decl.prop === 'box-shadow' || decl.prop === 'text-shadow') {
      const parts = decl.value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        decl.remove();
      } else {
        decl.value = parts.join(', ');
      }
      return;
    }

    if (decl.prop === 'filter' || decl.prop === 'backdrop-filter') {
      const parts = decl.value
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        decl.remove();
      } else {
        decl.value = parts.join(' ');
      }
      return;
    }

    if (decl.prop === 'transition-property' || decl.prop === 'transition') {
      if (!decl.value.includes('--tw-')) return;
      const parts = decl.value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && !part.includes('--tw-'));
      if (parts.length === 0) {
        decl.remove();
      } else {
        decl.value = parts.join(', ');
      }
      return;
    }

    if (decl.prop === 'content' && decl.value === '') {
      decl.value = "''";
    }
  });
}

/**
 * Get container query breakpoint sizes
 */
function getContainerBreakpoints(): Record<string, string> {
  return {
    'xs': '20rem',   // 320px
    'sm': '24rem',   // 384px
    'md': '28rem',   // 448px
    'lg': '32rem',   // 512px
    'xl': '36rem',   // 576px
    '2xl': '42rem',  // 672px
    '3xl': '48rem',  // 768px
    '4xl': '56rem',  // 896px
    '5xl': '64rem',  // 1024px
    '6xl': '72rem',  // 1152px
    '7xl': '80rem',  // 1280px
  };
}

function formatCss(root: Root): string {
  const indentUnit = '  ';
  const lines: string[] = [];

  const renderNode = (node: ChildNode, depth: number): void => {
    const indent = indentUnit.repeat(depth);
    if (node.type === 'rule') {
      lines.push(`${indent}${node.selector} {`);
      node.walkDecls((decl) => {
        lines.push(`${indentUnit.repeat(depth + 1)}${decl.prop}: ${decl.value};`);
      });
      lines.push(`${indent}}`);
      return;
    }

    if (node.type === 'atrule') {
      const params = node.params ? ` ${node.params}` : '';
      if (node.nodes && node.nodes.length > 0) {
        lines.push(`${indent}@${node.name}${params} {`);
        node.each((child) => {
          renderNode(child, depth + 1);
        });
        lines.push(`${indent}}`);
      } else {
        lines.push(`${indent}@${node.name}${params};`);
      }
      return;
    }

    if (node.type === 'comment') {
      lines.push(`${indent}/*${node.text}*/`);
    }
  };

  root.each((child) => {
    renderNode(child, 0);
  });

  return lines.join('\n').trim();
}

/**
 * Compiles a Tailwind styles object to CSS Modules + TypeScript definitions
 *
 * @param config - Compilation configuration
 * @returns CSS Modules output with CSS, TypeScript definitions, and warnings
 */
export async function compileTailwindToCSS(
  config: TailwindCompilationConfig,
): Promise<CSSModulesOutput> {
  const { stylesObject, tailwindConfig, warnings: enableWarnings = true } = config;

  const entries = Object.entries(stylesObject);

  // Phase 1: Parse and categorize all classes using enhanced parser
  const enhancedByKey = new Map<string, ReturnType<typeof enhanceClassString>>();
  const allSimpleTokens = new Set<string>();

  for (const [key, value] of entries) {
    const enhanced = enhanceClassString(value);
    enhancedByKey.set(key, enhanced);

    // Collect all simple classes for Tailwind processing
    enhanced.simpleClasses.forEach((token) => allSimpleTokens.add(token));
  }

  // Phase 2: Process simple classes through Tailwind
  const simpleTokensByKey = new Map<string, string[]>();
  for (const [key, enhanced] of enhancedByKey) {
    simpleTokensByKey.set(key, enhanced.simpleClasses);
  }

  const rawContent = buildRawContent(Array.from(enhancedByKey.entries()).map(([key, enhanced]) =>
    [key, enhanced.simpleClasses.join(' ')]
  ));
  const safelist = Array.from(allSimpleTokens);
  const mergedConfig: TailwindConfig = {
    ...(tailwindConfig || {}),
    corePlugins: {
      preflight: false,
    },
    content: [{ raw: rawContent, extension: 'html' }],
    safelist,
  };

  const inputCss = `@theme {
  --font-sans: InterVariable, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';

  /* Spacing scale - Tailwind v4's base unit (0.25rem = 4px at 16px base font) */
  --spacing: 0.25rem;

  /* Color definitions with opacity support */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-blue-500: rgb(59 130 246);

  /* Text shadow utilities */
  --text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  --text-shadow-2xs: 0 1px 1px rgba(0, 0, 0, 0.5);
}

/* Custom variants */
@custom-variant hocus (&:is(:hover, :focus-visible));
@custom-variant group-hocus (&:is(:hover, :focus-visible) &);
@custom-variant peer-hocus (&:is(:hover, :focus-visible) ~ &);

/* Custom utilities */
@utility text-shadow {
  text-shadow: var(--text-shadow);
}

@utility text-shadow-2xs {
  text-shadow: var(--text-shadow-2xs);
}

@utility drop-shadow-icon {
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

@tailwind base;
@layer components {}
@tailwind utilities;`;

  const tailwindPlugin = (tailwindcss as unknown as TailwindPluginFactory)({ config: mergedConfig });
  const result = await postcss([tailwindPlugin]).process(inputCss, {
    from: undefined,
    map: false,
  });

  const tailwindRoot = result.root;
  if (!tailwindRoot) throw new Error('Tailwind produced no AST');

  const ruleIndex = collectRuleIndex(tailwindRoot);
  const unresolvedByKey = new Map<string, string[]>();
  const outputRoot = postcss.root();

  // Phase 3: Generate CSS for each key
  for (const [key, enhanced] of enhancedByKey) {
    const rule = postcss.rule({ selector: `.${key}` });
    let hasContent = false;

    // Add simple classes that resolved via Tailwind
    const seen = new Set<string>();
    for (const token of enhanced.simpleClasses) {
      const ruleRecords = ruleIndex.get(token);
      if (!ruleRecords || ruleRecords.length === 0) {
        if (!unresolvedByKey.has(key)) unresolvedByKey.set(key, []);
        unresolvedByKey.get(key)!.push(token);
        continue;
      }

      for (const record of ruleRecords) {
        const clone = cloneWithAncestors(record);
        rescopeSelectors(clone, token, key);

        const cssText = clone.toString();
        if (seen.has(cssText)) continue;
        seen.add(cssText);

        outputRoot.append(clone);
        hasContent = true;
      }
    }

    // Add container declarations
    for (const declaration of enhanced.containerDeclarations) {
      const match = declaration.match(/^@container(?:\/(\w+))?$/);
      if (match) {
        const containerName = match[1];
        rule.append(postcss.decl({
          prop: 'container-type',
          value: 'inline-size',
        }));
        if (containerName) {
          rule.append(postcss.decl({
            prop: 'container-name',
            value: containerName,
          }));
        }
        hasContent = true;
      }
    }

    // Add arbitrary values as direct CSS properties
    for (const arbitrary of enhanced.arbitraryValues) {
      if (arbitrary.variantSelector) {
        // Has a variant selector like "& svg" - create nested rule
        const nestedSelector = arbitrary.variantSelector.replace(/&/g, `.${key}`);
        const nestedRule = postcss.rule({ selector: nestedSelector });
        nestedRule.append(postcss.decl({
          prop: arbitrary.property,
          value: arbitrary.value,
        }));
        outputRoot.append(nestedRule);
      } else {
        // No variant - add directly to the main rule
        rule.append(postcss.decl({
          prop: arbitrary.property,
          value: arbitrary.value,
        }));
      }
      hasContent = true;
    }

    if (hasContent && rule.nodes && rule.nodes.length > 0) {
      outputRoot.append(rule);
    }

    // Add container query rules
    const breakpoints = getContainerBreakpoints();
    for (const query of enhanced.containerQueries) {
      const breakpointSize = breakpoints[query.breakpoint];
      if (breakpointSize) {
        const containerRule = postcss.atRule({
          name: 'container',
          params: `${query.container} (min-width: ${breakpointSize})`,
        });

        const innerRule = postcss.rule({ selector: `.${key}` });

        // Handle arbitrary value in utility
        if (query.utility.includes('[') && query.utility.includes(']')) {
          const match = query.utility.match(/^(\w+)-\[(.+)\]$/);
          if (match && match.length >= 3 && match[1] && match[2]) {
            const utilityRoot: string = match[1];
            const value: string = match[2];
            const propertyMap: Record<string, string> = {
              'text': 'font-size',
              'font': 'font-weight',
              'w': 'width',
              'h': 'height',
            };
            const property: string = propertyMap[utilityRoot] || utilityRoot;
            innerRule.append(postcss.decl({ prop: property, value }));
          }
        } else {
          // Try to resolve via Tailwind
          const utilityRecords = ruleIndex.get(query.utility);
          if (utilityRecords) {
            for (const record of utilityRecords) {
              record.rule.each((decl) => {
                if (decl.type === 'decl') {
                  innerRule.append(decl.clone());
                }
              });
            }
          }
        }

        if (innerRule.nodes && innerRule.nodes.length > 0) {
          containerRule.append(innerRule);
          outputRoot.append(containerRule);
        }
      }
    }
  }

  const nestedResult = await postcss([postcssNested()]).process(outputRoot, { from: undefined });
  const flattenedRoot = nestedResult.root ?? outputRoot;

  // Build group name mapping from enhanced data
  // Look for classes that define groups (e.g., "group/root", "group/button")
  const groupNameToClass = new Map<string, string>();
  for (const [key, enhanced] of enhancedByKey) {
    for (const token of enhanced.simpleClasses) {
      const groupMatch = token.match(/^group\/(.+)$/);
      if (groupMatch && groupMatch[1]) {
        groupNameToClass.set(groupMatch[1], key);
      }
    }
  }

  // Transform group-hover selectors to descendant selectors
  transformGroupHoverSelectorsInAST(flattenedRoot, groupNameToClass);

  simplifySelectors(flattenedRoot);
  removeOrphanedAmpersandSelectors(flattenedRoot);
  mergeDuplicateRules(flattenedRoot);
  const globalTwVariables = collectGlobalTailwindVariables(tailwindRoot);
  resolveTailwindVariables(flattenedRoot, globalTwVariables);
  dedupeDeclarations(flattenedRoot);
  cleanupDeclarationValues(flattenedRoot);

  const formattedCss = formatCss(flattenedRoot);

  const dtsContent = [
    'declare const styles: {',
    ...entries.map(([key]) => `  readonly ${key}: string;`),
    '};',
    'export default styles;',
    '',
  ].join('\n');

  const warnings: string[] = [];
  if (enableWarnings && unresolvedByKey.size > 0) {
    for (const [key, tokens] of unresolvedByKey) {
      warnings.push(`${key}: ${tokens.join(', ')}`);
    }
  }

  // Resolve CSS variables if requested (default to 'all' for fully resolved output)
  let finalCss = formattedCss;
  const shouldResolve: ('spacing' | 'colors' | 'all')[] = config.resolveCSSVariables !== undefined
    ? config.resolveCSSVariables
    : ['all']; // Default: resolve everything

  if (shouldResolve.length > 0) {
    // Build theme from our embedded config
    // This should match the @theme block defined in inputCss above
    const embeddedTheme = {
      '--spacing': '0.25rem',
      '--color-white': '#ffffff',
      '--color-black': '#000000',
      '--color-blue-500': 'rgb(59 130 246)',
      '--text-shadow': '0 1px 2px rgba(0, 0, 0, 0.5)',
      '--text-shadow-2xs': '0 1px 1px rgba(0, 0, 0, 0.5)',
    };

    // Prepend theme to CSS for extraction
    const cssWithTheme = `:root { ${Object.entries(embeddedTheme).map(([k, v]) => `${k}: ${v};`).join(' ')} }\n${formattedCss}`;

    finalCss = resolveCSSVariables(cssWithTheme, {
      resolve: shouldResolve,
    });

    // Remove the :root block we added
    finalCss = finalCss.replace(/:root\s*\{[^}]+\}\s*/g, '');
  }

  return {
    css: `${finalCss}\n`,
    dts: dtsContent,
    warnings,
  };
}
