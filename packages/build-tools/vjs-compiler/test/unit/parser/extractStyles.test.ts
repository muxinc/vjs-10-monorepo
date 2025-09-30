import { describe, expect, it } from 'vitest';

import { extractStyles } from '../../../src/core/parser/extractStyles.js';
import { parseSource } from '../../../src/core/parser/parseSource.js';

describe('extractStyles', () => {
  it('extracts styles from const declaration', () => {
    const source = `
      const styles = {
        Container: 'relative',
        Controls: 'flex gap-2',
        Button: 'p-2 rounded',
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Container: 'relative',
      Controls: 'flex gap-2',
      Button: 'p-2 rounded',
    });
  });

  it('extracts styles from export default object', () => {
    const source = `
      export default {
        Container: 'relative',
        Controls: 'flex gap-2',
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Container: 'relative',
      Controls: 'flex gap-2',
    });
  });

  it('extracts styles from export default identifier', () => {
    const source = `
      const styles = {
        Container: 'relative',
        Controls: 'flex gap-2',
      };

      export default styles;
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Container: 'relative',
      Controls: 'flex gap-2',
    });
  });

  it('extracts styles with cn() helper', () => {
    const source = `
      function cn(...classes: string[]): string {
        return classes.join(' ');
      }

      const styles = {
        Button: cn('p-2', 'rounded', 'bg-white/10'),
        Icon: cn('size-6', 'shrink-0'),
      };

      export default styles;
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Button: 'p-2 rounded bg-white/10',
      Icon: 'size-6 shrink-0',
    });
  });

  it('extracts styles with nested cn() calls', () => {
    const source = `
      function cn(...classes: string[]): string {
        return classes.join(' ');
      }

      const styles = {
        Button: cn(
          'p-2 rounded',
          cn('bg-white/10', 'hover:bg-white/20')
        ),
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles?.Button).toContain('p-2');
    expect(styles?.Button).toContain('rounded');
  });

  it('extracts styles with template literals (no interpolation)', () => {
    const source = `
      const styles = {
        Button: \`p-2 rounded\`,
        Icon: \`size-6\`,
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Button: 'p-2 rounded',
      Icon: 'size-6',
    });
  });

  it('handles string literal keys', () => {
    const source = `
      const styles = {
        'Button': 'p-2',
        'my-special-key': 'flex',
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Button: 'p-2',
      'my-special-key': 'flex',
    });
  });

  it('skips non-string values', () => {
    const source = `
      const styles = {
        Button: 'p-2',
        SomeNumber: 42,
        SomeObject: { nested: 'value' },
      };
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles).toEqual({
      Button: 'p-2',
    });
  });

  it('returns null when no styles found', () => {
    const source = `
      const x = 42;
      export default x;
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).toBeNull();
  });

  it('extracts complex real-world example', () => {
    const source = `
      function cn(...classes: (string | undefined)[]): string {
        return classes.filter(Boolean).join(' ');
      }

      const styles = {
        MediaContainer: cn(
          'relative @container/root group/root overflow-clip',
          'text-sm'
        ),
        Controls: 'flex items-center gap-2',
        Button: cn(
          'p-2 rounded-full cursor-pointer',
          'bg-transparent text-white/90',
          'hover:bg-white/10'
        ),
        PlayButton: cn(
          '[&_.pause-icon]:opacity-100',
          '[&[data-paused]_.pause-icon]:opacity-0'
        ),
      };

      export default styles;
    `;

    const ast = parseSource(source);
    const styles = extractStyles(ast);

    expect(styles).not.toBeNull();
    expect(styles?.MediaContainer).toContain('relative');
    expect(styles?.MediaContainer).toContain('@container/root');
    expect(styles?.Controls).toBe('flex items-center gap-2');
    expect(styles?.Button).toContain('p-2');
    expect(styles?.Button).toContain('hover:bg-white/10');
    expect(styles?.PlayButton).toContain('[&_.pause-icon]:opacity-100');
  });
});
