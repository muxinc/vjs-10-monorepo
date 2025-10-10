import type { BrowserNavigator } from '../../../utils/docs/navigation';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FRAMEWORK_STYLES } from '../../../types/docs';
import { Selectors } from '../Selectors';

describe('selectors component', () => {
  // Use first framework and its first style dynamically
  const frameworks = Object.keys(FRAMEWORK_STYLES) as (keyof typeof FRAMEWORK_STYLES)[];
  const firstFramework = frameworks[0];
  const secondFramework = frameworks[1];
  const firstFrameworkFirstStyle = FRAMEWORK_STYLES[firstFramework][0];
  const firstFrameworkSecondStyle = FRAMEWORK_STYLES[firstFramework][1];

  const mockNavigator: BrowserNavigator = {
    getCurrentPath: () => `/docs/framework/${firstFramework}/style/${firstFrameworkFirstStyle}/getting-started/`,
    navigate: vi.fn(),
  };

  it('should render framework and style selectors', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    expect(screen.getByLabelText('Framework:')).toBeInTheDocument();
    expect(screen.getByLabelText('Style:')).toBeInTheDocument();
  });

  it('should display current framework value', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:') as HTMLSelectElement;
    expect(frameworkSelect.value).toBe(firstFramework);
  });

  it('should display current style value', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:') as HTMLSelectElement;
    expect(styleSelect.value).toBe(firstFrameworkFirstStyle);
  });

  it('should show all supported frameworks', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:');
    const options = Array.from(frameworkSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toEqual(frameworks);
  });

  it('should show available styles for current framework', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    const options = Array.from(styleSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toEqual(FRAMEWORK_STYLES[firstFramework]);
  });

  it('should show correct styles for second framework', () => {
    const secondFrameworkFirstStyle = FRAMEWORK_STYLES[secondFramework][0];
    render(
      <Selectors
        currentFramework={secondFramework}
        currentStyle={secondFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    const options = Array.from(styleSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toEqual(FRAMEWORK_STYLES[secondFramework]);
  });

  it('should call navigator when framework changes', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const testNavigator: BrowserNavigator = {
      getCurrentPath: () => `/docs/framework/${firstFramework}/style/${firstFrameworkFirstStyle}/getting-started/`,
      navigate,
    };

    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={testNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:');
    await user.selectOptions(frameworkSelect, secondFramework);

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining(`/docs/framework/${secondFramework}/`),
      expect.any(Boolean),
    );
  });

  it('should call navigator when style changes', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const testNavigator: BrowserNavigator = {
      getCurrentPath: () => `/docs/framework/${firstFramework}/style/${firstFrameworkFirstStyle}/getting-started/`,
      navigate,
    };

    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={testNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    await user.selectOptions(styleSelect, firstFrameworkSecondStyle);

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining(`/docs/framework/${firstFramework}/style/${firstFrameworkSecondStyle}/`),
      expect.any(Boolean),
    );
  });
});
