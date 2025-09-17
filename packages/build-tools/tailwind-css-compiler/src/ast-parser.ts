import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync } from 'fs';
import { ClassUsage, ParsedFile } from './types.js';

export class ASTParser {
  /**
   * Parse a single TypeScript/React file and extract className usage
   */
  parseFile(filePath: string): ParsedFile {
    const sourceCode = readFileSync(filePath, 'utf8');
    const usages: ClassUsage[] = [];

    try {
      const ast = parse(sourceCode, {
        sourceType: 'module',
        plugins: ['tsx', 'typescript', 'jsx']
      });

      let currentComponent = this.extractComponentName(filePath);
      const parser = this; // Reference to this for use in traverse callbacks

      traverse(ast, {
        // Track current component/function name
        FunctionDeclaration(path) {
          if (path.node.id?.name) {
            currentComponent = path.node.id.name;
          }
        },
        VariableDeclarator(path) {
          if (t.isIdentifier(path.node.id) && t.isArrowFunctionExpression(path.node.init)) {
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
          if (parser.isClassNameAttribute(path.node)) {
            const usage = parser.extractClassUsage(
              path,
              currentComponent,
              filePath,
              sourceCode
            );
            if (usage) {
              usages.push(usage);
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return {
      path: filePath,
      usages
    };
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    const baseName = fileName.replace(/\.(tsx?|jsx?)$/, '');

    // Convert kebab-case or snake_case to PascalCase
    return baseName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Check if JSX attribute is a className
   */
  private isClassNameAttribute(node: t.JSXAttribute): boolean {
    return t.isJSXIdentifier(node.name) &&
           (node.name.name === 'className' || node.name.name === 'class');
  }

  /**
   * Extract class usage from JSX attribute
   */
  private extractClassUsage(
    path: any,
    component: string,
    file: string,
    sourceCode: string
  ): ClassUsage | null {
    const node = path.node;
    const element = this.getElementType(path);

    const classes = this.extractClasses(node.value);
    if (classes.length === 0) {
      return null;
    }

    const conditions = this.extractConditions(classes);
    const cleanClasses = classes.filter(cls => !this.isConditionalClass(cls));

    const loc = node.loc;

    return {
      file,
      component,
      element,
      classes: cleanClasses,
      conditions,
      line: loc?.start.line || 0,
      column: loc?.start.column || 0
    };
  }

  /**
   * Get the type of element this className is applied to
   */
  private getElementType(path: any): string {
    const jsxElement = path.findParent((p: any) => t.isJSXOpeningElement(p.node));

    if (jsxElement && t.isJSXIdentifier(jsxElement.node.name)) {
      const elementName = jsxElement.node.name.name;

      // Map common HTML elements
      const htmlElements = new Set(['button', 'div', 'span', 'input', 'img', 'video']);
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
   * Extract class names from JSX attribute value
   */
  private extractClasses(value: t.JSXExpressionContainer['expression'] | t.StringLiteral | null): string[] {
    if (!value) return [];

    if (t.isStringLiteral(value)) {
      return this.parseClassString(value.value);
    }

    if (t.isJSXExpressionContainer(value)) {
      return this.extractClassesFromExpression(value.expression);
    }

    return [];
  }

  /**
   * Extract classes from various expression types
   */
  private extractClassesFromExpression(expression: t.Expression | t.JSXEmptyExpression): string[] {
    if (t.isStringLiteral(expression)) {
      return this.parseClassString(expression.value);
    }

    if (t.isTemplateLiteral(expression)) {
      // Handle template literals - extract static parts
      const staticParts: string[] = [];
      expression.quasis.forEach(quasi => {
        if (quasi.value.raw) {
          staticParts.push(...this.parseClassString(quasi.value.raw));
        }
      });
      return staticParts;
    }

    if (t.isBinaryExpression(expression) && expression.operator === '+') {
      // Handle string concatenation
      const left = this.extractClassesFromExpression(expression.left);
      const right = this.extractClassesFromExpression(expression.right);
      return [...left, ...right];
    }

    if (t.isConditionalExpression(expression)) {
      // Handle ternary expressions
      const consequent = this.extractClassesFromExpression(expression.consequent);
      const alternate = this.extractClassesFromExpression(expression.alternate);
      return [...consequent, ...alternate];
    }

    // For more complex expressions, we might need static analysis
    // For now, return empty array
    return [];
  }

  /**
   * Parse space-separated class string
   */
  private parseClassString(classString: string): string[] {
    return classString
      .split(/\s+/)
      .map(cls => cls.trim())
      .filter(cls => cls.length > 0);
  }

  /**
   * Extract conditional modifiers from classes
   */
  private extractConditions(classes: string[]): string[] {
    const conditions: string[] = [];

    classes.forEach(cls => {
      // Handle data-* attribute conditions
      const dataMatch = cls.match(/^data-\[([^\]]+)\]:/);
      if (dataMatch) {
        conditions.push(`data-${dataMatch[1]}`);
      }

      // Handle pseudo-class conditions
      const pseudoMatch = cls.match(/^(hover|focus|active|disabled):/);
      if (pseudoMatch) {
        conditions.push(pseudoMatch[1]);
      }
    });

    return [...new Set(conditions)]; // dedupe
  }

  /**
   * Check if a class is conditional (has modifiers)
   */
  private isConditionalClass(cls: string): boolean {
    return cls.includes(':') && (
      cls.startsWith('data-[') ||
      cls.startsWith('hover:') ||
      cls.startsWith('focus:') ||
      cls.startsWith('active:') ||
      cls.startsWith('disabled:')
    );
  }
}