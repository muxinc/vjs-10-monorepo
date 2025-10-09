import type { AnySupportedStyle, Guide, SupportedFramework, SupportedStyle } from '@/types/docs';

import { getDefaultStyle } from '@/types/docs';
import { findFirstGuide, getValidStylesForGuide } from '@/utils/docs/sidebar';

/**
 * Build a docs URL from framework, style, and guide slug components.
 */
export function buildDocsUrl(framework: SupportedFramework, style: AnySupportedStyle, guideSlug: string): string {
  return `/docs/framework/${framework}/style/${style}/${guideSlug}/`;
}

/**
 * Navigate to a URL, optionally replacing the current history entry.
 */
export function navigateToUrl(url: string, replaceHistory = false): void {
  if (replaceHistory) {
    window.location.replace(url);
  } else {
    window.location.href = url;
  }
}

/**
 * Extract the current guide slug from the docs URL.
 * URL format: /docs/framework/{framework}/style/{style}/{slug}/
 */
export function getCurrentGuideSlug(): string {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const styleIndex = pathParts.indexOf('style');
  const slugParts = pathParts.slice(styleIndex + 2);
  return slugParts.join('/');
}

interface NavigationTarget {
  url: string;
  replaceHistory: boolean;
}

/**
 * Determine where to navigate when the framework changes.
 * Returns the target URL and whether to replace browser history.
 */
export function getFrameworkChangeTarget(
  currentGuide: Guide | null,
  currentStyle: AnySupportedStyle,
  newFramework: SupportedFramework,
): NavigationTarget {
  const defaultStyle = getDefaultStyle(newFramework);

  // If no current guide, go to first guide of new framework with default style
  if (!currentGuide) {
    const firstGuide = findFirstGuide(newFramework, defaultStyle);
    return {
      url: firstGuide ? buildDocsUrl(newFramework, defaultStyle, firstGuide) : '/docs/',
      replaceHistory: false,
    };
  }

  // If guide doesn't support new framework, go to first guide
  if (currentGuide.frameworks && !currentGuide.frameworks.includes(newFramework)) {
    const firstGuide = findFirstGuide(newFramework, defaultStyle);
    return {
      url: firstGuide ? buildDocsUrl(newFramework, defaultStyle, firstGuide) : '/docs/',
      replaceHistory: false,
    };
  }

  // Check valid styles for this guide in the new framework
  const validStyles = getValidStylesForGuide(currentGuide, newFramework);

  if (validStyles.length === 0) {
    const firstGuide = findFirstGuide(newFramework, defaultStyle);
    return {
      url: firstGuide ? buildDocsUrl(newFramework, defaultStyle, firstGuide) : '/docs/',
      replaceHistory: false,
    };
  }

  // Keep current guide, pick best style
  const newStyle = validStyles.includes(currentStyle) ? currentStyle : validStyles[0];

  return {
    url: buildDocsUrl(newFramework, newStyle, currentGuide.slug),
    replaceHistory: true, // Same guide, don't add to history
  };
}

/**
 * Determine where to navigate when the style changes.
 * Returns the target URL and whether to replace browser history.
 */
export function getStyleChangeTarget<F extends SupportedFramework>(
  currentGuide: Guide | null,
  currentFramework: F,
  newStyle: SupportedStyle<F>,
): NavigationTarget {
  // If no current guide, go to first guide of new style
  if (!currentGuide) {
    const firstGuide = findFirstGuide(currentFramework, newStyle);
    return {
      url: firstGuide ? buildDocsUrl(currentFramework, newStyle, firstGuide) : '/docs/',
      replaceHistory: false,
    };
  }

  // Check if guide supports the new style
  const validStyles = getValidStylesForGuide(currentGuide, currentFramework);

  if (!validStyles.includes(newStyle)) {
    // Guide doesn't support new style, go to first guide
    const firstGuide = findFirstGuide(currentFramework, newStyle);
    return {
      url: firstGuide ? buildDocsUrl(currentFramework, newStyle, firstGuide) : '/docs/',
      replaceHistory: false,
    };
  }

  // Keep current guide with new style
  return {
    url: buildDocsUrl(currentFramework, newStyle, currentGuide.slug),
    replaceHistory: true, // Same guide, don't add to history
  };
}
