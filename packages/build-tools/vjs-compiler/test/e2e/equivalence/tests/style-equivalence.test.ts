/**
 * E2E Test: Computed Style Equivalence
 *
 * Validates that computed styles match between React and Web Component versions
 * across various states and conditions.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { ElementMatcher } from '../utils/element-matcher.js';
import { StateSimulator } from '../utils/state-simulator.js';
import { CRITICAL_STYLE_PROPERTIES, StyleComparator } from '../utils/style-comparator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Computed Style Equivalence', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('initial render styles match', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      // Get all critical elements
      const elements = await matcher.getAllCriticalElements();

      // Wait for videos to be ready
      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Compare styles for each element
      for (const elementPair of elements) {
        const result = await comparator.compareStyles(elementPair.react, elementPair.wc);

        // Log detailed comparison
        if (!result.matches) {
          console.log(comparator.formatComparisonResult(result, elementPair.id));
        }

        // Should match with high percentage
        expect(
          result.matchPercentage,
          `${elementPair.id}: ${result.matchPercentage.toFixed(1)}% match (expected >95%)`
        ).toBeGreaterThan(95);
      }
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('paused state styles match', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Ensure both are paused
      await Promise.all([simulator.pause(videoElements.react), simulator.pause(videoElements.wc)]);

      await reactPage.waitForTimeout(100);

      // Get play button for comparison
      const playButton = await matcher.getPlayButton();

      // Compare button styles in paused state
      const result = await comparator.compareStyles(playButton.react, playButton.wc);

      if (!result.matches) {
        console.log(comparator.formatComparisonResult(result, 'play-button-paused'));
      }

      expect(result.matchPercentage).toBeGreaterThan(95);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('playing state styles match', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Play both videos
      await Promise.all([simulator.play(videoElements.react), simulator.play(videoElements.wc)]);

      await reactPage.waitForTimeout(100);

      // Get play button for comparison
      const playButton = await matcher.getPlayButton();

      // Compare button styles in playing state
      const result = await comparator.compareStyles(playButton.react, playButton.wc);

      if (!result.matches) {
        console.log(comparator.formatComparisonResult(result, 'play-button-playing'));
      }

      expect(result.matchPercentage).toBeGreaterThan(95);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('hover state styles match', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Get controls container
      const controls = await matcher.getControlsContainer();

      // Simulate hover on both
      await Promise.all([simulator.simulateHover(controls.react, true), simulator.simulateHover(controls.wc, true)]);

      await reactPage.waitForTimeout(100);

      // Compare styles during hover
      const result = await comparator.compareStyles(controls.react, controls.wc);

      if (!result.matches) {
        console.log(comparator.formatComparisonResult(result, 'controls-hover'));
      }

      expect(result.matchPercentage).toBeGreaterThan(95);

      // Remove hover
      await Promise.all([simulator.simulateHover(controls.react, false), simulator.simulateHover(controls.wc, false)]);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('focus state styles match', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Get play button
      const playButton = await matcher.getPlayButton();

      // Focus both buttons
      await Promise.all([
        simulator.simulateFocus(playButton.react, true),
        simulator.simulateFocus(playButton.wc, true),
      ]);

      await reactPage.waitForTimeout(100);

      // Compare styles during focus
      const result = await comparator.compareStyles(playButton.react, playButton.wc);

      if (!result.matches) {
        console.log(comparator.formatComparisonResult(result, 'play-button-focus'));
      }

      expect(result.matchPercentage).toBeGreaterThan(95);

      // Remove focus
      await Promise.all([
        simulator.simulateFocus(playButton.react, false),
        simulator.simulateFocus(playButton.wc, false),
      ]);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('layout properties match across all elements', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      const elements = await matcher.getAllCriticalElements();

      // Test only layout properties
      const layoutProperties = CRITICAL_STYLE_PROPERTIES.layout;

      for (const elementPair of elements) {
        const result = await comparator.compareStyles(elementPair.react, elementPair.wc, layoutProperties);

        if (!result.matches) {
          console.log(comparator.formatComparisonResult(result, `${elementPair.id}-layout`));
        }

        // Layout properties should match exactly
        expect(
          result.matches,
          `${elementPair.id} layout mismatch: ${result.differences.map((d) => d.property).join(', ')}`
        ).toBe(true);
      }
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('visual properties match across all elements', async ({ browser }) => {
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      const matcher = new ElementMatcher({ reactPage, wcPage });
      const comparator = new StyleComparator();
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      const elements = await matcher.getAllCriticalElements();

      // Test only visual properties
      const visualProperties = CRITICAL_STYLE_PROPERTIES.visual;

      for (const elementPair of elements) {
        const result = await comparator.compareStyles(elementPair.react, elementPair.wc, visualProperties);

        if (!result.matches) {
          console.log(comparator.formatComparisonResult(result, `${elementPair.id}-visual`));
        }

        // Visual properties should match with high percentage
        expect(
          result.matchPercentage,
          `${elementPair.id} visual: ${result.matchPercentage.toFixed(1)}% match`
        ).toBeGreaterThan(90);
      }
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });
});
