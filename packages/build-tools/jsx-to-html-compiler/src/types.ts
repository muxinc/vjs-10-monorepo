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
}
