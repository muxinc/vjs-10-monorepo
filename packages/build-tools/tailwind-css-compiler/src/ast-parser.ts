import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync } from 'fs';
import { ClassUsage, ParsedFile } from './types.js';


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
/**
 * Native HTML elements that should be classified as 'native' component type
 */
const NATIVE_HTML_ELEMENTS = new Set([
  'button',
  'div',
  'span',
  'input',
  'img',
  'video',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'main',
  'nav'
]);

/**
 * Check if an element is structural (generic layout/styling container)
 * vs semantic (meaningful component or form element)
 */
export function isStructuralElement(elementName: string): boolean {
  const structuralElements = new Set([
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'
  ]);
  return structuralElements.has(elementName.toLowerCase());
}

/**
 * Check if an element is a native HTML element
 */
export function isNativeHTMLElement(elementName: string): boolean {
  return NATIVE_HTML_ELEMENTS.has(elementName.toLowerCase());
}

/**
 * Get the raw JSX element name (for component naming)
 */
export function getJSXElementName(path: any): string | null {
  const jsxElement = path.findParent((p: any) => t.isJSXOpeningElement(p.node));

  if (jsxElement) {
    if (t.isJSXIdentifier(jsxElement.node.name)) {
      // Simple component: <PlayButton>
      return jsxElement.node.name.name;
    } else if (t.isJSXMemberExpression(jsxElement.node.name)) {
      // Compound component: <TimeRange.Root>
      // Extract the full name like "TimeRange.Root"
      const object = jsxElement.node.name.object;
      const property = jsxElement.node.name.property;

      if (t.isJSXIdentifier(object) && t.isJSXIdentifier(property)) {
        return `${object.name}.${property.name}`;
      }
    }
  }

  return null;
}

export function getElementType(path: any): string {
  const jsxElement = path.findParent((p: any) => t.isJSXOpeningElement(p.node));

  if (jsxElement && t.isJSXIdentifier(jsxElement.node.name)) {
    const elementName = jsxElement.node.name.name;

    // Map native HTML elements using the shared set
    if (isNativeHTMLElement(elementName)) {
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
  fallbackComponent: string,
  importedComponents?: Set<string>,
): Omit<ClassUsage, 'file'> | null {
  const node = path.node;
  const element = getElementType(path);

  // Determine component name and type based on element type and imports
  const jsxElementName = getJSXElementName(path);

  let component: string;
  let componentType: 'library' | 'native' | 'unknown';

  if (jsxElementName && isNativeHTMLElement(jsxElementName)) {
    // Native HTML elements (button, div, span, etc.)
    component = jsxElementName.toLowerCase();
    componentType = 'native';
  } else if (jsxElementName && importedComponents?.has(jsxElementName)) {
    // Imported library components
    component = jsxElementName;
    componentType = 'library';
  } else if (jsxElementName) {
    // JSX element name exists but not imported - could be library component not tracked
    component = jsxElementName;
    componentType = 'unknown';
  } else {
    // Fallback to current component context
    component = fallbackComponent;
    componentType = 'unknown';
  }

  const classes = extractClasses(node.value);
  if (classes.length === 0) {
    return null;
  }

  const loc = node.loc;

  return {
    component,
    element,
    classes,
    line: loc?.start.line || 0,
    column: loc?.start.column || 0,
    componentType,
  };
}

/**
 * Parse source code string and extract className usage
 */
export function parseSourceCode(
  sourceCode: string,
  defaultComponentName: string,
): Omit<ClassUsage, 'file'>[] {
  const usages: Omit<ClassUsage, 'file'>[] = [];

  // Track imported components to distinguish library vs native components
  const importedComponents = new Set<string>();

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

    let currentComponent = defaultComponentName;

    traverse(ast, {
      // Track imported components
      ImportDeclaration(path) {
        const specifiers = path.node.specifiers;
        for (const specifier of specifiers) {
          if (t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
            if (t.isIdentifier(specifier.local)) {
              importedComponents.add(specifier.local.name);
            }
          }
        }
      },

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
          const usage = extractClassUsage(path, currentComponent, importedComponents);
          if (usage) {
            usages.push(usage);
          }
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse src`, error);
  }

  return usages;
}


/**
 * Parse a single TypeScript/React file and extract className usage
 */
export function parseFile(filePath: string): ParsedFile {
  const sourceCode = readFileSync(filePath, 'utf8');
  const defaultComponentName = extractComponentName(filePath);
  const usages = parseSourceCode(sourceCode, defaultComponentName);

  // Add file path to all usages
  const usagesWithFile = usages.map((usage) => ({ ...usage, file: filePath }));

  return {
    path: filePath,
    usages: usagesWithFile,
  };
}

export class ASTParser {
  /**
   * Parse a single TypeScript/React file and extract className usage
   */
  parseFile(filePath: string): ParsedFile {
    return parseFile(filePath);
  }
}
