import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compileReactToReactWithCSSModules } from '../src/index.js';
import { validateTypeScriptWithESLint } from './utils/outputValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('compileReactToReactWithCSSModules', () => {
  it('transforms basic styles import', () => {
    const source = `
      import styles from './styles';

      export const Button = () => <button className={styles.Button}>Click</button>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('import styles from "./styles.module.css"');
    expect(result).toContain('className={styles.Button}');
  });

  it('transforms relative path styles import', () => {
    const source = `
      import styles from '../shared/styles';

      export const Component = () => <div className={styles.Container}>Content</div>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('import styles from "../shared/styles.module.css"');
  });

  it('preserves existing .module.css imports', () => {
    const source = `
      import styles from './styles.module.css';

      export const Component = () => <div className={styles.Container}>Content</div>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain("import styles from './styles.module.css'");
    // Should not double-add .module.css
    expect(result).not.toContain('.module.css.module.css');
  });

  it('preserves existing .css imports', () => {
    const source = `
      import './global.css';
      import styles from './styles';

      export const Component = () => <div className={styles.Container}>Content</div>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain("import './global.css'");
    expect(result).toContain('import styles from "./styles.module.css"');
  });

  it('only transforms the styles import that matches the identifier', () => {
    const source = `
      import styles from './styles';
      import otherStyles from './other-styles';

      export const Component = () => <div className={styles.Container}>Content</div>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    // Should transform the one used (styles)
    expect(result).toContain('import styles from "./styles.module.css"');
    // Should also transform other style-like imports
    expect(result).toContain('import otherStyles from "./other-styles.module.css"');
  });

  it('preserves JSX structure unchanged', () => {
    const source = `
      import styles from './styles';

      export const Card = ({ title, children }) => (
        <div className={styles.Card}>
          <h2 className={styles.Title}>{title}</h2>
          <div className={styles.Content}>{children}</div>
        </div>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('<div className={styles.Card}>');
    expect(result).toContain('<h2 className={styles.Title}>{title}</h2>');
    expect(result).toContain('<div className={styles.Content}>{children}</div>');
  });

  it('preserves template literal classNames', () => {
    const source = `
      import styles from './styles';

      export const Button = ({ variant }) => (
        <button className={\`\${styles.Button} \${styles[variant]}\`}>
          Click
        </button>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('styles.Button');
    expect(result).toContain('styles[variant]');
  });

  it('preserves non-styles imports', () => {
    const source = `
      import React from 'react';
      import { useState } from 'react';
      import styles from './styles';
      import { Button } from './Button';

      export const Component = () => <Button className={styles.Button}>Click</Button>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain("import React from 'react'");
    expect(result).toContain("import { useState } from 'react'");
    expect(result).toContain('import styles from "./styles.module.css"');
    expect(result).toContain("import { Button } from './Button'");
  });

  it('preserves TypeScript types', () => {
    const source = `
      import type { FC } from 'react';
      import styles from './styles';

      interface Props {
        title: string;
      }

      export const Component: FC<Props> = ({ title }) => (
        <div className={styles.Container}>{title}</div>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain("import type { FC } from 'react'");
    expect(result).toContain('interface Props');
    expect(result).toContain('FC<Props>');
  });

  it('preserves comments', () => {
    const source = `
      // Component imports
      import styles from './styles';

      /**
       * A button component
       */
      export const Button = () => (
        // Main button element
        <button className={styles.Button}>
          {/* Button text */}
          Click
        </button>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('Component imports');
    expect(result).toContain('A button component');
  });

  it('handles component without styles', () => {
    const source = `
      import React from 'react';

      export const Component = () => <div>No styles</div>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('<div>No styles</div>');
  });

  it('handles default export', () => {
    const source = `
      import styles from './styles';

      export default function Button() {
        return <button className={styles.Button}>Click</button>;
      }
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('export default function Button()');
    expect(result).toContain('import styles from "./styles.module.css"');
  });

  it('handles named import alias', () => {
    const source = `
      import buttonStyles from './button-styles';

      export const Button = () => <button className={buttonStyles.Primary}>Click</button>;
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('import buttonStyles from "./button-styles.module.css"');
    expect(result).toContain('buttonStyles.Primary');
  });
});

describe('compileReactToReactWithCSSModules - Real World', () => {
  it('transforms MediaSkinDefault.tsx correctly', () => {
    const skinPath = join(__dirname, '../../../react/react/src/skins/default/MediaSkinDefault.tsx');
    const source = readFileSync(skinPath, 'utf-8');

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();

    // Should transform the styles import
    expect(result).toContain('import styles from "./styles.module.css"');

    // Should preserve all other imports
    expect(result).toContain('@vjs-10/react-icons');
    expect(result).toContain('CurrentTimeDisplay');
    expect(result).toContain('MediaContainer');

    // Should preserve JSX structure
    expect(result).toContain('MediaContainer');
    expect(result).toContain('TimeRange.Root');
    expect(result).toContain('VolumeRange.Root');

    // Should preserve className usage
    expect(result).toContain('className={styles');
    expect(result).toContain('className={`${styles');
  });

  it('generates valid TypeScript output', async () => {
    const source = `
      import type { FC, PropsWithChildren } from 'react';
      import styles from './styles';

      interface Props {
        className?: string;
      }

      export const Component: FC<PropsWithChildren<Props>> = ({ children, className }) => (
        <div className={\`\${styles.Container} \${className}\`}>
          {children}
        </div>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();

    // Validate with ESLint
    const validation = await validateTypeScriptWithESLint(result!);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

describe('compileReactToReactWithCSSModules - Edge Cases', () => {
  it('returns null for invalid source', () => {
    const result = compileReactToReactWithCSSModules('this is not valid code {{{');
    expect(result).toBeNull();
  });

  it('handles empty source', () => {
    const result = compileReactToReactWithCSSModules('');
    expect(result).not.toBeNull();
    expect(result).toBe('');
  });

  it('handles source with only imports', () => {
    const source = `
      import styles from './styles';
      import React from 'react';
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('import styles from "./styles.module.css"');
  });

  it('handles multiple template literals in className', () => {
    const source = `
      import styles from './styles';

      export const Component = ({ isActive, variant }) => (
        <div className={\`\${styles.Base} \${isActive ? styles.Active : ''} \${styles[variant]}\`}>
          Content
        </div>
      );
    `;

    const result = compileReactToReactWithCSSModules(source);

    expect(result).not.toBeNull();
    expect(result).toContain('styles.Base');
    expect(result).toContain('styles.Active');
    expect(result).toContain('styles[variant]');
  });
});
