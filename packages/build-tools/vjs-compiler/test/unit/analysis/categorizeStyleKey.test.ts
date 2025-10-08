/**
 * Unit tests for style key categorization
 */

import { describe, expect, it } from 'vitest';
import { categorizeStyleKey } from '../../../src/core/analysis/categorizeStyleKey.js';
import type { StyleKeyUsage } from '../../../src/types.js';

describe('categorizeStyleKey', () => {
  it('identifies Component Selector Identifier (exact match)', () => {
    const styleKey: StyleKeyUsage = {
      key: 'PlayButton',
      usedOn: ['PlayButton'],
    };

    const category = categorizeStyleKey(styleKey, ['PlayButton', 'PauseButton']);

    expect(category).toBe('component-selector-id');
  });

  it('identifies Component Type Selector (suffix pattern)', () => {
    const styleKey: StyleKeyUsage = {
      key: 'Button',
      usedOn: ['PlayButton', 'PauseButton'],
    };

    const category = categorizeStyleKey(styleKey, ['PlayButton', 'PauseButton']);

    expect(category).toBe('component-type-selector');
  });

  it('identifies Nested Component Selector (compound)', () => {
    const styleKey: StyleKeyUsage = {
      key: 'RangeRoot',
      usedOn: ['TimeRange.Root'],
    };

    const category = categorizeStyleKey(styleKey, ['TimeRange.Root', 'TimeRange.Track']);

    expect(category).toBe('nested-component-selector');
  });

  it('identifies Generic Selector (no component match)', () => {
    const styleKey: StyleKeyUsage = {
      key: 'Controls',
      usedOn: ['div'],
    };

    const category = categorizeStyleKey(styleKey, ['PlayButton', 'PauseButton']);

    expect(category).toBe('generic-selector');
  });

  it('handles multiple components with shared suffix', () => {
    const styleKey: StyleKeyUsage = {
      key: 'Icon',
      usedOn: ['PlayIcon', 'PauseIcon', 'VolumeIcon'],
    };

    const category = categorizeStyleKey(styleKey, ['PlayIcon', 'PauseIcon', 'VolumeIcon']);

    expect(category).toBe('component-type-selector');
  });

  it('handles MediaContainer as Component Selector Identifier', () => {
    const styleKey: StyleKeyUsage = {
      key: 'MediaContainer',
      usedOn: ['MediaContainer'],
    };

    const category = categorizeStyleKey(styleKey, ['MediaContainer', 'PlayButton']);

    expect(category).toBe('component-selector-id');
  });

  it('handles compound component with multiple parts', () => {
    const styleKey: StyleKeyUsage = {
      key: 'RangeTrack',
      usedOn: ['TimeRange.Track'],
    };

    const category = categorizeStyleKey(styleKey, ['TimeRange.Root', 'TimeRange.Track']);

    expect(category).toBe('nested-component-selector');
  });
});
