import { registerPipeline } from './registry.js';
import { skinToWebComponentInline } from './skinToWebComponentInline.js';
import { skinToReactCSSModules } from './skinToReactCSSModules.js';

// Register all available pipelines
registerPipeline(skinToWebComponentInline);
registerPipeline(skinToReactCSSModules);

// Re-export registry functions and types
export { getPipeline, getAvailablePipelines } from './registry.js';
export type { CompilationPipeline, PipelineKey } from './types.js';
