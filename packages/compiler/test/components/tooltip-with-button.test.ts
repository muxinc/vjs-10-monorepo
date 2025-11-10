/**
 * Tests for: tooltip-with-button.tsx
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

describe('fixture: Tooltip - With Button (v0.1 limitation)', () => {
  let result: CompileResult;
  let root: Element;

  beforeAll(() => {
    const source = readFileSync(
      join(__dirname, '../fixtures/components/interactive/tooltip-with-button.tsx'),
      'utf-8',
    );
    result = compile(source);
    root = parseElement(result.html);
  });

  describe('current behavior (incorrect for HTML package)', () => {
    it('the Tooltip.Root component transforms to media-tooltip (Root rule)', () => {
      expect(root.tagName.toLowerCase()).toBe('media-tooltip');
    });

    it('contains nested media-tooltip-trigger', () => {
      const trigger = querySelector(root, 'media-tooltip-trigger');
      expect(trigger).toBeDefined();
    });

    it('button is nested inside trigger', () => {
      const trigger = querySelector(root, 'media-tooltip-trigger');
      const button = querySelector(trigger, 'media-play-button');
      expect(button).toBeDefined();
    });

    it('contains media-tooltip-portal', () => {
      const portal = querySelector(root, 'media-tooltip-portal');
      expect(portal).toBeDefined();
    });

    it('contains media-tooltip-positioner', () => {
      const positioner = querySelector(root, 'media-tooltip-positioner');
      expect(positioner).toBeDefined();
    });

    it('contains media-tooltip-popup', () => {
      const popup = querySelector(root, 'media-tooltip-popup');
      expect(popup).toBeDefined();
    });

    it('delay prop preserved on root', () => {
      expect(root.getAttribute('delay')).toBe('500');
    });
  });

  describe('pending TODO: Phase 2 target structure', () => {
    it.todo('should extract button as sibling with commandfor');
    it.todo('should flatten to single media-tooltip element');
    it.todo('should merge attributes from Root/Positioner/Popup');
    it.todo('should generate unique ID for linking');
    it.todo('should add popover="manual" attribute');
  });
});
