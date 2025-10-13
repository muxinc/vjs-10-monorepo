// astro.config depends on this file.
// use only relative imports
import type { Sidebar } from '../../types/docs';
import { FRAMEWORK_STYLES } from '../../types/docs';
import { findFirstGuide } from '../../utils/docs/sidebar';

/**
 * Generate static redirect configuration for all docs routes.
 * Creates redirects from framework/style index routes to the first available guide.
 *
 * @param sidebarToUse - Optional sidebar to use (defaults to the real sidebar config)
 * @returns Object mapping source paths to destination paths for static redirects config
 */
export function generateDocsRedirects(sidebarToUse?: Sidebar): Record<string, string> {
  const redirects: Record<string, string> = {};
  const frameworks = Object.keys(FRAMEWORK_STYLES);

  // 1. /docs -> /docs/framework/html/style/css/[first-guide]
  const defaultFramework = 'html';
  const defaultStyle = FRAMEWORK_STYLES[defaultFramework][0];
  const defaultFirstGuide = findFirstGuide(defaultFramework, defaultStyle, sidebarToUse);
  if (defaultFirstGuide) {
    redirects['/docs']
      = `/docs/framework/${defaultFramework}/style/${defaultStyle}/${defaultFirstGuide}`;
  }

  // 2. /docs/framework/[framework] -> /docs/framework/[framework]/style/[default-style]/[first-guide]
  for (const framework of frameworks) {
    const defaultStyleForFramework = FRAMEWORK_STYLES[framework][0];
    const firstGuide = findFirstGuide(framework, defaultStyleForFramework, sidebarToUse);
    if (firstGuide) {
      redirects[`/docs/framework/${framework}`]
        = `/docs/framework/${framework}/style/${defaultStyleForFramework}/${firstGuide}`;
    }

    // 3. /docs/framework/[framework]/style/[style] -> /docs/framework/[framework]/style/[style]/[first-guide]
    for (const style of FRAMEWORK_STYLES[framework]) {
      const firstGuideForStyle = findFirstGuide(framework, style, sidebarToUse);
      if (firstGuideForStyle) {
        redirects[`/docs/framework/${framework}/style/${style}`]
          = `/docs/framework/${framework}/style/${style}/${firstGuideForStyle}`;
      }
    }
  }

  return redirects;
}
