/**
 * Core type definitions for VJS Compiler v2
 */

import type * as t from '@babel/types';

/**
 * Configuration for compiling a skin
 */
export interface CompileSkinConfig {
  // Source code (as strings, no filesystem required)
  skinSource: string;
  stylesSource: string;

  // Path context (can be hypothetical)
  paths: PathContext;

  // Module configuration
  moduleType: 'skin';
  input: InputContext;
  output: OutputContext;
}

/**
 * Path context for import resolution
 * All paths are absolute and can be hypothetical (no real files required)
 */
export interface PathContext {
  // Input file locations
  skinPath: string; // Absolute path to skin file
  stylesPath?: string; // Absolute path to styles file

  // Output location
  outputPath: string; // Absolute path to output file

  // Package context (optional - only needed for monorepo internal compilation)
  sourcePackage?: PackageInfo;
  targetPackage?: PackageInfo;

  // Package mapping (Phase 2)
  packageMappings?: PackageMappings;

  // Discovered package exports (Phase 2.2 - Multi-Package Discovery)
  // Maps package names to their discovered exports
  // Discovered at boundary, passed as data to transformers
  // Example: Map { '@vjs-10/html' => PackageExportMap, '@vjs-10/html-icons' => PackageExportMap }
  packageExports?: Map<string, PackageExportMap>;

  // DEPRECATED (Phase 2.1 - kept for backward compatibility during migration)
  // Use packageExports instead
  targetPackageExports?: PackageExportMap;
}

/**
 * Package mappings for cross-package imports
 * Maps source package names to target package names
 */
export interface PackageMappings {
  [sourcePackage: string]: string;
  // Example:
  // '@vjs-10/react': '@vjs-10/html'
  // '@vjs-10/react-icons': '@vjs-10/html-icons'
}

/**
 * Component export strategy (discovered from package.json)
 */
export type ComponentExportStrategy =
  | 'named-from-main' // import { PlayButton } from '@vjs-10/html'
  | 'subpath-per-component' // import '@vjs-10/html/components/media-play-button'
  | 'wildcard-subpath'; // import '@vjs-10/html/components/*'

/**
 * Maps logical import paths to actual package exports
 * Discovered from package.json at boundary, passed as data to transformers
 *
 * Following "Push Assumptions to Boundaries" principle:
 * - Discovery happens in boundary layer (packageDiscovery.ts)
 * - Result passed as data to pure transformers
 * - No I/O in transformation logic
 */
export interface PackageExportMap {
  // Package name
  packageName: string;

  // Main export
  mainExport: string; // "."

  // Subpath exports (discovered from package.json)
  subpathExports: Map<string, string>;
  // Example:
  // "./skins/media-skin-default" → "./src/skins/media-skin-default.ts"

  // Component export strategy (discovered, not assumed)
  componentExportStrategy: ComponentExportStrategy;

  // Named exports from main (if strategy is 'named-from-main')
  // These are the actual class/function names exported
  namedExports?: string[];
}

/**
 * Result of import validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Package information for import resolution
 */
export interface PackageInfo {
  name: string; // e.g. '@vjs-10/react'
  rootPath: string; // Absolute path to package src root
}

/**
 * Input context configuration
 */
export interface InputContext {
  format: 'react';
  typescript: boolean;
}

/**
 * Import mode determines how imports are generated
 */
export type ImportMode =
  | 'relative' // Phase 1: Relative file paths (monorepo builds)
  | 'package'; // Phase 2: Package imports (npm publishing)

/**
 * Output context configuration
 */
export interface OutputContext {
  format: 'web-component';
  css: 'inline' | 'css-modules' | 'tailwind';
  typescript: boolean;
  importMode?: ImportMode; // Defaults to 'relative' for backward compatibility
}

/**
 * Result of parsing source code
 */
export interface ParseResult {
  // Babel AST
  ast: t.File;

  // Extracted structures
  jsx: t.JSXElement | null;
  imports: ImportDeclaration[];
  componentName: string | null;

  // Styles (if parsing styles.ts)
  stylesObject?: Record<string, string>;
}

/**
 * Import declaration information
 */
export interface ImportDeclaration {
  source: string; // Import path (e.g. '@vjs-10/react', './styles')
  specifiers: string[]; // Named imports (e.g. ['MediaContainer', 'PlayButton'])
  defaultImport?: string | undefined; // Default import name (e.g. 'styles')
  isTypeOnly: boolean; // Whether this is a type-only import
}

/**
 * Component map: maps component names to web component element names
 * Example: { PlayButton: 'media-play-button', MediaContainer: 'media-container' }
 */
export type ComponentMap = Record<string, string>;

/**
 * Styles object: maps style keys to Tailwind utility strings
 * Example: { Button: 'p-2 rounded', Controls: 'flex gap-2' }
 */
export type StylesObject = Record<string, string>;

/**
 * Compilation result
 */
export interface CompileResult {
  // Generated code
  code: string;

  // Component map (for reference)
  componentMap: ComponentMap;

  // Styles object (for reference)
  stylesObject: StylesObject;
}

/**
 * Usage Analysis Types
 */

/**
 * How an import is used in the module
 */
export type ImportUsageType =
  | 'jsx-element' // Used as JSX element name: <PlayButton>
  | 'className-access' // Used in className: className={styles.Button}
  | 'compound-member' // Used as namespace member: <TimeRange.Root>
  | 'unknown'; // Used in other contexts

/**
 * Usage information for a single import
 */
export interface ImportUsage {
  /** Import identifier name */
  name: string;
  /** How this import is used */
  usageType: ImportUsageType;
  /** JSX element nodes where used (if jsx-element) */
  jsxElements?: t.JSXElement[];
  /** Member accesses (if compound-member): ['Root', 'Track'] */
  members?: string[];
}

/**
 * Style key usage information
 */
export interface StyleKeyUsage {
  /** Style key name (e.g., 'Container', 'Button') */
  key: string;
  /** Component names this style is applied to */
  usedOn: string[];
  /** Selector category (determined by categorization layer) */
  category?: SelectorCategory;
}

/**
 * Unified usage graph for a module
 */
export interface UsageGraph {
  /** Import usage information */
  imports: ImportUsage[];
  /** Style key usage information */
  styleKeys: StyleKeyUsage[];
}

/**
 * Categorization Types
 */

/**
 * CSS selector category based on style key relationship to components
 */
export type SelectorCategory =
  | 'component-selector-id' // Exact match: styles.PlayButton on <PlayButton>
  | 'component-type-selector' // Suffix pattern: styles.Button on multiple buttons
  | 'nested-component-selector' // Compound: styles.RangeRoot on <TimeRange.Root>
  | 'generic-selector'; // No match: styles.Controls on <div>

/**
 * Import category based on usage and package context
 */
export type ImportCategory =
  | 'vjs-component-same-package' // VJS component in same package
  | 'vjs-component-external' // VJS component from external package
  | 'vjs-icon-package' // VJS icon package
  | 'vjs-core-package' // Platform-agnostic core package
  | 'framework-import' // React, react-dom, etc.
  | 'style-import' // Style definitions
  | 'external-package'; // Non-VJS external package

/**
 * Categorized import information
 */
export interface CategorizedImport {
  /** Original import */
  import: ImportDeclaration;
  /** Determined category */
  category: ImportCategory;
  /** Usage information */
  usage: ImportUsage;
}
