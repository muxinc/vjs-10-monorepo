import { Plugin, Root, Helpers } from 'postcss';
import postcss from 'postcss';
import { ClassUsage, SemanticMapping } from './types.js';

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
export const semanticCSSGenerator = (options: SemanticCSSGeneratorOptions): Plugin => {
  const plugin = {
    postcssPlugin: 'semantic-css-generator',
    Once(root: Root, _helpers: Helpers) {
      const { usages, mappings = [], generateVanilla = true, generateModules = true } = options;

      // Group usages by component + element for deduplication
      const usageMap = new Map<string, ClassUsage>();

      for (const usage of usages) {
        const key = `${usage.component}-${usage.element}`;
        const existing = usageMap.get(key);

        if (existing) {
          // Merge classes from multiple instances
          existing.classes = [...new Set([...existing.classes, ...usage.classes])];
          if (usage.conditions) {
            existing.conditions = [...new Set([...(existing.conditions || []), ...usage.conditions])];
          }
        } else {
          usageMap.set(key, { ...usage });
        }
      }

      // Generate CSS for each unique component-element combination
      for (const usage of usageMap.values()) {
        if (generateVanilla) {
          plugin.generateVanillaCSS(root, usage, mappings);
        }

        if (generateModules) {
          plugin.generateModuleCSS(root, usage, mappings);
        }
      }
    },

    /**
     * Generate vanilla CSS with semantic element selectors
     */
    generateVanillaCSS(root: Root, usage: ClassUsage, mappings: SemanticMapping[]) {
      const selector = plugin.getVanillaSelector(usage, mappings);

      if (usage.classes.length > 0) {
        const rule = postcss.rule({ selector });
        const applyRule = postcss.atRule({
          name: 'apply',
          params: usage.classes.join(' ')
        });
        rule.append(applyRule);
        root.append(rule);
      }

      // Generate conditional/state-based rules
      if (usage.conditions && usage.conditions.length > 0) {
        plugin.generateConditionalRules(root, usage, selector, mappings);
      }
    },

    /**
     * Generate CSS modules with class-based selectors
     */
    generateModuleCSS(root: Root, usage: ClassUsage, mappings: SemanticMapping[]) {
      const className = plugin.getModuleClassName(usage, mappings);
      const selector = `.${className}`;

      if (usage.classes.length > 0) {
        const rule = postcss.rule({ selector });
        const applyRule = postcss.atRule({
          name: 'apply',
          params: usage.classes.join(' ')
        });
        rule.append(applyRule);
        root.append(rule);
      }

      // Generate conditional rules for modules
      if (usage.conditions && usage.conditions.length > 0) {
        plugin.generateConditionalRules(root, usage, selector, mappings, true);
      }
    },

    /**
     * Generate conditional/state-based CSS rules
     */
    generateConditionalRules(
      root: Root,
      usage: ClassUsage,
      baseSelector: string,
      _mappings: SemanticMapping[],
      isModule = false
    ) {
      for (const condition of usage.conditions || []) {
        let conditionalSelector: string;

        if (condition.startsWith('data-')) {
          // Handle data attributes: data-paused -> [data-paused]
          conditionalSelector = `${baseSelector}[${condition}]`;
        } else {
          // Handle pseudo-classes: hover -> :hover
          conditionalSelector = `${baseSelector}:${condition}`;
        }

        // For nested elements (like icons), we might need descendant selectors
        if (usage.element === 'icon') {
          const iconSelector = isModule ? '.Icon' : '.icon';
          conditionalSelector = `${conditionalSelector} ${iconSelector}`;
        }

        // Create rule for conditional state
        const rule = postcss.rule({ selector: conditionalSelector });

        // Add display rule for icons (common pattern)
        if (usage.element === 'icon') {
          const decl = postcss.decl({
            prop: 'display',
            value: 'inline-block'
          });
          rule.append(decl);
        }

        root.append(rule);
      }
    },

    /**
     * Get vanilla CSS selector for a usage
     */
    getVanillaSelector(usage: ClassUsage, mappings: SemanticMapping[]): string {
      // Check for custom mapping first
      const customMapping = mappings.find(m =>
        m.component === usage.component && m.element === usage.element
      );

      if (customMapping) {
        return customMapping.vanillaSelector;
      }

      // Generate semantic selector
      const componentName = plugin.toKebabCase(usage.component);
      const elementType = usage.element;

      if (elementType === 'icon') {
        return `${componentName} .${elementType}`;
      }

      // For buttons, ranges, etc., use the component name as element
      if (usage.component.toLowerCase().includes(elementType)) {
        return `media-${componentName}`;
      }

      return `${componentName}`;
    },

    /**
     * Get CSS module class name for a usage
     */
    getModuleClassName(usage: ClassUsage, mappings: SemanticMapping[]): string {
      // Check for custom mapping first
      const customMapping = mappings.find(m =>
        m.component === usage.component && m.element === usage.element
      );

      if (customMapping) {
        return customMapping.moduleClassName;
      }

      // Generate class name
      if (usage.element === 'icon') {
        return `${usage.component}Icon`;
      }

      return usage.component;
    },

    /**
     * Convert PascalCase to kebab-case
     */
    toKebabCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
    }
  };

  return plugin;
};

semanticCSSGenerator.postcss = true;