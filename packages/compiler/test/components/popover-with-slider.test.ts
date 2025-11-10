/**
 * Tests for: popover-with-slider.tsx
 *
 * NOTE: Documents v0.1 limitation - incorrect nested structure
 * Phase 2 will implement proper flat commandfor pattern
 */

import type { CompileResult } from '../../src';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { compile } from '../../src';
import { parseElement, querySelector } from '../helpers/dom';

describe('fixture: Popover - With Slider (v0.1 limitation)', () => {
  let result: CompileResult;
  let root: Element;

  beforeAll(() => {
    const source = readFileSync(
      join(__dirname, '../fixtures/components/interactive/popover-with-slider.tsx'),
      'utf-8',
    );
    result = compile(source);
    root = parseElement(result.html);
  });

  describe('current behavior (incorrect for HTML package)', () => {
    it('the Popover.Root component transforms to media-popover (Root rule)', () => {
      expect(root.tagName.toLowerCase()).toBe('media-popover');
    });

    it('contains nested media-popover-trigger', () => {
      const trigger = querySelector(root, 'media-popover-trigger');
      expect(trigger).toBeDefined();
    });

    it('button is nested inside trigger', () => {
      const trigger = querySelector(root, 'media-popover-trigger');
      const button = querySelector(trigger, 'media-mute-button');
      expect(button).toBeDefined();
    });

    it('contains media-popover-popup', () => {
      const popup = querySelector(root, 'media-popover-popup');
      expect(popup).toBeDefined();
    });

    it('slider is nested in popup', () => {
      const popup = querySelector(root, 'media-popover-popup');
      const slider = querySelector(popup, 'media-volume-slider');
      expect(slider).toBeDefined();
    });

    it('openOnHover prop transforms to open-on-hover', () => {
      // Boolean props become attributes with "true" value
      expect(root.hasAttribute('open-on-hover')).toBe(true);
    });

    it('delay prop preserved', () => {
      expect(root.getAttribute('delay')).toBe('200');
    });

    it('closeDelay prop preserved', () => {
      expect(root.getAttribute('close-delay')).toBe('100');
    });
  });

  describe('pending TODO: Phase 2 target structure', () => {
    it.todo('should extract button as sibling with commandfor and command attributes');
    it.todo('should flatten to single media-popover element');
    it.todo('should merge attributes from Root/Positioner/Popup');
    it.todo('should generate unique ID for linking');
  });
});
