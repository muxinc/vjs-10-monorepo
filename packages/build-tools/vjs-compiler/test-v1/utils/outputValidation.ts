import type { Linter } from 'eslint';

import { ESLint } from 'eslint';
import * as prettier from 'prettier';

/**
 * Result of validating TypeScript code with ESLint
 */
export interface ESLintValidationResult {
  valid: boolean;
  errors: Linter.LintMessage[];
  warnings: Linter.LintMessage[];
}

/**
 * Result of validating code formatting with Prettier
 */
export interface PrettierValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates generated TypeScript code using ESLint
 *
 * Uses the workspace ESLint configuration (@antfu/eslint-config)
 * to ensure generated code follows project standards.
 *
 * @param code - TypeScript code to validate
 * @returns ESLint validation result with errors and warnings
 */
export async function validateTypeScriptWithESLint(code: string): Promise<ESLintValidationResult> {
  const eslint = new ESLint({
    baseConfig: {
      extends: ['@antfu'],
    },
    overrideConfigFile: true,
  });

  const results = await eslint.lintText(code, {
    filePath: 'generated.ts',
  });

  const result = results[0];
  if (!result) {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  const errors = result.messages.filter((msg) => msg.severity === 2);
  const warnings = result.messages.filter((msg) => msg.severity === 1);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates code formatting using Prettier
 *
 * Checks if code is formatted according to workspace prettier configuration.
 *
 * @param code - Code to validate
 * @param parser - Prettier parser to use (typescript, css, html, etc.)
 * @returns Prettier validation result
 */
export async function validateFormattingWithPrettier(
  code: string,
  parser: 'typescript' | 'css' | 'html'
): Promise<PrettierValidationResult> {
  try {
    const isFormatted = await prettier.check(code, {
      parser,
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
    });

    return {
      valid: isFormatted,
      message: isFormatted ? undefined : 'Code is not properly formatted',
    };
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Unknown formatting error',
    };
  }
}

/**
 * Validates generated CSS code
 *
 * Checks that CSS is properly formatted and parseable.
 *
 * @param css - CSS code to validate
 * @returns Validation result
 */
export async function validateCSS(css: string): Promise<PrettierValidationResult> {
  return validateFormattingWithPrettier(css, 'css');
}

/**
 * Validates generated TypeScript skin module
 *
 * Performs both ESLint and Prettier validation on generated TypeScript code.
 *
 * @param code - TypeScript code to validate
 * @returns Combined validation result
 */
export async function validateSkinModule(code: string): Promise<{
  eslint: ESLintValidationResult;
  prettier: PrettierValidationResult;
}> {
  const [eslint, prettier] = await Promise.all([
    validateTypeScriptWithESLint(code),
    validateFormattingWithPrettier(code, 'typescript'),
  ]);

  return { eslint, prettier };
}
