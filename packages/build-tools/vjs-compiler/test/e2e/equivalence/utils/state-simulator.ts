/**
 * State Simulator: Triggers media state changes and simulates user interactions
 *
 * Provides utilities to programmatically trigger state changes and simulate
 * pseudo-states like hover and focus.
 */

import type { Locator } from '@playwright/test';

/**
 * Media state information
 */
export interface MediaState {
  paused: boolean;
  muted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

/**
 * State Simulator class
 */
export class StateSimulator {
  /**
   * Get current media state from video element
   */
  async getMediaState(videoLocator: Locator): Promise<MediaState> {
    return await videoLocator.evaluate((video: HTMLVideoElement) => ({
      paused: video.paused,
      muted: video.muted,
      currentTime: video.currentTime,
      duration: video.duration,
      volume: video.volume,
    }));
  }

  /**
   * Play the video
   */
  async play(videoLocator: Locator): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement) => video.play());
    // Wait for play event
    await videoLocator.evaluate(
      (video: HTMLVideoElement) =>
        new Promise<void>((resolve) => {
          if (!video.paused) {
            resolve();
          } else {
            video.addEventListener('play', () => resolve(), { once: true });
          }
        })
    );
  }

  /**
   * Pause the video
   */
  async pause(videoLocator: Locator): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement) => video.pause());
    // Wait for pause event
    await videoLocator.evaluate(
      (video: HTMLVideoElement) =>
        new Promise<void>((resolve) => {
          if (video.paused) {
            resolve();
          } else {
            video.addEventListener('pause', () => resolve(), { once: true });
          }
        })
    );
  }

  /**
   * Mute the video
   */
  async mute(videoLocator: Locator): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement) => {
      video.muted = true;
    });
  }

  /**
   * Unmute the video
   */
  async unmute(videoLocator: Locator): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement) => {
      video.muted = false;
    });
  }

  /**
   * Set volume (0-1)
   */
  async setVolume(videoLocator: Locator, volume: number): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement, vol: number) => {
      video.volume = vol;
    }, volume);
  }

  /**
   * Seek to specific time
   */
  async seek(videoLocator: Locator, time: number): Promise<void> {
    await videoLocator.evaluate((video: HTMLVideoElement, seekTime: number) => {
      video.currentTime = seekTime;
    }, time);
    // Wait for seeked event
    await videoLocator.evaluate(
      (video: HTMLVideoElement) =>
        new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
        })
    );
  }

  /**
   * Wait for video to be ready
   */
  async waitForReady(videoLocator: Locator, timeout = 5000): Promise<void> {
    await videoLocator.evaluate(
      (video: HTMLVideoElement, ms: number) =>
        new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Video not ready')), ms);

          if (video.readyState >= 2) {
            clearTimeout(timer);
            resolve();
          } else {
            video.addEventListener(
              'loadeddata',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true }
            );
          }
        }),
      timeout
    );
  }

  /**
   * Simulate hover state on an element
   */
  async simulateHover(locator: Locator, hover: boolean): Promise<void> {
    if (hover) {
      await locator.hover();
    } else {
      // Move mouse away
      await locator.page().mouse.move(0, 0);
    }
  }

  /**
   * Simulate focus state on an element
   */
  async simulateFocus(locator: Locator, focused: boolean): Promise<void> {
    if (focused) {
      await locator.focus();
    } else {
      await locator.blur();
    }
  }

  /**
   * Get data attributes from an element
   */
  async getDataAttributes(locator: Locator): Promise<Record<string, string>> {
    return await locator.evaluate((el: Element) => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        if (attr.name.startsWith('data-')) {
          attrs[attr.name] = attr.value;
        }
      }
      return attrs;
    });
  }

  /**
   * Wait for a data attribute to have a specific value
   */
  async waitForDataAttribute(
    locator: Locator,
    attribute: string,
    expectedValue: string | null,
    timeout = 5000
  ): Promise<void> {
    await locator.evaluate(
      (el: Element, { attr, value, ms }: { attr: string; value: string | null; ms: number }) =>
        new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${attr}`)), ms);

          const check = () => {
            const current = el.getAttribute(attr);
            if (value === null ? current === null : current === value) {
              clearTimeout(timer);
              resolve();
            }
          };

          check();

          const observer = new MutationObserver(() => {
            check();
          });

          observer.observe(el, { attributes: true, attributeFilter: [attr] });
        }),
      { attr: attribute, value: expectedValue, ms: timeout }
    );
  }

  /**
   * Click an element (with wait for stability)
   */
  async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click({ force: false });
  }

  /**
   * Trigger keyboard event on element
   */
  async pressKey(locator: Locator, key: string): Promise<void> {
    await locator.press(key);
  }
}

/**
 * Helper: Compare two media states
 */
export function compareMediaStates(
  state1: MediaState,
  state2: MediaState,
  tolerance = 0.1
): { matches: boolean; differences: string[] } {
  const differences: string[] = [];

  if (state1.paused !== state2.paused) {
    differences.push(`paused: ${state1.paused} vs ${state2.paused}`);
  }
  if (state1.muted !== state2.muted) {
    differences.push(`muted: ${state1.muted} vs ${state2.muted}`);
  }
  if (Math.abs(state1.currentTime - state2.currentTime) > tolerance) {
    differences.push(`currentTime: ${state1.currentTime} vs ${state2.currentTime}`);
  }
  if (Math.abs(state1.volume - state2.volume) > 0.01) {
    differences.push(`volume: ${state1.volume} vs ${state2.volume}`);
  }

  return {
    matches: differences.length === 0,
    differences,
  };
}
