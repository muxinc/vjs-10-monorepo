export const FRAMEWORK_STYLES = {
  html: ['css', 'tailwind'],
  react: ['css', 'tailwind', 'styled-components'],
} as const;

export const SUPPORTED_FRAMEWORKS = Object.keys(FRAMEWORK_STYLES) as (keyof typeof FRAMEWORK_STYLES)[];

export type SupportedFramework = keyof typeof FRAMEWORK_STYLES;
export type SupportedStyle<F extends SupportedFramework> = (typeof FRAMEWORK_STYLES)[F][number];
export type AnySupportedStyle = SupportedStyle<SupportedFramework>;

/**
 * Get the default style for a given framework (first available style)
 */
export function getDefaultStyle<F extends SupportedFramework>(framework: F): SupportedStyle<F> {
  return FRAMEWORK_STYLES[framework][0];
}

export interface Guide {
  slug: string;
  sidebarLabel?: string; // defaults to guide title
  frameworks?: SupportedFramework[];
  styles?: AnySupportedStyle[];
}

export interface Section {
  sidebarLabel: string;
  frameworks?: SupportedFramework[];
  styles?: AnySupportedStyle[];
  contents: Array<Guide | Section>;
}

export type Sidebar = Array<Guide | Section>;

/**
 * Type guard to check if an item is a Section (vs a Guide)
 */
export function isSection(item: Guide | Section): item is Section {
  return 'contents' in item;
}
