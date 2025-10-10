import type { BrowserNavigator } from '../../../utils/docs/navigation';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Selectors } from '../Selectors';

describe('selectors component', () => {
  const mockNavigator: BrowserNavigator = {
    getCurrentPath: () => '/docs/framework/html/style/css/getting-started/',
    navigate: vi.fn(),
  };

  it('should render framework and style selectors', () => {
    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    expect(screen.getByLabelText('Framework:')).toBeInTheDocument();
    expect(screen.getByLabelText('Style:')).toBeInTheDocument();
  });

  it('should display current framework value', () => {
    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:') as HTMLSelectElement;
    expect(frameworkSelect.value).toBe('html');
  });

  it('should display current style value', () => {
    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:') as HTMLSelectElement;
    expect(styleSelect.value).toBe('css');
  });

  it('should show all supported frameworks', () => {
    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:');
    const options = Array.from(frameworkSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toContain('html');
    expect(options).toContain('react');
  });

  it('should show available styles for current framework', () => {
    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    const options = Array.from(styleSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toEqual(['css', 'tailwind']);
  });

  it('should show styled-components for react framework', () => {
    render(
      <Selectors
        currentFramework="react"
        currentStyle="css"
        navigator={mockNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    const options = Array.from(styleSelect.querySelectorAll('option')).map(
      opt => opt.value,
    );

    expect(options).toEqual(['css', 'tailwind', 'styled-components']);
  });

  it('should call navigator when framework changes', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const testNavigator: BrowserNavigator = {
      getCurrentPath: () => '/docs/framework/html/style/css/getting-started/',
      navigate,
    };

    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={testNavigator}
      />,
    );

    const frameworkSelect = screen.getByLabelText('Framework:');
    await user.selectOptions(frameworkSelect, 'react');

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining('/docs/framework/react/'),
      expect.any(Boolean),
    );
  });

  it('should call navigator when style changes', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const testNavigator: BrowserNavigator = {
      getCurrentPath: () => '/docs/framework/html/style/css/getting-started/',
      navigate,
    };

    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={testNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    await user.selectOptions(styleSelect, 'tailwind');

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining('/docs/framework/html/style/tailwind/'),
      expect.any(Boolean),
    );
  });

  it('should use correct guide slug when navigating', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const testNavigator: BrowserNavigator = {
      getCurrentPath: () => '/docs/framework/html/style/css/concepts/everyone/',
      navigate,
    };

    render(
      <Selectors
        currentFramework="html"
        currentStyle="css"
        navigator={testNavigator}
      />,
    );

    const styleSelect = screen.getByLabelText('Style:');
    await user.selectOptions(styleSelect, 'tailwind');

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining('/concepts/everyone/'),
      expect.any(Boolean),
    );
  });
});
