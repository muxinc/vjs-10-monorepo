import type { CompilerConfig, CompilationOutput } from '../config/index.js';

/**
 * A compilation pipeline processes an entry file and its dependencies
 * according to a specific input type + output format + CSS strategy combination
 */
export interface CompilationPipeline {
  /**
   * Unique identifier for this pipeline
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Compile an entry file
   *
   * @param entryFile - Absolute path to the entry file
   * @param config - Compiler configuration
   * @returns Compilation output with generated files
   */
  compile(entryFile: string, config: CompilerConfig): CompilationOutput;
}

/**
 * Pipeline key for registry lookup
 */
export type PipelineKey = `${string}-${string}-${string}`;
