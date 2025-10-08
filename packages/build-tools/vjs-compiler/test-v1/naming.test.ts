import { describe, expect, it } from 'vitest';

import { toAttributeName, toCustomElementName, toKebabCase } from '../src/utils/naming.js';

describe('toKebabCase', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('PlayButton')).toBe('play-button');
    expect(toKebabCase('CurrentTimeDisplay')).toBe('current-time-display');
    expect(toKebabCase('MediaContainer')).toBe('media-container');
  });

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('showRemaining')).toBe('show-remaining');
    expect(toKebabCase('ariaLabel')).toBe('aria-label');
    expect(toKebabCase('dataTestId')).toBe('data-test-id');
  });

  it('handles consecutive capitals', () => {
    expect(toKebabCase('HTMLElement')).toBe('html-element');
    expect(toKebabCase('XMLHttpRequest')).toBe('xml-http-request');
  });

  it('leaves already kebab-case strings unchanged', () => {
    expect(toKebabCase('already-kebab')).toBe('already-kebab');
    expect(toKebabCase('aria-label')).toBe('aria-label');
  });

  it('handles single word', () => {
    expect(toKebabCase('button')).toBe('button');
    expect(toKebabCase('Button')).toBe('button');
  });
});

describe('toCustomElementName', () => {
  it('converts simple component names', () => {
    expect(toCustomElementName('PlayButton')).toBe('media-play-button');
    expect(toCustomElementName('MuteButton')).toBe('media-mute-button');
    expect(toCustomElementName('FullscreenButton')).toBe('media-fullscreen-button');
  });

  it('converts compound component names (member expressions)', () => {
    expect(toCustomElementName('TimeRange.Root')).toBe('media-time-range-root');
    expect(toCustomElementName('TimeRange.Track')).toBe('media-time-range-track');
    expect(toCustomElementName('TimeRange.Progress')).toBe('media-time-range-progress');
    expect(toCustomElementName('TimeRange.Pointer')).toBe('media-time-range-pointer');
    expect(toCustomElementName('TimeRange.Thumb')).toBe('media-time-range-thumb');
  });

  it('converts icon names', () => {
    expect(toCustomElementName('PlayIcon')).toBe('media-play-icon');
    expect(toCustomElementName('PauseIcon')).toBe('media-pause-icon');
    expect(toCustomElementName('VolumeHighIcon')).toBe('media-volume-high-icon');
  });

  it('preserves built-in HTML elements', () => {
    expect(toCustomElementName('div')).toBe('div');
    expect(toCustomElementName('span')).toBe('span');
    expect(toCustomElementName('button')).toBe('button');
    expect(toCustomElementName('input')).toBe('input');
    expect(toCustomElementName('section')).toBe('section');
    expect(toCustomElementName('slot')).toBe('slot');
  });

  it('preserves already prefixed names', () => {
    expect(toCustomElementName('media-play-button')).toBe('media-play-button');
    expect(toCustomElementName('media-container')).toBe('media-container');
  });
});

describe('toAttributeName', () => {
  it('converts className to class', () => {
    expect(toAttributeName('className')).toBe('class');
  });

  it('converts camelCase to kebab-case', () => {
    expect(toAttributeName('showRemaining')).toBe('show-remaining');
    expect(toAttributeName('ariaLabel')).toBe('aria-label');
    expect(toAttributeName('dataTestId')).toBe('data-test-id');
  });

  it('preserves already kebab-case attributes', () => {
    expect(toAttributeName('aria-label')).toBe('aria-label');
    expect(toAttributeName('data-value')).toBe('data-value');
    expect(toAttributeName('some-attr')).toBe('some-attr');
  });

  it('handles standard HTML attributes', () => {
    expect(toAttributeName('disabled')).toBe('disabled');
    expect(toAttributeName('hidden')).toBe('hidden');
    expect(toAttributeName('type')).toBe('type');
  });
});
