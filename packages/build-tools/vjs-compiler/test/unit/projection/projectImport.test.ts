/**
 * Unit tests for import projection
 */

import type { CategorizedImport, PathContext } from '../../../src/types.js';

import { describe, expect, it } from 'vitest';

import { projectImport } from '../../../src/core/projection/projectImport.js';

describe('projectImport', () => {
  // Mock path context for tests
  const context: PathContext = {
    skinPath: '/packages/react/react/src/skins/MediaSkinDefault.tsx',
    stylesPath: '/packages/react/react/src/skins/styles.ts',
    outputPath: '/packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts',
    sourcePackage: {
      name: '@vjs-10/react',
      rootPath: '/packages/react/react/src',
    },
    targetPackage: {
      name: '@vjs-10/html',
      rootPath: '/packages/html/html/src',
    },
  };

  it('projects framework imports to be removed', () => {
    const categorized: CategorizedImport = {
      import: {
        source: 'react',
        specifiers: [],
        isTypeOnly: false,
      },
      category: 'framework-import',
      usage: {
        name: 'React',
        usageType: 'unknown',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(false);
    expect(projection.shouldTransform).toBe(false);
  });

  it('projects style imports to be removed', () => {
    const categorized: CategorizedImport = {
      import: {
        source: './styles',
        specifiers: [],
        defaultImport: 'styles',
        isTypeOnly: false,
      },
      category: 'style-import',
      usage: {
        name: 'styles',
        usageType: 'className-access',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(false);
    expect(projection.shouldTransform).toBe(false);
  });

  it('projects VJS icon packages to be kept', () => {
    const categorized: CategorizedImport = {
      import: {
        source: '@vjs-10/react-icons',
        specifiers: ['PlayIcon'],
        isTypeOnly: false,
      },
      category: 'vjs-icon-package',
      usage: {
        name: 'PlayIcon',
        usageType: 'jsx-element',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(true);
  });

  it('projects VJS core packages to be kept', () => {
    const categorized: CategorizedImport = {
      import: {
        source: '@vjs-10/media-store',
        specifiers: ['createStore'],
        isTypeOnly: false,
      },
      category: 'vjs-core-package',
      usage: {
        name: 'createStore',
        usageType: 'unknown',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(true);
  });

  it('projects VJS same-package components to be kept', () => {
    const categorized: CategorizedImport = {
      import: {
        source: '../../components/PlayButton',
        specifiers: ['PlayButton'],
        isTypeOnly: false,
      },
      category: 'vjs-component-same-package',
      usage: {
        name: 'PlayButton',
        usageType: 'jsx-element',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(true);
  });

  it('projects VJS external components to be kept', () => {
    const categorized: CategorizedImport = {
      import: {
        source: '@vjs-10/react',
        specifiers: ['PlayButton'],
        isTypeOnly: false,
      },
      category: 'vjs-component-external',
      usage: {
        name: 'PlayButton',
        usageType: 'jsx-element',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(true);
  });

  it('projects external packages to be kept', () => {
    const categorized: CategorizedImport = {
      import: {
        source: 'lodash',
        specifiers: ['debounce'],
        isTypeOnly: false,
      },
      category: 'external-package',
      usage: {
        name: 'debounce',
        usageType: 'unknown',
      },
    };

    const projection = projectImport(categorized, context);

    expect(projection.shouldKeep).toBe(true);
  });
});
