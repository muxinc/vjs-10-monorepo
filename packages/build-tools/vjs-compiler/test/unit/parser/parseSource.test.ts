import { describe, expect, it } from 'vitest';
import { parseSource } from '../../../src/core/parser/parseSource.js';

describe('parseSource', () => {
  it('parses simple TypeScript code', () => {
    const source = `
      const x = 42;
      export default x;
    `;

    const ast = parseSource(source);

    expect(ast).toBeDefined();
    expect(ast.type).toBe('File');
    expect(ast.program).toBeDefined();
    expect(ast.program.body).toHaveLength(2);
  });

  it('parses JSX code', () => {
    const source = `
      import React from 'react';

      export default function Component() {
        return <div>Hello</div>;
      }
    `;

    const ast = parseSource(source);

    expect(ast).toBeDefined();
    expect(ast.type).toBe('File');
    // Should not throw
  });

  it('parses TypeScript with types', () => {
    const source = `
      interface Props {
        name: string;
      }

      export default function Component({ name }: Props) {
        return <div>{name}</div>;
      }
    `;

    const ast = parseSource(source);

    expect(ast).toBeDefined();
    expect(ast.type).toBe('File');
  });

  it('parses React component with imports', () => {
    const source = `
      import { MediaContainer, PlayButton } from '@vjs-10/react';
      import styles from './styles';

      export default function MinimalSkin({ children }) {
        return (
          <MediaContainer className={styles.Container}>
            {children}
            <PlayButton className={styles.Button} />
          </MediaContainer>
        );
      }
    `;

    const ast = parseSource(source);

    expect(ast).toBeDefined();
    expect(ast.program.body.length).toBeGreaterThan(0);
  });
});
