/**
 * End-to-end browser tests for Phase 3
 *
 * Validates:
 * 1. Browser loadability (no console errors)
 * 2. CSS generation produces valid CSS
 * 3. Visual rendering works
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { compileSkin } from '../../src/pipelines/compileSkin.js';
import type { CompileSkinConfig } from '../../src/types.js';
import {
  setupE2ETest,
  teardownE2ETest,
  loadTestPageWithSkin,
  validateNoConsoleErrors,
  type E2ETestContext,
} from './setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../fixtures');

describe('Phase 3: Browser E2E Tests', () => {
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
    await loadTestPageWithSkin(
      context.webComponentPage,
      context.serverUrl,
      result.code,
      result.tagName
    );

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

    // TODO: Add CSS computed styles validation
    // Currently blocked by missing usage analysis and categorization layers.
    // Issue: CSS has `.Container` but HTML has `class="container"` (lowercase)
    // Need to implement proper selector categorization:
    // - Component Selector Identifier (exact match) → element selector
    // - Component Type Selector (suffix pattern) → class selector
    // - Generic Selector (no match) → class selector
    // See: docs/compiler-architecture.md "Module Relationships & Usage Analysis"
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
    await loadTestPageWithSkin(
      context.webComponentPage,
      context.serverUrl,
      result.code,
      result.tagName
    );

    // Validate component rendered
    const componentExists = await context.webComponentPage.evaluate((tagName) => {
      const el = document.querySelector(tagName);
      return !!el && !!el.shadowRoot;
    }, result.tagName);

    expect(componentExists).toBe(true);
  }, 30000);
});
