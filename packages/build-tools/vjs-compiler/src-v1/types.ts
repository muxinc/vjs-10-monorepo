import type { AttributeProcessorPipeline } from './attributeProcessing/index.js';

export interface CompileOptions {
  indent?: number;
  indentSize?: number;
  /**
   * Pipeline for processing JSX attributes to HTML attributes
   * If not provided, a default pipeline will be created
   */
  attributePipeline?: AttributeProcessorPipeline;
}

export interface SerializeOptions {
  indent?: number;
  indentSize?: number;
  /**
   * Pipeline for processing JSX attributes to HTML attributes
   * If not provided, a default pipeline will be created
   */
  attributePipeline?: AttributeProcessorPipeline;
  /**
   * Optional: The styles object extracted from the source
   * Used for resolving className expressions
   */
  stylesObject?: Record<string, string> | null;
  /**
   * Optional: Map of component class names to their HTML element names
   * Used to filter out classes that were transformed to element selectors
   */
  componentMap?: Record<string, string>;
}
