import type { AnySupportedStyle, SupportedFramework } from '@/types/docs';

import { navigate } from 'astro:transitions/client';

import { getAvailableStyles, getDefaultStyle, SUPPORTED_FRAMEWORKS } from '@/types/docs';
import { findFirstGuide, findGuideBySlug, getValidStylesForGuide } from '@/utils/docs/sidebar';

interface SelectorProps {
  currentFramework: SupportedFramework;
  currentStyle: AnySupportedStyle;
}

/**
 * Extract the current guide slug from the docs URL.
 * URL format: /docs/framework/{framework}/style/{style}/{slug}/
 * @returns The guide slug (everything after the style parameter)
 */
function getCurrentGuideSlug(): string {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const styleIndex = pathParts.indexOf('style');
  const slugParts = pathParts.slice(styleIndex + 2); // Everything after the style value
  return slugParts.join('/');
}

export function Selectors({ currentFramework, currentStyle }: SelectorProps) {
  const handleFrameworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFramework = event.target.value as SupportedFramework;

    // Get current guide slug from URL
    const currentGuideSlug = getCurrentGuideSlug();

    // Find the current guide in the sidebar
    const currentGuide = findGuideBySlug(currentGuideSlug);

    if (!currentGuide) {
      // No current guide found, redirect to first guide of new framework
      const firstGuide = findFirstGuide(newFramework, getDefaultStyle(newFramework));
      if (firstGuide) {
        navigate(`/docs/framework/${newFramework}/style/${getDefaultStyle(newFramework)}/${firstGuide}/`);
      }
      else {
        navigate('/docs/');
      }
      return;
    }

    // Check if guide is available for the new framework
    if (currentGuide.frameworks && !currentGuide.frameworks.includes(newFramework)) {
      // Guide not available in new framework, redirect to first guide
      const firstGuide = findFirstGuide(newFramework, getDefaultStyle(newFramework));
      if (firstGuide) {
        navigate(`/docs/framework/${newFramework}/style/${getDefaultStyle(newFramework)}/${firstGuide}/`);
      }
      else {
        navigate('/docs/');
      }
      return;
    }

    // Get valid styles for this guide in the new framework
    const validStyles = getValidStylesForGuide(currentGuide, newFramework);

    if (validStyles.length === 0) {
      // Guide not available in new framework, go to first guide
      const firstGuide = findFirstGuide(newFramework, getDefaultStyle(newFramework));
      if (firstGuide) {
        navigate(`/docs/framework/${newFramework}/style/${getDefaultStyle(newFramework)}/${firstGuide}/`);
      }
      else {
        navigate('/docs/');
      }
      return;
    }

    // Pick best style: current if still valid, otherwise first valid
    const newStyle = validStyles.includes(currentStyle) ? currentStyle : validStyles[0];

    // Navigate to same guide with adjusted framework/style
    navigate(`/docs/framework/${newFramework}/style/${newStyle}/${currentGuideSlug}/`);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = event.target.value as AnySupportedStyle;

    // Get current guide slug from URL
    const currentGuideSlug = getCurrentGuideSlug();

    // Find the current guide in the sidebar
    const currentGuide = findGuideBySlug(currentGuideSlug);

    if (!currentGuide) {
      // No current guide found, redirect to first guide of new style
      const firstGuide = findFirstGuide(currentFramework, newStyle);
      if (firstGuide) {
        navigate(`/docs/framework/${currentFramework}/style/${newStyle}/${firstGuide}/`);
      }
      else {
        navigate('/docs/');
      }
      return;
    }

    // Check if guide is valid for current framework and new style
    const validStyles = getValidStylesForGuide(currentGuide, currentFramework);

    if (!validStyles.includes(newStyle)) {
      // Guide not available for new style, go to first guide
      const firstGuide = findFirstGuide(currentFramework, newStyle);
      if (firstGuide) {
        navigate(`/docs/framework/${currentFramework}/style/${newStyle}/${firstGuide}/`);
      }
      else {
        navigate('/docs/');
      }
      return;
    }

    // Guide supports the new style, navigate to it
    navigate(`/docs/framework/${currentFramework}/style/${newStyle}/${currentGuideSlug}/`);
  };

  const availableStyles = getAvailableStyles(currentFramework);

  return (
    <div className="mb-4">
      <div>
        <label htmlFor="framework-select">Framework:</label>
        <select id="framework-select" value={currentFramework} onChange={handleFrameworkChange}>
          {SUPPORTED_FRAMEWORKS.map(fw => (
            <option key={fw} value={fw}>
              {fw}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="style-select">Style:</label>
        <select id="style-select" value={currentStyle} onChange={handleStyleChange}>
          {availableStyles.map(st => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
