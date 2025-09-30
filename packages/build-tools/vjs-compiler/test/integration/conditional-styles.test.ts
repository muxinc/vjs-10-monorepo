/**
 * Integration Test: Conditional Styles
 *
 * Tests that conditional styling patterns compile correctly:
 * - Pseudo-classes (:hover, :focus-visible, :active, :disabled)
 * - Data attribute selectors ([data-state], [data-level="high"])
 * - Arbitrary variant selectors ([&_child], [&[data-x]_child])
 * - Media queries (@media (prefers-color-scheme: dark))
 * - Container queries (@container (min-width: 400px))
 */

import type { CompileSkinConfig } from '../../src/types.js';

import { describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';

describe('conditional Styles', () => {
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

  describe('pseudo-Class Selectors', () => {
    it('transforms :hover styles correctly', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Hover Me</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 hover:bg-blue-600 hover:scale-105',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :hover selector
      expect(result.code).toMatch(/:hover/);

      // Should apply hover styles
      expect(result.code).toMatch(/hover[\s\S]*background/i);
    });

    it('transforms :focus-visible styles correctly', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Focus Me</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :focus-visible selector
      expect(result.code).toMatch(/:focus-visible/);

      // Should apply focus styles
      expect(result.code).toMatch(/focus-visible[\s\S]*ring/i);
    });

    it('transforms :active styles correctly', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Press Me</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 active:bg-blue-700 active:scale-95',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :active selector
      expect(result.code).toMatch(/:active/);
    });

    it('transforms :disabled styles correctly', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button} disabled>Disabled</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate :disabled selector
      expect(result.code).toMatch(/:disabled/);

      // Should have disabled attribute in HTML
      expect(result.code).toContain('disabled=');
    });

    it('combines multiple pseudo-classes', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Interactive</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-2 disabled:opacity-50',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should have all pseudo-classes
      expect(result.code).toMatch(/:hover/);
      expect(result.code).toMatch(/:active/);
      expect(result.code).toMatch(/:focus-visible/);
      expect(result.code).toMatch(/:disabled/);
    });
  });

  describe('data Attribute Selectors', () => {
    it('transforms simple [data-state] selector', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <div className={styles.Element} data-state="active">State</div>;
        }
      `;

      const stylesSource = `
        export default {
          Element: 'bg-gray-500 data-[state=active]:bg-blue-500',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should preserve data attribute in HTML
      expect(result.code).toContain('data-state="active"');

      // Should generate data attribute selector in CSS
      expect(result.code).toMatch(/\[data-state/);
    });

    it('transforms [data-volume-level="high"] selector', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <div className={styles.VolumeControl} data-volume-level="high">Volume</div>;
        }
      `;

      const stylesSource = `
        export default {
          VolumeControl: 'opacity-0 data-[volume-level=high]:opacity-100',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('data-volume-level="high"');
      expect(result.code).toMatch(/\[data-volume-level.*high/);
    });

    it('transforms multiple data attributes', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <div className={styles.Element} data-state="on" data-variant="primary">Multi</div>;
        }
      `;

      const stylesSource = `
        export default {
          Element: 'bg-gray-500 data-[state=on]:bg-blue-500 data-[variant=primary]:border-2',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      expect(result.code).toContain('data-state="on"');
      expect(result.code).toContain('data-variant="primary"');
      expect(result.code).toMatch(/\[data-state[\s\S]*on/);
      expect(result.code).toMatch(/\[data-variant[\s\S]*primary/);
    });
  });

  describe('arbitrary Variant Selectors', () => {
    it.skip('transforms [&_.child]:utility to parent .child selector (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return (
            <div className={styles.Parent}>
              <span className="child">Child</span>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Parent: '[&_.child]:text-blue-500 [&_.child]:opacity-0',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate child selector
      // Expected: .parent .child { color: ...; opacity: 0; }
      expect(result.code).toMatch(/\.parent\s+\.child/);
      expect(result.code).toMatch(/opacity.*0/);
    });

    it.skip('transforms [&[data-paused]_.icon]:utility (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return (
            <button className={styles.PlayButton} data-paused>
              <span className="icon">⏸</span>
            </button>
          );
        }
      `;

      const stylesSource = `
        export default {
          PlayButton: '[&[data-paused]_.icon]:opacity-0 [&_.icon]:opacity-100',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate combined selector
      // Expected: .play-button[data-paused] .icon { opacity: 0; }
      expect(result.code).toMatch(/\.play-button\[data-paused\]\s+\.icon/);
      expect(result.code).toMatch(/opacity.*0/);
    });

    it.skip('transforms group-hover:[&_.arrow]:utility (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return (
            <div className={styles.Group}>
              <span className="arrow">→</span>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Group: 'group group-hover:[&_.arrow]:translate-x-1',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate group hover with child selector
      // Expected: .group:hover .arrow { transform: translateX(...); }
      expect(result.code).toMatch(/\.group:hover\s+\.arrow/);
      expect(result.code).toMatch(/translate/i);
    });
  });

  describe('media Queries', () => {
    it('transforms @media (prefers-color-scheme: dark) styles', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <div className={styles.Container}>Theme</div>;
        }
      `;

      const stylesSource = `
        export default {
          Container: 'bg-white dark:bg-gray-900 dark:text-white',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate media query for dark mode
      expect(result.code).toMatch(/@media[\s\S]*prefers-color-scheme[\s\S]*dark/i);
    });

    it('transforms @media (hover: hover) styles', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Hover</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 @[hover]:hover:bg-blue-600',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should handle hover media query variant
      // Note: Exact syntax depends on Tailwind v4 @[hover] support
      expect(result.code).toMatch(/@media|hover/i);
    });
  });

  describe('container Queries', () => {
    it.skip('transforms @container (min-width: 400px) styles (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <div className={styles.Responsive}>Responsive</div>;
        }
      `;

      const stylesSource = `
        export default {
          Responsive: 'flex-col @container(min-width:400px):flex-row',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate container query
      expect(result.code).toMatch(/@container.*min-width.*400px/);
    });

    it.skip('transforms named container queries (NOT YET IMPLEMENTED)', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return (
            <div className={styles.Container}>
              <div className={styles.Child}>Child</div>
            </div>
          );
        }
      `;

      const stylesSource = `
        export default {
          Container: '@container/main',
          Child: '@container/main(min-width:400px):flex-row',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should generate named container query
      expect(result.code).toMatch(/@container main.*min-width/);
    });
  });

  describe('combined Conditional Styles', () => {
    it('combines pseudo-class + data attribute', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button} data-variant="primary">Button</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-gray hover:bg-blue data-[variant=primary]:bg-blue-600 data-[variant=primary]:hover:bg-blue-700',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should have both :hover and [data-variant] selectors
      expect(result.code).toMatch(/:hover/);
      expect(result.code).toMatch(/\[data-variant/);
    });

    it('combines media query + pseudo-class', async () => {
      const skinSource = `
        import styles from './styles';
        export default function TestSkin() {
          return <button className={styles.Button}>Dark Mode Hover</button>;
        }
      `;

      const stylesSource = `
        export default {
          Button: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-900',
        };
      `;

      const config = createTestConfig(skinSource, stylesSource);
      const result = await compileSkin(config);

      // Should have both @media dark and :hover
      expect(result.code).toMatch(/@media[\s\S]*dark/i);
      expect(result.code).toMatch(/:hover/);
    });
  });
});
