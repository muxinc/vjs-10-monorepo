/**
 * Integration test for attribute transformation
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('attribute Transformation', () => {
  it('transforms numeric literal attributes to strings', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function AttributeSkin() {
        return (
          <MediaContainer className={styles.Container} delay={200} timeout={5000} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/AttributeSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate numeric attributes converted to strings
    expect(result.code).toMatch(/delay="200"/);
    expect(result.code).toMatch(/timeout="5000"/);
    // Should not have JSX expression syntax
    expect(result.code).not.toMatch(/delay=\{200\}/);
    expect(result.code).not.toMatch(/timeout=\{5000\}/);
  });

  it('transforms boolean literal attributes to strings', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function BooleanSkin() {
        return (
          <MediaContainer className={styles.Container} disabled={true} autoplay={false} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/BooleanSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate boolean attributes converted to strings
    expect(result.code).toMatch(/disabled="true"/);
    expect(result.code).toMatch(/autoplay="false"/);
  });

  it('preserves data-* attributes', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function DataAttrSkin() {
        return (
          <div className={styles.Controls} data-testid="controls" data-state="paused">
            <MediaContainer />
          </div>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Controls: 'flex',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/DataAttrSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate data attributes preserved
    expect(result.code).toMatch(/data-testid="controls"/);
    expect(result.code).toMatch(/data-state="paused"/);
  });

  it('preserves aria-* attributes', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function AriaAttrSkin() {
        return (
          <div className={styles.Overlay} aria-hidden="true" aria-label="Video overlay">
            <MediaContainer />
          </div>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Overlay: 'absolute',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/AriaAttrSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate aria attributes preserved
    expect(result.code).toMatch(/aria-hidden="true"/);
    expect(result.code).toMatch(/aria-label="Video overlay"/);
  });

  it('unwraps string literals from expression containers', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function StringExprSkin() {
        return (
          <MediaContainer className={styles.Container} role={"button"} type={"submit"} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/StringExprSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/test',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/test',
        },
      },
      moduleType: 'skin',
      input: {
        format: 'react',
        typescript: true,
      },
      output: {
        format: 'web-component',
        css: 'inline',
        typescript: true,
      },
    };

    const result = await compileSkin(config);

    // Validate string literals unwrapped from expression containers
    expect(result.code).toMatch(/role="button"/);
    expect(result.code).toMatch(/type="submit"/);
  });
});
