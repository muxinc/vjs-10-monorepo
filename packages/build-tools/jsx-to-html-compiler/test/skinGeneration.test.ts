import type { SkinModuleData } from '../src/skinGeneration/index.js';

import { describe, expect, it } from 'vitest';

import { formatHTML, formatImports, formatStyles, generateSkinModule } from '../src/skinGeneration/index.js';

describe('formatImports', () => {
  it('joins imports with newlines', () => {
    const imports = [
      'import { MediaSkin } from \'../media-skin\';',
      'import \'../components/play-button\';',
      'import \'@vjs-10/html-icons\';',
    ];
    const result = formatImports(imports);
    expect(result).toBe(imports.join('\n'));
  });

  it('handles empty imports array', () => {
    const result = formatImports([]);
    expect(result).toBe('');
  });

  it('handles single import', () => {
    const imports = ['import { MediaSkin } from \'../media-skin\';'];
    const result = formatImports(imports);
    expect(result).toBe(imports[0]);
  });
});

describe('formatStyles', () => {
  it('returns placeholder for empty string', () => {
    const result = formatStyles('');
    expect(result).toContain('<style>');
    expect(result).toContain('/* TODO: Add skin styles here */');
    expect(result).toContain('</style>');
  });

  it('returns placeholder for whitespace-only string', () => {
    const result = formatStyles('   \n  \n  ');
    expect(result).toContain('/* TODO: Add skin styles here */');
  });

  it('indents single-line styles', () => {
    const styles = '.button { color: red; }';
    const result = formatStyles(styles);
    expect(result).toContain('      .button { color: red; }');
    expect(result).toMatch(/<style>\n.*\n {4}<\/style>/);
  });

  it('indents multi-line styles', () => {
    const styles = `.button {
  color: red;
  padding: 10px;
}`;
    const result = formatStyles(styles);
    expect(result).toContain('      .button {');
    expect(result).toContain('      color: red;');
    expect(result).toContain('      padding: 10px;');
    expect(result).toContain('      }');
  });

  it('filters out empty lines', () => {
    const styles = `.button {

  color: red;


}`;
    const result = formatStyles(styles);
    // Should not have multiple consecutive newlines
    expect(result).not.toMatch(/\n\n\n/);
  });
});

describe('formatHTML', () => {
  it('indents single-line HTML', () => {
    const html = '<div>Hello</div>';
    const result = formatHTML(html);
    expect(result).toBe('    <div>Hello</div>');
  });

  it('indents multi-line HTML', () => {
    const html = `<div>
  <button>Click</button>
</div>`;
    const result = formatHTML(html);
    expect(result).toContain('    <div>');
    expect(result).toContain('    <button>Click</button>');
    expect(result).toContain('    </div>');
  });

  it('filters out empty lines', () => {
    const html = `<div>

  <button>Click</button>

</div>`;
    const result = formatHTML(html);
    expect(result).not.toMatch(/\n\n/);
  });

  it('handles empty string', () => {
    const result = formatHTML('');
    expect(result).toBe('');
  });
});

