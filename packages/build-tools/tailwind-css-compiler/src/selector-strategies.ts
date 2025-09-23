import type { EnhancedClassUsage, SelectorContext, SelectorStrategy, SemanticMapping } from './types.js';

/**
 * Convert PascalCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Base class for selector strategies with common functionality
 */
export abstract class BaseSelectorStrategy implements SelectorStrategy {
  constructor(protected mappings: SemanticMapping[] = []) {}

  abstract generateSelector(context: SelectorContext): string;

  needsDeduplication(_usage: EnhancedClassUsage): boolean {
    // All usages might need deduplication if there are multiple instances
    return true;
  }

  getDeduplicationKey(usage: EnhancedClassUsage): string {
    // Default deduplication by component-element combination
    return `${usage.component}-${usage.element}`;
  }

  /**
   * Find a custom mapping for the given usage
   */
  protected findCustomMapping(usage: EnhancedClassUsage): SemanticMapping | undefined {
    return this.mappings.find((m) => m.component === usage.component && m.element === usage.element);
  }
}

/**
 * Vanilla CSS selector strategy - generates element selectors for library components
 * and class selectors for native HTML elements
 */
export class VanillaSelectorStrategy extends BaseSelectorStrategy {
  generateSelector(context: SelectorContext): string {
    const { usage, instanceSuffix } = context;

    // Check for custom mapping first
    const customMapping = this.findCustomMapping(usage);
    if (customMapping) {
      const baseSelector = customMapping.vanillaSelector;
      return instanceSuffix ? `${baseSelector}${instanceSuffix}` : baseSelector;
    }

    // Generate selector based on component type
    const componentName = toKebabCase(usage.component);
    const elementType = usage.element;

    let baseSelector: string;

    // Handle native HTML elements - generate class selectors
    if (usage.componentType === 'native') {
      const className = usage.component; // e.g., 'div', 'button'
      baseSelector = `.${className}`;
      return instanceSuffix ? `${baseSelector}${instanceSuffix}` : baseSelector;
    }

    // Handle library components - generate element selectors
    if (usage.componentType === 'library') {
      if (elementType === 'icon') {
        const iconClass = elementType; // 'icon'
        baseSelector = `${componentName} .${iconClass}`;
      } else {
        // Don't add media- prefix if the original component name already starts with "Media"
        baseSelector = usage.component.startsWith('Media') ? componentName : `media-${componentName}`;
      }
      return instanceSuffix ? `${baseSelector}${instanceSuffix}` : baseSelector;
    }

    // Handle unknown type - fall back to original logic
    if (elementType === 'icon') {
      const iconClass = elementType;
      baseSelector = `${componentName} .${iconClass}`;
    } else if (elementType && usage.component.toLowerCase().includes(elementType)) {
      // Don't add media- prefix if the original component name already starts with "Media"
      baseSelector = usage.component.startsWith('Media') ? componentName : `media-${componentName}`;
    } else {
      // Don't add media- prefix if the original component name already starts with "Media"
      baseSelector = usage.component.startsWith('Media') ? componentName : `media-${componentName}`;
    }

    return instanceSuffix ? `${baseSelector}${instanceSuffix}` : baseSelector;
  }
}

/**
 * CSS Modules selector strategy - generates class selectors for all components
 */
export class ModulesSelectorStrategy extends BaseSelectorStrategy {
  generateSelector(context: SelectorContext): string {
    const { usage, instanceSuffix } = context;

    // Check for custom mapping first
    const customMapping = this.findCustomMapping(usage);
    if (customMapping) {
      const baseName = customMapping.moduleClassName;
      return instanceSuffix ? `${baseName}${instanceSuffix}` : baseName;
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

    return instanceSuffix ? `${baseName}${instanceSuffix}` : baseName;
  }
}
