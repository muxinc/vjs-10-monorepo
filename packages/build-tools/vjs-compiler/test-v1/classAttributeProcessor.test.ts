import type { AttributeContext } from '../src/attributeProcessing/types.js';

import { describe, expect, it } from 'vitest';

import * as t from '@babel/types';

import { ClassAttributeProcessor } from '../src/attributeProcessing/ClassAttributeProcessor.js';

describe('classAttributeProcessor', () => {
  const processor = new ClassAttributeProcessor();

  function createContext(
    attribute: t.JSXAttribute,
    stylesObject?: Record<string, string> | null,
    componentMap?: Record<string, string>
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
      it('should resolve styles.Button to "button" (kebab-case)', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { Button: 'btn-styles' });

        const result = processor.transformValue(context);
        expect(result).toBe('button');
      });

      it('should filter out component classes in componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('PlayButton'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { PlayButton: 'play-button-styles' }, { PlayButton: 'media-play-button' });

        const result = processor.transformValue(context);
        expect(result).toBeNull(); // Filtered out
      });

      it('should keep styling classes not in componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { Button: 'btn-styles' }, { PlayButton: 'media-play-button' });

        const result = processor.transformValue(context);
        expect(result).toBe('button');
      });

      it('should handle fuzzy matching for component names (FullScreenButton vs FullscreenButton)', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('FullScreenButton'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(
          attr,
          { FullScreenButton: 'fullscreen-styles' },
          { FullscreenButton: 'media-fullscreen-button' } // Component uses different casing
        );

        const result = processor.transformValue(context);
        expect(result).toBeNull(); // Should be filtered due to fuzzy match
      });
    });

    describe('template literals', () => {
      it('should resolve multiple styles in template literal (kebab-case)', () => {
        const expr = t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }, false),
            t.templateElement({ raw: ' ', cooked: ' ' }, false),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [
            t.memberExpression(t.identifier('styles'), t.identifier('Button')),
            t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
          ]
        );
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('button icon-button');
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
          ]
        );
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(
          attr,
          {
            Button: 'btn',
            IconButton: 'icon-btn',
            PlayButton: 'play-btn',
          },
          {
            PlayButton: 'media-play-button',
          }
        );

        const result = processor.transformValue(context);
        expect(result).toBe('button icon-button'); // PlayButton filtered out
      });

      it('should handle template literals with static text', () => {
        const expr = t.templateLiteral(
          [
            t.templateElement({ raw: 'static-start ', cooked: 'static-start ' }, false),
            t.templateElement({ raw: ' static-end', cooked: ' static-end' }, true),
          ],
          [t.memberExpression(t.identifier('styles'), t.identifier('Button'))]
        );
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { Button: 'btn' });

        const result = processor.transformValue(context);
        expect(result).toBe('static-start button static-end');
      });
    });

    describe('function calls (cn/clsx)', () => {
      it('should resolve function call arguments (kebab-case)', () => {
        const expr = t.callExpression(t.identifier('cn'), [
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('IconButton')),
          t.stringLiteral('static-class'),
        ]);
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('button icon-button static-class');
      });

      it('should filter component classes from function calls', () => {
        const expr = t.callExpression(t.identifier('cn'), [
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('PlayButton')),
        ]);
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(
          attr,
          {
            Button: 'btn',
            PlayButton: 'play-btn',
          },
          {
            PlayButton: 'media-play-button',
          }
        );

        const result = processor.transformValue(context);
        expect(result).toBe('button'); // PlayButton filtered out
      });
    });

    describe('conditional expressions', () => {
      it('should resolve conditional expression (takes consequent, kebab-case)', () => {
        const expr = t.conditionalExpression(
          t.booleanLiteral(true),
          t.memberExpression(t.identifier('styles'), t.identifier('Button')),
          t.memberExpression(t.identifier('styles'), t.identifier('IconButton'))
        );
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, {
          Button: 'btn',
          IconButton: 'icon-btn',
        });

        const result = processor.transformValue(context);
        expect(result).toBe('button');
      });
    });

    describe('logical expressions', () => {
      it('should resolve logical AND expression (takes right side, kebab-case)', () => {
        const expr = t.logicalExpression(
          '&&',
          t.booleanLiteral(true),
          t.memberExpression(t.identifier('styles'), t.identifier('Button'))
        );
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { Button: 'btn' });

        const result = processor.transformValue(context);
        expect(result).toBe('button');
      });
    });

    describe('edge cases', () => {
      it('should return null for empty JSX expression', () => {
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(t.jsxEmptyExpression()));
        const context = createContext(attr);

        const result = processor.transformValue(context);
        expect(result).toBeNull();
      });

      it('should return null when all classes are filtered out', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('PlayButton'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { PlayButton: 'play-btn' }, { PlayButton: 'media-play-button' });

        const result = processor.transformValue(context);
        expect(result).toBeNull();
      });

      it('should handle missing stylesObject', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, null);

        const result = processor.transformValue(context);
        expect(result).toBe('button'); // Still resolves the key name (kebab-case)
      });

      it('should handle missing componentMap', () => {
        const expr = t.memberExpression(t.identifier('styles'), t.identifier('Button'));
        const attr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(expr));
        const context = createContext(attr, { Button: 'btn' }, undefined);

        const result = processor.transformValue(context);
        expect(result).toBe('button'); // No filtering without componentMap (kebab-case)
      });
    });
  });
});
