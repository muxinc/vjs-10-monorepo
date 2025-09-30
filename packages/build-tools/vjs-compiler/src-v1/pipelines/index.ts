import { registerPipeline } from './registry.js';
import { skinToReactCSSModules } from './skinToReactCSSModules.js';
import { skinToReactInline } from './skinToReactInline.js';
import { skinToWebComponentInline } from './skinToWebComponentInline.js';
import { skinToWebComponentInlineTailwind } from './skinToWebComponentInlineTailwind.js';

// Register all available pipelines
registerPipeline(skinToWebComponentInline);
registerPipeline(skinToWebComponentInlineTailwind);
registerPipeline(skinToReactCSSModules);
registerPipeline(skinToReactInline);

// Re-export registry functions and types
export { getAvailablePipelines, getPipeline } from './registry.js';
export type { CompilationPipeline, PipelineKey } from './types.js';
