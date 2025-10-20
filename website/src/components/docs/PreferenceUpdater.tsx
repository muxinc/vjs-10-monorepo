import type { SupportedFramework, SupportedStyle } from '@/types/docs';
import { useEffect } from 'react';
import { setPreferenceClient } from '@/utils/docs/preferences';

interface PreferenceUpdaterProps<F extends SupportedFramework = SupportedFramework> {
  currentFramework: F;
  currentStyle: SupportedStyle<F>;
}

/**
 * PreferenceUpdater component updates user preferences in cookies.
 * This component is loaded with client:idle directive, making it non-blocking.
 * It renders nothing but updates cookies whenever framework or style changes.
 */
export function PreferenceUpdater<F extends SupportedFramework = SupportedFramework>({ currentFramework, currentStyle }: PreferenceUpdaterProps<F>) {
  useEffect(() => {
    setPreferenceClient(currentFramework, currentStyle);
  }, [currentFramework, currentStyle]);

  return <></>;
}
