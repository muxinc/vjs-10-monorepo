export interface ClassUsage {
  /** Source file path */
  file: string;
  /** Component name (e.g., "PlayButton") */
  component: string;
  /** Element type (e.g., "button", "icon", "div") */
  element: string;
  /** Tailwind classes found */
  classes: string[];
  /** Line number in source file */
  line: number;
  /** Column number in source file */
  column: number;
  /** Type of component - distinguishes library vs native elements */
  componentType: 'library' | 'native' | 'unknown';
}

export interface SemanticMapping {
  /** Original component name */
  component: string;
  /** Element type */
  element: string;
  /** Semantic selector for vanilla CSS */
  vanillaSelector: string;
  /** Class name for CSS modules */
  moduleClassName: string;
}

export interface SelectorContext {
  usage: ClassUsage;
  targetType: 'vanilla' | 'modules';
  instanceSuffix?: string;
}

export interface SelectorStrategy {
  /** Generate a CSS selector for the given context */
  generateSelector(context: SelectorContext): string;
  /** Determine if this usage needs deduplication */
  needsDeduplication(usage: ClassUsage): boolean;
  /** Generate a key for deduplication grouping */
  getDeduplicationKey(usage: ClassUsage): string;
}

export interface CompilerConfig {
  /** Source file patterns to scan */
  sources: string[];
  /** Output directory */
  outputDir: string;
  /** Generate vanilla CSS */
  generateVanilla: boolean;
  /** Generate CSS modules */
  generateModules: boolean;
  /** Custom semantic mappings */
  mappings?: SemanticMapping[];
  /** Tailwind config path */
  tailwindConfig?: string;
}

export interface ParsedFile {
  /** File path */
  path: string;
  /** Extracted class usages */
  usages: ClassUsage[];
}