import type { AnySupportedStyle, SupportedFramework } from '@/types/docs';

import type { BrowserNavigator } from '@/utils/docs/navigation';
import { Select } from '@/components/Select';
import { FRAMEWORK_STYLES, SUPPORTED_FRAMEWORKS } from '@/types/docs';
import {
  defaultBrowserNavigator,
  getCurrentGuideSlug,
  getFrameworkChangeTarget,
  getStyleChangeTarget,
  navigateToUrl,
} from '@/utils/docs/navigation';
import { findGuideBySlug } from '@/utils/docs/sidebar';

interface SelectorProps {
  currentFramework: SupportedFramework;
  currentStyle: AnySupportedStyle;
  navigator?: BrowserNavigator;
}

export function Selectors({
  currentFramework,
  currentStyle,
  navigator = defaultBrowserNavigator,
}: SelectorProps) {
  // TODO: use astro view transitions to preserve scroll position when switching from the same slug to the same slug
  const handleFrameworkChange = (newFramework: SupportedFramework | null) => {
    if (newFramework === null) return;
    const currentGuide = findGuideBySlug(getCurrentGuideSlug(navigator));
    const target = getFrameworkChangeTarget(
      currentGuide,
      currentStyle,
      newFramework,
    );
    navigateToUrl(target.url, target.replaceHistory, navigator);
  };

  const handleStyleChange = (newStyle: AnySupportedStyle | null) => {
    if (newStyle === null) return;
    const currentGuide = findGuideBySlug(getCurrentGuideSlug(navigator));
    const target = getStyleChangeTarget(
      currentGuide,
      currentFramework,
      newStyle,
    );
    navigateToUrl(target.url, target.replaceHistory, navigator);
  };

  const availableStyles = FRAMEWORK_STYLES[currentFramework];

  const frameworkOptions = SUPPORTED_FRAMEWORKS.map(fw => ({
    value: fw,
    label: fw,
  }));

  const styleOptions = availableStyles.map(st => ({
    value: st,
    label: st,
  }));

  return (
    <div className="p-6 grid gap-x-6 gap-y-2 items-center border-b border-light-40" style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
      <span>Framework</span>
      <Select
        value={currentFramework}
        onChange={handleFrameworkChange}
        options={frameworkOptions}
        aria-label="Select framework"
        data-testid="select-framework"
      />
      <span>Style</span>
      <Select
        value={currentStyle}
        onChange={handleStyleChange}
        options={styleOptions}
        aria-label="Select style"
        data-testid="select-style"
      />
    </div>
  );
}
