#!/usr/bin/env tsx
/**
 * 4-Level Validation Framework for Compiler Output
 *
 * Validates that compiled output meets quality standards:
 * - Level 1: Syntactic validity (TypeScript, HTML, CSS)
 * - Level 2: Output comparison (vs v1 reference)
 * - Level 3: Browser loadability (planned - requires test server)
 * - Level 4: Visual equivalence (planned - requires Playwright)
 *
 * Usage:
 *   npm run validate:output <path-to-compiled-file>
 *   npm run validate:output test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as typescript from 'typescript';

interface ValidationResult {
  level: number;
  name: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

interface ValidationReport {
  filePath: string;
  overallPassed: boolean;
  results: ValidationResult[];
}

// ANSI color codes
const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  gray: '\x1B[90m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Level 1: Syntactic Validation
 *
 * Checks:
 * - TypeScript compilation
 * - No JSX syntax in HTML template strings
 * - Valid CSS (basic parsing)
 */
function validateLevel1Syntax(filePath: string, content: string): ValidationResult {
  const result: ValidationResult = {
    level: 1,
    name: 'Syntactic Validity',
    passed: true,
    errors: [],
    warnings: [],
    info: [],
  };

  // Check 1: TypeScript compilation
  try {
    const compilerOptions: typescript.CompilerOptions = {
      target: typescript.ScriptTarget.ES2020,
      module: typescript.ModuleKind.ESNext,
      strict: true,
      noEmit: true,
    };

    const sourceFile = typescript.createSourceFile(filePath, content, typescript.ScriptTarget.ES2020, true);

    const program = typescript.createProgram([filePath], compilerOptions);
    const diagnostics = typescript.getPreEmitDiagnostics(program, sourceFile);

    if (diagnostics.length > 0) {
      result.passed = false;
      for (const diagnostic of diagnostics) {
        const message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          result.errors.push(`TS${diagnostic.code}: Line ${line + 1}, Col ${character + 1}: ${message}`);
        } else {
          result.errors.push(`TS${diagnostic.code}: ${message}`);
        }
      }
    } else {
      result.info.push('✓ TypeScript compilation successful');
    }
  } catch (err) {
    result.passed = false;
    result.errors.push(`TypeScript compilation failed: ${err}`);
  }

  // Check 2: No JSX syntax in HTML template strings
  const jsxInTemplateRegex = /class=\{`\$\{.*?\}`\}/g;
  const jsxMatches = content.match(jsxInTemplateRegex);
  if (jsxMatches) {
    result.passed = false;
    result.errors.push(`Found ${jsxMatches.length} JSX expression(s) in HTML template:`);
    for (const match of jsxMatches.slice(0, 5)) {
      result.errors.push(`  ${match}`);
    }
    if (jsxMatches.length > 5) {
      result.errors.push(`  ... and ${jsxMatches.length - 5} more`);
    }
  } else {
    result.info.push('✓ No JSX syntax in HTML templates');
  }

  // Check 3: Self-closing tags without closing (Web components need explicit close)
  const selfClosingRegex = /<media-[\w-][^>]*\/>/g;
  const selfClosingMatches = content.match(selfClosingRegex);
  if (selfClosingMatches) {
    result.warnings.push(
      `Found ${selfClosingMatches.length} self-closing custom element(s) (should have explicit closing tags):`
    );
    for (const match of selfClosingMatches.slice(0, 3)) {
      result.warnings.push(`  ${match}`);
    }
  } else {
    result.info.push('✓ All custom elements have explicit closing tags');
  }

  // Check 4: Missing closing tags
  const unclosedRegex = /<(media-[\w-]+)[^/>]*>(?![\s\S]*?<\/\1>)/g;
  const lines = content.split('\n');
  const unclosedTags: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Look for opening tags without matching closing tags
    const openingTags = line.match(/<(media-[\w-]+)[^/>]*>/g);
    if (openingTags) {
      for (const tag of openingTags) {
        const tagNameMatch = tag.match(/<(media-[\w-]+)/);
        if (tagNameMatch) {
          const tagName = tagNameMatch[1];
          const closingTag = `</${tagName}>`;
          // Check if closing tag exists in same line or subsequent lines
          let hasClosing = false;
          for (let j = i; j < lines.length; j++) {
            const checkLine = lines[j];
            if (checkLine && checkLine.includes(closingTag)) {
              hasClosing = true;
              break;
            }
          }
          if (!hasClosing) {
            unclosedTags.push(`Line ${i + 1}: ${tag} (no matching closing tag found)`);
          }
        }
      }
    }
  }

  if (unclosedTags.length > 0) {
    result.passed = false;
    result.errors.push(`Found ${unclosedTags.length} unclosed custom element(s):`);
    for (const tag of unclosedTags.slice(0, 5)) {
      result.errors.push(`  ${tag}`);
    }
  } else {
    result.info.push('✓ All custom elements have matching closing tags');
  }

  // Check 5: "No CSS generated" comments
  const noCSSRegex = /\/\*\s*No CSS generated\s*\*\//g;
  const noCSSMatches = content.match(noCSSRegex);
  if (noCSSMatches) {
    result.passed = false;
    result.errors.push(
      `Found ${noCSSMatches.length} "No CSS generated" comment(s) - CSS rules missing for complex selectors`
    );
  } else {
    result.info.push('✓ No missing CSS rules');
  }

  return result;
}

/**
 * Level 2: Output Comparison
 *
 * Compares against v1 reference output:
 * - Line count comparison
 * - Required sections present (imports, styles, template, class, registration)
 */
