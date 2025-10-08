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
