import { describe, it, expect, vi } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  parseEnhancedClassString,
  enhanceClassUsage,
  enhanceClassUsages,
} from '../../src/class-parser.js';
import { ASTParser } from '../../src/ast-parser.js';
import type { ClassUsage } from '../../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Enhanced Class Parsing', () => {
  describe('parseEnhancedClassString', () => {
    it('should categorize simple utility classes', () => {
      const result = parseEnhancedClassString('bg-blue-500 text-white p-4 rounded');

      expect(result.simpleClasses).toEqual(['bg-blue-500', 'text-white', 'p-4', 'rounded']);
      expect(result.containerDeclarations).toEqual([]);
      expect(result.containerQueries).toEqual([]);
      expect(result.arbitraryValues).toEqual([]);
    });

    it('should detect container declarations', () => {
      const result = parseEnhancedClassString('@container/root relative overflow-hidden');

      expect(result.simpleClasses).toEqual(['relative', 'overflow-hidden']);
      expect(result.containerDeclarations).toEqual(['@container/root']);
      expect(result.containerQueries).toEqual([]);
      expect(result.arbitraryValues).toEqual([]);
    });

    it('should detect unnamed container declarations', () => {
      const result = parseEnhancedClassString('@container relative');

      expect(result.simpleClasses).toEqual(['relative']);
      expect(result.containerDeclarations).toEqual(['@container']);
      expect(result.containerQueries).toEqual([]);
      expect(result.arbitraryValues).toEqual([]);
    });

    it('should parse container queries', () => {
      const result = parseEnhancedClassString('@7xl/root:text-lg @sm/sidebar:p-2 bg-white');

      expect(result.simpleClasses).toEqual(['bg-white']);
      expect(result.containerDeclarations).toEqual([]);
      expect(result.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-lg' },
        { breakpoint: 'sm', container: 'sidebar', utility: 'p-2' },
      ]);
      expect(result.arbitraryValues).toEqual([]);
    });

    it('should parse container queries with arbitrary values', () => {
      const result = parseEnhancedClassString('@7xl/root:text-[0.9375rem] @lg/controls:font-[510] base-class');

      expect(result.simpleClasses).toEqual(['base-class']);
      expect(result.containerDeclarations).toEqual([]);
      expect(result.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-[0.9375rem]' },
        { breakpoint: 'lg', container: 'controls', utility: 'font-[510]' },
      ]);
      expect(result.arbitraryValues).toEqual([]);
    });

    it('should parse arbitrary values', () => {
      const result = parseEnhancedClassString('font-[510] text-[0.8125rem] w-[50px] bg-[#ff0000] normal-class');

      expect(result.simpleClasses).toEqual(['normal-class']);
      expect(result.containerDeclarations).toEqual([]);
      expect(result.containerQueries).toEqual([]);
      expect(result.arbitraryValues).toEqual([
        { property: 'font-weight', value: '510', originalClass: 'font-[510]' },
        { property: 'font-size', value: '0.8125rem', originalClass: 'text-[0.8125rem]' },
        { property: 'width', value: '50px', originalClass: 'w-[50px]' },
        { property: 'background-color', value: '#ff0000', originalClass: 'bg-[#ff0000]' },
      ]);
    });

    it('should skip complex utilities', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = parseEnhancedClassString('group/root after:absolute before:ring-white/15 hover:bg-blue-500');

      expect(result.simpleClasses).toEqual(['hover:bg-blue-500']);
      expect(result.containerDeclarations).toEqual([]);
      expect(result.containerQueries).toEqual([]);
      expect(result.arbitraryValues).toEqual([]);

      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'group/root');
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'after:absolute');
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'before:ring-white/15');

      consoleSpy.mockRestore();
    });

    it('should handle MediaContainer-style complex classes', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const classString = 'relative @container/root group/root overflow-clip rounded-4xl antialiased font-[510] font-sans text-[0.8125rem] @7xl/root:text-[0.9375rem] leading-normal tracking-[-0.0125em] [&:fullscreen]:rounded-none after:absolute after:inset-0 before:absolute';

      const result = parseEnhancedClassString(classString);

      expect(result.simpleClasses).toEqual([
        'relative',
        'overflow-clip',
        'rounded-4xl',
        'antialiased',
        'font-sans',
        'leading-normal'
      ]);
      expect(result.containerDeclarations).toEqual(['@container/root']);
      expect(result.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-[0.9375rem]' }
      ]);
      expect(result.arbitraryValues).toEqual([
        { property: 'font-weight', value: '510', originalClass: 'font-[510]' },
        { property: 'font-size', value: '0.8125rem', originalClass: 'text-[0.8125rem]' },
        // Note: tracking-[-0.0125em] should be parsed as arbitrary value
        { property: 'letter-spacing', value: '-0.0125em', originalClass: 'tracking-[-0.0125em]' }
      ]);

      // Should skip complex utilities (check that some complex utilities are skipped)
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'group/root');
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'after:absolute');
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'after:inset-0');
      expect(consoleSpy).toHaveBeenCalledWith('SKIPPING COMPLEX UTILITY:', 'before:absolute');
      // Should skip complex utilities containing complex patterns
      const calledUtilities = consoleSpy.mock.calls.map(call => call[1]);
      expect(calledUtilities).toContain('group/root');
      expect(calledUtilities).toContain('after:absolute');
      expect(calledUtilities).toContain('[&:fullscreen]:rounded-none');
      expect(calledUtilities).toContain('before:absolute');

      consoleSpy.mockRestore();
    });

    it('should handle empty or whitespace-only strings', () => {
      expect(parseEnhancedClassString('')).toEqual({
        simpleClasses: [],
        containerDeclarations: [],
        containerQueries: [],
        arbitraryValues: [],
      });

      expect(parseEnhancedClassString('   \t\n   ')).toEqual({
        simpleClasses: [],
        containerDeclarations: [],
        containerQueries: [],
        arbitraryValues: [],
      });
    });
  });

  describe('enhanceClassUsage', () => {
    it('should transform ClassUsage to EnhancedClassUsage', () => {
      const usage: ClassUsage = {
        file: '/test/component.tsx',
        component: 'MediaContainer',
        element: 'div',
        classes: ['@container/root', '@7xl/root:text-lg', 'font-[510]', 'bg-blue-500'],
        line: 10,
        column: 5,
        componentType: 'library',
      };

      const enhanced = enhanceClassUsage(usage);

      expect(enhanced.file).toBe(usage.file);
      expect(enhanced.component).toBe(usage.component);
      expect(enhanced.element).toBe(usage.element);
      expect(enhanced.line).toBe(usage.line);
      expect(enhanced.column).toBe(usage.column);
      expect(enhanced.componentType).toBe(usage.componentType);

      // Original classes preserved
      expect(enhanced.classes).toEqual(['@container/root', '@7xl/root:text-lg', 'font-[510]', 'bg-blue-500']);

      // Enhanced fields added
      expect(enhanced.simpleClasses).toEqual(['bg-blue-500']);
      expect(enhanced.containerDeclarations).toEqual(['@container/root']);
      expect(enhanced.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-lg' }
      ]);
      expect(enhanced.arbitraryValues).toEqual([
        { property: 'font-weight', value: '510', originalClass: 'font-[510]' }
      ]);
    });

    it('should handle usage with only simple classes', () => {
      const usage: ClassUsage = {
        file: '/test/button.tsx',
        component: 'PlayButton',
        element: 'button',
        classes: ['bg-blue-500', 'text-white', 'rounded'],
        line: 5,
        column: 0,
        componentType: 'library',
      };

      const enhanced = enhanceClassUsage(usage);

      expect(enhanced.simpleClasses).toEqual(['bg-blue-500', 'text-white', 'rounded']);
      expect(enhanced.containerDeclarations).toEqual([]);
      expect(enhanced.containerQueries).toEqual([]);
      expect(enhanced.arbitraryValues).toEqual([]);
    });

    it('should handle empty classes', () => {
      const usage: ClassUsage = {
        file: '/test/empty.tsx',
        component: 'Empty',
        element: 'div',
        classes: [],
        line: 1,
        column: 0,
        componentType: 'native',
      };

      const enhanced = enhanceClassUsage(usage);

      expect(enhanced.simpleClasses).toEqual([]);
      expect(enhanced.containerDeclarations).toEqual([]);
      expect(enhanced.containerQueries).toEqual([]);
      expect(enhanced.arbitraryValues).toEqual([]);
    });
  });

  describe('enhanceClassUsages', () => {
    it('should transform multiple ClassUsages', () => {
      const usages: ClassUsage[] = [
        {
          file: '/test/container.tsx',
          component: 'MediaContainer',
          element: 'div',
          classes: ['@container/root', 'relative'],
          line: 10,
          column: 0,
          componentType: 'library',
        },
        {
          file: '/test/button.tsx',
          component: 'PlayButton',
          element: 'button',
          classes: ['@7xl/root:text-lg', 'bg-blue-500'],
          line: 20,
          column: 5,
          componentType: 'library',
        },
      ];

      const enhanced = enhanceClassUsages(usages);

      expect(enhanced).toHaveLength(2);

      expect(enhanced[0].containerDeclarations).toEqual(['@container/root']);
      expect(enhanced[0].simpleClasses).toEqual(['relative']);
      expect(enhanced[0].containerQueries).toEqual([]);

      expect(enhanced[1].containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-lg' }
      ]);
      expect(enhanced[1].simpleClasses).toEqual(['bg-blue-500']);
      expect(enhanced[1].containerDeclarations).toEqual([]);
    });

    it('should handle empty array', () => {
      const result = enhanceClassUsages([]);
      expect(result).toEqual([]);
    });
  });

  describe('Integration with ASTParser', () => {
    it('should work with MediaContainer-like component', () => {
      const sourceCode = `
import React from 'react';
import { MediaContainer } from '@vjs-10/react';

export const MediaSkin = () => {
  return (
    <MediaContainer className="relative @container/root group/root overflow-clip font-[510] font-sans text-[0.8125rem] @7xl/root:text-[0.9375rem] after:absolute">
      <div className="absolute @lg/controls:p-4 bg-white">
        Controls
      </div>
    </MediaContainer>
  );
};
      `;

      const parser = new ASTParser();
      const usages = parser.parseString(sourceCode, 'MediaSkin.tsx');

      expect(usages).toHaveLength(2);

      // Test raw parsing (original functionality)
      const mediaContainerUsage = usages.find(u => u.component === 'MediaContainer');
      expect(mediaContainerUsage).toBeDefined();
      expect(mediaContainerUsage!.classes).toContain('@container/root');
      expect(mediaContainerUsage!.classes).toContain('@7xl/root:text-[0.9375rem]');
      expect(mediaContainerUsage!.classes).toContain('font-[510]');

      // Test enhanced parsing
      const enhancedUsages = enhanceClassUsages(usages);
      const enhancedContainer = enhancedUsages.find(u => u.component === 'MediaContainer');

      expect(enhancedContainer).toBeDefined();
      expect(enhancedContainer!.containerDeclarations).toEqual(['@container/root']);
      expect(enhancedContainer!.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-[0.9375rem]' }
      ]);
      expect(enhancedContainer!.arbitraryValues.length).toBeGreaterThan(0);

      // Check that we have the font-[510] arbitrary value
      const fontArbitraryValue = enhancedContainer!.arbitraryValues.find(av => av.originalClass === 'font-[510]');
      expect(fontArbitraryValue).toBeDefined();
      expect(fontArbitraryValue?.property).toBe('font-weight');
      expect(fontArbitraryValue?.value).toBe('510');
      expect(enhancedContainer!.simpleClasses).toContain('relative');
      expect(enhancedContainer!.simpleClasses).toContain('overflow-clip');
      expect(enhancedContainer!.simpleClasses).not.toContain('@container/root');
      expect(enhancedContainer!.simpleClasses).not.toContain('font-[510]');
    });

    it('should handle media skin with multiple components', () => {
      const sourceCode = `
import React from 'react';
import { MediaContainer, PlayButton, MuteButton, TimeRange } from '@vjs-10/react';

export const ComplexMediaSkin = () => {
  return (
    <MediaContainer className="@container/root relative font-[510] text-[0.8125rem] @7xl/root:text-[0.9375rem]">
      <PlayButton className="@lg/controls:p-2 bg-blue-500 hover:bg-blue-600" />
      <MuteButton className="font-[600] @md/controls:text-sm" />
      <TimeRange.Root className="@xl/controls:h-2 bg-gray-200 w-[200px]">
        <TimeRange.Thumb className="bg-white rounded-full" />
      </TimeRange.Root>
    </MediaContainer>
  );
};
      `;

      const parser = new ASTParser();
      const usages = parser.parseString(sourceCode, 'ComplexMediaSkin.tsx');
      const enhanced = enhanceClassUsages(usages);

      expect(enhanced).toHaveLength(5); // MediaContainer, PlayButton, MuteButton, TimeRange.Root, TimeRange.Thumb

      // MediaContainer should have container declaration and query
      const container = enhanced.find(u => u.component === 'MediaContainer');
      expect(container!.containerDeclarations).toEqual(['@container/root']);
      expect(container!.containerQueries).toEqual([
        { breakpoint: '7xl', container: 'root', utility: 'text-[0.9375rem]' }
      ]);

      // PlayButton should have container query
      const playButton = enhanced.find(u => u.component === 'PlayButton');
      expect(playButton!.containerQueries).toEqual([
        { breakpoint: 'lg', container: 'controls', utility: 'p-2' }
      ]);

      // MuteButton should have arbitrary value and container query
      const muteButton = enhanced.find(u => u.component === 'MuteButton');
      const muteButtonFontValue = muteButton!.arbitraryValues.find(av => av.originalClass === 'font-[600]');
      expect(muteButtonFontValue).toBeDefined();
      expect(muteButtonFontValue?.property).toBe('font-weight');
      expect(muteButtonFontValue?.value).toBe('600');
      expect(muteButton!.containerQueries).toEqual([
        { breakpoint: 'md', container: 'controls', utility: 'text-sm' }
      ]);

      // TimeRange.Root should have arbitrary value and container query
      const timeRangeRoot = enhanced.find(u => u.component === 'TimeRange.Root');
      expect(timeRangeRoot!.containerQueries).toEqual([
        { breakpoint: 'xl', container: 'controls', utility: 'h-2' }
      ]);
      const timeRangeWidthValue = timeRangeRoot!.arbitraryValues.find(av => av.originalClass === 'w-[200px]');
      expect(timeRangeWidthValue).toBeDefined();
      expect(timeRangeWidthValue?.property).toBe('width');
      expect(timeRangeWidthValue?.value).toBe('200px');
    });

    it('should parse MediaSkinDefaultInlineClasses fixture', () => {
      const fixturePath = resolve(
        __dirname,
        '../fixtures/components/MediaSkinDefaultInlineClasses.tsx'
      );

      const parser = new ASTParser();
      const result = parser.parseFile(fixturePath);
      const enhanced = enhanceClassUsages(result.usages);

      expect(result.usages.length).toBeGreaterThan(0);
      expect(enhanced.length).toEqual(result.usages.length);

      // Find MediaContainer usage
      const mediaContainer = enhanced.find(u => u.component === 'MediaContainer');
      expect(mediaContainer).toBeDefined();

      // Should have container declaration
      expect(mediaContainer!.containerDeclarations).toContain('@container/root');

      // Should have container queries
      const containerQueries = enhanced.flatMap(u => u.containerQueries);
      expect(containerQueries.length).toBeGreaterThan(0);

      // Should have arbitrary values
      const arbitraryValues = enhanced.flatMap(u => u.arbitraryValues);
      expect(arbitraryValues.length).toBeGreaterThan(0);

      // Check for specific container query from fixture
      expect(containerQueries).toContainEqual(
        expect.objectContaining({
          breakpoint: '7xl',
          container: 'root',
          utility: 'text-[0.9375rem]'
        })
      );

      // Check for specific arbitrary values from fixture
      expect(arbitraryValues).toContainEqual(
        expect.objectContaining({
          property: 'font-weight',
          value: '510',
          originalClass: 'font-[510]'
        })
      );
      expect(arbitraryValues).toContainEqual(
        expect.objectContaining({
          property: 'font-size',
          value: '0.8125rem',
          originalClass: 'text-[0.8125rem]'
        })
      );
    });
  });
});