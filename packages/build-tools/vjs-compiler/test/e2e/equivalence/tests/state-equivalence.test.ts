/**
 * E2E Test: State Change Equivalence
 *
 * Validates that media state changes trigger equivalent data attribute updates
 * and media element state changes in both React and Web Component versions.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { ElementMatcher } from '../utils/element-matcher.js';
import { compareMediaStates, StateSimulator } from '../utils/state-simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('State Change Equivalence', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport size for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('play/pause state synchronization', async ({ browser }) => {
    // Create two browser contexts for parallel testing
    const reactContext = await browser.newContext();
    const wcContext = await browser.newContext();

    const reactPage = await reactContext.newPage();
    const wcPage = await wcContext.newPage();

    try {
      // Load test pages
      const reactPagePath = resolve(__dirname, '../pages/react-skin-default.html');
      const wcPagePath = resolve(__dirname, '../pages/wc-skin-default.html');

      await reactPage.goto(`file://${reactPagePath}`);
      await wcPage.goto(`file://${wcPagePath}`);

      // Initialize utilities
      const matcher = new ElementMatcher({ reactPage, wcPage });
      const simulator = new StateSimulator();

      // Get video elements
      const videoElements = await matcher.getVideoElement();

      // Wait for videos to be ready
      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Get initial state (both should be paused)
      const reactInitialState = await simulator.getMediaState(videoElements.react);
      const wcInitialState = await simulator.getMediaState(videoElements.wc);

      expect(reactInitialState.paused).toBe(true);
      expect(wcInitialState.paused).toBe(true);

      // Play both videos
      await Promise.all([simulator.play(videoElements.react), simulator.play(videoElements.wc)]);

      // Get playing state
      const reactPlayingState = await simulator.getMediaState(videoElements.react);
      const wcPlayingState = await simulator.getMediaState(videoElements.wc);

      // Compare states
      const playingComparison = compareMediaStates(reactPlayingState, wcPlayingState);
      expect(playingComparison.matches, `Playing state mismatch: ${playingComparison.differences.join(', ')}`).toBe(
        true
      );

      // Verify both are playing
      expect(reactPlayingState.paused).toBe(false);
      expect(wcPlayingState.paused).toBe(false);

      // Pause both videos
      await Promise.all([simulator.pause(videoElements.react), simulator.pause(videoElements.wc)]);

      // Get paused state
      const reactPausedState = await simulator.getMediaState(videoElements.react);
      const wcPausedState = await simulator.getMediaState(videoElements.wc);

      // Compare states
      const pausedComparison = compareMediaStates(reactPausedState, wcPausedState);
      expect(pausedComparison.matches, `Paused state mismatch: ${pausedComparison.differences.join(', ')}`).toBe(true);

      // Verify both are paused
      expect(reactPausedState.paused).toBe(true);
      expect(wcPausedState.paused).toBe(true);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('mute/unmute state synchronization', async ({ browser }) => {
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
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();

      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Get initial mute state
      const reactInitialState = await simulator.getMediaState(videoElements.react);
      const wcInitialState = await simulator.getMediaState(videoElements.wc);

      expect(reactInitialState.muted).toBe(wcInitialState.muted);

      // Mute both videos
      await Promise.all([simulator.mute(videoElements.react), simulator.mute(videoElements.wc)]);

      // Wait a bit for state propagation
      await reactPage.waitForTimeout(100);

      // Get muted state
      const reactMutedState = await simulator.getMediaState(videoElements.react);
      const wcMutedState = await simulator.getMediaState(videoElements.wc);

      // Compare states
      const mutedComparison = compareMediaStates(reactMutedState, wcMutedState);
      expect(mutedComparison.matches, `Muted state mismatch: ${mutedComparison.differences.join(', ')}`).toBe(true);

      expect(reactMutedState.muted).toBe(true);
      expect(wcMutedState.muted).toBe(true);

      // Unmute both videos
      await Promise.all([simulator.unmute(videoElements.react), simulator.unmute(videoElements.wc)]);

      await reactPage.waitForTimeout(100);

      // Get unmuted state
      const reactUnmutedState = await simulator.getMediaState(videoElements.react);
      const wcUnmutedState = await simulator.getMediaState(videoElements.wc);

      // Compare states
      const unmutedComparison = compareMediaStates(reactUnmutedState, wcUnmutedState);
      expect(unmutedComparison.matches, `Unmuted state mismatch: ${unmutedComparison.differences.join(', ')}`).toBe(
        true
      );

      expect(reactUnmutedState.muted).toBe(false);
      expect(wcUnmutedState.muted).toBe(false);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('volume state synchronization', async ({ browser }) => {
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
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();

      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Test multiple volume levels
      const volumeLevels = [0.0, 0.5, 1.0, 0.75, 0.25];

      for (const volume of volumeLevels) {
        // Set volume on both videos
        await Promise.all([
          simulator.setVolume(videoElements.react, volume),
          simulator.setVolume(videoElements.wc, volume),
        ]);

        await reactPage.waitForTimeout(50);

        // Get states
        const reactState = await simulator.getMediaState(videoElements.react);
        const wcState = await simulator.getMediaState(videoElements.wc);

        // Compare
        const comparison = compareMediaStates(reactState, wcState);
        expect(comparison.matches, `Volume ${volume} mismatch: ${comparison.differences.join(', ')}`).toBe(true);

        expect(reactState.volume).toBeCloseTo(volume, 2);
        expect(wcState.volume).toBeCloseTo(volume, 2);
      }
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });

  test('seek state synchronization', async ({ browser }) => {
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
      const simulator = new StateSimulator();

      const videoElements = await matcher.getVideoElement();

      await simulator.waitForReady(videoElements.react);
      await simulator.waitForReady(videoElements.wc);

      // Get duration
      const reactState = await simulator.getMediaState(videoElements.react);
      const wcState = await simulator.getMediaState(videoElements.wc);

      // Both should have same duration
      expect(reactState.duration).toBeGreaterThan(0);
      expect(wcState.duration).toBeGreaterThan(0);

      // Seek to middle
      const seekTime = Math.min(reactState.duration, wcState.duration) / 2;

      await Promise.all([simulator.seek(videoElements.react, seekTime), simulator.seek(videoElements.wc, seekTime)]);

      // Get states after seek
      const reactSeekedState = await simulator.getMediaState(videoElements.react);
      const wcSeekedState = await simulator.getMediaState(videoElements.wc);

      // Compare
      const comparison = compareMediaStates(reactSeekedState, wcSeekedState, 0.5); // 0.5s tolerance
      expect(comparison.matches, `Seek state mismatch: ${comparison.differences.join(', ')}`).toBe(true);

      expect(reactSeekedState.currentTime).toBeCloseTo(seekTime, 0);
      expect(wcSeekedState.currentTime).toBeCloseTo(seekTime, 0);
    } finally {
      await reactContext.close();
      await wcContext.close();
    }
  });
});
