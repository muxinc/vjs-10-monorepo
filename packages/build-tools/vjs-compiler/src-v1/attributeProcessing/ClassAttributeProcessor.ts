import * as t from '@babel/types';

import type { AttributeContext, AttributeProcessor } from './types.js';
import { toKebabCase } from '../utils/naming.js';

/**
 * Processes className attributes, resolving styles object references
 * and filtering out component classes that were transformed to element selectors.
 *
 * Handles:
 * - Simple: className={styles.Button} → class="Button" (if not in componentMap)
 * - Template: className={`${styles.Button} ${styles.IconButton}`} → class="Button IconButton"
 * - String literals: className="static-class" → class="static-class"
 * - Function calls: cn(styles.Button, 'static') → class="Button static"
 *
 * The componentMap is used to filter out classes that were transformed to
 * element selectors in the CSS (e.g., PlayButton → media-play-button).
 * These should not appear in the class attribute.
 */
export class ClassAttributeProcessor implements AttributeProcessor {
  transformName(context: AttributeContext): string | null {
    const attr = context.attribute;
    const attrName = attr.name;

    // Only process className attributes
    if (!t.isJSXIdentifier(attrName) || attrName.name !== 'className') {
      return null;
    }

    return 'class';
  }

  transformValue(context: AttributeContext): string | null {
    const attr = context.attribute;
    const value = attr.value;

    // Skip attributes without values
    if (!value) {
      return null;
    }

    // Handle string literals: className="static-class"
    if (t.isStringLiteral(value)) {
      return value.value;
    }

    // Handle JSX expressions: className={...}
    if (t.isJSXExpressionContainer(value)) {
      const resolved = this.resolveClassNameExpression(
        value.expression,
        context.stylesObject,
        context.componentMap,
      );

      return resolved; // Can be null if we can't resolve it or all classes were filtered
    }

    return null;
  }

  private resolveClassNameExpression(
    expr: t.Expression | t.JSXEmptyExpression,
    stylesObject?: Record<string, string> | null,
    componentMap?: Record<string, string>,
  ): string | null {
    if (t.isJSXEmptyExpression(expr)) {
      return null;
    }

    // Handle member expressions: styles.Button
    if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
      const propertyName = expr.property.name;

      // Check if this is styles.SomeKey
      if (t.isIdentifier(expr.object) && expr.object.name === 'styles') {
        // Filter out component classes that were transformed to element selectors
        if (componentMap && this.isComponentClass(propertyName, componentMap)) {
          return null; // This class became an element selector, omit from class attribute
        }

        // This is a styling class, convert to kebab-case
        return toKebabCase(propertyName);
      }
    }

    // Handle template literals: `${styles.Button} ${styles.IconButton}`
    if (t.isTemplateLiteral(expr)) {
      const parts: string[] = [];

      for (let i = 0; i < expr.quasis.length; i++) {
        const quasi = expr.quasis[i];
        const quasiValue = quasi?.value.cooked || quasi?.value.raw || '';

        // Add static text (trimmed and split by whitespace)
        const staticParts = quasiValue.trim().split(/\s+/).filter(Boolean);
        parts.push(...staticParts);

        // Add expression value if present
        if (i < expr.expressions.length) {
          const exprValue = this.resolveClassNameExpression(
            expr.expressions[i] as t.Expression,
            stylesObject,
            componentMap,
          );
          if (exprValue) {
            parts.push(exprValue);
          }
        }
      }

      return parts.length > 0 ? parts.join(' ') : null;
    }

    // Handle function calls: cn(styles.Button, styles.IconButton, 'static')
    if (t.isCallExpression(expr)) {
      const args = expr.arguments;
      const parts: string[] = [];

      for (const arg of args) {
        if (t.isExpression(arg)) {
          const resolved = this.resolveClassNameExpression(arg, stylesObject, componentMap);
          if (resolved) {
            parts.push(resolved);
          }
        } else if (t.isSpreadElement(arg)) {
          // Skip spread elements for now
          continue;
        }
      }

      return parts.length > 0 ? parts.join(' ') : null;
    }

    // Handle string literals within expressions
    if (t.isStringLiteral(expr)) {
      return expr.value;
    }

    // Handle conditional expressions: condition ? styles.A : styles.B
    // For now, we'll take the consequent branch (simplification)
    if (t.isConditionalExpression(expr)) {
      return this.resolveClassNameExpression(expr.consequent, stylesObject, componentMap);
    }

    // Handle logical expressions: condition && styles.Class
    if (t.isLogicalExpression(expr)) {
      // Try right side first (usual pattern: condition && styles.Class)
      const right = this.resolveClassNameExpression(expr.right, stylesObject, componentMap);
      if (right) return right;

      // Fallback to left side
      return this.resolveClassNameExpression(expr.left, stylesObject, componentMap);
    }

    return null;
  }

  /**
   * Check if a class name is a component class (should be filtered out)
   * Handles both exact matches and fuzzy matches for common naming inconsistencies.
   *
   * Fuzzy matching handles cases like:
   * - FullScreenButton (style key) matches FullscreenButton (component)
   * - By removing case and comparing
   */
  private isComponentClass(className: string, componentMap: Record<string, string>): boolean {
    // Exact match
    if (componentMap[className]) {
      return true;
    }

    // Fuzzy match: normalize both to lowercase for comparison
    const normalizedClassName = className.toLowerCase();
    for (const componentName of Object.keys(componentMap)) {
      if (componentName.toLowerCase() === normalizedClassName) {
        return true;
      }
    }

    return false;
  }
}
