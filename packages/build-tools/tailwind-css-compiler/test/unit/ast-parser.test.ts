import { describe, it, expect, beforeEach } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { ASTParser } from '../../src/ast-parser.js';
import { createTestFile } from '../utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_OUTPUT_DIR = resolve(__dirname, '../temp');

describe('ASTParser', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = new ASTParser();
  });

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

      const usages = parser.parseSourceCode(sourceCode, 'SimpleButton.tsx');

      expect(usages).toHaveLength(1);

      const usage = usages[0];
      expect(usage.component).toBe('SimpleButton');
      expect(usage.element).toBe('button');
      expect(usage.classes).toEqual(['bg-blue-500', 'text-white']);
      expect(usage.file).toBe('SimpleButton.tsx');
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

      const usages = parser.parseSourceCode(sourceCode, 'ConditionalButton.tsx');

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

      const usages = parser.parseSourceCode(sourceCode, 'test.tsx');

      expect(usages).toHaveLength(2);

      const playUsage = usages.find(u => u.classes.includes('play-btn'));
      const pauseUsage = usages.find(u => u.classes.includes('pause-btn'));

      expect(playUsage?.component).toBe('PlayButton');
      expect(pauseUsage?.component).toBe('PauseButton');
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

      const usages = parser.parseSourceCode(sourceCode, 'DataButton.tsx');

      expect(usages).toHaveLength(1);
      const usage = usages[0];

      // Should extract base classes and conditions
      expect(usage.classes).toContain('hover:bg-gray-100');
      expect(usage.classes).toContain('data-[state=open]:bg-blue-500');

      // Should extract conditions
      expect(usage.conditions).toContain('hover');
      expect(usage.conditions).toContain('data-state=open');
    });

    it('should handle malformed code gracefully', () => {
      const invalidCode = `
export const BrokenComponent = () => {
  return (
    <button className="bg-blue-500"
      // Missing closing and other syntax errors
  );
`;

      const usages = parser.parseSourceCode(invalidCode, 'Broken.tsx');

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

      const usages = parser.parseSourceCode(sourceCode, 'Multi.tsx');

      expect(usages).toHaveLength(4);

      const buttonUsage = usages.find(u => u.classes.includes('btn-primary'));
      const inputUsage = usages.find(u => u.classes.includes('input-field'));
      const iconUsage = usages.find(u => u.classes.includes('icon-play'));
      const rangeUsage = usages.find(u => u.classes.includes('range-slider'));

      expect(buttonUsage?.element).toBe('button');
      expect(inputUsage?.element).toBe('input');
      expect(iconUsage?.element).toBe('icon'); // Should detect Icon suffix
      expect(rangeUsage?.element).toBe('range'); // Should detect Range suffix
    });
  });

  describe('parseFile', () => {
    it('should parse a simple React component with className', () => {
      const componentCode = `
import React from 'react';

export const TestButton = () => {
  return (
    <button className="bg-blue-500 text-white">
      Click me
    </button>
  );
};
`;

      const filePath = createTestFile('TestButton.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.path).toBe(filePath);
      expect(result.usages).toHaveLength(1);

      const usage = result.usages[0];
      expect(usage.component).toBe('TestButton');
      expect(usage.element).toBe('button');
      expect(usage.classes).toEqual(['bg-blue-500', 'text-white']);
      expect(usage.file).toBe(filePath);
    });

    it('should handle conditional className expressions', () => {
      const componentCode = `
import React from 'react';

export const ConditionalButton = ({ isActive }: { isActive: boolean }) => {
  return (
    <button className={\`bg-blue-500 \${isActive ? 'bg-green-500' : 'bg-red-500'}\`}>
      Click me
    </button>
  );
};
`;

      const filePath = createTestFile('ConditionalButton.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages).toHaveLength(1);
      const usage = result.usages[0];
      expect(usage.classes).toContain('bg-blue-500');
      expect(usage.classes).toContain('bg-green-500');
      expect(usage.classes).toContain('bg-red-500');
    });

    it('should extract element types correctly', () => {
      const componentCode = `
import React from 'react';

export const MultiElementComponent = () => {
  return (
    <div>
      <button className="btn-primary">Button</button>
      <input className="input-field" />
      <PlayIcon className="icon-play" />
      <CustomRange className="range-slider" />
    </div>
  );
};
`;

      const filePath = createTestFile('MultiElementComponent.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages).toHaveLength(4);

      const buttonUsage = result.usages.find(u => u.element === 'button');
      expect(buttonUsage).toBeDefined();
      expect(buttonUsage?.classes).toEqual(['btn-primary']);

      const inputUsage = result.usages.find(u => u.element === 'input');
      expect(inputUsage).toBeDefined();

      const iconUsage = result.usages.find(u => u.element === 'icon');
      expect(iconUsage).toBeDefined();

      const rangeUsage = result.usages.find(u => u.element === 'range');
      expect(rangeUsage).toBeDefined();
    });

    it('should handle data attribute conditions', () => {
      const componentCode = `
import React from 'react';

export const DataAttributeComponent = () => {
  return (
    <button className="data-[state=open]:bg-blue-500 hover:bg-gray-100">
      Toggle
    </button>
  );
};
`;

      const filePath = createTestFile('DataAttributeComponent.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages).toHaveLength(1);
      const usage = result.usages[0];

      expect(usage.classes).toContain('hover:bg-gray-100');
      expect(usage.conditions).toContain('data-state=open');
      expect(usage.conditions).toContain('hover');
    });
  });

  describe('extractComponentName', () => {
    it('should extract component name from file path', () => {
      // Test the private method via parseFile
      const componentCode = 'export const Test = () => <div className="test">Test</div>;';

      const filePath = createTestFile('my-awesome-component.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages[0]?.component).toBe('MyAwesomeComponent');
    });

    it('should handle kebab-case file names', () => {
      const componentCode = 'export const Test = () => <div className="test">Test</div>;';

      const filePath = createTestFile('play-button-component.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages[0]?.component).toBe('PlayButtonComponent');
    });

    it('should handle snake_case file names', () => {
      const componentCode = 'export const Test = () => <div className="test">Test</div>;';

      const filePath = createTestFile('media_player_component.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages[0]?.component).toBe('MediaPlayerComponent');
    });
  });

  describe('error handling', () => {
    it('should handle malformed TypeScript gracefully', () => {
      const invalidCode = `
import React from 'react';

export const BrokenComponent = () => {
  return (
    <button className="bg-blue-500"
      // Missing closing tag and other syntax errors
  );
}; // Missing closing brace
`;

      const filePath = createTestFile('BrokenComponent.tsx', invalidCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      // Should return empty usages array but not throw
      expect(result.path).toBe(filePath);
      expect(result.usages).toEqual([]);
    });

    it('should handle missing className attributes', () => {
      const componentCode = `
import React from 'react';

export const NoClassNameComponent = () => {
  return (
    <button>
      Click me
    </button>
  );
};
`;

      const filePath = createTestFile('NoClassNameComponent.tsx', componentCode, TEST_OUTPUT_DIR);
      const result = parser.parseFile(filePath);

      expect(result.usages).toEqual([]);
    });
  });

  describe('isConditionalClass', () => {
    it('should return true for hover pseudo-class', () => {
      const result = parser.isConditionalClass('hover:bg-blue-500');
      expect(result).toBe(true);
    });

    it('should return true for focus pseudo-class', () => {
      const result = parser.isConditionalClass('focus:ring-2');
      expect(result).toBe(true);
    });

    it('should return true for active pseudo-class', () => {
      const result = parser.isConditionalClass('active:bg-gray-800');
      expect(result).toBe(true);
    });

    it('should return true for disabled pseudo-class', () => {
      const result = parser.isConditionalClass('disabled:opacity-50');
      expect(result).toBe(true);
    });

    it('should return true for data attribute conditions', () => {
      const result = parser.isConditionalClass('data-[state=open]:bg-blue-500');
      expect(result).toBe(true);
    });

    it('should return true for complex data attribute conditions', () => {
      const result = parser.isConditionalClass('data-[orientation=vertical]:h-full');
      expect(result).toBe(true);
    });

    it('should return false for regular classes without conditions', () => {
      const result = parser.isConditionalClass('bg-blue-500');
      expect(result).toBe(false);
    });

    it('should return false for classes with colons but not conditional prefixes', () => {
      const result = parser.isConditionalClass('sm:bg-blue-500');
      expect(result).toBe(false);
    });

    it('should return false for classes that contain conditional words but not as prefixes', () => {
      const result = parser.isConditionalClass('my-hover-class');
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = parser.isConditionalClass('');
      expect(result).toBe(false);
    });

    it('should return false for classes with only colons but no conditional prefixes', () => {
      const result = parser.isConditionalClass('lg:md:bg-red-500');
      expect(result).toBe(false);
    });
  });
});