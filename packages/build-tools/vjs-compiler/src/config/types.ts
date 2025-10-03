/**
 * Input type - what kind of source are we compiling?
 */
export type InputType = 'skin' | 'component';

/**
 * Output format - what runtime/framework should the output target?
 */
export type OutputFormat = 'react' | 'web-component';

/**
 * CSS strategy - how should CSS be handled in the output?
 */
export type CSSStrategy = 'inline' | 'css-modules' | 'tailwind' | 'vanilla';

/**
 * Options for Tailwind CSS processing
 */
export interface TailwindOptions {
  /**
   * Path to Tailwind config file
   */
  config?: string;
}

/**
 * Options for CSS Modules processing
 */
export interface CSSModulesOptions {
  /**
   * Pattern for generating scoped class names
   */
  generateScopedName?: string;
}

/**
 * General compiler options
 */
export interface CompilerOptions {
  /**
   * Tailwind-specific options
   */
  tailwind?: TailwindOptions;

  /**
   * CSS Modules-specific options
   */
  cssModules?: CSSModulesOptions;

  /**
   * Package import mappings (e.g., React → HTML)
   */
  importMappings?: Record<string, string>;

  /**
   * Starting indentation level for output
   */
  indent?: number;

  /**
   * Spaces per indentation level
   */
  indentSize?: number;
}

/**
 * Main compiler configuration
 */
export interface CompilerConfig {
  /**
   * What type of input are we compiling?
   */
  inputType: InputType;

  /**
   * Input file pattern(s)
   * Can be a single file path or glob pattern(s)
   */
  input: string | string[];

  /**
   * Output directory for compiled files
   */
  outDir: string;

  /**
   * What format should the output be?
   */
  outputFormat: OutputFormat;

  /**
   * How should CSS be handled?
   */
  cssStrategy: CSSStrategy;

  /**
   * Additional compiler options
   */
  options?: CompilerOptions;
}

/**
 * Result of a compilation operation
 */
export interface CompilationOutput {
  /**
   * Generated files
   */
  files: CompilationFile[];
}

/**
 * A single compiled file
 */
export interface CompilationFile {
  /**
   * Output path (relative to outDir)
   */
  path: string;

  /**
   * File content
   */
  content: string;

  /**
   * File type
   */
  type: 'ts' | 'tsx' | 'css' | 'js';
}
