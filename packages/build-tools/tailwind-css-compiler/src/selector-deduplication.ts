import type { SelectorContext, SelectorStrategy } from './types.js';

export interface SelectorWithContext<T extends SelectorContext = SelectorContext> {
  context: T;
  selector: string;
}

/**
 * Service responsible for generating unique selectors by handling deduplication
 * across multiple usages of the same component-element combinations
 */
export class SelectorDeduplicationService {
  /**
   * Generate unique selectors for a list of contexts using the provided strategy
   */
  generateUniqueSelectors<T extends SelectorContext>(
    contexts: T[],
    strategy: SelectorStrategy
  ): SelectorWithContext<T>[] {
    // First pass: group contexts by deduplication key
    const keyGroups = new Map<string, T[]>();

    for (const context of contexts) {
      if (strategy.needsDeduplication(context.usage)) {
        const key = strategy.getDeduplicationKey(context.usage);
        const group = keyGroups.get(key) || [];
        group.push(context);
        keyGroups.set(key, group);
      }
    }

    // Second pass: generate selectors with suffixes as needed
    const results: SelectorWithContext<T>[] = [];

    for (const context of contexts) {
      const key = strategy.getDeduplicationKey(context.usage);
      const group = keyGroups.get(key) || [context];

      let instanceSuffix: string | undefined;

      if (group.length > 1) {
        const index = group.indexOf(context);
        if (index === -1) {
          // Context not found in group, should not happen but handle gracefully
          instanceSuffix = undefined;
        } else {
          // First instance gets no suffix, subsequent get -2, -3, etc.
          instanceSuffix = index === 0 ? undefined : `-${index + 1}`;
        }
      }

      // Create the selector context with instanceSuffix
      const selectorContext: T = { ...context, instanceSuffix };
      const selector = strategy.generateSelector(selectorContext);

      results.push({
        context: selectorContext,
        selector,
      });
    }

    return results;
  }

  /**
   * Merge class usages that have the same selector to avoid duplicate CSS rules
   */
  mergeUsagesBySelector<T extends SelectorContext>(
    selectorResults: SelectorWithContext<T>[]
  ): SelectorWithContext<T>[] {
    const selectorMap = new Map<string, SelectorWithContext<T>>();

    for (const result of selectorResults) {
      const existing = selectorMap.get(result.selector);

      if (existing) {
        // Merge classes from multiple usages with the same selector
        const mergedClasses = [...new Set([...existing.context.usage.classes, ...result.context.usage.classes])];

        // Update the existing entry with merged classes
        existing.context.usage.classes = mergedClasses;
      } else {
        // Create a deep copy to avoid mutating the original
        const contextCopy = {
          ...result.context,
          usage: { ...result.context.usage },
        };

        selectorMap.set(result.selector, {
          context: contextCopy,
          selector: result.selector,
        });
      }
    }

    return Array.from(selectorMap.values());
  }

  /**
   * Complete pipeline: generate unique selectors and merge duplicates
   */
  processSelectors<T extends SelectorContext>(contexts: T[], strategy: SelectorStrategy): SelectorWithContext<T>[] {
    const uniqueSelectors = this.generateUniqueSelectors(contexts, strategy);
    return this.mergeUsagesBySelector(uniqueSelectors);
  }
}
