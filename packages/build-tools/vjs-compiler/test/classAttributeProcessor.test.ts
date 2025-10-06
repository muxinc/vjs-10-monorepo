import { describe, it, expect } from 'vitest';
import * as t from '@babel/types';

import { ClassAttributeProcessor } from '../src/attributeProcessing/ClassAttributeProcessor.js';
import type { AttributeContext } from '../src/attributeProcessing/types.js';

describe('ClassAttributeProcessor', () => {
  const processor = new ClassAttributeProcessor();

  function createContext(
    attribute: t.JSXAttribute,
    stylesObject?: Record<string, string> | null,
    componentMap?: Record<string, string>,
  ): AttributeContext {
    return {
      attribute,
      elementName: 'TestElement',
      htmlElementName: 'test-element',
      stylesObject,
      componentMap,
    };
  }

  describe('transformName', () => {
    it('should transform className to class', () => {
      const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('foo'));
      const context = createContext(attr);

      const result = processor.transformName(context);
      expect(result).toBe('class');
    });

    it('should return null for non-className attributes', () => {
      const attr = t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral('foo'));
      const context = createContext(attr);

      const result = processor.transformName(context);
      expect(result).toBeNull();
    });
  });

  describe('transformValue', () => {
    describe('string literals', () => {
      it('should pass through string literals', () => {
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('static-class'));
        const context = createContext(attr);

        const result = processor.transformValue(context);
        expect(result).toBe('static-class');
      });
    });

    describe('simple member expressions', () => {
      it('should resolve styles.Button to "Button"', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, { Button: 'btn-styles' });

        const result = processor.transformValue(context);
        expect(result).toBe('Button');
      });

      it('should filter out component classes in componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('PlayButton'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(
          attr,
          { PlayButton: 'play-button-styles' },
          { PlayButton: 'media-play-button' },
        );

        const result = processor.transformValue(context);
        expect(result).toBeNull(); // Filtered out
      });

      it('should keep styling classes not in componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(
          attr,
          { Button: 'btn-styles' },
          { PlayButton: 'media-play-button' },
        );

        const result = processor.transformValue(context);
        expect(result).toBe('Button');
      });
    });

    describe('template literals', () => {
      it('should resolve multiple styles in template literal', () => {
        const expr = t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }, false),
            t.templateElement({ raw: ' ', cooked: ' ' }, false),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [
            t.memberExpression(t.identifier('styles'), t.identifier('Button')),
            t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
          ],
        );
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('Button IconButton');
      });

      it('should filter out component classes from template literal', () => {
        const expr = t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }, false),
            t.templateElement({ raw: ' ', cooked: ' ' }, false),
            t.templateElement({ raw: ' ', cooked: ' ' }, false),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [
            t.memberExpression(t.identifier('styles'), t.identifier('Button')),
            t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
            t.memberExpression(t.identifier('styles'), t.identifier('PlayButton')),
          ],
        );
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(
          attr,
          {
            Button: 'btn',
            IconButton: 'icon-btn',
            PlayButton: 'play-btn',
          },
          {
            PlayButton: 'media-play-button',
          },
        );

        const result = processor.transformValue(context);
        expect(result).toBe('Button IconButton'); // PlayButton filtered out
      });

      it('should handle template literals with static text', () => {
        const expr = t.templateLiteral(
          [
            t.templateElement({ raw: 'static-start ', cooked: 'static-start ' }, false),
            t.templateElement({ raw: ' static-end', cooked: ' static-end' }, true),
          ],
          [t.memberExpression(t.identifier('styles'), t.identifier('Button'))],
        );
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, { Button: 'btn' });

        const result = processor.transformValue(context);
        expect(result).toBe('static-start Button static-end');
      });
    });

    describe('function calls (cn/clsx)', () => {
      it('should resolve function call arguments', () => {
        const expr = t.callExpression(t.identifier('cn'), [
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
          t.stringLiteral('static-class'),
        ]);
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('Button IconButton static-class');
      });

      it('should filter component classes from function calls', () => {
        const expr = t.callExpression(t.identifier('cn'), [
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('PlayButton')),
        ]);
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(
          attr,
          {
            Button: 'btn',
            PlayButton: 'play-btn',
          },
          {
            PlayButton: 'media-play-button',
          },
        );

        const result = processor.transformValue(context);
        expect(result).toBe('Button'); // PlayButton filtered out
      });
    });

    describe('conditional expressions', () => {
      it('should resolve conditional expression (takes consequent)', () => {
        const expr = t.conditionalExpression(
          t.booleanLiteral(true),
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
        );
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('Button');
      });
    });

    describe('logical expressions', () => {
      it('should resolve logical AND expression (takes right side)', () => {
        const expr = t.logicalExpression(
          '&&',
          t.booleanLiteral(true),
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
        );
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, { Button: 'btn' });

        const result = processor.transformValue(context);
        expect(result).toBe('Button');
      });
    });

    describe('edge cases', () => {
      it('should return null for empty JSX expression', () => {
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(t.jsxEmptyExpression()),
        );
        const context = createContext(attr);

        const result = processor.transformValue(context);
        expect(result).toBeNull();
      });

      it('should return null when all classes are filtered out', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('PlayButton'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(
          attr,
          { PlayButton: 'play-btn' },
          { PlayButton: 'media-play-button' },
        );

        const result = processor.transformValue(context);
        expect(result).toBeNull();
      });

      it('should handle missing stylesObject', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, null);

        const result = processor.transformValue(context);
        expect(result).toBe('Button'); // Still resolves the key name
      });

      it('should handle missing componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(
          t.jsxIdentifier('className'),
          t.jsxExpressionContainer(expr),
        );
        const context = createContext(attr, { Button: 'btn' }, undefined);

        const result = processor.transformValue(context);
        expect(result).toBe('Button'); // No filtering without componentMap
      });
    });
  });
});
