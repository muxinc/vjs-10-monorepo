import { describe, it, expect } from 'vitest';
import {
  transformImports,
  defaultShouldExclude,
  defaultTransformRelativeImport,
  defaultImportMappings,
  type ImportMappingConfig
} from '../src/importTransforming';
import type { ImportInfo } from '../src/skinGeneration/types';

describe('importTransforming', () => {
  describe('defaultShouldExclude', () => {
    it('should exclude imports matching patterns', () => {
      expect(defaultShouldExclude('./styles.module.css', ['.css'])).toBe(true);
      expect(defaultShouldExclude('./component.tsx', ['.css'])).toBe(false);
    });

    it('should check multiple patterns', () => {
      const patterns = ['.css', '.scss', '/styles'];
      expect(defaultShouldExclude('./styles.module.css', patterns)).toBe(true);
      expect(defaultShouldExclude('./theme.scss', patterns)).toBe(true);
      expect(defaultShouldExclude('./styles/index', patterns)).toBe(true);
      expect(defaultShouldExclude('./component.tsx', patterns)).toBe(false);
    });

    it('should handle empty patterns', () => {
      expect(defaultShouldExclude('./any-import', [])).toBe(false);
    });
  });

  describe('defaultTransformRelativeImport', () => {
    it('should transform component imports to kebab-case with media- prefix', () => {
      expect(defaultTransformRelativeImport('../../components/PlayButton'))
        .toBe('../components/media-play-button');
    });

    it('should handle already kebab-cased imports with media- prefix', () => {
      expect(defaultTransformRelativeImport('../components/media-play-button'))
        .toBe('../components/media-play-button');
    });

    it('should return unchanged for non-component paths', () => {
      expect(defaultTransformRelativeImport('./utils/helper'))
        .toBe('./utils/helper');
    });

    it('should handle empty path parts', () => {
      expect(defaultTransformRelativeImport('./')).toBe('./');
    });

    it('should special-case MediaContainer to root directory', () => {
      expect(defaultTransformRelativeImport('../../components/MediaContainer'))
        .toBe('../media-container');
    });

    it('should add media- prefix to components without it', () => {
      expect(defaultTransformRelativeImport('../../components/PlayButton'))
        .toBe('../components/media-play-button');
      expect(defaultTransformRelativeImport('../../components/TimeRange'))
        .toBe('../components/media-time-range');
    });

    it('should not double-add media- prefix', () => {
      expect(defaultTransformRelativeImport('../../components/MediaPlayButton'))
        .toBe('../components/media-play-button');
    });
  });

  describe('transformImports with default functions', () => {
    it('should use default shouldExclude when not provided', () => {
      const imports: ImportInfo[] = [
        { source: './components/PlayButton', specifiers: [] },
        { source: './styles.module.css', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should exclude the CSS import
      expect(result.some(imp => imp.includes('styles.module.css'))).toBe(false);
      // Should include the component import (transformed to kebab-case with media- prefix)
      expect(result.some(imp => imp.includes('media-play-button'))).toBe(true);
    });

    it('should use default transformRelativeImport when not provided', () => {
      const imports: ImportInfo[] = [
        { source: '../../components/PlayButton', specifiers: [] }
      ];

      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        excludePatterns: []
      };

      const result = transformImports(imports, config);

      // Should transform using default kebab-case logic with media- prefix
      expect(result.some(imp => imp.includes('media-play-button'))).toBe(true);
    });
  });

  describe('transformImports with custom functions', () => {
    it('should use custom shouldExclude function', () => {
      const imports: ImportInfo[] = [
        { source: './normal-import', specifiers: [] },
        { source: './custom-exclude-me', specifiers: [] }
      ];

      const customShouldExclude = (source: string, _patterns: string[]) => {
        return source.includes('custom-exclude-me');
      };

      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        shouldExclude: customShouldExclude
      };

      const result = transformImports(imports, config);

      // Should exclude using custom logic
      expect(result.some(imp => imp.includes('custom-exclude-me'))).toBe(false);
      // Should still include other imports
      expect(result.some(imp => imp.includes('normal-import'))).toBe(true);
    });

    it('should use custom transformRelativeImport function', () => {
      const imports: ImportInfo[] = [
        { source: './MyComponent', specifiers: [] }
      ];

      const customTransform = (source: string) => {
        // Custom logic: add .custom suffix
        return `${source}.custom`;
      };

      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        excludePatterns: [],
        transformRelativeImport: customTransform
      };

      const result = transformImports(imports, config);

      // Should use custom transformation
      expect(result.some(imp => imp.includes('./MyComponent.custom'))).toBe(true);
    });

    it('should combine custom functions with package mappings', () => {
      const imports: ImportInfo[] = [
        { source: './components/PlayButton', specifiers: [] },
        { source: './utils/helper', specifiers: [] },
        { source: './styles.custom.css', specifiers: [] }
      ];

      const customShouldExclude = (source: string, _patterns: string[]) => {
        return source.endsWith('.custom.css');
      };

      const customTransform = (source: string) => {
        return source.toUpperCase();
      };

      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        shouldExclude: customShouldExclude,
        transformRelativeImport: customTransform
      };

      const result = transformImports(imports, config);

      // Should exclude custom CSS
      expect(result.some(imp => imp.includes('.custom.css'))).toBe(false);
      // Should transform relative import with custom logic (component paths)
      expect(result.some(imp => imp.includes('./COMPONENTS/PLAYBUTTON'))).toBe(true);
      // Should also transform non-component paths
      expect(result.some(imp => imp.includes('./UTILS/HELPER'))).toBe(true);
    });
  });

  describe('transformImports integration', () => {
    it('should maintain backward compatibility with no custom functions', () => {
      const imports: ImportInfo[] = [
        { source: './styles.module.css', specifiers: [] },
        { source: './components/PlayButton', specifiers: [] },
        { source: './utils/helper', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should have MediaSkin import at the start
      expect(result[0]).toContain("import { MediaSkin } from '../media-skin'");
      // Should exclude CSS (default shouldExclude behavior)
      expect(result.some(imp => imp.includes('.module.css'))).toBe(false);
      // Should transform component import (default transformRelativeImport for component paths)
      expect(result.some(imp => imp.includes('play-button'))).toBe(true);
      // Should include non-component relative imports as-is
      expect(result.some(imp => imp.includes('./utils/helper'))).toBe(true);
    });

    it('should allow partial override of functions', () => {
      const imports: ImportInfo[] = [
        { source: './MyComponent', specifiers: [] }
      ];

      // Only override shouldExclude, keep default transformRelativeImport
      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        excludePatterns: [],
        shouldExclude: () => false // Never exclude
      };

      const result = transformImports(imports, config);

      // Should include the import (custom shouldExclude)
      expect(result.some(imp => imp.includes('MyComponent'))).toBe(true);
    });
  });

  describe('React core library exclusion', () => {
    it('should exclude react core library', () => {
      const imports: ImportInfo[] = [
        { source: 'react', specifiers: [] },
        { source: './components/PlayButton', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should exclude 'react'
      expect(result.some(imp => imp.includes("'react'"))).toBe(false);
      // Should include component
      expect(result.some(imp => imp.includes('media-play-button'))).toBe(true);
    });

    it('should NOT exclude packages containing react in their name', () => {
      const imports: ImportInfo[] = [
        { source: 'react', specifiers: [] },
        { source: '@vjs-10/react-icons', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should exclude 'react'
      expect(result.some(imp => imp.includes("'react'"))).toBe(false);
      // Should transform and include '@vjs-10/react-icons' -> '@vjs-10/html-icons'
      expect(result.some(imp => imp.includes('@vjs-10/html-icons'))).toBe(true);
    });

    it('should exclude react-dom', () => {
      const imports: ImportInfo[] = [
        { source: 'react', specifiers: [] },
        { source: 'react-dom', specifiers: [] },
        { source: '@vjs-10/react', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should exclude both 'react' and 'react-dom'
      expect(result.some(imp => imp.includes("'react'"))).toBe(false);
      expect(result.some(imp => imp.includes("'react-dom'"))).toBe(false);
      // Should transform '@vjs-10/react' -> '@vjs-10/html'
      expect(result.some(imp => imp.includes('@vjs-10/html'))).toBe(true);
    });

    it('should handle react/ subpath imports', () => {
      const imports: ImportInfo[] = [
        { source: 'react/jsx-runtime', specifiers: [] },
        { source: '@vjs-10/react-icons', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should exclude 'react/*' paths
      expect(result.some(imp => imp.includes('react/jsx-runtime'))).toBe(false);
      // Should NOT exclude packages with 'react' in name
      expect(result.some(imp => imp.includes('@vjs-10/html-icons'))).toBe(true);
    });
  });

  describe('Icon package consolidation', () => {
    it('should consolidate icon imports into single package import', () => {
      const imports: ImportInfo[] = [
        { source: '@vjs-10/react-icons', specifiers: [{ local: 'PlayIcon' }] },
        { source: '@vjs-10/react-icons', specifiers: [{ local: 'PauseIcon' }] },
        { source: '@vjs-10/react-icons', specifiers: [{ local: 'VolumeIcon' }] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should have exactly one icon package import
      const iconImports = result.filter(imp => imp.includes('@vjs-10/html-icons'));
      expect(iconImports).toHaveLength(1);
      expect(iconImports[0]).toBe("import '@vjs-10/html-icons';");
    });

    it('should add icon import alongside component imports', () => {
      const imports: ImportInfo[] = [
        { source: '@vjs-10/react-icons', specifiers: [] },
        { source: '../../components/PlayButton', specifiers: [] },
        { source: '../../components/MediaContainer', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should have MediaSkin at start
      expect(result[0]).toContain("import { MediaSkin } from '../media-skin'");
      // Should have component imports
      expect(result.some(imp => imp.includes('media-play-button'))).toBe(true);
      expect(result.some(imp => imp.includes('../media-container'))).toBe(true);
      // Should have icon package import
      expect(result.some(imp => imp.includes('@vjs-10/html-icons'))).toBe(true);
    });

    it('should handle multiple icon packages if configured', () => {
      const imports: ImportInfo[] = [
        { source: '@vjs-10/react-icons', specifiers: [] },
        { source: '@custom/react-icons', specifiers: [] }
      ];

      const config: ImportMappingConfig = {
        ...defaultImportMappings,
        packageMappings: {
          '@vjs-10/react-icons': '@vjs-10/html-icons',
          '@custom/react-icons': '@custom/html-icons'
        }
      };

      const result = transformImports(imports, config);

      // Should have both icon packages
      expect(result.some(imp => imp.includes('@vjs-10/html-icons'))).toBe(true);
      expect(result.some(imp => imp.includes('@custom/html-icons'))).toBe(true);
    });
  });

  describe('Pattern matching with trailing slashes', () => {
    it('should match exact prefix for patterns ending with /', () => {
      expect(defaultShouldExclude('react/jsx-runtime', ['react/'])).toBe(true);
      expect(defaultShouldExclude('react', ['react/'])).toBe(true); // Exact match without trailing /
      expect(defaultShouldExclude('@vjs-10/react', ['react/'])).toBe(false);
    });

    it('should match substring for patterns without trailing /', () => {
      expect(defaultShouldExclude('./styles/index', ['/styles'])).toBe(true);
      expect(defaultShouldExclude('./components/button', ['/styles'])).toBe(false);
      expect(defaultShouldExclude('./styles.module.css', ['.css'])).toBe(true);
    });

    it('should handle mixed pattern types', () => {
      const patterns = ['react/', '.css', '/styles'];

      expect(defaultShouldExclude('react', patterns)).toBe(true);
      expect(defaultShouldExclude('react/jsx-runtime', patterns)).toBe(true);
      expect(defaultShouldExclude('@vjs-10/react', patterns)).toBe(false);
      expect(defaultShouldExclude('./styles.module.css', patterns)).toBe(true);
      expect(defaultShouldExclude('./styles/index', patterns)).toBe(true);
      expect(defaultShouldExclude('./component.tsx', patterns)).toBe(false);
    });
  });

  describe('Real-world scenario: MediaSkinDefault', () => {
    it('should transform all imports correctly for a complete skin', () => {
      const imports: ImportInfo[] = [
        { source: 'react', specifiers: [] },
        { source: '@vjs-10/react-icons', specifiers: [] },
        { source: '../../components/PlayButton', specifiers: [] },
        { source: '../../components/MuteButton', specifiers: [] },
        { source: '../../components/TimeRange', specifiers: [] },
        { source: '../../components/VolumeRange', specifiers: [] },
        { source: '../../components/CurrentTimeDisplay', specifiers: [] },
        { source: '../../components/DurationDisplay', specifiers: [] },
        { source: '../../components/FullscreenButton', specifiers: [] },
        { source: '../../components/MediaContainer', specifiers: [] },
        { source: './styles', specifiers: [] }
      ];

      const result = transformImports(imports, defaultImportMappings);

      // Should have MediaSkin import first
      expect(result[0]).toBe("import { MediaSkin } from '../media-skin';");

      // Should exclude react and styles
      expect(result.some(imp => imp.includes("'react'"))).toBe(false);
      expect(result.some(imp => imp.includes('styles'))).toBe(false);

      // Should have all component imports with media- prefix
      expect(result.some(imp => imp.includes("'../components/media-play-button'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-mute-button'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-time-range'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-volume-range'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-current-time-display'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-duration-display'"))).toBe(true);
      expect(result.some(imp => imp.includes("'../components/media-fullscreen-button'"))).toBe(true);

      // Should have MediaContainer at root
      expect(result.some(imp => imp.includes("'../media-container'"))).toBe(true);

      // Should have single consolidated icon import
      const iconImports = result.filter(imp => imp.includes('@vjs-10/html-icons'));
      expect(iconImports).toHaveLength(1);
    });
  });
});
