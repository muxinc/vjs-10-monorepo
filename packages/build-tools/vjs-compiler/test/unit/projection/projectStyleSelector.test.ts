/**
 * Unit tests for style selector projection
 */

import { describe, expect, it } from 'vitest';
import { projectStyleSelector } from '../../../src/core/projection/projectStyleSelector.js';
import type { StyleKeyUsage } from '../../../src/types.js';

describe('projectStyleSelector', () => {
  it('projects Component Selector Identifier to element selector', () => {
    const styleKey: StyleKeyUsage = {
      key: 'PlayButton',
      usedOn: ['PlayButton'],
      category: 'component-selector-id',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('play-button');
    expect(projection.needsClassAttribute).toBe(false);
    expect(projection.className).toBeUndefined();
  });

  it('projects MediaContainer to element selector', () => {
    const styleKey: StyleKeyUsage = {
      key: 'MediaContainer',
      usedOn: ['MediaContainer'],
      category: 'component-selector-id',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('media-container');
    expect(projection.needsClassAttribute).toBe(false);
    expect(projection.className).toBeUndefined();
  });

  it('projects Component Type Selector to class selector', () => {
    const styleKey: StyleKeyUsage = {
      key: 'Button',
      usedOn: ['PlayButton', 'PauseButton'],
      category: 'component-type-selector',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('.button');
    expect(projection.needsClassAttribute).toBe(true);
    expect(projection.className).toBe('button');
  });

  it('projects Nested Component Selector to element selector', () => {
    const styleKey: StyleKeyUsage = {
      key: 'RangeRoot',
      usedOn: ['TimeRange.Root'],
      category: 'nested-component-selector',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('time-range-root');
    expect(projection.needsClassAttribute).toBe(false);
    expect(projection.className).toBeUndefined();
  });

  it('projects Generic Selector to class selector', () => {
    const styleKey: StyleKeyUsage = {
      key: 'Controls',
      usedOn: ['div'],
      category: 'generic-selector',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('.controls');
    expect(projection.needsClassAttribute).toBe(true);
    expect(projection.className).toBe('controls');
  });

  it('handles PascalCase to kebab-case conversion', () => {
    const styleKey: StyleKeyUsage = {
      key: 'VolumeIcon',
      usedOn: ['VolumeIcon'],
      category: 'component-selector-id',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('volume-icon');
  });

  it('handles compound component names', () => {
    const styleKey: StyleKeyUsage = {
      key: 'RangeTrack',
      usedOn: ['TimeRange.Track'],
      category: 'nested-component-selector',
    };

    const projection = projectStyleSelector(styleKey);

    expect(projection.cssSelector).toBe('time-range-track');
  });
});
