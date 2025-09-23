import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
// @ts-ignore - ESM compatibility fix for Babel traverse
const babelTraverse = traverse.default || traverse;
import * as t from '@babel/types';
import type {
  JSXOpeningElement,
  JSXAttribute,
  JSXIdentifier,
  JSXMemberExpression,
  Expression,
  JSXEmptyExpression,
  JSXExpressionContainer,
  StringLiteral,
  ImportDeclaration,
  FunctionDeclaration,
  VariableDeclarator,
  ExportDefaultDeclaration,
} from '@babel/types';
import { readFileSync } from 'fs';
import type { ClassUsage, ParsedFile } from './types.js';

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
export function isClassNameAttribute(node: JSXAttribute): boolean {
  return (
    t.isJSXIdentifier(node.name) &&
    (node.name.name === 'className' || node.name.name === 'class')
  );
}

/**
 * Native HTML elements that should be classified as 'native' component type
 */
const NATIVE_HTML_ELEMENTS = [
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
  'nav',
] as const;

/**
 * Check if an element is a native HTML element
 */
export function isNativeHTMLElement(
  elementName: string,
  nativeElementNames: Readonly<string[]> = NATIVE_HTML_ELEMENTS,
): boolean {
  return nativeElementNames.includes(elementName.toLowerCase());
}

/**
 * Type guard to check if a JSX element name is an identifier
 */
function isJSXIdentifierName(
  name: JSXOpeningElement['name'],
): name is JSXIdentifier {
  return t.isJSXIdentifier(name);
}

/**
 * Type guard to check if a JSX element name is a member expression
 */
function isJSXMemberExpressionName(
  name: JSXOpeningElement['name'],
): name is JSXMemberExpression {
  return t.isJSXMemberExpression(name);
}

/**
 * Get the raw JSX element name (for component naming)
 */
export function getJSXElementName(path: NodePath<JSXAttribute>): string | null {
  const jsxElement = path.findParent((p: NodePath) =>
    t.isJSXOpeningElement(p.node),
  ) as NodePath<JSXOpeningElement> | null;

  if (jsxElement) {
    if (isJSXIdentifierName(jsxElement.node.name)) {
      // Simple component: <PlayButton>
      return jsxElement.node.name.name;
    } else if (isJSXMemberExpressionName(jsxElement.node.name)) {
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

const COMPONENT_TYPE_SUFFIXES = ['Icon', 'Button', 'Range', 'Display'];

export function getElementType(
  path: NodePath<JSXAttribute>,
  componentTypeSuffixes: Readonly<string[]> = COMPONENT_TYPE_SUFFIXES,
): string | undefined {
  const jsxElement = path.findParent((p: NodePath) =>
    t.isJSXOpeningElement(p.node),
  ) as NodePath<JSXOpeningElement> | null;

  if (jsxElement && isJSXIdentifierName(jsxElement.node.name)) {
    const elementName = jsxElement.node.name.name;

    // Map native HTML elements using the shared set
    if (isNativeHTMLElement(elementName)) {
      return elementName.toLowerCase();
    }

    // For custom components, try to infer the type
    const suffixName = componentTypeSuffixes.find((suffix) =>
      elementName.endsWith(suffix),
    );

    if (suffixName) return suffixName.toLowerCase();

    return elementName.toLowerCase();
  }

  return undefined; // default
}

/**
 * Extract classes from various expression types
 */
export function extractClassesFromExpression(
  expression: Expression | JSXEmptyExpression,
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
      allParts.push(...extractClassesFromExpression(expr as Expression));
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
  value: JSXExpressionContainer | StringLiteral | null,
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
  path: NodePath<JSXAttribute>,
  fallbackComponent: string,
  importedComponents?: string[],
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
  } else if (jsxElementName && importedComponents?.includes(jsxElementName)) {
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

  const classes = extractClasses(
    node.value as JSXExpressionContainer | StringLiteral | null,
  );

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
  let importedComponents: string[] = [];

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

    babelTraverse(ast, {
      // Track imported components
      ImportDeclaration(path: NodePath<ImportDeclaration>) {
        const specifiers = path.node.specifiers;
        importedComponents = specifiers.reduce(
          (importedComponents, specifier) => {
            if (
              (t.isImportSpecifier(specifier) ||
                t.isImportDefaultSpecifier(specifier)) &&
              t.isIdentifier(specifier.local)
            ) {
              importedComponents.push(specifier.local.name);
            }
            return importedComponents;
          },
          [] as string[],
        );
      },

      // Track current component/function name
      FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
        if (path.node.id?.name) {
          currentComponent = path.node.id.name;
        }
      },
      VariableDeclarator(path: NodePath<VariableDeclarator>) {
        if (
          t.isIdentifier(path.node.id) &&
          t.isArrowFunctionExpression(path.node.init)
        ) {
          currentComponent = path.node.id.name;
        }
      },
      ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
        if (t.isIdentifier(path.node.declaration)) {
          currentComponent = path.node.declaration.name;
        }
      },

      // Extract className attributes
      JSXAttribute(path: NodePath<JSXAttribute>) {
        if (isClassNameAttribute(path.node)) {
          const usage = extractClassUsage(
            path,
            currentComponent,
            importedComponents,
          );
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

  /**
   * Parse source code string and extract className usage
   */
  parseString(sourceCode: string, filename: string = 'input.tsx'): ClassUsage[] {
    const defaultComponentName = extractComponentName(filename);
    const usages = parseSourceCode(sourceCode, defaultComponentName);
    // Add filename to all usages
    return usages.map((usage) => ({ ...usage, file: filename }));
  }
}
