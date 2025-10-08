/**
 * Unit tests for className usage analysis
 */

import { describe, expect, it } from 'vitest';
import { parseSource } from '../../../src/core/parser/parseSource.js';
import { analyzeClassNameUsage } from '../../../src/core/analysis/analyzeClassNameUsage.js';

describe('analyzeClassNameUsage', () => {
  it('identifies style import usage', () => {
    const source = `
      import styles from './styles';
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton className={styles.Button} />;
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'PlayButton']);

    const stylesUsage = result.imports.find((u) => u.name === 'styles');
    expect(stylesUsage?.usageType).toBe('className-access');
  });

  it('tracks which components style keys are applied to', () => {
    const source = `
      import styles from './styles';
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton className={styles.Button} />;
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'PlayButton']);

    expect(result.styleKeys).toHaveLength(1);
    expect(result.styleKeys[0]).toMatchObject({
      key: 'Button',
      usedOn: ['PlayButton'],
    });
  });

  it('handles template literal className', () => {
    const source = `
      import styles from './styles';
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton className={\`\${styles.Button} \${styles.Icon}\`} />;
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'PlayButton']);

    expect(result.styleKeys).toHaveLength(2);

    const button = result.styleKeys.find((sk) => sk.key === 'Button');
    expect(button?.usedOn).toContain('PlayButton');

    const icon = result.styleKeys.find((sk) => sk.key === 'Icon');
    expect(icon?.usedOn).toContain('PlayButton');
  });

  it('handles conditional className', () => {
    const source = `
      import styles from './styles';
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton className={isActive ? styles.Active : styles.Inactive} />;
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'PlayButton']);

    expect(result.styleKeys).toHaveLength(2);

    const active = result.styleKeys.find((sk) => sk.key === 'Active');
    expect(active?.usedOn).toContain('PlayButton');

    const inactive = result.styleKeys.find((sk) => sk.key === 'Inactive');
    expect(inactive?.usedOn).toContain('PlayButton');
  });

  it('tracks style keys used on multiple components', () => {
    const source = `
      import styles from './styles';
      import { PlayButton, PauseButton } from './components';

      export default function Skin() {
        return (
          <>
            <PlayButton className={styles.Button} />
            <PauseButton className={styles.Button} />
          </>
        );
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'PlayButton', 'PauseButton']);

    expect(result.styleKeys).toHaveLength(1);
    expect(result.styleKeys[0]?.usedOn).toContain('PlayButton');
    expect(result.styleKeys[0]?.usedOn).toContain('PauseButton');
  });

  it('handles compound components', () => {
    const source = `
      import styles from './styles';
      import { TimeRange } from './components';

      export default function Skin() {
        return (
          <TimeRange.Root className={styles.RangeRoot}>
            <TimeRange.Track className={styles.RangeTrack} />
          </TimeRange.Root>
        );
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['styles', 'TimeRange']);

    expect(result.styleKeys).toHaveLength(2);

    const root = result.styleKeys.find((sk) => sk.key === 'RangeRoot');
    expect(root?.usedOn).toContain('TimeRange.Root');

    const track = result.styleKeys.find((sk) => sk.key === 'RangeTrack');
    expect(track?.usedOn).toContain('TimeRange.Track');
  });

  it('ignores string literal className', () => {
    const source = `
      import { PlayButton } from './components';

      export default function Skin() {
        return <PlayButton className="static-class" />;
      }
    `;

    const ast = parseSource(source);
    const result = analyzeClassNameUsage(ast, ['PlayButton']);

    expect(result.styleKeys).toHaveLength(0);
  });
});
