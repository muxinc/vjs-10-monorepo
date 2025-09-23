import postcss, { Root } from 'postcss';

import type { ClassUsage, SelectorContext, SemanticMapping } from './types.js';
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

      // Create selector contexts from usages
      const contexts: SelectorContext[] = usages.map((usage) => ({
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
          generateCSSRule(root, result.selector, result.context.usage.classes);
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
          generateCSSRule(root, selector, result.context.usage.classes);
        });
      }
    },
  };
};

/**
 * Generate a CSS rule with @apply directive
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
