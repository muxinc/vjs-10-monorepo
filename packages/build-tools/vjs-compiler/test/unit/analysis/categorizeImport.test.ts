/**
 * Unit tests for import categorization
 */

import type { ImportDeclaration, ImportUsage, PathContext } from '../../../src/types.js';

import { describe, expect, it } from 'vitest';

import { categorizeImport } from '../../../src/core/analysis/categorizeImport.js';

const mockPaths: PathContext = {
  skinPath: '/packages/react/react/src/skins/default/Skin.tsx',
  stylesPath: '/packages/react/react/src/skins/default/styles.ts',
  outputPath: '/packages/html/html/src/skins/compiled/inline/skin.ts',
  sourcePackage: {
    name: '@vjs-10/react',
    rootPath: '/packages/react/react/src',
  },
  targetPackage: {
    name: '@vjs-10/html',
    rootPath: '/packages/html/html/src',
  },
};

describe('categorizeImport', () => {
  it('categorizes framework imports', () => {
    const importDecl: ImportDeclaration = {
      source: 'react',
      specifiers: [],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'React',
      usageType: 'unknown',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('framework-import');
  });

  it('categorizes style imports', () => {
    const importDecl: ImportDeclaration = {
      source: './styles',
      specifiers: [],
      defaultImport: 'styles',
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'styles',
      usageType: 'className-access',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('style-import');
  });

  it('categorizes VJS icon packages', () => {
    const importDecl: ImportDeclaration = {
      source: '@vjs-10/react-icons',
      specifiers: ['PlayIcon'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'PlayIcon',
      usageType: 'jsx-element',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('vjs-icon-package');
  });

  it('categorizes VJS core packages', () => {
    const importDecl: ImportDeclaration = {
      source: '@vjs-10/media-store',
      specifiers: ['createStore'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'createStore',
      usageType: 'unknown',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('vjs-core-package');
  });

  it('categorizes VJS external component packages', () => {
    const importDecl: ImportDeclaration = {
      source: '@vjs-10/react',
      specifiers: ['PlayButton'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'PlayButton',
      usageType: 'jsx-element',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('vjs-component-external');
  });

  it('categorizes VJS same-package components', () => {
    const importDecl: ImportDeclaration = {
      source: '../../components/PlayButton',
      specifiers: ['PlayButton'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'PlayButton',
      usageType: 'jsx-element',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('vjs-component-same-package');
  });

  it('categorizes external packages', () => {
    const importDecl: ImportDeclaration = {
      source: 'lodash',
      specifiers: ['debounce'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'debounce',
      usageType: 'unknown',
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('external-package');
  });

  it('categorizes compound component usage', () => {
    const importDecl: ImportDeclaration = {
      source: '../../components/TimeRange',
      specifiers: ['TimeRange'],
      isTypeOnly: false,
    };
    const usage: ImportUsage = {
      name: 'TimeRange',
      usageType: 'compound-member',
      members: ['Root', 'Track'],
    };

    const category = categorizeImport(importDecl, usage, mockPaths);
    expect(category).toBe('vjs-component-same-package');
  });
});
