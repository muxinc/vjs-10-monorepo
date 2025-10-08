import { AttributeProcessorPipeline } from './AttributeProcessorPipeline.js';
import { ClassAttributeProcessor } from './ClassAttributeProcessor.js';
import { DefaultAttributeProcessor } from './DefaultAttributeProcessor.js';

export { AttributeProcessorPipeline } from './AttributeProcessorPipeline.js';
export { ClassAttributeProcessor } from './ClassAttributeProcessor.js';
export { DefaultAttributeProcessor } from './DefaultAttributeProcessor.js';
export type { AttributeContext, AttributeProcessor, AttributeTransformResult } from './types.js';

/**
 * Create a default attribute processor pipeline
 *
 * This provides the standard JSX to HTML attribute transformations:
 * - className expressions → class (with styles object resolution and component filtering)
 * - Other attributes: camelCase → kebab-case, string literals pass through
 *
 * The ClassAttributeProcessor is registered for className, and DefaultAttributeProcessor
 * handles all other attributes as a fallback.
 *
 * @returns A configured AttributeProcessorPipeline
 */
export function createDefaultPipeline(): AttributeProcessorPipeline {
  // DefaultAttributeProcessor is the fallback for unregistered attributes
  const pipeline = new AttributeProcessorPipeline(new DefaultAttributeProcessor());

  // Register ClassAttributeProcessor for className attributes
  pipeline.register('className', new ClassAttributeProcessor());

  return pipeline;
}
