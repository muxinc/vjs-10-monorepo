/**
 * Element Matcher: Maps React component hierarchy to Web Component hierarchy
 *
 * Handles shadow DOM traversal and provides parallel element access for comparison.
 */

import type { Locator, Page } from '@playwright/test';

/**
 * Element pair for comparison
 */
export interface ElementPair {
  /** Element in React version */
  react: Locator;
  /** Element in Web Component version */
  wc: Locator;
  /** Semantic identifier for logging */
  id: string;
}

/**
 * Element matcher configuration
 */
export interface ElementMatcherConfig {
  /** React page */
  reactPage: Page;
  /** Web Component page */
  wcPage: Page;
}

/**
 * Element Matcher class
 *
 * Provides utilities to match corresponding elements between React and WC versions.
 */
export class ElementMatcher {
  constructor(private config: ElementMatcherConfig) {}

  /**
   * Get the skin container element pair
   */
  async getSkinContainer(): Promise<ElementPair> {
    // React: MediaSkinDefault component (rendered as div with specific class/data)
    // WC: media-skin-default custom element
    return {
      react: this.config.reactPage.locator('[data-media-skin]').first(),
      wc: this.config.wcPage.locator('media-skin-default'),
      id: 'skin-container',
    };
  }

  /**
   * Get the media container element pair
   */
  async getMediaContainer(): Promise<ElementPair> {
    // React: MediaContainer component
    // WC: media-container custom element (inside shadow root)
    const reactContainer = this.config.reactPage.locator('[data-media-container]').first();
    const wcContainer = this.config.wcPage.locator('media-skin-default').locator('media-container').first();

    return {
      react: reactContainer,
      wc: wcContainer,
      id: 'media-container',
    };
  }

  /**
   * Get the controls container element pair
   */
  async getControlsContainer(): Promise<ElementPair> {
    // React: div with controls class/data-testid
    // WC: div with controls class (inside shadow root)
    const reactControls = this.config.reactPage.locator('[data-testid="media-controls"]').first();
    const wcControls = this.config.wcPage
      .locator('media-skin-default')
      .locator('[data-testid="media-controls"]')
      .first();

    return {
      react: reactControls,
      wc: wcControls,
      id: 'controls-container',
    };
  }

  /**
   * Get the play button element pair
   */
  async getPlayButton(): Promise<ElementPair> {
    const reactButton = this.config.reactPage.locator('[data-testid="media-controls"]').locator('button').first();
    const wcButton = this.config.wcPage
      .locator('media-skin-default')
      .locator('[data-testid="media-controls"]')
      .locator('media-play-button')
      .first();

    return {
      react: reactButton,
      wc: wcButton,
      id: 'play-button',
    };
  }

  /**
   * Get the overlay element pair (background gradient)
   */
  async getOverlay(): Promise<ElementPair> {
    const reactOverlay = this.config.reactPage
      .locator('[data-media-container]')
      .locator('[aria-hidden="true"]')
      .first();
    const wcOverlay = this.config.wcPage.locator('media-skin-default').locator('[aria-hidden="true"]').first();

    return {
      react: reactOverlay,
      wc: wcOverlay,
      id: 'overlay',
    };
  }

  /**
   * Get the video element pair
   */
  async getVideoElement(): Promise<ElementPair> {
    const reactVideo = this.config.reactPage.locator('video').first();
    const wcVideo = this.config.wcPage.locator('video').first();

    return {
      react: reactVideo,
      wc: wcVideo,
      id: 'video-element',
    };
  }

  /**
   * Get all critical elements for comparison
   */
  async getAllCriticalElements(): Promise<ElementPair[]> {
    return Promise.all([
      this.getMediaContainer(),
      this.getControlsContainer(),
      this.getPlayButton(),
      this.getOverlay(),
      this.getVideoElement(),
    ]);
  }
}

/**
 * Helper: Check if element exists
 */
export async function elementExists(locator: Locator): Promise<boolean> {
  try {
    await locator.waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Get element count
 */
export async function getElementCount(locator: Locator): Promise<number> {
  try {
    return await locator.count();
  } catch {
    return 0;
  }
}
