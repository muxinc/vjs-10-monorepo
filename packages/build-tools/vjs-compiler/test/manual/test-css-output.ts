/**
 * Manual test to inspect CSS output
 */

import { compileSkin } from '../../src/pipelines/compileSkin.js';
import type { CompileSkinConfig } from '../../src/types.js';

const skinSource = `
  import { MediaContainer } from '@vjs-10/react';
  import styles from './styles';

  export default function TestSkin() {
    return (
      <MediaContainer className={styles.Container}>
        <div>Test</div>
      </MediaContainer>
    );
  }
`;

const stylesSource = `
  const styles = {
    Container: 'flex gap-2 p-4 bg-white',
  };
  export default styles;
`;

const config: CompileSkinConfig = {
  skinSource,
  stylesSource,
  paths: {
    skinPath: '/test.tsx',
    stylesPath: '/styles.ts',
    outputPath: '/output.ts',
    sourcePackage: { name: '@vjs-10/react', rootPath: '/src' },
    targetPackage: { name: '@vjs-10/html', rootPath: '/dist' },
  },
  moduleType: 'skin',
  input: { format: 'react', typescript: true },
  output: { format: 'web-component', css: 'inline', typescript: true },
};

const result = await compileSkin(config);
console.log('=== GENERATED CODE ===\n');
console.log(result.code);
