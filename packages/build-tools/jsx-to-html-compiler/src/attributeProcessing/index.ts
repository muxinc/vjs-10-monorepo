export { AttributeProcessorPipeline } from './AttributeProcessorPipeline.js';
export { DefaultAttributeProcessor } from './DefaultAttributeProcessor.js';
export type {
  AttributeContext,
  AttributeProcessor,
  AttributeTransformResult,
} from './types.js';

import { AttributeProcessorPipeline } from './AttributeProcessorPipeline.js';

/**
 * Create a default attribute processor pipeline
 *
 * This provides the standard JSX to HTML attribute transformations:
 * - className → class
 * - camelCase → kebab-case
 * - String literals pass through
 * - JSX expressions → null (placeholder)
 *
 * @returns A configured AttributeProcessorPipeline
 */
export function createDefaultPipeline(): AttributeProcessorPipeline {
  return new AttributeProcessorPipeline();
}
