import { describe, it, expect } from 'vitest';
import { validateHTML, isValidCustomElementName } from './utils/validator.js';

describe('isValidCustomElementName', () => {
  it('validates custom element names with hyphens', () => {
    expect(isValidCustomElementName('media-play-button')).toBe(true);
    expect(isValidCustomElementName('my-element')).toBe(true);
    expect(isValidCustomElementName('super-button')).toBe(true);
  });

  it('rejects names without hyphens', () => {
    expect(isValidCustomElementName('button')).toBe(false);
    expect(isValidCustomElementName('mediaplaybutton')).toBe(false);
  });

  it('rejects names starting with uppercase', () => {
    expect(isValidCustomElementName('Media-button')).toBe(false);
    expect(isValidCustomElementName('Button-play')).toBe(false);
  });

  it('rejects names with uppercase anywhere', () => {
    expect(isValidCustomElementName('media-Play-button')).toBe(false);
    expect(isValidCustomElementName('media-button-Play')).toBe(false);
  });

  it('validates complex valid names', () => {
    expect(isValidCustomElementName('media-time-range-root')).toBe(true);
    expect(isValidCustomElementName('media-volume-high-icon')).toBe(true);
    expect(isValidCustomElementName('x-foo-bar-baz')).toBe(true);
  });
});

describe('validateHTML', () => {
  it('validates simple valid HTML', async () => {
    const result = await validateHTML('<div>Hello</div>');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates custom elements', async () => {
    const result = await validateHTML('<media-play-button>Play</media-play-button>');
    expect(result.valid).toBe(true);
  });

  it('validates nested custom elements', async () => {
    const html = `
      <media-container>
        <media-play-button>
          <media-play-icon></media-play-icon>
        </media-play-button>
      </media-container>
    `;
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });

  it('validates compound component names', async () => {
    const html = `
      <media-time-range-root>
        <media-time-range-track>
          <media-time-range-progress></media-time-range-progress>
        </media-time-range-track>
      </media-time-range-root>
    `;
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });

  it('validates boolean attributes', async () => {
    const result = await validateHTML('<button disabled>Click</button>');
    expect(result.valid).toBe(true);
  });

  it('validates slot elements', async () => {
    const html = '<slot name="media" slot="media"></slot>';
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });

  it('validates empty class attributes', async () => {
    const html = '<div class="">Content</div>';
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });

  it('detects invalid HTML', async () => {
    const result = await validateHTML('<div><span></div></span>');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates attributes with aria- prefix', async () => {
    const html = '<button aria-label="Play">Play</button>';
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });

  it('validates data- attributes', async () => {
    const html = '<div data-testid="test">Content</div>';
    const result = await validateHTML(html);
    expect(result.valid).toBe(true);
  });
});
