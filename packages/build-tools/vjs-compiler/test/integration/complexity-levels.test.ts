/**
 * Integration Test: Complexity Levels
 *
 * Tests compilation at increasing complexity levels to ensure
 * the compiler handles progressively more complex patterns.
 *
 * Level 1 (Simple): Single elements, basic utilities
 * Level 2 (Medium): Nesting, pseudo-classes, data attributes
 * Level 3 (Complex): Arbitrary variants, container queries, group variants
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('complexity Levels', () => {
  // Helper to create minimal test config
  function createTestConfig(skinSource: string, stylesSource: string): CompileSkinConfig {
    return {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/test/TestSkin.tsx',
        stylesPath: '/test/styles.ts',
        outputPath: '/test/output.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/packages/react',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/packages/html',
        },
      },
      moduleType: 'skin',
      input: { format: 'react', typescript: true },
      output: { format: 'web-component', css: 'inline', typescript: true },
    };
  }

  describe('level 1: Simple Transformations', () => {
    it('compiles single element with single utility class', async () => {
      const skinSource = `
        import styles from './styles';
        export default function SimpleSkin() {
          return <div className={styles.Container}>Test</div>;
        }
      `;

      const stylesSource = `
        export default {
          Container: 'p-4',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate valid code
      expect(result.code).toContain('class="container"');
      expect(result.code).toContain('<div');
      expect(result.code).toContain('</div>');

      // Should generate CSS for p-4 (using CSS variables)
      expect(result.code).toMatch(/padding.*var\(--spacing-4\)/);
    });

    it('compiles single element with multiple utility classes', async () => {
      const skinSource = `
        import styles from './styles';
        export default function SimpleSkin() {
          return <div className={styles.Container}>Test</div>;
        }
      `;

      const stylesSource = `
        export default {
          Container: 'p-4 bg-white rounded-lg',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate CSS for all utilities (using CSS variables)
      expect(result.code).toMatch(/padding.*var\(--spacing-4\)/);
      expect(result.code).toMatch(/border-radius.*var\(--radius-lg\)/);
    });

    it('compiles nested elements with simple classes', async () => {
      const skinSource = `
        import styles from './styles';
        export default function SimpleSkin() {
          return (
            <div className={styles.Outer}>
              <span className={styles.Inner}>Text</span>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Outer: 'p-4',
          Inner: 'text-sm',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('<div class="outer">');
      expect(result.code).toContain('<span class="inner">');
      expect(result.code).toContain('</span>');
      expect(result.code).toContain('</div>');
    });

    it('compiles element without className', async () => {
      const skinSource = `
        import styles from './styles';
        export default function SimpleSkin() {
          return <div>No styles</div>;
        }
      `;

      const stylesSource = `export default {};`;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('<div>No styles</div>');
    });
  });

  describe('level 2: Medium Complexity', () => {
    it('compiles with :hover pseudo-class', async () => {
      const skinSource = `
        import styles from './styles';
        export default function MediumSkin() {
          return <button className={styles.Button}>Click</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 hover:bg-blue-600',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :hover selector
      expect(result.code).toMatch(/:hover/);
    });

    it('compiles with :focus-visible pseudo-class', async () => {
      const skinSource = `
        import styles from './styles';
        export default function MediumSkin() {
          return <button className={styles.Button}>Click</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'outline-none focus-visible:ring-2',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :focus-visible selector
      expect(result.code).toMatch(/:focus-visible/);
    });

    it('compiles with [data-state] selector', async () => {
      const skinSource = `
        import styles from './styles';
        export default function MediumSkin() {
          return <button className={styles.Button} data-state="active">Click</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-gray-500 data-[state=active]:bg-blue-500',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should have data-state attribute
      expect(result.code).toContain('data-state="active"');

      // Should generate CSS with data attribute selector
      // Note: Tailwind v4 data-[state=active] syntax
      expect(result.code).toMatch(/\[data-state.*active/);
    });

    it('compiles template literal className with multiple styles', async () => {
      const skinSource = `
        import styles from './styles';
        export default function MediumSkin() {
          return <div className={\`\${styles.Base} \${styles.Variant}\`}>Test</div>;
        }
      `;

      const stylesSource = `
        export default {
          Base: 'p-4',
          Variant: 'bg-white',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should resolve template literal to static classes
      expect(result.code).toContain('class="base variant"');
      expect(result.code).not.toMatch(/\$\{/); // No template literal syntax
    });

    it('compiles compound component pattern', async () => {
      const skinSource = `
        import { MediaContainer } from '@vjs-10/react';
        import styles from './styles';

        export default function MediumSkin() {
          return (
            <MediaContainer className={styles.Container}>
              <div className={styles.Inner}>Content</div>
            </MediaContainer>
          );
        }
      `;

      const stylesSource = `
        export default {
          Container: 'relative',
          Inner: 'absolute inset-0',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should transform to web component
      expect(result.code).toContain('<media-container>');
      expect(result.code).toContain('</media-container>');

      // Should have import for MediaContainer
      expect(result.code).toMatch(/import.*media-container/);
    });
  });

  describe('level 3: Complex Transformations', () => {
    it.skip('compiles arbitrary variant [&_selector]:utility (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function ComplexSkin() {
          return (
            <div className={styles.Parent}>
              <span className="child">Child</span>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Parent: '[&_.child]:text-blue-500',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate child selector CSS
      expect(result.code).toMatch(/\.parent\s+\.child/);
      expect(result.code).toMatch(/color.*blue/);
    });

    it.skip('compiles group variant with nesting (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function ComplexSkin() {
          return (
            <div className={styles.Group}>
              <span className={styles.Child}>Child</span>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Group: 'group',
          Child: 'opacity-0 group-hover:opacity-100',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate group hover CSS
      expect(result.code).toMatch(/\.group:hover.*\.child/);
    });

    it.skip('compiles container queries (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function ComplexSkin() {
          return <div className={styles.Responsive}>Content</div>;
        }
      `;

      const stylesSource = `
        export default {
          Responsive: '@container(min-width:400px):flex-row',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate container query
      expect(result.code).toMatch(/@container.*min-width.*400px/);
    });

    it.skip('compiles deeply nested arbitrary variants (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function ComplexSkin() {
          return (
            <div className={styles.Parent}>
              <div className="level1">
                <div className="level2">
                  <span className="target">Deep</span>
                </div>
              </div>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Parent: '[&_.level1_.level2_.target]:text-blue-500',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate deeply nested selector
      expect(result.code).toMatch(/\.parent\s+\.level1\s+\.level2\s+\.target/);
    });
  });

  describe('edge Cases', () => {
    it('handles empty className', async () => {
      const skinSource = `
        import styles from './styles';
        export default function EdgeCase() {
          return <div className="">Empty</div>;
        }
      `;

      const stylesSource = `export default {};`;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('<div>Empty</div>');
    });

    it('handles className without styles object reference', async () => {
      const skinSource = `
        export default function EdgeCase() {
          return <div className="plain-string">Static</div>;
        }
      `;

      const stylesSource = `export default {};`;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('class="plain-string"');
    });

    it('handles self-closing elements', async () => {
      const skinSource = `
        import styles from './styles';
        export default function EdgeCase() {
          return <div className={styles.Container}><br /></div>;
        }
      `;

      const stylesSource = `
        export default {
          Container: 'p-4',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Built-in elements can be self-closing
      expect(result.code).toMatch(/<br\s*\/>/);
    });

    it('handles elements without closing tags in React becoming explicit in HTML', async () => {
      const skinSource = `
        import { MediaContainer } from '@vjs-10/react';
        export default function EdgeCase() {
          return <MediaContainer />;
        }
      `;

      const stylesSource = `export default {};`;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Custom elements must have explicit closing tags
      expect(result.code).toContain('<media-container></media-container>');
    });
  });
});
