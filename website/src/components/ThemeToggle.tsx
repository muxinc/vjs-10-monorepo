import { Toggle } from '@base-ui-components/react/toggle';
import { ToggleGroup } from '@base-ui-components/react/toggle-group';
import clsx from 'clsx';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { THEME_KEY } from '@/consts';

type Preference = 'system' | 'light' | 'dark';
type Theme = 'light' | 'dark';

const themeOptions = [
  { value: 'system' as const, label: 'System', icon: Monitor },
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
];

function initPreference(): Preference {
  if (typeof localStorage === 'undefined') return 'system';
  if (localStorage[THEME_KEY] === 'light') return 'light';
  if (localStorage[THEME_KEY] === 'dark') return 'dark';
  if (localStorage[THEME_KEY] === 'system') return 'system';
  // Shouldn't be possible after head script runs, but handle it
  localStorage[THEME_KEY] = 'system';
  return 'system';
}

function getThemeFromPreference(preference: Preference): Theme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  if (preference === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return 'light';
}

export function ThemeToggle() {
  const [preference, _setPreference] = useState<Preference | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);

  const setPreference = (newPreference: Preference) => {
    _setPreference(newPreference);
    if (typeof localStorage !== 'undefined') localStorage[THEME_KEY] = newPreference;
    setTheme(getThemeFromPreference(newPreference));
  };

  const handleValueChange = (values: Preference[]) => {
    if (values.length > 0) setPreference(values[0]);
  };

  // Initialize preference and theme on mount
  useEffect(() => {
    const initialPreference = initPreference();
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    _setPreference(initialPreference);
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setTheme(getThemeFromPreference(initialPreference));
  }, []);

  // Listen to media query changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return;
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;

    const onMediaChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, [preference]);

  // Keep document.documentElement, theme-color, and favicons in sync with theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ebe4c1');
      document.querySelector('link[rel="icon"][type="image/svg+xml"]')?.setAttribute('href', '/favicon.svg');
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/favicon.ico');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#393836');
      document.querySelector('link[rel="icon"][type="image/svg+xml"]')?.setAttribute('href', '/favicon-dark.svg');
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/favicon-dark.ico');
    }

    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [theme]);

  return (
    <ToggleGroup
      disabled={preference === null}
      value={[preference]}
      onValueChange={handleValueChange}
      multiple={false}
      className={clsx(
        'inline-flex items-center gap-1 bg-light-60 dark:bg-dark-90 dark:text-light-100 border border-light-40 dark:border-dark-80 rounded-lg p-1',
      )}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Toggle
            key={option.value}
            value={option.value}
            className={clsx(
              'relative',
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm',
              preference === null ? 'cursor-wait' : 'cursor-pointer',
              preference === option.value ? 'bg-light-80 dark:bg-dark-100' : preference !== null ? 'intent:bg-light-80/50 dark:intent:bg-dark-100/50' : '',
            )}
            aria-label={option.label}
          >
            <Icon size={14} />
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
