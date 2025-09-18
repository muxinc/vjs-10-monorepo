import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync } from 'fs';
import { ClassUsage, ParsedFile } from './types.js';

/**
 * Check if a class is conditional (has modifiers)
 */
export function isConditionalClass(cls: string): boolean {
  return (
    cls.includes(':') &&
    (cls.startsWith('data-[') ||
      cls.startsWith('hover:') ||
      cls.startsWith('focus:') ||
      cls.startsWith('active:') ||
      cls.startsWith('disabled:'))
  );
}

/**
 * Extract conditional modifiers from classes
 */
export function extractConditions(classes: string[]): string[] {
  return classes.reduce((conditions, cls) => {
    let condition: string | undefined;
    // Handle data-* attribute conditions
    const dataMatch = cls.match(/^data-\[([^\]]+)\]:/);
    if (dataMatch) {
      condition = `data-${dataMatch[1]}`;
    } else {
      // Handle pseudo-class conditions
      condition = cls.match(/^(hover|focus|active|disabled):/)?.[1];
    }
    if (condition && !conditions.includes(condition))
      conditions.push(condition);
    return conditions;
  }, [] as string[]);
}

/**
 * Parse space-separated class string
 */
export function parseClassString(classString: string): string[] {
  return classString.split(/\s+/).filter((cls) => cls);
}

/**
 * Extract component name from file path
 */
export function extractComponentName(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  const baseName = fileName.replace(/\.(tsx?|jsx?)$/, '');

  // Convert kebab-case or snake_case to PascalCase
  return baseName
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if JSX attribute is a className
 */
export function isClassNameAttribute(node: t.JSXAttribute): boolean {
  return (
    t.isJSXIdentifier(node.name) &&
    (node.name.name === 'className' || node.name.name === 'class')
  );
}

/**
 * Get the type of element this className is applied to
 */
export function getElementType(path: any): string {
  const jsxElement = path.findParent((p: any) => t.isJSXOpeningElement(p.node));

  if (jsxElement && t.isJSXIdentifier(jsxElement.node.name)) {
    const elementName = jsxElement.node.name.name;

    // Map common HTML elements
    const htmlElements = new Set([
      'button',
      'div',
      'span',
      'input',
      'img',
      'video',
    ]);
    if (htmlElements.has(elementName.toLowerCase())) {
      return elementName.toLowerCase();
    }

    // For custom components, try to infer the type
    if (elementName.includes('Icon')) return 'icon';
    if (elementName.includes('Button')) return 'button';
    if (elementName.includes('Range')) return 'range';
    if (elementName.includes('Display')) return 'display';

    return elementName.toLowerCase();
  }

  return 'div'; // default
}

/**
 * Extract classes from various expression types
 */
export function extractClassesFromExpression(
  expression: t.Expression | t.JSXEmptyExpression,
): string[] {
  if (t.isStringLiteral(expression)) {
    return parseClassString(expression.value);
  }

  if (t.isTemplateLiteral(expression)) {
    // Handle template literals - extract static parts and analyze expressions
    const allParts: string[] = [];

    // Extract static parts from quasis
    expression.quasis.forEach((quasi) => {
      if (quasi.value.raw) {
        allParts.push(...parseClassString(quasi.value.raw));
      }
    });

    // Recursively extract from expressions inside template literal
    expression.expressions.forEach((expr) => {
      allParts.push(...extractClassesFromExpression(expr));
    });

    return allParts;
  }

  if (t.isBinaryExpression(expression) && expression.operator === '+') {
    // Handle string concatenation
    const left = t.isPrivateName(expression.left)
      ? []
      : extractClassesFromExpression(expression.left);
    const right = t.isPrivateName(expression.right)
      ? []
      : extractClassesFromExpression(expression.right);
    return [...left, ...right];
  }

  if (t.isConditionalExpression(expression)) {
    // Handle ternary expressions
    const consequent = extractClassesFromExpression(expression.consequent);
    const alternate = extractClassesFromExpression(expression.alternate);
    return [...consequent, ...alternate];
  }

  // For more complex expressions, we might need static analysis
  // For now, return empty array
  return [];
}

/**
 * Extract class names from JSX attribute value
 */
export function extractClasses(
  value: t.JSXExpressionContainer | t.StringLiteral | null,
): string[] {
  if (!value) return [];

  if (t.isStringLiteral(value)) {
    return parseClassString(value.value);
  }

  if (
    t.isJSXExpressionContainer(value) &&
    !t.isJSXEmptyExpression(value.expression)
  ) {
    return extractClassesFromExpression(value.expression);
  }

  return [];
}

/**
 * Extract class usage from JSX attribute
 */
export function extractClassUsage(
  path: any,
  component: string,
  file: string,
): ClassUsage | null {
  const node = path.node;
  const element = getElementType(path);

  const classes = extractClasses(node.value);
  if (classes.length === 0) {
    return null;
  }

  const conditions = extractConditions(classes);

  const loc = node.loc;

  return {
    file,
    component,
    element,
    classes,
    conditions,
    line: loc?.start.line || 0,
    column: loc?.start.column || 0,
  };
}

/**
 * Parse source code string and extract className usage
 */
export function parseSourceCode(sourceCode: string, filePath: string): ClassUsage[] {
  const usages: ClassUsage[] = [];

  try {
    const ast = parse(sourceCode, {
      sourceType: 'module',
      plugins: [
        // NOTE: Per docs, this should be valid (CJP)
        /** @ts-ignore */
        ['typescript', { isTSX: true }],
        'jsx',
      ],
    });

    let currentComponent = extractComponentName(filePath);

    traverse(ast, {
      // Track current component/function name
      FunctionDeclaration(path) {
        if (path.node.id?.name) {
          currentComponent = path.node.id.name;
        }
      },
      VariableDeclarator(path) {
        if (
          t.isIdentifier(path.node.id) &&
          t.isArrowFunctionExpression(path.node.init)
        ) {
          currentComponent = path.node.id.name;
        }
      },
      ExportDefaultDeclaration(path) {
        if (t.isIdentifier(path.node.declaration)) {
          currentComponent = path.node.declaration.name;
        }
      },

      // Extract className attributes
      JSXAttribute(path) {
        if (isClassNameAttribute(path.node)) {
          const usage = extractClassUsage(path, currentComponent, filePath);
          if (usage) {
            usages.push(usage);
          }
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse ${filePath}:`, error);
  }

  return usages;
}

export class ASTParser {
  /**
   * Parse a single TypeScript/React file and extract className usage
   */
  parseFile(filePath: string): ParsedFile {
    const sourceCode = readFileSync(filePath, 'utf8');
    const usages = parseSourceCode(sourceCode, filePath);

    return {
      path: filePath,
      usages,
    };
  }

}