describe('generateSkinModule', () => {
  const basicData: SkinModuleData = {
    imports: ['import { MediaSkin } from \'../media-skin\';', 'import \'../components/play-button\';'],
    html: '<media-play-button></media-play-button>',
    styles: '',
    className: 'MediaSkinTest',
    elementName: 'media-skin-test',
  };

  it('generates complete module with all parts', () => {
    const result = generateSkinModule(basicData);

    // Check imports
    expect(result).toContain('import { MediaSkin } from \'../media-skin\';');
    expect(result).toContain('import \'../components/play-button\';');

    // Check getTemplateHTML function
    expect(result).toContain('export function getTemplateHTML()');
    expect(result).toContain('return /* html */ `');
    expect(result).toMatch(/\$\{MediaSkin\.getTemplateHTML\(\)\}/);

    // Check styles placeholder
    expect(result).toContain('<style>');
    expect(result).toContain('/* TODO: Add skin styles here */');
    expect(result).toContain('</style>');

    // Check HTML
    expect(result).toContain('<media-play-button></media-play-button>');

    // Check class definition
    expect(result).toContain('export class MediaSkinTest extends MediaSkin');
    expect(result).toContain('static getTemplateHTML: () => string = getTemplateHTML;');

    // Check custom element registration
    expect(result).toContain('customElements.define(\'media-skin-test\', MediaSkinTest);');
  });

  it('includes provided styles', () => {
    const dataWithStyles: SkinModuleData = {
      ...basicData,
      styles: `.button {
  color: red;
}`,
    };
    const result = generateSkinModule(dataWithStyles);

    expect(result).toContain('.button {');
    expect(result).toContain('color: red;');
    expect(result).not.toContain('/* TODO: Add skin styles here */');
  });

  it('handles empty imports array', () => {
    const dataWithoutImports: SkinModuleData = {
      ...basicData,
      imports: [],
    };
    const result = generateSkinModule(dataWithoutImports);

    // Should still have the function and class
    expect(result).toContain('export function getTemplateHTML()');
    expect(result).toContain('export class MediaSkinTest');
  });

  it('handles multi-line HTML', () => {
    const dataWithComplexHTML: SkinModuleData = {
      ...basicData,
      html: `<media-container>
  <media-play-button></media-play-button>
  <media-mute-button></media-mute-button>
</media-container>`,
    };
    const result = generateSkinModule(dataWithComplexHTML);

    expect(result).toContain('<media-container>');
    expect(result).toContain('<media-play-button></media-play-button>');
    expect(result).toContain('<media-mute-button></media-mute-button>');
    expect(result).toContain('</media-container>');
  });

  it('handles special characters in className', () => {
    const dataWithSpecialClassName: SkinModuleData = {
      ...basicData,
      className: 'MediaSkin_V2_Default',
      elementName: 'media-skin-v2-default',
    };
    const result = generateSkinModule(dataWithSpecialClassName);

    expect(result).toContain('export class MediaSkin_V2_Default extends MediaSkin');
    expect(result).toContain('customElements.define(\'media-skin-v2-default\', MediaSkin_V2_Default);');
  });

  describe('custom formatters', () => {
    it('uses custom imports formatter', () => {
      const customFormatImports = (imports: string[]) => {
        return `// Custom imports\n${imports.join('\n')}`;
      };

      const result = generateSkinModule(basicData, {
        formatImports: customFormatImports,
      });

      expect(result).toContain('// Custom imports');
    });

    it('uses custom styles formatter', () => {
      const customFormatStyles = (_styles: string) => {
        return '    <style>/* Custom styles */</style>';
      };

      const result = generateSkinModule(basicData, {
        formatStyles: customFormatStyles,
      });

      expect(result).toContain('/* Custom styles */');
      expect(result).not.toContain('/* TODO: Add skin styles here */');
    });

    it('uses custom HTML formatter', () => {
      const customFormatHTML = (html: string) => {
        return `      ${html}`; // Double indent
      };

      const result = generateSkinModule(basicData, {
        formatHTML: customFormatHTML,
      });

      expect(result).toContain('      <media-play-button>');
    });

    it('allows mixing custom and default formatters', () => {
      const customFormatImports = (imports: string[]) => {
        return `// Custom\n${imports.join('\n')}`;
      };

      const result = generateSkinModule(basicData, {
        formatImports: customFormatImports,
        // formatStyles and formatHTML use defaults
      });

      expect(result).toContain('// Custom');
      expect(result).toContain('/* TODO: Add skin styles here */'); // Default
      expect(result).toContain('    <media-play-button>'); // Default indentation
    });
  });

  describe('output structure validation', () => {
    it('has proper blank lines between sections', () => {
      const result = generateSkinModule(basicData);

      // Should have blank line after imports
      expect(result).toMatch(/import.*\n\nexport function/);

      // Should have blank line after getTemplateHTML
      expect(result).toMatch(/\}\n\nexport class/);

      // Should have blank line after class
      expect(result).toMatch(/\}\n\ncustomElements.define/);
    });

    it('ends with newline', () => {
      const result = generateSkinModule(basicData);
      expect(result.endsWith('\n')).toBe(true);
    });

    it('has correct TypeScript module structure', () => {
      const result = generateSkinModule(basicData);

      // Check exports
      const exportMatches = result.match(/export (function|class)/g);
      expect(exportMatches).toHaveLength(2); // function and class

      // Check template literal structure
      expect(result).toMatch(/return \/\* html \*\/ `/);
      expect(result).toMatch(/\$\{MediaSkin\.getTemplateHTML\(\)\}/);
    });
  });
});
