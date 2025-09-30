/**
 * End-to-end browser tests for Phase 3
 *
 * Validates:
 * 1. Browser loadability (no console errors)
 * 2. CSS generation produces valid CSS
 * 3. Visual rendering works
 */

import type { CompileSkinConfig } from '../../src/types.js';
import type { E2ETestContext } from './setup.js';

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { compileSkin } from '../../src/pipelines/compileSkin.js';
import { loadTestPageWithSkin, setupE2ETest, teardownE2ETest, validateNoConsoleErrors } from './setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../fixtures');

describe('phase 3: Browser E2E Tests', () => {
  let context: E2ETestContext;

  beforeAll(async () => {
    context = await setupE2ETest();
  });

  afterAll(async () => {
    if (context) {
      await teardownE2ETest(context);
    }
  });

  it('compiled web component loads in browser without errors', async () => {
    // Read fixture files
    const skinSource = readFileSync(join(fixturesDir, 'minimal-skin.tsx'), 'utf-8');
    const stylesSource = readFileSync(join(fixturesDir, 'minimal-styles.ts'), 'utf-8');

    // Compile
    const config: CompileSkinConfig = {
      skinSource,
      stylesSource,
      paths: {
        skinPath: '/packages/react/react/src/skins/minimal/MediaSkinMinimal.tsx',
        stylesPath: '/packages/react/react/src/skins/minimal/styles.ts',
        outputPath: '/packages/html/html/src/skins/compiled/inline/media-skin-minimal.ts',
        sourcePackage: {
          name: '@vjs-10/react',
          rootPath: '/packages/react/react/src',
        },
        targetPackage: {
          name: '@vjs-10/html',
          rootPath: '/packages/html/html/src',
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

    // Load test page with compiled skin
    await loadTestPageWithSkin(context.webComponentPage, context.serverUrl, result.code, result.tagName);

    // Validate no console errors
    await validateNoConsoleErrors(context.webComponentPage, 'Web Component Page');

    // Validate component exists in DOM
    const componentExists = await context.webComponentPage.evaluate((tagName) => {
      return !!document.querySelector(tagName);
    }, result.tagName);

    expect(componentExists).toBe(true);

    // Validate shadow DOM exists
    const hasShadowRoot = await context.webComponentPage.evaluate((tagName) => {
      const el = document.querySelector(tagName);
      return el && !!el.shadowRoot;
    }, result.tagName);

    expect(hasShadowRoot).toBe(true);

    // Validate CSS was applied
    const hasStyles = await context.webComponentPage.evaluate((tagName) => {
      const el = document.querySelector(tagName) as HTMLElement;
      if (!el || !el.shadowRoot) return false;

      const styleEl = el.shadowRoot.querySelector('style');
      return styleEl && styleEl.textContent && styleEl.textContent.length > 0;
    }, result.tagName);

    expect(hasStyles).toBe(true);

    // Validate CSS computed styles are correctly applied
    // Now that categorization is implemented, verify element selectors work
    const computedStyles = await context.webComponentPage.evaluate((tagName) => {
      const el = document.querySelector(tagName) as HTMLElement;
      if (!el || !el.shadowRoot) return null;

      // Find the media-container element inside shadow DOM
      const container = el.shadowRoot.querySelector('media-container') as HTMLElement;
      if (!container) return null;

      const styles = window.getComputedStyle(container);
      return {
        position: styles.position,
        display: styles.display,
      };
    }, result.tagName);

    expect(computedStyles).toBeTruthy();
    expect(computedStyles?.position).toBe('relative'); // from styles.Container → media-container { position: relative }
  }, 30000); // 30 second timeout for browser tests

  it('validates CSS contains expected properties', async () => {
    const skinSource = `
      import { MediaContainer } from '@vjs-10/react';
      import styles from './styles';

      export default function TestSkin() {
        return (
          <MediaContainer className={styles.Container}>
            <div className={styles.Content}>Test</div>
          </MediaContainer>
        );
      }
    `;

    const stylesSource = `
      const styles = {
        Container: 'relative flex',
        Content: 'flex',
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

    // Validate generated CSS contains expected properties
    expect(result.code).toMatch(/position:\s*relative/);
    expect(result.code).toMatch(/display:\s*flex/);

    // Load test page with compiled skin
    await loadTestPageWithSkin(context.webComponentPage, context.serverUrl, result.code, result.tagName);

    // Validate component rendered
    const componentExists = await context.webComponentPage.evaluate((tagName) => {
      const el = document.querySelector(tagName);
      return !!el && !!el.shadowRoot;
    }, result.tagName);

    expect(componentExists).toBe(true);
  }, 30000);
});
