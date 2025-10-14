/**
 * E2E Test: Level 1 - Minimal Skin
 *
 * Tests basic compiler functionality:
 * - React → WC transformation
 * - Browser loading (no console errors)
 * - Basic rendering (button visible)
 * - Simple styling (padding, border-radius, colors)
 */

import { test, expect } from '@playwright/test';
import { compareScreenshots, saveComparisonArtifacts, assertVisualEquivalence } from '../app/src/test-utils/visual-comparison';

test.describe('Level 1: Minimal Skin', () => {
  test('React version loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/src/react/01-minimal.html');

    // Wait for React to render - React components render as regular DOM elements
    await page.waitForSelector('video', { timeout: 5000 });

    // Check for console errors
    expect(errors).toHaveLength(0);

    // Check that play button exists (React renders as <button>)
    const playButton = page.locator('button');
    await expect(playButton).toBeVisible();

    // Check that video exists
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });

  test('Web Component version loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/src/wc/01-minimal.html');

    // Wait for custom element to register and render
    await page.waitForSelector('media-skin-minimal', { timeout: 5000 });

    // Check for console errors
    expect(errors).toHaveLength(0);

    // Check that play button exists
    const playButton = page.locator('media-play-button');
    await expect(playButton).toBeVisible();

    // Check that icon exists
    const icon = page.locator('media-play-icon');
    await expect(icon).toBeVisible();
  });

  test('Visual equivalence: React vs WC', async ({ page, browser }) => {
    // Open both pages in separate contexts
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    // Load both pages
    await reactPage.goto('/src/react/01-minimal.html');
    await wcPage.goto('/src/wc/01-minimal.html');

    // Wait for both to render
    await reactPage.waitForSelector('video'); // React: regular DOM elements
    await wcPage.waitForSelector('media-play-button'); // WC: custom elements

    // Wait a moment for static video to load
    // Static video is 1-second long and loads instantly
    await reactPage.waitForTimeout(500);
    await wcPage.waitForTimeout(500);

    // Take screenshots - use video element as common ancestor
    const reactScreenshot = await reactPage.locator('video').screenshot();
    const wcScreenshot = await wcPage.locator('video').screenshot();

    // Pixel-diff comparison
    const result = compareScreenshots(reactScreenshot, wcScreenshot, {
      threshold: 0.1,
      includeAA: false
    });

    // Save artifacts if there's any difference (for debugging)
    if (result.percentDiff > 0) {
      saveComparisonArtifacts(
        reactScreenshot,
        wcScreenshot,
        result,
        'minimal-skin',
        'test-results/visual-diffs'
      );
    }

    // Assert visual equivalence (< 2% difference)
    assertVisualEquivalence(result, 2.0);

    // Cleanup
    await reactContext.close();
    await wcContext.close();
  });

  test('Button styling is applied (React)', async ({ page }) => {
    await page.goto('/src/react/01-minimal.html');
    await page.waitForSelector('button');

    const button = page.locator('button');

    // Check computed styles
    const styles = await button.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        display: computed.display,
      };
    });

    // Should have padding (p-3 = 0.75rem = 12px)
    expect(styles.padding).toBeTruthy();

    // Should have border-radius (rounded-full = 9999px)
    expect(styles.borderRadius).toBeTruthy();

    // Should have display flex
    expect(styles.display).toBe('flex');
  });

  test('Button styling is applied (WC)', async ({ page }) => {
    await page.goto('/src/wc/01-minimal.html');
    await page.waitForSelector('media-play-button');

    const button = page.locator('media-play-button');

    // Check computed styles
    const styles = await button.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        display: computed.display,
      };
    });

    // Should have padding (p-3 = 0.75rem = 12px)
    expect(styles.padding).toBeTruthy();

    // Should have border-radius (rounded-full = 9999px)
    expect(styles.borderRadius).toBeTruthy();

    // Should have display flex
    expect(styles.display).toBe('flex');
  });

  test('Custom element is registered (WC)', async ({ page }) => {
    await page.goto('/src/wc/01-minimal.html');

    const isRegistered = await page.evaluate(() => {
      return customElements.get('media-skin-minimal') !== undefined;
    });

    expect(isRegistered).toBe(true);
  });
});
