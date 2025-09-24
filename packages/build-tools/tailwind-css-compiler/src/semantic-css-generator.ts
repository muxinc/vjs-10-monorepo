import postcss, { Root } from 'postcss';
// Note: TailwindCSS v4 has different exports, so we'll handle configuration differently
// @ts-ignore - Container queries plugin types not yet available
import containerQueries from '@tailwindcss/container-queries';
import { parseClassString as parseClasses } from '@toddledev/tailwind-parser';

import type { ClassUsage, EnhancedClassUsage, SelectorContext, SemanticMapping } from './types.js';
import { enhanceClassUsages } from './class-parser.js';
import type { Helpers, Plugin } from 'postcss';

import { SelectorDeduplicationService } from './selector-deduplication.js';
import { ModulesSelectorStrategy, VanillaSelectorStrategy } from './selector-strategies.js';

export interface SemanticCSSGeneratorOptions {
  /** Class usages extracted from AST parsing */
  usages: ClassUsage[];
  /** Custom semantic mappings */
  mappings?: SemanticMapping[];
  /** Whether to generate vanilla CSS selectors */
  generateVanilla?: boolean;
  /** Whether to generate CSS modules selectors */
  generateModules?: boolean;
}

/**
 * PostCSS plugin that generates intermediate CSS with @apply directives
 * based on extracted className usage from React components
 */
const semanticCSSGenerator: {
  (options: SemanticCSSGeneratorOptions): Plugin;
  postcss: boolean;
} = (options: SemanticCSSGeneratorOptions): Plugin => {
  return {
    postcssPlugin: 'semantic-css-generator',
    Once(root: Root, _helpers: Helpers) {
      const { usages, mappings = [], generateVanilla = true, generateModules = true } = options;

      // Enhance usages with parsed class information
      const enhancedUsages = enhanceClassUsages(usages);

      // Create selector contexts from enhanced usages
      const contexts: SelectorContext[] = enhancedUsages.map((usage) => ({
        usage,
        targetType: 'vanilla' as const, // This will be overridden per strategy
      }));

      const deduplicationService = new SelectorDeduplicationService();

      if (generateVanilla) {
        const vanillaStrategy = new VanillaSelectorStrategy(mappings);
        const vanillaContexts = contexts.map((c) => ({ ...c, targetType: 'vanilla' as const }));
        const vanillaResults = deduplicationService.processSelectors(vanillaContexts, vanillaStrategy);

        // Generate vanilla CSS rules
        vanillaResults.forEach((result) => {
          generateEnhancedCSSRule(root, result.selector, result.context.usage, false);
        });
      }

      if (generateModules) {
        const modulesStrategy = new ModulesSelectorStrategy(mappings);
        const modulesContexts = contexts.map((c) => ({ ...c, targetType: 'modules' as const }));
        const modulesResults = deduplicationService.processSelectors(modulesContexts, modulesStrategy);

        // Generate CSS modules rules
        modulesResults.forEach((result) => {
          // For modules, prepend . to make it a class selector
          const selector = result.selector.startsWith('.') ? result.selector : `.${result.selector}`;
          generateEnhancedCSSRule(root, selector, result.context.usage, true);
        });
      }
    },
  };
};

/**
 * Get container query breakpoint sizes from TailwindCSS config
 */
function getContainerBreakpoints(): Record<string, string> {
  // For TailwindCSS v4, we'll use the default container breakpoints
  // These match the standard container query sizes
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

/**
 * Generate enhanced CSS rule with container queries and arbitrary values
 */
function generateEnhancedCSSRule(root: Root, selector: string, usage: EnhancedClassUsage, isModule: boolean) {
  const rule = postcss.rule({ selector });
  let hasContent = false;

  // 1. Add simple classes via @apply
  if (usage.simpleClasses.length > 0) {
    const applyRule = postcss.atRule({
      name: 'apply',
      params: usage.simpleClasses.join(' '),
    });
    rule.append(applyRule);
    hasContent = true;
  }

  // 2. Add container declarations
  if (usage.containerDeclarations.length > 0) {
    for (const declaration of usage.containerDeclarations) {
      // Parse @container/name or @container
      const match = declaration.match(/^@container(?:\/(\w+))?$/);
      if (match) {
        const containerName = match[1];

        // Add container-type property
        rule.append(postcss.decl({
          prop: 'container-type',
          value: 'inline-size',
        }));

        // Add container-name property if named
        if (containerName) {
          rule.append(postcss.decl({
            prop: 'container-name',
            value: containerName,
          }));
        }
        hasContent = true;
      }
    }
  }

  // 3. Add arbitrary values as direct CSS properties
  if (usage.arbitraryValues.length > 0) {
    for (const arbitrary of usage.arbitraryValues) {
      rule.append(postcss.decl({
        prop: arbitrary.property,
        value: arbitrary.value,
      }));
      hasContent = true;
    }
  }

  // Add the rule if it has any content
  if (hasContent) {
    root.append(rule);
  }

  // 4. Generate container query rules
  if (usage.containerQueries.length > 0) {
    const breakpoints = getContainerBreakpoints();

    for (const query of usage.containerQueries) {
      const breakpointSize = breakpoints[query.breakpoint];
      if (breakpointSize) {
        // Create @container rule
        const containerRule = postcss.atRule({
          name: 'container',
          params: `${query.container} (min-width: ${breakpointSize})`,
        });

        // Create rule inside container query
        const innerRule = postcss.rule({ selector });

        // Handle the utility within the container query
        if (query.utility.includes('[') && query.utility.includes(']')) {
          // Arbitrary value utility - parse and add directly
          try {
            const parsed = parseClasses(query.utility);
            if (parsed && parsed.style) {
              const styles = parsed.style as Record<string, string | number>;
              for (const [property, value] of Object.entries(styles)) {
                innerRule.append(postcss.decl({
                  prop: property,
                  value: String(value),
                }));
              }
            }
          } catch (error) {
            // Fallback to manual parsing for common arbitrary values
            if (query.utility.startsWith('text-[')) {
              const value = query.utility.match(/text-\[(.+)\]/)?.[1];
              if (value) {
                innerRule.append(postcss.decl({
                  prop: 'font-size',
                  value: value,
                }));
              }
            } else if (query.utility.startsWith('font-[')) {
              const value = query.utility.match(/font-\[(.+)\]/)?.[1];
              if (value) {
                innerRule.append(postcss.decl({
                  prop: 'font-weight',
                  value: value,
                }));
              }
            }
            // Add more patterns as needed
          }
        } else {
          // Simple utility - use @apply
          const applyRule = postcss.atRule({
            name: 'apply',
            params: query.utility,
          });
          innerRule.append(applyRule);
        }

        containerRule.append(innerRule);
        root.append(containerRule);
      }
    }
  }
}

/**
 * Generate a CSS rule with @apply directive (legacy function for compatibility)
 */
function generateCSSRule(root: Root, selector: string, classes: string[]) {
  if (classes.length > 0) {
    const rule = postcss.rule({ selector });
    const applyRule = postcss.atRule({
      name: 'apply',
      params: classes.join(' '),
    });
    rule.append(applyRule);
    root.append(rule);
  }
}

semanticCSSGenerator.postcss = true;

export { semanticCSSGenerator };
