import type { CompilerConfig } from '../config/index.js';
import type { CompilationPipeline, PipelineKey } from './types.js';

/**
 * Registry of compilation pipelines
 */
const pipelineRegistry = new Map<PipelineKey, CompilationPipeline>();

/**
 * Register a compilation pipeline
 */
export function registerPipeline(pipeline: CompilationPipeline): void {
  pipelineRegistry.set(pipeline.id as PipelineKey, pipeline);
}

/**
 * Get a pipeline for a specific configuration
 */
export function getPipeline(config: CompilerConfig): CompilationPipeline {
  const key: PipelineKey = `${config.inputType}-${config.outputFormat}-${config.cssStrategy}`;
  const pipeline = pipelineRegistry.get(key);

  if (!pipeline) {
    throw new Error(
      `Unsupported combination: ${config.inputType} + ${config.outputFormat} + ${config.cssStrategy}.\n` +
        `Available pipelines: ${Array.from(pipelineRegistry.keys()).join(', ')}`
    );
  }

  return pipeline;
}

/**
 * Get all registered pipeline IDs
 */
export function getAvailablePipelines(): string[] {
  return Array.from(pipelineRegistry.keys());
}
