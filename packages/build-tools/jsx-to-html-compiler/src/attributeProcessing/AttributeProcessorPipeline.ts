import type {
  AttributeProcessor,
  AttributeContext,
  AttributeTransformResult,
} from './types.js';
import { DefaultAttributeProcessor } from './DefaultAttributeProcessor.js';

/**
 * Helper to extract attribute name from context
 */
function getJSXAttributeName(context: AttributeContext): string {
  const attr = context.attribute;
  if (attr.name.type === 'JSXIdentifier') {
    return attr.name.name;
  }
  if (attr.name.type === 'JSXNamespacedName') {
    return `${attr.name.namespace.name}:${attr.name.name.name}`;
  }
  return '';
}

/**
 * Pipeline that processes JSX attributes using registered processors
 *
 * The pipeline supports:
 * - Name-specific processors (e.g., special handling for "className")
 * - A default processor for all other attributes
 * - Full context about the parent element
 */
export class AttributeProcessorPipeline {
  private processors: Map<string, AttributeProcessor> = new Map();
  private defaultProcessor: AttributeProcessor;

  constructor(defaultProcessor?: AttributeProcessor) {
    this.defaultProcessor = defaultProcessor ?? new DefaultAttributeProcessor();
  }

  /**
   * Register a processor for a specific JSX attribute name
   *
   * @param attrName - The JSX attribute name (e.g., "className", "style")
   * @param processor - The processor to use for this attribute
   */
  register(attrName: string, processor: AttributeProcessor): void {
    this.processors.set(attrName, processor);
  }

  /**
   * Process a JSX attribute with full context
   *
   * @param context - The attribute context including parent element information
   * @returns The transformed attribute, or null to omit the attribute
   */
  process(context: AttributeContext): AttributeTransformResult | null {
    const jsxName = getJSXAttributeName(context);

    // Use name-specific processor if registered, otherwise use default
    const processor = this.processors.get(jsxName) ?? this.defaultProcessor;

    // Transform the name
    const name = processor.transformName(context);
    if (name === null) {
      return null; // Omit attribute
    }

    // Transform the value
    const value = processor.transformValue(context);

    return { name, value };
  }
}
