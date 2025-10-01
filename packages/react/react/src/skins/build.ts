#!/usr/bin/env -S pnpm dlx tsx

/**
 * Generates vanilla CSS Modules + .d.ts mirrors from the Tailwind utility
 * strings exported by each skin's styles.ts file.
 *
 * Usage (from repo root):
 *   pnpm tsx packages/react/react/src/skins/build.ts
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import postcss, { type AcceptedPlugin, type AtRule, type ChildNode, type Container, type Declaration, type Node, type Root, type Rule } from 'postcss';
import postcssNested from 'postcss-nested';
import tailwindcss from '@tailwindcss/postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser, { type FunctionNode, type Node as ValueNode } from 'postcss-value-parser';

type TailwindConfig = Record<string, unknown>;
type TailwindPluginFactory = (options: { config: TailwindConfig }) => AcceptedPlugin;

interface BuildTarget {
  source: string;
  outCss?: string;
  outDts?: string;
}

const SKINS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

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

async function discoverSkinTargets(): Promise<BuildTarget[]> {
  const dirs = await fs.readdir(SKINS_ROOT, { withFileTypes: true });
  const targets: BuildTarget[] = [];
  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const source = path.join(SKINS_ROOT, dirent.name, 'styles.ts');
    try {
      await fs.access(source);
      targets.push({ source });
    } catch {
      /* ignore directories without a styles.ts */
    }
  }
  return targets;
}

async function loadStylesModule(modulePath: string): Promise<Record<string, string>> {
  const absolute = path.resolve(modulePath);
  const imported = await import(pathToFileURL(absolute).href);
  const styles = imported.default ?? imported.styles ?? imported;
  if (!styles || typeof styles !== 'object') {
    throw new Error(`Styles export from ${modulePath} is not an object`);
  }
  return styles as Record<string, string>;
}

function tokenize(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildRawContent(entries: [string, string][]): string {
  const rows = entries.map(([key, value]) => {
    const escaped = value.replace(/"/g, '&quot;');
    return `<div data-style="${key}" class="${escaped}"></div>`;
  });
  return rows.join('\n');
}

type RuleRecord = {
  rule: Rule;
  ancestors: AtRule[];
};

type RuleParent = Exclude<Rule['parent'], undefined>;

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

function dedupeDeclarations(container: Container): void {
  container.walkRules((rule) => {
    const seen = new Set<string>();
    rule.walkDecls((decl) => {
      const key = `${decl.prop}::${decl.value}`;
      if (seen.has(key)) {
        decl.remove();
      } else {
        seen.add(key);
      }
    });
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

async function generateCssModule({
  source,
  outCss,
  outDts,
}: BuildTarget): Promise<void> {
  const resolvedSource = path.resolve(source);
  const resolvedOutCss = path.resolve(
    outCss ?? path.join(path.dirname(resolvedSource), 'styles.module.css'),
  );
  const resolvedOutDts = path.resolve(outDts ?? `${resolvedOutCss}.d.ts`);

  const styles = await loadStylesModule(resolvedSource);
  const entries = Object.entries(styles);
  const tokensByKey = new Map<string, string[]>();
  const allTokens = new Set<string>();

  for (const [key, value] of entries) {
    const tokens = tokenize(value);
    tokensByKey.set(key, tokens);
    tokens.forEach((token) => allTokens.add(token));
  }

  const rawContent = buildRawContent(entries);
  const safelist = Array.from(allTokens);
  const mergedConfig: TailwindConfig = {
    corePlugins: {
      preflight: false,
    },
    content: [{ raw: rawContent, extension: 'html' }],
    safelist,
  };

  const inputCss = '@tailwind base;\n@layer components {}\n@tailwind utilities;';
  const tailwindPlugin = (tailwindcss as unknown as TailwindPluginFactory)({ config: mergedConfig });
  const result = await postcss([tailwindPlugin]).process(inputCss, {
    from: undefined,
    to: resolvedOutCss,
    map: false,
  });

  const tailwindRoot = result.root;
  if (!tailwindRoot) throw new Error('Tailwind produced no AST');

  const ruleIndex = collectRuleIndex(tailwindRoot);
  const unresolvedByKey = new Map<string, string[]>();
  const outputRoot = postcss.root();

  for (const [key, tokens] of tokensByKey) {
    const seen = new Set<string>();
    for (const token of tokens) {
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
      }
    }
  }

  const nestedResult = await postcss([postcssNested()]).process(outputRoot, { from: undefined });
  const flattenedRoot = nestedResult.root ?? outputRoot;

  simplifySelectors(flattenedRoot);
  mergeDuplicateRules(flattenedRoot);
  const globalTwVariables = collectGlobalTailwindVariables(tailwindRoot);
  resolveTailwindVariables(flattenedRoot, globalTwVariables);
  dedupeDeclarations(flattenedRoot);
  cleanupDeclarationValues(flattenedRoot);

  await fs.mkdir(path.dirname(resolvedOutCss), { recursive: true });
  const formattedCss = formatCss(flattenedRoot);
  await fs.writeFile(resolvedOutCss, `${formattedCss}\n`, 'utf8');

  const dtsContent = [
    'declare const styles: {',
    ...entries.map(([key]) => `  readonly ${key}: string;`),
    '};',
    'export default styles;',
    '',
  ].join('\n');
  await fs.writeFile(resolvedOutDts, dtsContent, 'utf8');

  if (unresolvedByKey.size > 0) {
    console.warn(
      `⚠️  The following tokens in ${path.relative(process.cwd(), resolvedSource)} did not produce CSS and will need manual handling:`,
    );
    for (const [key, tokens] of unresolvedByKey) {
      console.warn(`  ${key}: ${tokens.join(', ')}`);
    }
  } else {
    console.log(
      `✅ Generated ${path.relative(process.cwd(), resolvedOutCss)} and ${path.relative(process.cwd(), resolvedOutDts)}`,
    );
  }
}

(async () => {
  try {
    const targets = await discoverSkinTargets();

    if (targets.length === 0) {
      console.warn('⚠️  No skins with a styles.ts file were found.');
      return;
    }

    for (const target of targets) {
      await generateCssModule(target);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exit(1);
  }
})();
