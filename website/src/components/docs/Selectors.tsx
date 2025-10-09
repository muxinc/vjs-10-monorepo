import type { AnySupportedStyle, SupportedFramework } from '@/types/docs';

import { getAvailableStyles, SUPPORTED_FRAMEWORKS } from '@/types/docs';
import {
  getCurrentGuideSlug,
  getFrameworkChangeTarget,
  getStyleChangeTarget,
  navigateToUrl,
} from '@/utils/docs/navigation';
import { findGuideBySlug } from '@/utils/docs/sidebar';

interface SelectorProps {
  currentFramework: SupportedFramework;
  currentStyle: AnySupportedStyle;
}

export function Selectors({ currentFramework, currentStyle }: SelectorProps) {
  const handleFrameworkChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newFramework = event.target.value as SupportedFramework;
    const currentGuide = findGuideBySlug(getCurrentGuideSlug());
    const target = getFrameworkChangeTarget(
      currentGuide,
      currentStyle,
      newFramework,
    );
    navigateToUrl(target.url, target.replaceHistory);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = event.target.value as AnySupportedStyle;
    const currentGuide = findGuideBySlug(getCurrentGuideSlug());
    const target = getStyleChangeTarget(
      currentGuide,
      currentFramework,
      newStyle,
    );
    navigateToUrl(target.url, target.replaceHistory);
  };

  const availableStyles = getAvailableStyles(currentFramework);

  return (
    <div>
      <div>
        <label htmlFor="framework-select">Framework:</label>
        <select
          id="framework-select"
          value={currentFramework}
          onChange={handleFrameworkChange}
        >
          {SUPPORTED_FRAMEWORKS.map(fw => (
            <option key={fw} value={fw}>
              {fw}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="style-select">Style:</label>
        <select
          id="style-select"
          value={currentStyle}
          onChange={handleStyleChange}
        >
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
