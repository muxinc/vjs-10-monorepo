// astro.config depends on this file.
// use only relative imports

import type { AnySupportedStyle, Guide, Section, Sidebar, SupportedFramework, SupportedStyle } from '@/types/docs';

import { sidebar } from '../../config/docs/sidebar';
import { FRAMEWORK_STYLES, isSection } from '../../types/docs';

/**
 * Check if an item (Guide or Section) should be shown based on framework and style.
 * If no frameworks are specified, the item is visible to all frameworks.
 * If no styles are specified, the item is visible to all styles.
 *
 * @param item - The guide or section to check
 * @param framework - The currently selected framework
 * @param style - The currently selected style
 * @returns true if the item should be visible
 */
function isItemVisible(item: Guide | Section, framework: SupportedFramework, style: AnySupportedStyle): boolean {
  const frameworkMatch = !item.frameworks || item.frameworks.includes(framework);
  const styleMatch = !item.styles || item.styles.includes(style);
  return frameworkMatch && styleMatch;
}

/**
 * Filter sidebar items based on selected framework and style.
 * Recursively filters sections and guides to only include
 * those that are visible for the given framework and style combination.
 * Removes empty sections after filtering.
 *
 * @param framework - The framework to filter for
 * @param style - The style to filter for
 * @param sidebarToFilter - Optional sidebar to filter (defaults to main sidebar config)
 * @returns A new filtered sidebar with only visible content
 */
export function filterSidebar(
  framework: SupportedFramework,
  style: AnySupportedStyle,
  sidebarToFilter: Sidebar = sidebar,
): Sidebar {
  return sidebarToFilter
    .filter(item => isItemVisible(item, framework, style))
    .map((item) => {
      if (isSection(item)) {
        const filteredContents = filterSidebar(framework, style, item.contents);
        return {
          ...item,
          contents: filteredContents,
        };
      }
      // It's a Guide, return as-is
      return item;
    })
    .filter((item) => {
      // Remove sections with no contents after filtering
      if (isSection(item)) {
        return item.contents.length > 0;
      }
      // Keep all guides
      return true;
    });
}

/**
 * Find the first guide in the sidebar that matches the framework and style.
 * Recursively searches through sections and guides in order,
 * returning the slug of the first visible guide found.
 *
 * @param framework - The framework to match
 * @param style - The style to match
 * @param sidebarToSearch - Optional sidebar to search (defaults to main sidebar config)
 * @returns The slug of the first visible guide, or null if none found
 */
export function findFirstGuide(
  framework: SupportedFramework,
  style: AnySupportedStyle,
  sidebarToSearch: Sidebar = sidebar,
): string | null {
  for (const item of sidebarToSearch) {
    if (!isItemVisible(item, framework, style)) {
      continue;
    }

    if (isSection(item)) {
      // Recursively search section contents
      const guide = findFirstGuide(framework, style, item.contents);
      if (guide) return guide;
    } else {
      // It's a Guide, return its slug
      return item.slug;
    }
  }

  return null;
}

/**
 * Get all guide slugs from a sidebar (recursively).
 * This function extracts ALL slugs from the provided sidebar structure,
 * including those in nested sections. It does not perform any filtering.
 * Typically used with an already-filtered sidebar to get allowed slugs.
 *
 * @param sidebarToExtract - Optional sidebar to extract from (defaults to main sidebar config)
 * @returns An array of all guide slugs found in the sidebar
 */
export function getAllGuideSlugs(sidebarToExtract: Sidebar = sidebar): string[] {
  const slugs: string[] = [];

  for (const item of sidebarToExtract) {
    if (isSection(item)) {
      // Recursively get slugs from section contents
      slugs.push(...getAllGuideSlugs(item.contents));
    } else {
      // It's a Guide, add its slug
      slugs.push(item.slug);
    }
  }

  return slugs;
}

/**
 * Find a guide by its slug in the sidebar (recursively).
 *
 * @param slug - The slug to find
 * @param sidebarToSearch - Optional sidebar to search (defaults to main sidebar config)
 * @returns The guide object if found, null otherwise
 */
export function findGuideBySlug(slug: string, sidebarToSearch: Sidebar = sidebar): Guide | null {
  for (const item of sidebarToSearch) {
    if (isSection(item)) {
      // Recursively search section contents
      const guide = findGuideBySlug(slug, item.contents);
      if (guide) return guide;
    } else if (item.slug === slug) {
      // Found the guide
      return item;
    }
  }
  return null;
}

/**
 * Get valid styles for a guide in a specific framework.
 * Returns the intersection of styles the framework supports and styles the guide supports.
 * If the guide has no style restrictions (styles is undefined), returns all framework styles.
 *
 * @param guide - The guide to check
 * @param framework - The framework to check against
 * @returns Array of valid styles for this guide in this framework
 */
export function getValidStylesForGuide<F extends SupportedFramework>(
  guide: Guide,
  framework: F,
): readonly SupportedStyle<F>[] {
  const frameworkStyles = FRAMEWORK_STYLES[framework];

  // If guide has no style restrictions, all framework styles are valid
  if (!guide.styles) {
    return frameworkStyles;
  }

  // Return intersection of framework styles and guide styles
  return frameworkStyles.filter(s => guide.styles!.includes(s));
}
