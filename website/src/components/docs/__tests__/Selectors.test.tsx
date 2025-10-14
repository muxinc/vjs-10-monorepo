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

    expect(screen.getByTestId('select-framework')).toBeInTheDocument();
    expect(screen.getByTestId('select-style')).toBeInTheDocument();
  });

  it('should display current framework value', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByTestId('select-framework');
    expect(frameworkSelect).toHaveTextContent(firstFramework);
  });

  it('should display current style value', () => {
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByTestId('select-style');
    expect(styleSelect).toHaveTextContent(firstFrameworkFirstStyle);
  });

  it('should show all supported frameworks', async () => {
    const user = userEvent.setup();
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByTestId('select-framework');
    await user.click(frameworkSelect);

    // Wait for the first option to appear
    await screen.findByRole('option', { name: frameworks[0] });

    // Check that all framework options are rendered in the popup
    const options = screen.getAllByRole('option');
    const optionValues = options.map(opt => opt.textContent);

    frameworks.forEach((framework) => {
      expect(optionValues).toContain(framework);
    });
  });

  it('should show available styles for current framework', async () => {
    const user = userEvent.setup();
    render(
      <Selectors
        currentFramework={firstFramework}
        currentStyle={firstFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByTestId('select-style');
    await user.click(styleSelect);

    // Wait for the first option to appear
    await screen.findByRole('option', { name: FRAMEWORK_STYLES[firstFramework][0] });

    // Check that all style options for the current framework are rendered
    const options = screen.getAllByRole('option');
    const optionValues = options.map(opt => opt.textContent);

    FRAMEWORK_STYLES[firstFramework].forEach((style) => {
      expect(optionValues).toContain(style);
    });
  });

  it('should show correct styles for second framework', async () => {
    const user = userEvent.setup();
    const secondFrameworkFirstStyle = FRAMEWORK_STYLES[secondFramework][0];
    render(
      <Selectors
        currentFramework={secondFramework}
        currentStyle={secondFrameworkFirstStyle}
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByTestId('select-style');
    await user.click(styleSelect);

    // Wait for the first option to appear
    await screen.findByRole('option', { name: FRAMEWORK_STYLES[secondFramework][0] });

    // Check that all style options for the second framework are rendered
    const options = screen.getAllByRole('option');
    const optionValues = options.map(opt => opt.textContent);

    FRAMEWORK_STYLES[secondFramework].forEach((style) => {
      expect(optionValues).toContain(style);
    });
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

    const frameworkSelect = screen.getByTestId('select-framework');
    await user.click(frameworkSelect);

    // Wait for options to appear and find the target option
    await screen.findByRole('option', { name: frameworks[0] });
    const options = screen.getAllByRole('option');
    const targetOption = options.find(opt => opt.textContent === secondFramework);

    if (targetOption) {
      await user.click(targetOption);
    }

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

    const styleSelect = screen.getByTestId('select-style');
    await user.click(styleSelect);

    // Wait for options to appear and find the target option
    await screen.findByRole('option', { name: FRAMEWORK_STYLES[firstFramework][0] });
    const options = screen.getAllByRole('option');
    const targetOption = options.find(opt => opt.textContent === firstFrameworkSecondStyle);

    if (targetOption) {
      await user.click(targetOption);
    }

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining(`/docs/framework/${firstFramework}/style/${firstFrameworkSecondStyle}/`),
      expect.any(Boolean),
    );
  });
});
