import { registerPipeline } from './registry.js';
import { skinToWebComponentInline } from './skinToWebComponentInline.js';
import { skinToWebComponentInlineTailwind } from './skinToWebComponentInlineTailwind.js';
import { skinToReactCSSModules } from './skinToReactCSSModules.js';
import { skinToReactInline } from './skinToReactInline.js';

// Register all available pipelines
registerPipeline(skinToWebComponentInline);
registerPipeline(skinToWebComponentInlineTailwind);
registerPipeline(skinToReactCSSModules);
registerPipeline(skinToReactInline);

// Re-export registry functions and types
export { getPipeline, getAvailablePipelines } from './registry.js';
export type { CompilationPipeline, PipelineKey } from './types.js';
