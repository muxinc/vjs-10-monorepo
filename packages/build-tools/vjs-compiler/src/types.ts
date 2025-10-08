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
  stylesPath: string; // Absolute path to styles file

  // Output location
  outputPath: string; // Absolute path to output file

  // Package context
  sourcePackage: PackageInfo;
  targetPackage: PackageInfo;
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
  framework: 'react';
  cssType: 'tailwind-v4';
}

/**
 * Output context configuration
 */
export interface OutputContext {
  framework: 'web-component';
  cssStrategy: 'inline-vanilla';
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
  | 'jsx-element'        // Used as JSX element name: <PlayButton>
  | 'className-access'   // Used in className: className={styles.Button}
  | 'compound-member'    // Used as namespace member: <TimeRange.Root>
  | 'unknown';           // Used in other contexts

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
  | 'component-selector-id'     // Exact match: styles.PlayButton on <PlayButton>
  | 'component-type-selector'   // Suffix pattern: styles.Button on multiple buttons
  | 'nested-component-selector' // Compound: styles.RangeRoot on <TimeRange.Root>
  | 'generic-selector';          // No match: styles.Controls on <div>

/**
 * Import category based on usage and package context
 */
export type ImportCategory =
  | 'vjs-component-same-package' // VJS component in same package
  | 'vjs-component-external'     // VJS component from external package
  | 'vjs-icon-package'           // VJS icon package
  | 'vjs-core-package'           // Platform-agnostic core package
  | 'framework-import'           // React, react-dom, etc.
  | 'style-import'               // Style definitions
  | 'external-package';          // Non-VJS external package

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
