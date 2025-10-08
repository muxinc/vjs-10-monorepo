import { describe, expect, it } from 'vitest';
import { parseSource } from '../../../src/core/parser/parseSource.js';
import { extractImports } from '../../../src/core/parser/extractImports.js';

describe('extractImports', () => {
  it('extracts named imports', () => {
    const source = `
      import { MediaContainer, PlayButton } from '@vjs-10/react';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('@vjs-10/react');
    expect(imports[0].specifiers).toEqual(['MediaContainer', 'PlayButton']);
    expect(imports[0].defaultImport).toBeUndefined();
    expect(imports[0].isTypeOnly).toBe(false);
  });

  it('extracts default import', () => {
    const source = `
      import styles from './styles';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('./styles');
    expect(imports[0].specifiers).toEqual([]);
    expect(imports[0].defaultImport).toBe('styles');
  });

  it('extracts mixed default and named imports', () => {
    const source = `
      import React, { useState } from 'react';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('react');
    expect(imports[0].specifiers).toEqual(['useState']);
    expect(imports[0].defaultImport).toBe('React');
  });

  it('extracts namespace import', () => {
    const source = `
      import * as Icons from '@vjs-10/react-icons';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('@vjs-10/react-icons');
    expect(imports[0].defaultImport).toBe('Icons');
  });

  it('extracts type-only imports', () => {
    const source = `
      import type { Props } from './types';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('./types');
    expect(imports[0].isTypeOnly).toBe(true);
  });

  it('extracts multiple imports', () => {
    const source = `
      import { MediaContainer, PlayButton } from '@vjs-10/react';
      import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
      import styles from './styles';
      import type { SkinProps } from './types';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(4);

    expect(imports[0].source).toBe('@vjs-10/react');
    expect(imports[0].specifiers).toEqual(['MediaContainer', 'PlayButton']);

    expect(imports[1].source).toBe('@vjs-10/react-icons');
    expect(imports[1].specifiers).toEqual(['PlayIcon', 'PauseIcon']);

    expect(imports[2].source).toBe('./styles');
    expect(imports[2].defaultImport).toBe('styles');

    expect(imports[3].source).toBe('./types');
    expect(imports[3].isTypeOnly).toBe(true);
  });

  it('handles renamed imports', () => {
    const source = `
      import { MediaContainer as Container } from '@vjs-10/react';
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toHaveLength(1);
    expect(imports[0].specifiers).toEqual(['MediaContainer']);
  });

  it('returns empty array for no imports', () => {
    const source = `
      export default function Component() {
        return <div />;
      }
    `;

    const ast = parseSource(source);
    const imports = extractImports(ast);

    expect(imports).toEqual([]);
  });
});
