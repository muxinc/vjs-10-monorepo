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
        const key = `${usage.component}-${usage.element}${usage.instanceId ? `-${usage.instanceId}` : ''}`;
        const existing = usageMap.get(key);

        if (existing) {
          // Merge classes from multiple instances
          existing.classes = [...new Set([...existing.classes, ...usage.classes])];
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

      // Note: Conditional styles are handled by Tailwind's @apply directive
      // No need for separate conditional rule generation
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

      // Note: Conditional styles are handled by Tailwind's @apply directive
      // No need for separate conditional rule generation
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
        const baseSelector = customMapping.vanillaSelector;
        // For vanilla selectors, append instanceId to the element part
        if (usage.instanceId && baseSelector.includes(' .')) {
          return baseSelector.replace(' .', ` .${baseSelector.split(' .')[1]}-${usage.instanceId}`);
        }
        return usage.instanceId ? `${baseSelector}-${usage.instanceId}` : baseSelector;
      }

      // Generate semantic selector
      const componentName = plugin.toKebabCase(usage.component);
      const elementType = usage.element;

      let baseSelector: string;

      if (elementType === 'icon') {
        const iconClass = usage.instanceId ? `${elementType}-${usage.instanceId}` : elementType;
        baseSelector = `${componentName} .${iconClass}`;
      } else if (usage.component.toLowerCase().includes(elementType)) {
        const elementName = usage.instanceId ? `${componentName}-${usage.instanceId}` : componentName;
        baseSelector = `media-${elementName}`;
      } else {
        const elementName = usage.instanceId ? `${componentName}-${usage.instanceId}` : componentName;
        baseSelector = elementName;
      }

      return baseSelector;
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
        const baseName = customMapping.moduleClassName;
        return usage.instanceId ? `${baseName}-${usage.instanceId}` : baseName;
      }

      let baseName: string;

      // For CSS modules, always use PascalCase component names directly
      // Icons get special handling to avoid duplication like "PlayIconIcon"
      if (usage.element === 'icon') {
        // If component already ends with "Icon", don't add another "Icon"
        baseName = usage.component.endsWith('Icon') ? usage.component : `${usage.component}Icon`;
      } else {
        // For all other elements, use the component name as-is (PascalCase)
        baseName = usage.component;
      }

      // Add instanceId suffix if present
      return usage.instanceId ? `${baseName}-${usage.instanceId}` : baseName;
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