function validateLevel2Comparison(filePath: string, content: string): ValidationResult {
  const result: ValidationResult = {
    level: 2,
    name: 'Output Comparison',
    passed: true,
    errors: [],
    warnings: [],
    info: [],
  };

  // Check line count (v1 reference is 513 lines)
  const lineCount = content.split('\n').length;
  result.info.push(`Line count: ${lineCount} lines`);

  if (lineCount < 200) {
    result.warnings.push(`Output is suspiciously short (${lineCount} lines, v1 reference is 513 lines)`);
  }

  // Check for required sections
  const requiredSections = [
    { name: 'Imports', regex: /^import\s+/m, critical: true },
    { name: 'MediaSkin import', regex: /import.*MediaSkin.*from.*media-skin/, critical: true },
    { name: 'Template function', regex: /export\s+function\s+getTemplateHTML\s*\(/, critical: true },
    { name: 'Style tag', regex: /<style>/, critical: true },
    { name: 'CSS rules', regex: /\{\s*[\w-]+\s*:/, critical: true },
    { name: 'HTML markup', regex: /<media-[\w-]+/, critical: true },
    { name: 'Class export', regex: /export\s+class\s+\w+\s+extends\s+MediaSkin/, critical: true },
    { name: 'Custom element registration', regex: /customElements\.define\(/, critical: true },
    { name: 'Base template inclusion', regex: /\$\{MediaSkin\.getTemplateHTML\(\)\}/, critical: false },
  ];

  for (const section of requiredSections) {
    if (!section.regex.test(content)) {
      if (section.critical) {
        result.passed = false;
        result.errors.push(`Missing required section: ${section.name}`);
      } else {
        result.warnings.push(`Missing optional section: ${section.name}`);
      }
    } else {
      result.info.push(`✓ ${section.name} present`);
    }
  }

  return result;
}

/**
 * Level 3: Browser Loadability
 *
 * Note: This requires a test server and browser environment.
 * Currently returns a placeholder result.
 */
function validateLevel3Browser(_filePath: string, _content: string): ValidationResult {
  return {
    level: 3,
    name: 'Browser Loadability',
    passed: true,
    errors: [],
    warnings: [],
    info: ['⏭️  Skipped (requires test server and browser environment)'],
  };
}

/**
 * Level 4: Visual Equivalence
 *
 * Note: This requires Playwright and React comparison app.
 * Currently returns a placeholder result.
 */
function validateLevel4Visual(_filePath: string, _content: string): ValidationResult {
  return {
    level: 4,
    name: 'Visual Equivalence',
    passed: true,
    errors: [],
    warnings: [],
    info: ['⏭️  Skipped (requires Playwright and test setup)'],
  };
}

/**
 * Run all validation levels
 */
function validateOutput(filePath: string): ValidationReport {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  const results: ValidationResult[] = [
    validateLevel1Syntax(filePath, content),
    validateLevel2Comparison(filePath, content),
    validateLevel3Browser(filePath, content),
    validateLevel4Visual(filePath, content),
  ];

  const overallPassed = results.every((r) => r.passed);

  return {
    filePath,
    overallPassed,
    results,
  };
}

/**
 * Print validation report
 */
function printReport(report: ValidationReport): void {
  console.log(`\n${colorize('═'.repeat(80), 'blue')}`);
  console.log(colorize('  COMPILER OUTPUT VALIDATION REPORT', 'blue'));
  console.log(`${colorize('═'.repeat(80), 'blue')}\n`);

  console.log(colorize('File:', 'gray'), report.filePath);
  console.log(
    colorize('Status:', 'gray'),
    report.overallPassed ? colorize('✓ PASSED', 'green') : colorize('✗ FAILED', 'red')
  );
  console.log();

  for (const result of report.results) {
    const statusIcon = result.passed ? colorize('✓', 'green') : colorize('✗', 'red');
    const levelLabel = colorize(`Level ${result.level}:`, 'blue');
    console.log(`${statusIcon} ${levelLabel} ${result.name}`);

    if (result.errors.length > 0) {
      console.log(colorize('  Errors:', 'red'));
      for (const error of result.errors) {
        console.log(colorize(`    ${error}`, 'red'));
      }
    }

    if (result.warnings.length > 0) {
      console.log(colorize('  Warnings:', 'yellow'));
      for (const warning of result.warnings) {
        console.log(colorize(`    ${warning}`, 'yellow'));
      }
    }

    if (result.info.length > 0 && result.errors.length === 0) {
      for (const info of result.info) {
        console.log(colorize(`    ${info}`, 'gray'));
      }
    }

    console.log();
  }

  console.log(colorize('─'.repeat(80), 'gray'));
  if (report.overallPassed) {
    console.log(colorize('✓ All validation checks passed', 'green'));
  } else {
    console.log(colorize('✗ Validation failed - output does not meet quality standards', 'red'));
    console.log(colorize('  See CLAUDE.md for common pitfalls and quality requirements', 'gray'));
  }
  console.log(`${colorize('─'.repeat(80), 'gray')}\n`);
}

/**
 * Main entry point
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(colorize('Error: No file path provided', 'red'));
    console.log('\nUsage:');
    console.log('  npm run validate:output <path-to-compiled-file>');
    console.log('\nExample:');
    console.log('  npm run validate:output test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js');
    process.exit(1);
  }

  const filePath = path.resolve(args[0] ?? '');

  try {
    const report = validateOutput(filePath);
    printReport(report);

    if (!report.overallPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error(colorize(`Validation failed: ${err}`, 'red'));
    process.exit(1);
  }
}

// Run if executed directly (ES module check)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { printReport, validateOutput, ValidationReport, ValidationResult };
