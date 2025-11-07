import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compile } from '../src';
import { elementExists, getClasses, parseElement, querySelector, querySelectorAll } from './helpers/dom';

describe('example: Minimal Skin (DOM)', () => {
  it('compiles example-minimal.tsx with correct DOM structure', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/example-minimal.tsx'),
      'utf-8',
    );

    const result = compile(source);
    const root = parseElement(result.html);

    // Root element
    expect(root.tagName.toLowerCase()).toBe('media-container');
    expect(getClasses(root)).toContain('container');

    // Children slot
    const slot = querySelector(root, 'slot[name="media"]');
    expect(slot.getAttribute('slot')).toBe('media');

    // Controls container
    const controls = querySelector(root, 'div.controls');
    expect(controls).toBeDefined();

    // Play button
    const playButton = querySelector(controls, 'media-play-button');
    expect(getClasses(playButton)).toContain('play-button');

    // Time slider - verify Root → base element (no -root suffix)
    const timeSlider = querySelector(controls, 'media-time-slider');
    expect(getClasses(timeSlider)).toContain('slider-root');

    // Time slider track
    const track = querySelector(timeSlider, 'media-time-slider-track');
    expect(getClasses(track)).toContain('slider-track');

    // Time slider progress
    const progress = querySelector(track, 'media-time-slider-progress');
    expect(getClasses(progress)).toContain('slider-progress');

    // Verify no media-time-slider-root exists (should be media-time-slider)
    expect(elementExists(root, 'media-time-slider-root')).toBe(false);
  });

  it('verifies all expected elements exist in DOM tree', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/example-minimal.tsx'),
      'utf-8',
    );

    const result = compile(source);
    const root = parseElement(result.html);

    // Check root itself
    expect(root.tagName.toLowerCase()).toBe('media-container');

    const expectedSelectors = [
      'slot[name="media"]',
      'div.controls',
      'media-play-button',
      'media-time-slider', // Not media-time-slider-root!
      'media-time-slider-track',
      'media-time-slider-progress',
    ];

    expectedSelectors.forEach((selector) => {
      expect(
        elementExists(root, selector),
        `Expected element to exist: ${selector}`,
      ).toBe(true);
    });
  });

  it('verifies DOM nesting structure', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/example-minimal.tsx'),
      'utf-8',
    );

    const result = compile(source);
    const root = parseElement(result.html);

    // Verify parent-child relationships
    const controls = querySelector(root, 'div.controls');
    const playButton = querySelector(controls, 'media-play-button');
    const timeSlider = querySelector(controls, 'media-time-slider');

    // Play button should be direct child of controls
    expect(playButton.parentElement).toBe(controls);

    // Time slider should be direct child of controls
    expect(timeSlider.parentElement).toBe(controls);

    // Track should be child of time slider
    const track = querySelector(timeSlider, 'media-time-slider-track');
    expect(track.parentElement).toBe(timeSlider);

    // Progress should be child of track
    const progress = querySelector(track, 'media-time-slider-progress');
    expect(progress.parentElement).toBe(track);
  });

  it('verifies all classNames are extracted', () => {
    const source = readFileSync(
      join(__dirname, 'fixtures/example-minimal.tsx'),
      'utf-8',
    );

    const result = compile(source);

    const expectedClasses = [
      'container',
      'controls',
      'play-button',
      'slider-progress',
      'slider-root',
      'slider-track',
    ];

    expect(result.classNames).toEqual(expectedClasses);

    // Verify classes exist in DOM
    const root = parseElement(result.html);

    // Include root element in search
    const allElements = [root, ...querySelectorAll(root, '*')];
    const domClasses = new Set<string>();

    allElements.forEach((el) => {
      getClasses(el).forEach(cls => domClasses.add(cls));
    });

    expectedClasses.forEach((className) => {
      expect(
        domClasses.has(className),
        `Expected class to exist in DOM: ${className}`,
      ).toBe(true);
    });
  });
});
