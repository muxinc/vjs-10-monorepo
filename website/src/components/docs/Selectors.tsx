import type { AnySupportedStyle, SupportedFramework, SupportedStyle } from '@/types/docs';

import { Select } from '@/components/Select';
import { FRAMEWORK_STYLES, isValidFramework, isValidStyleForFramework, SUPPORTED_FRAMEWORKS } from '@/types/docs';
import { resolveFrameworkChange, resolveStyleChange } from '@/utils/docs/routing';

interface SelectorProps<T extends SupportedFramework> {
  currentFramework: T;
  currentStyle: SupportedStyle<T>;
  currentSlug: string;
}

export function Selectors({
  currentFramework,
  currentStyle,
  currentSlug,
}: SelectorProps<SupportedFramework>) {
  // TODO: use astro view transitions to preserve scroll position when switching from the same slug to the same slug
  const handleFrameworkChange = (newFramework: SupportedFramework | null) => {
    if (newFramework === null) return;
    if (!isValidFramework(newFramework)) return;

    const { url, shouldReplace } = resolveFrameworkChange({
      currentFramework,
      currentStyle,
      currentSlug,
      newFramework,
    });

    if (shouldReplace) {
      // Maintaining the current slug, navigate without pushing onto the history stack
      window.location.replace(url);
    } else {
      // Changing slug, use normal navigation
      window.location.href = url;
    }
  };

  const handleStyleChange = (newStyle: AnySupportedStyle | null) => {
    if (newStyle === null) return;
    if (!isValidStyleForFramework(currentFramework, newStyle)) return;

    const { url, shouldReplace } = resolveStyleChange({
      currentFramework,
      currentStyle,
      currentSlug,
      newStyle,
    });

    if (shouldReplace) {
      // Maintaining the current slug, navigate without pushing onto the history stack
      window.location.replace(url);
    } else {
      // Changing slug, use normal navigation
      window.location.href = url;
    }
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
    <div className="p-6 lg:py-2.5 xl:p-6 grid gap-x-6 gap-y-2 items-center border-b border-light-40" style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
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
