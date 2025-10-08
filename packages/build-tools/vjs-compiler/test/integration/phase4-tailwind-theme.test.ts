/**
 * Integration test for Phase 4: Tailwind Theme Configuration
 *
 * Tests that all Tailwind utilities generate correct CSS with theme configuration.
 */

import { describe, expect, it } from 'vitest';
import { compileSkin } from '../../src/pipelines/compileSkin.js';
import type { CompileSkinConfig } from '../../src/types.js';

describe('Phase 4: Tailwind Theme Configuration', () => {
  it('generates CSS for spacing utilities (p-*, px-*, gap-*)', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function ThemeSkin() {
        return (
          <MediaContainer className={styles.Container} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'p-2 px-4 py-2 gap-2',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/ThemeSkin.tsx',
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

    // Validate spacing utilities generate CSS (with CSS variables)
    expect(result.code).toMatch(/padding:\s*var\(--spacing-2\)/); // p-2
    expect(result.code).toMatch(/padding-inline:\s*var\(--spacing-4\)/); // px-4
    expect(result.code).toMatch(/padding-block:\s*var\(--spacing-2\)/); // py-2
    expect(result.code).toMatch(/gap:\s*var\(--spacing-2\)/); // gap-2

    // Validate CSS variables are defined
    expect(result.code).toMatch(/--spacing-2:\s*0\.5rem/);
    expect(result.code).toMatch(/--spacing-4:\s*1rem/);
  });

  it('generates CSS for border-radius utilities (rounded)', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function RoundedSkin() {
        return (
          <MediaContainer className={styles.Container} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'rounded rounded-lg rounded-full',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/RoundedSkin.tsx',
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

    // Validate border-radius utilities generate CSS (with CSS variables)
    expect(result.code).toMatch(/border-radius:\s*var\(--radius\)/); // rounded
    expect(result.code).toMatch(/border-radius:\s*var\(--radius-lg\)/); // rounded-lg
    expect(result.code).toMatch(/border-radius:\s*var\(--radius-full\)/); // rounded-full

    // Validate CSS variables are defined
    expect(result.code).toMatch(/--radius:\s*0\.25rem/);
    expect(result.code).toMatch(/--radius-lg:\s*0\.5rem/);
    expect(result.code).toMatch(/--radius-full:\s*9999px/);
  });

  it('generates CSS for flex utilities (flex-1, flex-auto)', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function FlexSkin() {
        return (
          <MediaContainer className={styles.Container} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'flex-1 flex',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/FlexSkin.tsx',
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

    // Validate flex utilities generate CSS
    // Note: Tailwind v4 uses simplified flex: 1 instead of flex: 1 1 0%
    expect(result.code).toMatch(/flex:\s*1/); // flex-1
    expect(result.code).toMatch(/display:\s*flex/); // flex
  });

  it('generates CSS for overflow utilities', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function OverflowSkin() {
        return (
          <MediaContainer className={styles.Container} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'overflow-hidden overflow-auto',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/OverflowSkin.tsx',
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

    // Validate overflow utilities generate CSS
    expect(result.code).toMatch(/overflow:\s*hidden/); // overflow-hidden
    expect(result.code).toMatch(/overflow:\s*auto/); // overflow-auto
  });

  it('handles combination of all utility types', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function ComplexSkin() {
        return (
          <MediaContainer className={styles.Container} />
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'flex flex-1 p-4 rounded-lg overflow-hidden gap-2',
      };
      export default styles;
    `;

    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/ComplexSkin.tsx',
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

    // Validate all utilities work together (with CSS variables where applicable)
    expect(result.code).toMatch(/display:\s*flex/);
    expect(result.code).toMatch(/flex:\s*1/);
    expect(result.code).toMatch(/padding:\s*var\(--spacing-4\)/); // p-4
    expect(result.code).toMatch(/border-radius:\s*var\(--radius-lg\)/); // rounded-lg
    expect(result.code).toMatch(/overflow:\s*hidden/);
    expect(result.code).toMatch(/gap:\s*var\(--spacing-2\)/); // gap-2

    // Validate CSS variables are defined
    expect(result.code).toMatch(/--spacing-2:\s*0\.5rem/);
    expect(result.code).toMatch(/--spacing-4:\s*1rem/);
    expect(result.code).toMatch(/--radius-lg:\s*0\.5rem/);
  });
});
