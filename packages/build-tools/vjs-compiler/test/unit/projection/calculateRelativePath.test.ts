/**
 * Unit tests for relative path calculation
 */

import type { PathContext } from '../../../src/types.js';

import { describe, expect, it } from 'vitest';

import { calculateRelativePath, resolveImportPath } from '../../../src/core/projection/calculateRelativePath.js';

describe('calculateRelativePath', () => {
  it('calculates path from nested file to sibling', () => {
    const from = '/packages/html/html/src/skins/compiled/inline/MediaSkin.ts';
    const to = '/packages/html/html/src/media-skin.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../media-skin');
  });

  it('calculates path from nested file to component', () => {
    const from = '/packages/html/html/src/skins/compiled/inline/MediaSkin.ts';
    const to = '/packages/html/html/src/components/media-play-button.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../components/media-play-button');
  });

  it('removes .ts extension', () => {
    const from = '/a/b/file.ts';
    const to = '/a/target.ts';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('removes .tsx extension', () => {
    const from = '/a/b/file.tsx';
    const to = '/a/target.tsx';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('removes .js extension', () => {
    const from = '/a/b/file.js';
    const to = '/a/target.js';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('removes .jsx extension', () => {
    const from = '/a/b/file.jsx';
    const to = '/a/target.jsx';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('handles same directory', () => {
    const from = '/a/file.ts';
    const to = '/a/target.ts';
    expect(calculateRelativePath(from, to)).toBe('./target');
  });

  it('handles parent directory', () => {
    const from = '/a/b/file.ts';
    const to = '/a/target.ts';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('handles deeply nested paths', () => {
    const from = '/packages/html/html/src/skins/compiled/inline/deep/MediaSkin.ts';
    const to = '/packages/html/html/src/media-skin.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../../media-skin');
  });

  it('handles files without extensions', () => {
    const from = '/a/b/file';
    const to = '/a/target';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('handles paths with different roots', () => {
    const from = '/packages/html/html/src/file.ts';
    const to = '/packages/react/react/src/target.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../react/react/src/target');
  });
});

describe('resolveImportPath', () => {
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

  describe('vjs-component-same-package', () => {
    it('transforms component import from React path', () => {
      const result = resolveImportPath('../components/MediaPlayButton', 'vjs-component-same-package', context);
      expect(result).toBe('../../../components/media-play-button');
    });

    it('transforms nested component import', () => {
      const result = resolveImportPath('../components/MediaTimeRange', 'vjs-component-same-package', context);
      expect(result).toBe('../../../components/media-time-range');
    });

    it('handles compound component names', () => {
      const result = resolveImportPath('../components/MediaVolumeRange', 'vjs-component-same-package', context);
      expect(result).toBe('../../../components/media-volume-range');
    });
  });

  describe('vjs-core-package', () => {
    it('transforms MediaSkin import', () => {
      const result = resolveImportPath('../MediaSkin', 'vjs-core-package', context);
      expect(result).toBe('../../../media-skin');
    });

    it('transforms media-container import', () => {
      const result = resolveImportPath('../MediaContainer', 'vjs-core-package', context);
      expect(result).toBe('../../../media-container');
    });
  });

  describe('vjs-icon-package', () => {
    it('keeps icon package imports unchanged (Phase 1)', () => {
      const result = resolveImportPath('@vjs-10/html-icons', 'vjs-icon-package', context);
      expect(result).toBe('@vjs-10/html-icons');
    });

    it('keeps react-icons unchanged (will transform in Phase 2)', () => {
      const result = resolveImportPath('@vjs-10/react-icons', 'vjs-icon-package', context);
      expect(result).toBe('@vjs-10/react-icons');
    });
  });

  describe('external-package', () => {
    it('keeps external packages unchanged', () => {
      const result = resolveImportPath('lodash', 'external-package', context);
      expect(result).toBe('lodash');
    });

    it('keeps scoped packages unchanged', () => {
      const result = resolveImportPath('@floating-ui/dom', 'external-package', context);
      expect(result).toBe('@floating-ui/dom');
    });
  });

  describe('framework-import', () => {
    it('keeps framework imports unchanged (will be filtered)', () => {
      const result = resolveImportPath('react', 'framework-import', context);
      expect(result).toBe('react');
    });
  });

  describe('style-import', () => {
    it('keeps style imports unchanged (will be filtered)', () => {
      const result = resolveImportPath('./styles', 'style-import', context);
      expect(result).toBe('./styles');
    });
  });
});
