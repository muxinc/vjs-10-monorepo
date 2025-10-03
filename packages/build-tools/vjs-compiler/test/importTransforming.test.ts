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
    it('should transform component imports to kebab-case', () => {
      expect(defaultTransformRelativeImport('../../components/PlayButton'))
        .toBe('../components/play-button');
    });

    it('should handle already kebab-cased imports', () => {
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
      // Should include the component import (transformed to kebab-case)
      expect(result.some(imp => imp.includes('play-button'))).toBe(true);
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

      // Should transform using default kebab-case logic
      expect(result.some(imp => imp.includes('play-button'))).toBe(true);
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
});
