import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as t from '@babel/types';
import {
  parseClassString,
  extractComponentName,
  isClassNameAttribute,
  getElementType,
  extractClassesFromExpression,
  extractClasses,
  extractClassUsage,
  parseSourceCode,
  parseFile,
} from '../../src/ast-parser.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Note: fs.readFileSync is mocked locally only in specific unit tests that need it
// parseFile integration tests use real fixture files

describe('ASTParser', () => {
  describe('parseSourceCode', () => {
    it('should parse simple component with className directly from source', () => {
      const sourceCode = `
import React from 'react';

export const SimpleButton = () => {
  return (
    <button className="bg-blue-500 text-white">
      Click me
    </button>
  );
};
`;

      const usages = parseSourceCode(sourceCode, 'SimpleButton');

      expect(usages).toHaveLength(1);

      const usage = usages[0];
      expect(usage.component).toBe('button'); // Native HTML element uses element name
      expect(usage.componentType).toBe('native');
      expect(usage.element).toBe('button');
      expect(usage.classes).toEqual(['bg-blue-500', 'text-white']);
    });

    it('should handle template literal classNames', () => {
      const sourceCode = `
export const ConditionalButton = ({ isActive }: { isActive: boolean }) => {
  return (
    <button className={\`bg-blue-500 \${isActive ? 'bg-green-500' : 'bg-red-500'}\`}>
      Click me
    </button>
  );
};
`;

      const usages = parseSourceCode(sourceCode, 'ConditionalButton');

      expect(usages).toHaveLength(1);
      const usage = usages[0];

      // Should extract static parts from template literal
      expect(usage.classes).toContain('bg-blue-500');
      // TODO: These should be extracted from template literal expressions
      // expect(usage.classes).toContain('bg-green-500');
      // expect(usage.classes).toContain('bg-red-500');
    });

    it('should track component names from function declarations', () => {
      const sourceCode = `
function PlayButton() {
  return <button className="play-btn">Play</button>;
}

function PauseButton() {
  return <button className="pause-btn">Pause</button>;
}
`;

      const usages = parseSourceCode(sourceCode, 'Test');

      expect(usages).toHaveLength(2);

      const playUsage = usages.find((u) => u.classes.includes('play-btn'));
      const pauseUsage = usages.find((u) => u.classes.includes('pause-btn'));

      expect(playUsage?.component).toBe('button'); // Native HTML element uses element name
      expect(playUsage?.componentType).toBe('native');
      expect(pauseUsage?.component).toBe('button'); // Native HTML element uses element name
      expect(pauseUsage?.componentType).toBe('native');
    });

    it('should handle JSX expressions with conditions', () => {
      const sourceCode = `
export const DataButton = () => {
  return (
    <button className="data-[state=open]:bg-blue-500 hover:bg-gray-100">
      Toggle
    </button>
  );
};
`;

      const usages = parseSourceCode(sourceCode, 'DataButton');

      expect(usages).toHaveLength(1);
      const usage = usages[0];

      // Should extract base classes and conditions
      expect(usage.classes).toContain('hover:bg-gray-100');
      expect(usage.classes).toContain('data-[state=open]:bg-blue-500');

      // Note: Conditional class processing removed - Tailwind handles natively
    });

    it('should handle malformed code gracefully', () => {
      const invalidCode = `
export const BrokenComponent = () => {
  return (
    <button className="bg-blue-500"
      // Missing closing and other syntax errors
  );
`;

      const usages = parseSourceCode(invalidCode, 'Broken');

      // Should return empty array and not throw
      expect(usages).toEqual([]);
    });

    it('should detect different element types', () => {
      const sourceCode = `
export const MultiElementComponent = () => {
  return (
    <div>
      <button className="btn-primary">Button</button>
      <input className="input-field" />
      <PlayIcon className="icon-play" />
      <VolumeRange className="range-slider" />
    </div>
  );
};
`;

      const usages = parseSourceCode(sourceCode, 'Multi');

      expect(usages).toHaveLength(4);

      const buttonUsage = usages.find((u) => u.classes.includes('btn-primary'));
      const inputUsage = usages.find((u) => u.classes.includes('input-field'));
      const iconUsage = usages.find((u) => u.classes.includes('icon-play'));
      const rangeUsage = usages.find((u) => u.classes.includes('range-slider'));

      expect(buttonUsage?.element).toBe('button');
      expect(inputUsage?.element).toBe('input');
      expect(iconUsage?.element).toBe('icon'); // Should detect Icon suffix
      expect(rangeUsage?.element).toBe('range'); // Should detect Range suffix
    });
  });

  describe('parseFile', () => {
    it('should parse a simple React component with className', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/TestButton.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(1);

      const usage = result.usages[0];
      expect(usage.component).toBe('button'); // Native HTML element uses element name
      expect(usage.componentType).toBe('native');
      expect(usage.element).toBe('button');
      expect(usage.classes).toEqual(['bg-blue-500', 'text-white']);
      expect(usage.file).toBe(fixturePath);
    });

    it('should handle conditional className expressions', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/ConditionalButton.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1);
      const usage = result.usages[0];
      expect(usage.classes).toContain('bg-blue-500');
      expect(usage.classes).toContain('bg-green-500');
      expect(usage.classes).toContain('bg-red-500');
    });

    it('should extract element types correctly', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/MultiElementComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(4);

      const buttonUsage = result.usages.find((u) => u.element === 'button');
      expect(buttonUsage).toBeDefined();
      expect(buttonUsage?.classes).toEqual(['btn-primary']);

      const inputUsage = result.usages.find((u) => u.element === 'input');
      expect(inputUsage).toBeDefined();

      const iconUsage = result.usages.find((u) => u.element === 'icon');
      expect(iconUsage).toBeDefined();

      const rangeUsage = result.usages.find((u) => u.element === 'range');
      expect(rangeUsage).toBeDefined();
    });

    it('should handle data attribute conditions', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/DataAttributeComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1);
      const usage = result.usages[0];

      expect(usage.classes).toContain('hover:bg-gray-100');
      // Note: Conditional processing removed - classes processed by Tailwind natively
    });
  });

  describe('error handling', () => {
    it('should handle malformed TypeScript gracefully', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/BrokenComponent.tsx',
      );
      const result = parseFile(fixturePath);

      // Should return empty usages array but not throw
      expect(result.path).toBe(fixturePath);
      expect(result.usages).toEqual([]);
    });

    it('should handle missing className attributes', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/NoClassNameComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toEqual([]);
    });
  });


  describe('parseClassString', () => {
    it('should parse simple space-separated classes', () => {
      const result = parseClassString('bg-blue-500 text-white p-4');

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle multiple spaces between classes', () => {
      const result = parseClassString('bg-blue-500    text-white     p-4');

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle tabs and mixed whitespace', () => {
      const result = parseClassString('bg-blue-500\t\ttext-white\n\np-4');

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should trim leading and trailing whitespace', () => {
      const result = parseClassString('  bg-blue-500 text-white p-4  ');

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle single class', () => {
      const result = parseClassString('bg-blue-500');

      expect(result).toEqual(['bg-blue-500']);
    });

    it('should handle empty string', () => {
      const result = parseClassString('');

      expect(result).toEqual([]);
    });

    it('should handle string with only whitespace', () => {
      const result = parseClassString('   \t\n   ');

      expect(result).toEqual([]);
    });

    it('should handle conditional classes', () => {
      const result = parseClassString(
        'hover:bg-blue-600 focus:ring-2 data-[state=open]:visible',
      );

      expect(result).toEqual([
        'hover:bg-blue-600',
        'focus:ring-2',
        'data-[state=open]:visible',
      ]);
    });

    it('should handle complex Tailwind classes', () => {
      const result = parseClassString(
        'sm:bg-blue-500 lg:text-xl dark:bg-gray-800 hover:scale-105',
      );

      expect(result).toEqual([
        'sm:bg-blue-500',
        'lg:text-xl',
        'dark:bg-gray-800',
        'hover:scale-105',
      ]);
    });

    it('should handle classes with numbers and special characters', () => {
      const result = parseClassString('w-1/2 h-96 -mt-4 bg-blue-500/50');

      expect(result).toEqual(['w-1/2', 'h-96', '-mt-4', 'bg-blue-500/50']);
    });

    it('should handle long class names', () => {
      const result = parseClassString(
        'transition-all duration-300 ease-in-out transform hover:scale-110',
      );

      expect(result).toEqual([
        'transition-all',
        'duration-300',
        'ease-in-out',
        'transform',
        'hover:scale-110',
      ]);
    });

    it('should filter out empty segments from excessive whitespace', () => {
      const result = parseClassString('bg-blue-500   text-white   p-4');

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
      expect(result).not.toContain('');
    });

    it('should handle newlines in class strings', () => {
      const result = parseClassString(`
        bg-blue-500
        text-white
        p-4
        rounded
      `);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4', 'rounded']);
    });

    it('should preserve class order', () => {
      const result = parseClassString(
        'z-50 absolute top-0 left-0 right-0 bottom-0',
      );

      expect(result).toEqual([
        'z-50',
        'absolute',
        'top-0',
        'left-0',
        'right-0',
        'bottom-0',
      ]);
    });
  });

  describe('extractComponentName', () => {
    it('should extract component name from simple filename', () => {
      const result = extractComponentName('/path/to/Button.tsx');

      expect(result).toBe('Button');
    });

    it('should extract component name from kebab-case filename', () => {
      const result = extractComponentName('/path/to/play-button.tsx');

      expect(result).toBe('PlayButton');
    });

    it('should extract component name from snake_case filename', () => {
      const result = extractComponentName('/path/to/media_player.tsx');

      expect(result).toBe('MediaPlayer');
    });

    it('should handle complex kebab-case names', () => {
      const result = extractComponentName('/path/to/my-awesome-component.tsx');

      expect(result).toBe('MyAwesomeComponent');
    });

    it('should handle complex snake_case names', () => {
      const result = extractComponentName(
        '/path/to/media_player_component.tsx',
      );

      expect(result).toBe('MediaPlayerComponent');
    });

    it('should handle mixed case with separators', () => {
      const result = extractComponentName(
        '/path/to/video-player_controller.tsx',
      );

      expect(result).toBe('VideoPlayerController');
    });

    it('should handle JSX file extensions', () => {
      const result = extractComponentName('/path/to/component.jsx');

      expect(result).toBe('Component');
    });

    it('should handle TypeScript file extensions', () => {
      const result = extractComponentName('/path/to/component.ts');

      expect(result).toBe('Component');
    });

    it('should handle JavaScript file extensions', () => {
      const result = extractComponentName('/path/to/component.js');

      expect(result).toBe('Component');
    });

    it('should handle filename without path', () => {
      const result = extractComponentName('simple-button.tsx');

      expect(result).toBe('SimpleButton');
    });

    it('should handle single character parts', () => {
      const result = extractComponentName('/path/to/a-b-c.tsx');

      expect(result).toBe('ABC');
    });

    it('should handle numbers in filename', () => {
      const result = extractComponentName('/path/to/button-v2-final.tsx');

      expect(result).toBe('ButtonV2Final');
    });

    it('should handle filename with no separators', () => {
      const result = extractComponentName('/path/to/mediaplayer.tsx');

      expect(result).toBe('Mediaplayer');
    });

    it('should handle empty filename gracefully', () => {
      const result = extractComponentName('/path/to/.tsx');

      expect(result).toBe('');
    });

    it('should handle filename without extension', () => {
      const result = extractComponentName('/path/to/component');

      expect(result).toBe('Component');
    });

    it('should handle multiple consecutive separators', () => {
      const result = extractComponentName(
        '/path/to/play--button__component.tsx',
      );

      expect(result).toBe('PlayButtonComponent');
    });

    it('should preserve capitalization within parts', () => {
      const result = extractComponentName('/path/to/HTML-parser.tsx');

      expect(result).toBe('HTMLParser');
    });

    it('should handle leading separators', () => {
      const result = extractComponentName('/path/to/-play-button.tsx');

      expect(result).toBe('PlayButton');
    });

    it('should handle trailing separators', () => {
      const result = extractComponentName('/path/to/play-button-.tsx');

      expect(result).toBe('PlayButton');
    });
  });

  describe('isClassNameAttribute', () => {
    it('should return true for className attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral('bg-blue-500'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(true);
    });

    it('should return true for class attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('class'),
        t.stringLiteral('bg-blue-500'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(true);
    });

    it('should return false for other attributes', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('id'),
        t.stringLiteral('my-id'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for onClick attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('onClick'),
        t.jsxExpressionContainer(t.identifier('handleClick')),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for style attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(t.objectExpression([])),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for data attributes', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('data-testid'),
        t.stringLiteral('my-test'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for aria attributes', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('aria-label'),
        t.stringLiteral('Close button'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for key attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('key'),
        t.stringLiteral('item-1'),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should return false for ref attribute', () => {
      const attribute = t.jsxAttribute(
        t.jsxIdentifier('ref'),
        t.jsxExpressionContainer(t.identifier('buttonRef')),
      );

      const result = isClassNameAttribute(attribute);

      expect(result).toBe(false);
    });

    it('should handle case sensitivity correctly', () => {
      // className and class should work, but not other cases
      const classNameAttr = t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral('test'),
      );
      const classAttr = t.jsxAttribute(
        t.jsxIdentifier('class'),
        t.stringLiteral('test'),
      );
      const wrongCaseAttr = t.jsxAttribute(
        t.jsxIdentifier('ClassName'),
        t.stringLiteral('test'),
      );

      expect(isClassNameAttribute(classNameAttr)).toBe(true);
      expect(isClassNameAttribute(classAttr)).toBe(true);
      expect(isClassNameAttribute(wrongCaseAttr)).toBe(false);
    });

    it('should work with different value types', () => {
      // Test with string literal
      const stringAttr = t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral('bg-blue-500'),
      );

      // Test with expression container
      const exprAttr = t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.jsxExpressionContainer(t.identifier('classes')),
      );

      // Test with no value
      const noValueAttr = t.jsxAttribute(t.jsxIdentifier('className'), null);

      expect(isClassNameAttribute(stringAttr)).toBe(true);
      expect(isClassNameAttribute(exprAttr)).toBe(true);
      expect(isClassNameAttribute(noValueAttr)).toBe(true);
    });
  });

  describe('getElementType', () => {
    // Helper function to create a mock path object
    function createMockPath(elementName: string) {
      const jsxElement = t.jsxOpeningElement(
        t.jsxIdentifier(elementName),
        [],
        false,
      );

      return {
        findParent: (predicate: any) => {
          if (predicate({ node: jsxElement })) {
            return {
              node: jsxElement,
            };
          }
          return null;
        },
      };
    }

    it('should return "button" for button elements', () => {
      const path = createMockPath('button');
      const result = getElementType(path);

      expect(result).toBe('button');
    });

    it('should return "div" for div elements', () => {
      const path = createMockPath('div');
      const result = getElementType(path);

      expect(result).toBe('div');
    });

    it('should return "span" for span elements', () => {
      const path = createMockPath('span');
      const result = getElementType(path);

      expect(result).toBe('span');
    });

    it('should return "input" for input elements', () => {
      const path = createMockPath('input');
      const result = getElementType(path);

      expect(result).toBe('input');
    });

    it('should return "img" for img elements', () => {
      const path = createMockPath('img');
      const result = getElementType(path);

      expect(result).toBe('img');
    });

    it('should return "video" for video elements', () => {
      const path = createMockPath('video');
      const result = getElementType(path);

      expect(result).toBe('video');
    });

    it('should handle case-insensitive HTML elements', () => {
      const buttonPath = createMockPath('Button');
      const divPath = createMockPath('DIV');

      expect(getElementType(buttonPath)).toBe('button');
      expect(getElementType(divPath)).toBe('div');
    });

    it('should return "icon" for components with Icon in name', () => {
      const playIconPath = createMockPath('PlayIcon');
      const closeIconPath = createMockPath('CloseIcon');
      const iconButtonPath = createMockPath('IconButton');

      expect(getElementType(playIconPath)).toBe('icon');
      expect(getElementType(closeIconPath)).toBe('icon');
      expect(getElementType(iconButtonPath)).toBe('icon');
    });

    it('should return "button" for components with Button in name', () => {
      const playButtonPath = createMockPath('PlayButton');
      const closeButtonPath = createMockPath('CloseButton');
      const submitButtonPath = createMockPath('SubmitButton');

      expect(getElementType(playButtonPath)).toBe('button');
      expect(getElementType(closeButtonPath)).toBe('button');
      expect(getElementType(submitButtonPath)).toBe('button');
    });

    it('should return "range" for components with Range in name', () => {
      const timeRangePath = createMockPath('TimeRange');
      const volumeRangePath = createMockPath('VolumeRange');
      const customRangePath = createMockPath('CustomRange');

      expect(getElementType(timeRangePath)).toBe('range');
      expect(getElementType(volumeRangePath)).toBe('range');
      expect(getElementType(customRangePath)).toBe('range');
    });

    it('should return "display" for components with Display in name', () => {
      const timeDisplayPath = createMockPath('TimeDisplay');
      const durationDisplayPath = createMockPath('DurationDisplay');
      const statusDisplayPath = createMockPath('StatusDisplay');

      expect(getElementType(timeDisplayPath)).toBe('display');
      expect(getElementType(durationDisplayPath)).toBe('display');
      expect(getElementType(statusDisplayPath)).toBe('display');
    });

    it('should prioritize HTML elements over pattern matching', () => {
      // HTML elements should be returned as-is, not pattern matched
      const buttonPath = createMockPath('button');
      const inputPath = createMockPath('input');

      expect(getElementType(buttonPath)).toBe('button');
      expect(getElementType(inputPath)).toBe('input');
    });

    it('should return lowercase element name for unrecognized components', () => {
      const customPath = createMockPath('CustomComponent');
      const weirdPath = createMockPath('WeirdElement');
      const fooPath = createMockPath('Foo');

      expect(getElementType(customPath)).toBe('customcomponent');
      expect(getElementType(weirdPath)).toBe('weirdelement');
      expect(getElementType(fooPath)).toBe('foo');
    });

    it('should handle pattern priority correctly', () => {
      // Components with multiple patterns should match the first pattern in the code order
      // Order is: Icon, Button, Range, Display
      const iconButtonPath = createMockPath('IconButton');
      const buttonIconPath = createMockPath('ButtonIcon');
      const rangeButtonPath = createMockPath('RangeButton');
      const buttonRangePath = createMockPath('ButtonRange');

      // Icon pattern is checked first, so IconButton matches "icon"
      expect(getElementType(iconButtonPath)).toBe('icon');
      // ButtonIcon also matches Icon first (Icon comes before Button)
      expect(getElementType(buttonIconPath)).toBe('icon');
      // RangeButton matches Button first (Button comes before Range)
      expect(getElementType(rangeButtonPath)).toBe('button');
      // ButtonRange matches Button first (Button comes before Range)
      expect(getElementType(buttonRangePath)).toBe('button');
    });

    it('should return "div" as default when no parent found', () => {
      const pathWithoutParent = {
        findParent: () => null,
      };

      const result = getElementType(pathWithoutParent);

      expect(result).toBe('div');
    });

    it('should return "div" as default when parent is not JSX element', () => {
      const pathWithNonJSXParent = {
        findParent: (predicate: any) => {
          const nonJSXNode = t.identifier('someVariable');
          if (predicate({ node: nonJSXNode })) {
            return { node: nonJSXNode };
          }
          return null;
        },
      };

      const result = getElementType(pathWithNonJSXParent);

      expect(result).toBe('div');
    });

    it('should handle numeric and special characters in component names', () => {
      const component2Path = createMockPath('Component2');
      const underscorePath = createMockPath('My_Component');
      const numberIconPath = createMockPath('Icon24');

      expect(getElementType(component2Path)).toBe('component2');
      expect(getElementType(underscorePath)).toBe('my_component');
      expect(getElementType(numberIconPath)).toBe('icon');
    });
  });

  describe('extractClassesFromExpression', () => {
    it('should extract classes from string literal', () => {
      const stringLiteral = t.stringLiteral('bg-blue-500 text-white p-4');
      const result = extractClassesFromExpression(stringLiteral);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should extract classes from template literal with static parts only', () => {
      const templateLiteral = t.templateLiteral(
        [
          t.templateElement(
            { raw: 'bg-blue-500 ', cooked: 'bg-blue-500 ' },
            false,
          ),
          t.templateElement(
            { raw: ' text-white p-4', cooked: ' text-white p-4' },
            true,
          ),
        ],
        [t.identifier('variable')],
      );
      const result = extractClassesFromExpression(templateLiteral);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle template literal with empty parts', () => {
      const templateLiteral = t.templateLiteral(
        [
          t.templateElement({ raw: '', cooked: '' }, false),
          t.templateElement(
            { raw: 'bg-blue-500', cooked: 'bg-blue-500' },
            false,
          ),
          t.templateElement({ raw: '', cooked: '' }, true),
        ],
        [t.identifier('var1'), t.identifier('var2')],
      );
      const result = extractClassesFromExpression(templateLiteral);

      expect(result).toEqual(['bg-blue-500']);
    });

    it('should extract classes from string concatenation with binary expression', () => {
      const binaryExpression = t.binaryExpression(
        '+',
        t.stringLiteral('bg-blue-500 '),
        t.stringLiteral('text-white p-4'),
      );
      const result = extractClassesFromExpression(binaryExpression);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle nested binary expressions', () => {
      const nestedBinary = t.binaryExpression(
        '+',
        t.binaryExpression(
          '+',
          t.stringLiteral('bg-blue-500 '),
          t.stringLiteral('text-white '),
        ),
        t.stringLiteral('p-4 rounded'),
      );
      const result = extractClassesFromExpression(nestedBinary);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4', 'rounded']);
    });

    it('should handle binary expression with non-string operands', () => {
      // Should still handle the string part and ignore non-string parts
      const binaryExpression = t.binaryExpression(
        '+',
        t.stringLiteral('bg-blue-500 '),
        t.identifier('dynamicClasses'),
      );
      const result = extractClassesFromExpression(binaryExpression);

      expect(result).toEqual(['bg-blue-500']);
    });

    it('should handle binary expression with identifier operands', () => {
      // This represents: className={baseClasses + ' text-white'}
      const binaryExpression = t.binaryExpression(
        '+',
        t.identifier('baseClasses'),
        t.stringLiteral(' text-white'),
      );
      const result = extractClassesFromExpression(binaryExpression);

      // Only extracts from the string literal part
      expect(result).toEqual(['text-white']);
    });

    it('should extract classes from conditional expressions (ternary)', () => {
      const conditionalExpression = t.conditionalExpression(
        t.identifier('condition'),
        t.stringLiteral('bg-blue-500 text-white'),
        t.stringLiteral('bg-gray-500 text-black'),
      );
      const result = extractClassesFromExpression(conditionalExpression);

      expect(result).toEqual([
        'bg-blue-500',
        'text-white',
        'bg-gray-500',
        'text-black',
      ]);
    });

    it('should handle nested conditional expressions', () => {
      const nestedConditional = t.conditionalExpression(
        t.identifier('condition1'),
        t.conditionalExpression(
          t.identifier('condition2'),
          t.stringLiteral('bg-blue-500'),
          t.stringLiteral('bg-green-500'),
        ),
        t.stringLiteral('bg-red-500'),
      );
      const result = extractClassesFromExpression(nestedConditional);

      expect(result).toEqual(['bg-blue-500', 'bg-green-500', 'bg-red-500']);
    });

    it('should handle conditional with template literals', () => {
      const templateInConditional = t.conditionalExpression(
        t.identifier('isActive'),
        t.templateLiteral(
          [
            t.templateElement(
              { raw: 'bg-blue-500 ', cooked: 'bg-blue-500 ' },
              false,
            ),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [t.identifier('activeClass')],
        ),
        t.stringLiteral('bg-gray-500'),
      );
      const result = extractClassesFromExpression(templateInConditional);

      expect(result).toEqual(['bg-blue-500', 'bg-gray-500']);
    });

    it('should handle mixed complex expressions', () => {
      // Test a conditional with binary expressions
      const complexExpression = t.conditionalExpression(
        t.identifier('condition'),
        t.binaryExpression(
          '+',
          t.stringLiteral('bg-blue-500 '),
          t.stringLiteral('text-white'),
        ),
        t.binaryExpression(
          '+',
          t.stringLiteral('bg-red-500 '),
          t.stringLiteral('text-black'),
        ),
      );
      const result = extractClassesFromExpression(complexExpression);

      expect(result).toEqual([
        'bg-blue-500',
        'text-white',
        'bg-red-500',
        'text-black',
      ]);
    });

    it('should return empty array for unsupported expression types', () => {
      // Test with call expression, which is not supported
      const callExpression = t.callExpression(t.identifier('classNames'), [
        t.stringLiteral('bg-blue-500'),
      ]);
      const result = extractClassesFromExpression(callExpression);

      expect(result).toEqual([]);
    });

    it('should return empty array for object expressions', () => {
      const objectExpression = t.objectExpression([
        t.objectProperty(
          t.stringLiteral('bg-blue-500'),
          t.booleanLiteral(true),
        ),
      ]);
      const result = extractClassesFromExpression(objectExpression);

      expect(result).toEqual([]);
    });

    it('should return empty array for array expressions', () => {
      const arrayExpression = t.arrayExpression([
        t.stringLiteral('bg-blue-500'),
        t.stringLiteral('text-white'),
      ]);
      const result = extractClassesFromExpression(arrayExpression);

      expect(result).toEqual([]);
    });

    it('should return empty array for JSX empty expressions', () => {
      const jsxEmptyExpression = t.jsxEmptyExpression();
      const result = extractClassesFromExpression(jsxEmptyExpression);

      expect(result).toEqual([]);
    });

    it('should handle non-addition binary operators', () => {
      // Should return empty for non-addition operations
      const subtractionExpression = t.binaryExpression(
        '-',
        t.stringLiteral('bg-blue-500'),
        t.stringLiteral('text-white'),
      );
      const result = extractClassesFromExpression(subtractionExpression);

      expect(result).toEqual([]);
    });

    it('should preserve class order in complex expressions', () => {
      const expression = t.conditionalExpression(
        t.identifier('isFirst'),
        t.binaryExpression(
          '+',
          t.stringLiteral('first-class '),
          t.stringLiteral('second-class'),
        ),
        t.binaryExpression(
          '+',
          t.stringLiteral('third-class '),
          t.stringLiteral('fourth-class'),
        ),
      );
      const result = extractClassesFromExpression(expression);

      expect(result).toEqual([
        'first-class',
        'second-class',
        'third-class',
        'fourth-class',
      ]);
    });

    it('should handle whitespace normalization in extracted classes', () => {
      const stringLiteral = t.stringLiteral(
        '  bg-blue-500   text-white\t\tp-4  ',
      );
      const result = extractClassesFromExpression(stringLiteral);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should handle conditional classes in expressions', () => {
      const stringLiteral = t.stringLiteral(
        'hover:bg-blue-600 focus:ring-2 data-[state=open]:visible',
      );
      const result = extractClassesFromExpression(stringLiteral);

      expect(result).toEqual([
        'hover:bg-blue-600',
        'focus:ring-2',
        'data-[state=open]:visible',
      ]);
    });

    it('should handle empty strings in expressions', () => {
      const binaryExpression = t.binaryExpression(
        '+',
        t.stringLiteral(''),
        t.stringLiteral('bg-blue-500'),
      );
      const result = extractClassesFromExpression(binaryExpression);

      expect(result).toEqual(['bg-blue-500']);
    });

    it('should handle template literals with only dynamic parts', () => {
      const templateLiteral = t.templateLiteral(
        [
          t.templateElement({ raw: '', cooked: '' }, false),
          t.templateElement({ raw: '', cooked: '' }, true),
        ],
        [t.identifier('dynamicClass')],
      );
      const result = extractClassesFromExpression(templateLiteral);

      expect(result).toEqual([]);
    });

    it('should recursively handle deeply nested expressions', () => {
      // Create a deeply nested conditional with binary expressions
      const deepExpression = t.conditionalExpression(
        t.identifier('level1'),
        t.conditionalExpression(
          t.identifier('level2'),
          t.binaryExpression(
            '+',
            t.stringLiteral('deep-class-1 '),
            t.stringLiteral('deep-class-2'),
          ),
          t.stringLiteral('fallback-class'),
        ),
        t.templateLiteral(
          [
            t.templateElement(
              { raw: 'template-class ', cooked: 'template-class ' },
              false,
            ),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [t.identifier('dynamic')],
        ),
      );
      const result = extractClassesFromExpression(deepExpression);

      expect(result).toEqual([
        'deep-class-1',
        'deep-class-2',
        'fallback-class',
        'template-class',
      ]);
    });
  });

  describe('extractClasses', () => {
    it('should return empty array for null value', () => {
      const result = extractClasses(null);

      expect(result).toEqual([]);
    });

    it('should extract classes from string literal value', () => {
      const stringLiteral = t.stringLiteral('bg-blue-500 text-white p-4');
      const result = extractClasses(stringLiteral);

      expect(result).toEqual(['bg-blue-500', 'text-white', 'p-4']);
    });

    it('should extract classes from JSX expression container with string literal', () => {
      const expressionContainer = t.jsxExpressionContainer(
        t.stringLiteral('hover:bg-blue-600 focus:ring-2'),
      );
      const result = extractClasses(expressionContainer);

      expect(result).toEqual(['hover:bg-blue-600', 'focus:ring-2']);
    });

    it('should extract classes from JSX expression container with template literal', () => {
      const templateLiteral = t.templateLiteral(
        [
          t.templateElement(
            { raw: 'bg-blue-500 ', cooked: 'bg-blue-500 ' },
            false,
          ),
          t.templateElement({ raw: ' p-4', cooked: ' p-4' }, true),
        ],
        [t.identifier('dynamicClass')],
      );
      const expressionContainer = t.jsxExpressionContainer(templateLiteral);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual(['bg-blue-500', 'p-4']);
    });

    it('should extract classes from JSX expression container with binary expression', () => {
      const binaryExpression = t.binaryExpression(
        '+',
        t.stringLiteral('bg-blue-500 '),
        t.stringLiteral('text-white'),
      );
      const expressionContainer = t.jsxExpressionContainer(binaryExpression);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual(['bg-blue-500', 'text-white']);
    });

    it('should extract classes from JSX expression container with conditional expression', () => {
      const conditionalExpression = t.conditionalExpression(
        t.identifier('isActive'),
        t.stringLiteral('bg-blue-500 active'),
        t.stringLiteral('bg-gray-500 inactive'),
      );
      const expressionContainer = t.jsxExpressionContainer(
        conditionalExpression,
      );
      const result = extractClasses(expressionContainer);

      expect(result).toEqual([
        'bg-blue-500',
        'active',
        'bg-gray-500',
        'inactive',
      ]);
    });

    it('should return empty array for JSX expression container with empty expression', () => {
      const jsxEmptyExpression = t.jsxEmptyExpression();
      const expressionContainer = t.jsxExpressionContainer(jsxEmptyExpression);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual([]);
    });

    it('should return empty array for JSX expression container with unsupported expression', () => {
      const callExpression = t.callExpression(t.identifier('classNames'), [
        t.stringLiteral('bg-blue-500'),
      ]);
      const expressionContainer = t.jsxExpressionContainer(callExpression);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual([]);
    });

    it('should handle empty string literal', () => {
      const stringLiteral = t.stringLiteral('');
      const result = extractClasses(stringLiteral);

      expect(result).toEqual([]);
    });

    it('should handle string literal with only whitespace', () => {
      const stringLiteral = t.stringLiteral('   \t\n   ');
      const result = extractClasses(stringLiteral);

      expect(result).toEqual([]);
    });

    it('should handle complex conditional with multiple expression types', () => {
      // Test: condition ? (baseClass + ' active') : `inactive ${theme}`
      const conditionalExpression = t.conditionalExpression(
        t.identifier('condition'),
        t.binaryExpression(
          '+',
          t.stringLiteral('base-class '),
          t.stringLiteral('active'),
        ),
        t.templateLiteral(
          [
            t.templateElement({ raw: 'inactive ', cooked: 'inactive ' }, false),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [t.identifier('theme')],
        ),
      );
      const expressionContainer = t.jsxExpressionContainer(
        conditionalExpression,
      );
      const result = extractClasses(expressionContainer);

      expect(result).toEqual(['base-class', 'active', 'inactive']);
    });

    it('should handle JSX expression container with identifier', () => {
      // This represents: className={classes}
      const identifier = t.identifier('classes');
      const expressionContainer = t.jsxExpressionContainer(identifier);
      const result = extractClasses(expressionContainer);

      // Should return empty since we can't statically analyze identifiers
      expect(result).toEqual([]);
    });

    it('should handle JSX expression container with member expression', () => {
      // This represents: className={styles.button}
      const memberExpression = t.memberExpression(
        t.identifier('styles'),
        t.identifier('button'),
      );
      const expressionContainer = t.jsxExpressionContainer(memberExpression);
      const result = extractClasses(expressionContainer);

      // Should return empty since we can't statically analyze member expressions
      expect(result).toEqual([]);
    });

    it('should preserve class order in complex expressions', () => {
      const complexExpression = t.conditionalExpression(
        t.identifier('primary'),
        t.binaryExpression(
          '+',
          t.stringLiteral('first-class '),
          t.stringLiteral('second-class'),
        ),
        t.binaryExpression(
          '+',
          t.stringLiteral('third-class '),
          t.stringLiteral('fourth-class'),
        ),
      );
      const expressionContainer = t.jsxExpressionContainer(complexExpression);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual([
        'first-class',
        'second-class',
        'third-class',
        'fourth-class',
      ]);
    });

    it('should handle nested template literals in conditionals', () => {
      // Test nested template literals with static content
      const nestedConditional = t.conditionalExpression(
        t.identifier('level1'),
        t.templateLiteral(
          [
            t.templateElement(
              { raw: 'level1-true ', cooked: 'level1-true ' },
              false,
            ),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [
            t.conditionalExpression(
              t.identifier('level2'),
              t.stringLiteral('level2-true'),
              t.stringLiteral('level2-false'),
            ),
          ],
        ),
        t.stringLiteral('level1-false'),
      );
      const expressionContainer = t.jsxExpressionContainer(nestedConditional);
      const result = extractClasses(expressionContainer);

      // Should extract static parts from template literal, expressions within template, and the false branch
      expect(result).toEqual([
        'level1-true',
        'level2-true',
        'level2-false',
        'level1-false',
      ]);
    });

    it('should handle realistic className patterns', () => {
      // Test pattern: className={'btn btn-' + variant + (disabled ? ' disabled' : '')}
      const realisticPattern = t.binaryExpression(
        '+',
        t.binaryExpression(
          '+',
          t.stringLiteral('btn btn-'),
          t.identifier('variant'),
        ),
        t.conditionalExpression(
          t.identifier('disabled'),
          t.stringLiteral(' disabled'),
          t.stringLiteral(''),
        ),
      );
      const expressionContainer = t.jsxExpressionContainer(realisticPattern);
      const result = extractClasses(expressionContainer);

      expect(result).toEqual(['btn', 'btn-', 'disabled']);
    });

    it('should handle array of classes in template literal', () => {
      // Test: `base-class ${condition ? 'active' : 'inactive'} end-class`
      const templateWithConditional = t.templateLiteral(
        [
          t.templateElement(
            { raw: 'base-class ', cooked: 'base-class ' },
            false,
          ),
          t.templateElement({ raw: ' end-class', cooked: ' end-class' }, true),
        ],
        [
          t.conditionalExpression(
            t.identifier('condition'),
            t.stringLiteral('active'),
            t.stringLiteral('inactive'),
          ),
        ],
      );
      const expressionContainer = t.jsxExpressionContainer(
        templateWithConditional,
      );
      const result = extractClasses(expressionContainer);

      // Should extract static parts from template literal and expressions within
      expect(result).toEqual(['base-class', 'end-class', 'active', 'inactive']);
    });

    it('should handle malformed JSX expression containers gracefully', () => {
      // Test with unusual but valid AST structure
      const objectExpression = t.objectExpression([
        t.objectProperty(
          t.stringLiteral('className'),
          t.stringLiteral('bg-blue-500'),
        ),
      ]);
      const expressionContainer = t.jsxExpressionContainer(objectExpression);
      const result = extractClasses(expressionContainer);

      // Should return empty for unsupported expression types
      expect(result).toEqual([]);
    });
  });

  describe('extractClassUsage', () => {
    // Helper function to create a mock path object with JSX attribute
    function createMockPath(
      elementName: string,
      attributeValue: t.JSXExpressionContainer | t.StringLiteral | null,
      line = 1,
      column = 0,
    ) {
      const jsxElement = t.jsxOpeningElement(
        t.jsxIdentifier(elementName),
        [],
        false,
      );

      const jsxAttribute = t.jsxAttribute(
        t.jsxIdentifier('className'),
        attributeValue,
      );

      // Mock location object
      jsxAttribute.loc = {
        start: { line, column },
        end: { line, column: column + 10 },
        filename: '',
        identifierName: undefined,
      };

      return {
        node: jsxAttribute,
        findParent: (predicate: any) => {
          if (predicate({ node: jsxElement })) {
            return { node: jsxElement };
          }
          return null;
        },
      };
    }

    it('should extract class usage from string literal className', () => {
      const stringLiteral = t.stringLiteral('bg-blue-500 text-white p-4');
      const path = createMockPath('button', stringLiteral);
      const result = extractClassUsage(path, 'MyComponent', new Set());

      expect(result).not.toBeNull();
      expect(result!.component).toBe('button'); // Native HTML element uses element name
      expect(result!.element).toBe('button');
      expect(result!.classes).toEqual(['bg-blue-500', 'text-white', 'p-4']);
      expect(result!.componentType).toBe('native');
      expect(result!.line).toBe(1);
      expect(result!.column).toBe(0);
    });

    it('should extract class usage with conditional classes', () => {
      const stringLiteral = t.stringLiteral(
        'hover:bg-blue-600 focus:ring-2 data-[state=open]:visible p-4',
      );
      const path = createMockPath('div', stringLiteral);
      const result = extractClassUsage(path, 'ConditionalComponent', new Set());

      expect(result).not.toBeNull();
      expect(result!.component).toBe('div'); // Native HTML element uses element name
      expect(result!.element).toBe('div');
      expect(result!.componentType).toBe('native');
      expect(result!.classes).toEqual([
        'hover:bg-blue-600',
        'focus:ring-2',
        'data-[state=open]:visible',
        'p-4',
      ]);
    });

    it('should extract class usage from JSX expression container with string literal', () => {
      const expressionContainer = t.jsxExpressionContainer(
        t.stringLiteral('bg-green-500 rounded'),
      );
      const path = createMockPath('span', expressionContainer);
      const result = extractClassUsage(path, 'ExpressionComponent');

      expect(result).not.toBeNull();
      expect(result!.component).toBe('span'); // Native HTML element uses element name
      expect(result!.element).toBe('span');
      expect(result!.componentType).toBe('native');
      expect(result!.classes).toEqual(['bg-green-500', 'rounded']);
    });

    it('should extract class usage from template literal with conditional', () => {
      const templateLiteral = t.templateLiteral(
        [
          t.templateElement(
            { raw: 'base-class ', cooked: 'base-class ' },
            false,
          ),
          t.templateElement({ raw: '', cooked: '' }, true),
        ],
        [
          t.conditionalExpression(
            t.identifier('isActive'),
            t.stringLiteral('active'),
            t.stringLiteral('inactive'),
          ),
        ],
      );
      const expressionContainer = t.jsxExpressionContainer(templateLiteral);
      const path = createMockPath('button', expressionContainer);
      const result = extractClassUsage(path, 'TemplateComponent');

      expect(result).not.toBeNull();
      expect(result!.classes).toEqual(['base-class', 'active', 'inactive']);
    });

    it('should extract class usage from binary expression', () => {
      const binaryExpression = t.binaryExpression(
        '+',
        t.stringLiteral('btn btn-'),
        t.stringLiteral('primary'),
      );
      const expressionContainer = t.jsxExpressionContainer(binaryExpression);
      const path = createMockPath('button', expressionContainer);
      const result = extractClassUsage(path, 'BinaryComponent');

      expect(result).not.toBeNull();
      expect(result!.classes).toEqual(['btn', 'btn-', 'primary']);
    });

    it('should return null for empty className', () => {
      const emptyString = t.stringLiteral('');
      const path = createMockPath('div', emptyString);
      const result = extractClassUsage(path, 'EmptyComponent');

      expect(result).toBeNull();
    });

    it('should return null for whitespace-only className', () => {
      const whitespaceString = t.stringLiteral('   \t\n   ');
      const path = createMockPath('div', whitespaceString);
      const result = extractClassUsage(path, 'WhitespaceComponent');

      expect(result).toBeNull();
    });

    it('should return null for null className value', () => {
      const path = createMockPath('div', null);
      const result = extractClassUsage(path, 'NullComponent');

      expect(result).toBeNull();
    });

    it('should handle different element types correctly', () => {
      const stringLiteral = t.stringLiteral('test-class');

      // Test with HTML elements
      const buttonPath = createMockPath('button', stringLiteral);
      const buttonResult = extractClassUsage(buttonPath, 'TestComponent');
      expect(buttonResult!.element).toBe('button');

      const inputPath = createMockPath('input', stringLiteral);
      const inputResult = extractClassUsage(inputPath, 'TestComponent');
      expect(inputResult!.element).toBe('input');

      // Test with custom components
      const playButtonPath = createMockPath('PlayButton', stringLiteral);
      const playButtonResult = extractClassUsage(
        playButtonPath,
        'TestComponent',
      );
      expect(playButtonResult!.element).toBe('button');

      const playIconPath = createMockPath('PlayIcon', stringLiteral);
      const playIconResult = extractClassUsage(playIconPath, 'TestComponent');
      expect(playIconResult!.element).toBe('icon');
    });

    it('should handle line and column information', () => {
      const stringLiteral = t.stringLiteral('test-class');
      const path = createMockPath('div', stringLiteral, 10, 25);
      const result = extractClassUsage(path, 'LocationComponent');

      expect(result).not.toBeNull();
      expect(result!.line).toBe(10);
      expect(result!.column).toBe(25);
    });

    it('should handle missing location information gracefully', () => {
      const stringLiteral = t.stringLiteral('test-class');
      const path = createMockPath('div', stringLiteral);

      // Remove location info
      path.node.loc = null;

      const result = extractClassUsage(path, 'NoLocationComponent');

      expect(result).not.toBeNull();
      expect(result!.line).toBe(0);
      expect(result!.column).toBe(0);
    });

    it('should extract classes from complex nested expressions', () => {
      // Test: condition ? (baseClass + ' active') : `inactive ${theme}`
      const complexExpression = t.conditionalExpression(
        t.identifier('condition'),
        t.binaryExpression(
          '+',
          t.stringLiteral('base-class '),
          t.stringLiteral('active'),
        ),
        t.templateLiteral(
          [
            t.templateElement({ raw: 'inactive ', cooked: 'inactive ' }, false),
            t.templateElement({ raw: '', cooked: '' }, true),
          ],
          [t.identifier('theme')],
        ),
      );
      const expressionContainer = t.jsxExpressionContainer(complexExpression);
      const path = createMockPath('div', expressionContainer);
      const result = extractClassUsage(path, 'ComplexComponent');

      expect(result).not.toBeNull();
      expect(result!.classes).toEqual(['base-class', 'active', 'inactive']);
    });

    it('should handle unsupported expressions gracefully', () => {
      const callExpression = t.callExpression(t.identifier('classNames'), [
        t.stringLiteral('base-class'),
      ]);
      const expressionContainer = t.jsxExpressionContainer(callExpression);
      const path = createMockPath('div', expressionContainer);
      const result = extractClassUsage(path, 'CallComponent');

      expect(result).toBeNull();
    });

    it('should handle JSX empty expression', () => {
      const jsxEmptyExpression = t.jsxEmptyExpression();
      const expressionContainer = t.jsxExpressionContainer(jsxEmptyExpression);
      const path = createMockPath('div', expressionContainer);
      const result = extractClassUsage(path, 'EmptyExpressionComponent');

      expect(result).toBeNull();
    });

    it('should handle mixed conditional and static classes', () => {
      const stringLiteral = t.stringLiteral(
        'p-4 hover:bg-blue-500 rounded data-[loading=true]:opacity-50',
      );
      const path = createMockPath('button', stringLiteral);
      const result = extractClassUsage(path, 'MixedComponent');

      expect(result).not.toBeNull();
      expect(result!.classes).toEqual([
        'p-4',
        'hover:bg-blue-500',
        'rounded',
        'data-[loading=true]:opacity-50',
      ]);
    });

    it('should preserve class order in output', () => {
      const complexExpression = t.conditionalExpression(
        t.identifier('primary'),
        t.binaryExpression(
          '+',
          t.stringLiteral('first-class '),
          t.stringLiteral('second-class'),
        ),
        t.binaryExpression(
          '+',
          t.stringLiteral('third-class '),
          t.stringLiteral('fourth-class'),
        ),
      );
      const expressionContainer = t.jsxExpressionContainer(complexExpression);
      const path = createMockPath('div', expressionContainer);
      const result = extractClassUsage(path, 'OrderComponent');

      expect(result).not.toBeNull();
      expect(result!.classes).toEqual([
        'first-class',
        'second-class',
        'third-class',
        'fourth-class',
      ]);
    });

    it('should handle realistic component and file names', () => {
      const stringLiteral = t.stringLiteral('bg-blue-500 hover:bg-blue-600');
      const path = createMockPath('PlayButton', stringLiteral);
      const result = extractClassUsage(path, 'MediaControlsComponent');

      expect(result).not.toBeNull();
      expect(result!.component).toBe('PlayButton');
      expect(result!.element).toBe('button'); // PlayButton -> button
      expect(result!.componentType).toBe('unknown'); // Not imported in this mock test
      expect(result!.classes).toEqual(['bg-blue-500', 'hover:bg-blue-600']);
    });
  });

  describe('parseSourceCode', () => {
    it('should parse simple component with string literal className', () => {
      const sourceCode = `
import React from 'react';

export const SimpleButton = () => {
  return (
    <button className="bg-blue-500 text-white">
      Click me
    </button>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'SimpleButton');

      expect(result).toHaveLength(1);
      const usage = result[0];
      expect(usage.component).toBe('button'); // Native HTML element uses element name
      expect(usage.element).toBe('button');
      expect(usage.componentType).toBe('native');
      expect(usage.classes).toEqual(['bg-blue-500', 'text-white']);
    });

    it('should parse component with template literal className', () => {
      const sourceCode = `
import React from 'react';

export const ConditionalButton = ({ isActive }) => {
  return (
    <button className={\`base-class \${isActive ? 'active' : 'inactive'}\`}>
      Click me
    </button>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'ConditionalButton');

      expect(result).toHaveLength(1);
      const usage = result[0];
      expect(usage.classes).toEqual(['base-class', 'active', 'inactive']);
    });

    it('should parse component with conditional classes', () => {
      const sourceCode = `
import React from 'react';

export const HoverButton = () => {
  return (
    <button className="p-4 hover:bg-blue-500 focus:ring-2 data-[state=open]:visible">
      Hover me
    </button>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'HoverButton');

      expect(result).toHaveLength(1);
      const usage = result[0];
      expect(usage.classes).toEqual([
        'p-4',
        'hover:bg-blue-500',
        'focus:ring-2',
        'data-[state=open]:visible',
      ]);
    });

    it('should parse multiple elements in component', () => {
      const sourceCode = `
import React from 'react';

export const MultiElementComponent = () => {
  return (
    <div className="container">
      <button className="btn btn-primary">Button</button>
      <span className="text-sm text-gray-500">Text</span>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'MultiElementComponent');

      expect(result).toHaveLength(3);

      expect(result[0].element).toBe('div');
      expect(result[0].classes).toEqual(['container']);

      expect(result[1].element).toBe('button');
      expect(result[1].classes).toEqual(['btn', 'btn-primary']);

      expect(result[2].element).toBe('span');
      expect(result[2].classes).toEqual(['text-sm', 'text-gray-500']);
    });

    it('should track component names from function declarations', () => {
      const sourceCode = `
import React from 'react';

function MyCustomButton() {
  return <button className="custom-btn">Click</button>;
}

export default MyCustomButton;
`;

      const result = parseSourceCode(sourceCode, 'MyCustomButton');

      expect(result).toHaveLength(1);
      expect(result[0].component).toBe('button'); // Native HTML element uses element name
      expect(result[0].componentType).toBe('native');
    });

    it('should track component names from variable declarations', () => {
      const sourceCode = `
import React from 'react';

const ArrowComponent = () => {
  return <div className="arrow-component">Content</div>;
};

export default ArrowComponent;
`;

      const result = parseSourceCode(sourceCode, 'ArrowComponent');

      expect(result).toHaveLength(1);
      expect(result[0].component).toBe('div'); // Native HTML element uses element name
      expect(result[0].componentType).toBe('native');
    });

    it('should track component names from export default declarations', () => {
      const sourceCode = `
import React from 'react';

const InternalComponent = () => {
  return <div className="internal">Internal</div>;
};

export default InternalComponent;
`;

      const result = parseSourceCode(sourceCode, 'ExportedComponent');

      expect(result).toHaveLength(1);
      expect(result[0].component).toBe('div'); // Native HTML element uses element name
      expect(result[0].componentType).toBe('native');
    });

    it('should handle nested components with different names', () => {
      const sourceCode = `
import React from 'react';

export const OuterComponent = () => {
  const InnerComponent = () => {
    return <span className="inner-span">Inner</span>;
  };

  return (
    <div className="outer-div">
      <InnerComponent />
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'NestedComponents');

      expect(result).toHaveLength(2);

      // First className encountered (order may vary based on AST traversal)
      const outerDiv = result.find((r) => r.classes.includes('outer-div'));
      const innerSpan = result.find((r) => r.classes.includes('inner-span'));

      expect(outerDiv).toBeDefined();
      expect(outerDiv!.element).toBe('div');
      expect(outerDiv!.classes).toEqual(['outer-div']);

      expect(innerSpan).toBeDefined();
      expect(innerSpan!.element).toBe('span');
      expect(innerSpan!.classes).toEqual(['inner-span']);

      // Note: Component names depend on AST traversal order and current component context
    });

    it('should handle JSX expression containers', () => {
      const sourceCode = `
import React from 'react';

export const ExpressionComponent = ({ theme }) => {
  const baseClasses = 'base-class';
  return (
    <div className={baseClasses + ' ' + theme}>
      <button className={'btn-' + theme}>Button</button>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'ExpressionComponent');

      expect(result).toHaveLength(1); // Only one has extractable static classes

      expect(result[0].element).toBe('button');
      expect(result[0].classes).toEqual(['btn-']);
    });

    it('should handle empty className attributes', () => {
      const sourceCode = `
import React from 'react';

export const EmptyClassComponent = () => {
  return (
    <div className="">
      <button className="   ">Button</button>
      <span>No className</span>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'EmptyClassComponent');

      expect(result).toHaveLength(0); // Empty classNames should be filtered out
    });

    it('should handle malformed source code gracefully', () => {
      const malformedCode = `
import React from 'react';

export const BrokenComponent = () => {
  return (
    <div className="valid-class"
      <button>Broken JSX</button>
    </div>
  );
`;

      const result = parseSourceCode(malformedCode, 'BrokenComponent');

      expect(result).toHaveLength(0); // Should return empty array for malformed code
    });

    it('should handle different element types correctly', () => {
      const sourceCode = `
import React from 'react';

export const ElementTypesComponent = () => {
  return (
    <div>
      <button className="btn-class">Button</button>
      <input className="input-class" />
      <PlayButton className="play-btn-class">Play</PlayButton>
      <VolumeIcon className="volume-icon-class" />
      <TimeRange className="time-range-class" />
      <StatusDisplay className="status-display-class" />
      <CustomComponent className="custom-class" />
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'ElementTypesComponent');

      expect(result).toHaveLength(7);

      expect(result[0].element).toBe('button');
      expect(result[1].element).toBe('input');
      expect(result[2].element).toBe('button'); // PlayButton -> button
      expect(result[3].element).toBe('icon'); // VolumeIcon -> icon
      expect(result[4].element).toBe('range'); // TimeRange -> range
      expect(result[5].element).toBe('display'); // StatusDisplay -> display
      expect(result[6].element).toBe('customcomponent'); // CustomComponent -> lowercase
    });

    it('should handle TypeScript syntax', () => {
      const sourceCode = `
import React from 'react';

interface Props {
  variant: 'primary' | 'secondary';
  disabled?: boolean;
}

export const TypedComponent: React.FC<Props> = ({ variant, disabled }) => {
  return (
    <button
      className={\`btn btn-\${variant} \${disabled ? 'disabled' : ''}\`}
      disabled={disabled}
    >
      Typed Button
    </button>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'TypedComponent');

      expect(result).toHaveLength(1);
      expect(result[0].component).toBe('button'); // Native HTML element uses element name
      expect(result[0].componentType).toBe('native');
      expect(result[0].classes).toEqual(['btn', 'btn-', 'disabled']);
    });

    it('should handle line and column information', () => {
      const sourceCode = `import React from 'react';

export const LineColComponent = () => {
  return (
    <div className="test-class">
      Content
    </div>
  );
};`;

      const result = parseSourceCode(sourceCode, 'LineColComponent');

      expect(result).toHaveLength(1);
      expect(result[0].line).toBeGreaterThan(0);
      expect(result[0].column).toBeGreaterThanOrEqual(0);
    });

    it('should extract component name from file path as fallback', () => {
      const sourceCode = `
import React from 'react';

export default () => {
  return <div className="anonymous-component">Anonymous</div>;
};
`;

      const result = parseSourceCode(sourceCode, 'FallbackComponent');

      expect(result).toHaveLength(1);
      expect(result[0].component).toBe('div'); // Native HTML element uses element name
      expect(result[0].componentType).toBe('native');
    });

    it('should handle complex nested expressions', () => {
      const sourceCode = `
import React from 'react';

export const ComplexComponent = ({ condition, theme, size }) => {
  return (
    <div className={condition ? (
      size === 'large' ? 'large-container' : 'small-container'
    ) : 'default-container'}>
      <button className={\`btn \${theme}-theme \${size}-size\`}>
        Complex Button
      </button>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'ComplexComponent');

      expect(result).toHaveLength(2);

      expect(result[0].classes).toEqual([
        'large-container',
        'small-container',
        'default-container',
      ]);
      expect(result[1].classes).toEqual(['btn', '-theme', '-size']);
    });

    it('should handle class attribute (HTML-style) in addition to className', () => {
      const sourceCode = `
import React from 'react';

export const HtmlStyleComponent = () => {
  return (
    <div>
      <button className="react-style">React Style</button>
      <button class="html-style">HTML Style</button>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'HtmlStyleComponent');

      expect(result).toHaveLength(2);
      expect(result[0].classes).toEqual(['react-style']);
      expect(result[1].classes).toEqual(['html-style']);
    });

    it('should handle realistic component structure', () => {
      const sourceCode = `
import React from 'react';

export const MediaControls = ({ isPlaying, volume, muted }) => {
  return (
    <div className="media-controls-container">
      <button
        className={\`play-button \${isPlaying ? 'playing' : 'paused'}\`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <div className="volume-controls">
        <button
          className={\`mute-button \${muted ? 'muted' : ''}\`}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          Volume
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
        />
      </div>

      <div className="time-controls hover:opacity-100 data-[visible=true]:block">
        Time Controls
      </div>
    </div>
  );
};
`;

      const result = parseSourceCode(sourceCode, 'MediaControls');

      expect(result).toHaveLength(6);

      // Check that we got all the expected classes
      const allClasses = result.flatMap((usage) => usage.classes);
      expect(allClasses).toContain('media-controls-container');
      expect(allClasses).toContain('play-button');
      expect(allClasses).toContain('playing');
      expect(allClasses).toContain('paused');
      expect(allClasses).toContain('volume-controls');
      expect(allClasses).toContain('mute-button');
      expect(allClasses).toContain('muted');
      expect(allClasses).toContain('volume-slider');
      expect(allClasses).toContain('time-controls');
      expect(allClasses).toContain('hover:opacity-100');
      expect(allClasses).toContain('data-[visible=true]:block');

    });
  });

  describe('parseFile', () => {
    it('should parse a simple React component file', () => {
      // This test is redundant with existing fixture tests - removing
      // The first parseFile describe block already covers this case
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/SimpleButton.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(1);
      expect(result.usages[0]).toMatchObject({
        file: fixturePath,
        component: 'button', // Native HTML element uses element name
        componentType: 'native',
        element: 'button',
        classes: [
          'bg-blue-500',
          'hover:bg-blue-700',
          'text-white',
          'font-bold',
          'py-2',
          'px-4',
          'rounded',
        ],
      });
      expect(result.usages[0].line).toBeGreaterThan(0);
      expect(result.usages[0].column).toBeGreaterThanOrEqual(0);
    });

    it('should parse a file with multiple components', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/MultipleComponents.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(3);

      // Button component (native HTML button)
      expect(result.usages[0]).toMatchObject({
        component: 'button',
        componentType: 'native',
        element: 'button',
        classes: ['px-4', 'py-2'],
      });

      // Card component (native HTML div)
      expect(result.usages[1]).toMatchObject({
        component: 'div',
        componentType: 'native',
        element: 'div',
        classes: ['rounded-lg', 'shadow-md'],
      });

      // App component (native HTML div)
      expect(result.usages[2]).toMatchObject({
        component: 'div',
        componentType: 'native',
        element: 'div',
        classes: ['container', 'mx-auto'],
      });
    });

    it('should parse file with conditional classes', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/ConditionalClasses.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1);
      expect(result.usages[0].classes).toEqual([
        'base-class',
        'hover:bg-blue-500',
        'data-[active]:text-white',
        'disabled:opacity-50',
      ]);
    });

    it('should handle file with no className usage', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/NoClassNameComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(0);
    });

    it('should handle TypeScript file with JSX', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/TypeScriptComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1);
      expect(result.usages[0]).toMatchObject({
        component: 'button', // Native HTML element uses element name
        componentType: 'native',
        element: 'button',
        classes: ['btn', 'bg-blue-500', 'bg-gray-500'],
      });
    });

    it('should extract component name from file path', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/my-awesome-component.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages[0].component).toBe('div'); // Native HTML element uses element name
      expect(result.usages[0].componentType).toBe('native');
    });

    it('should handle parsing errors gracefully', () => {
      // Mock console.warn to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/BrokenComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse src'),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('should handle complex nested JSX structures', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/ComplexNested.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(7);

      const classLists = result.usages.map((usage) => usage.classes);
      expect(classLists).toEqual([
        ['container'],
        ['header', 'bg-white'],
        ['nav', 'flex', 'items-center'],
        ['link', 'hover:text-blue-500'],
        ['main'],
        ['section'],
        ['article', 'prose', 'max-w-none'],
      ]);
    });

    it('should handle files with class attribute (HTML style)', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/HtmlStyleComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1);
      expect(result.usages[0].classes).toEqual(['html-style-class']);
    });

    it('should handle empty and whitespace-only class attributes', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/EmptyClassesComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(1); // Only the valid class should be found
      expect(result.usages[0].classes).toEqual(['valid-class']);
    });

    it('should read file from filesystem', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/SimpleTestFile.tsx',
      );
      const result = parseFile(fixturePath);

      // Should successfully read the fixture file
      expect(result.path).toBe(fixturePath);
      expect(result.usages).toHaveLength(1);
    });

    it('should handle different file extensions', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/SimpleTestFile.tsx',
      );

      // Test that parseFile works with .tsx extension
      const result = parseFile(fixturePath);
      expect(result.usages[0].component).toBe('div'); // Native HTML element uses element name
      expect(result.usages[0].componentType).toBe('native');
      expect(result.usages[0].classes).toEqual(['test']);
    });

    it('should handle realistic media player component', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/PlayButtonComponent.tsx',
      );
      const result = parseFile(fixturePath);

      expect(result.usages).toHaveLength(2);

      const buttonUsage = result.usages.find((u) => u.element === 'button');
      const svgUsage = result.usages.find((u) => u.element === 'svg');

      expect(buttonUsage).toBeDefined();
      const expectedClasses = [
        'relative',
        'inline-flex',
        'min-w-0',
        'cursor-pointer',
        'select-none',
        'items-center',
        'justify-center',
        'rounded-full',
        'p-2',
        'transition-all',
        'duration-150',
        'hover:bg-blue-600',
        'data-[playing=true]:bg-blue-500',
        'hover:bg-gray-600',
        'focus:ring-2',
        'focus:ring-blue-300',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
      ];
      expect(buttonUsage!.classes).toHaveLength(expectedClasses.length);
      expectedClasses.forEach((cls) => {
        expect(buttonUsage!.classes).toContain(cls);
      });

      expect(svgUsage).toBeDefined();
      expect(svgUsage!.classes).toEqual(['w-4', 'h-4', 'fill-current']);
    });

    it('should return ParsedFile structure with correct shape', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/SimpleTestFile.tsx',
      );
      const result = parseFile(fixturePath);

      // Check that result matches ParsedFile interface
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('usages');
      expect(typeof result.path).toBe('string');
      expect(Array.isArray(result.usages)).toBe(true);

      // Check ClassUsage structure
      if (result.usages.length > 0) {
        const usage = result.usages[0];
        expect(usage).toHaveProperty('file');
        expect(usage).toHaveProperty('component');
        expect(usage).toHaveProperty('element');
        expect(usage).toHaveProperty('classes');
        expect(usage).toHaveProperty('line');
        expect(usage).toHaveProperty('column');

        expect(typeof usage.file).toBe('string');
        expect(typeof usage.component).toBe('string');
        expect(typeof usage.element).toBe('string');
        expect(Array.isArray(usage.classes)).toBe(true);
        expect(typeof usage.line).toBe('number');
        expect(typeof usage.column).toBe('number');
      }
    });
  });
});
