import type { AstroCookies } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import { ALL_FRAMEWORK_STYLE_COMBINATIONS } from '@/types/docs';
import { FRAMEWORK_COOKIE, getPreferencesServer, setPreferenceClient, STYLE_COOKIE } from '../preferences';

describe('preferences utilities', () => {
  describe('getPreferencesServer', () => {
    it('should return null preferences when no cookies are set', () => {
      const mockCookies = {
        has: vi.fn().mockReturnValue(false),
        get: vi.fn(),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: null, style: null });
    });

    it('should return framework preference when only framework cookie is set', () => {
      const mockCookies = {
        has: vi.fn((name: string) => name === FRAMEWORK_COOKIE),
        get: vi.fn((name: string) => {
          if (name === FRAMEWORK_COOKIE) {
            return { value: 'react' };
          }
          return null;
        }),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: 'react', style: null });
    });

    it('should return both preferences when both cookies are set with valid values', () => {
      const mockCookies = {
        has: vi.fn().mockReturnValue(true),
        get: vi.fn((name: string) => {
          if (name === FRAMEWORK_COOKIE) {
            return { value: 'react' };
          }
          if (name === STYLE_COOKIE) {
            return { value: 'tailwind' };
          }
          return null;
        }),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: 'react', style: 'tailwind' });
    });

    it('should ignore invalid framework cookie', () => {
      const mockCookies = {
        has: vi.fn().mockReturnValue(true),
        get: vi.fn((name: string) => {
          if (name === FRAMEWORK_COOKIE) {
            return { value: 'invalid-framework' };
          }
          if (name === STYLE_COOKIE) {
            return { value: 'css' };
          }
          return null;
        }),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: null, style: null });
    });

    it('should ignore style cookie when framework is null', () => {
      const mockCookies = {
        has: vi.fn((name: string) => name === STYLE_COOKIE),
        get: vi.fn((name: string) => {
          if (name === STYLE_COOKIE) {
            return { value: 'css' };
          }
          return null;
        }),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: null, style: null });
    });

    it('should ignore style cookie when it is invalid for the framework', () => {
      const mockCookies = {
        has: vi.fn().mockReturnValue(true),
        get: vi.fn((name: string) => {
          if (name === FRAMEWORK_COOKIE) {
            return { value: 'html' };
          }
          if (name === STYLE_COOKIE) {
            return { value: 'styled-components' }; // Not valid for HTML
          }
          return null;
        }),
      } as unknown as AstroCookies;

      const result = getPreferencesServer(mockCookies);

      expect(result).toEqual({ framework: 'html', style: null });
    });

    it('should accept valid framework/style combinations', () => {
      const testCases = ALL_FRAMEWORK_STYLE_COMBINATIONS;

      for (const { framework, style } of testCases) {
        const mockCookies = {
          has: vi.fn().mockReturnValue(true),
          get: vi.fn((name: string) => {
            if (name === FRAMEWORK_COOKIE) {
              return { value: framework };
            }
            if (name === STYLE_COOKIE) {
              return { value: style };
            }
            return null;
          }),
        } as unknown as AstroCookies;

        const result = getPreferencesServer(mockCookies);

        expect(result).toEqual({ framework, style });
      }
    });
  });

  describe('setPreferenceClient', () => {
    it('should set both framework and style cookies', () => {
      // Mock document.cookie
      const cookies: string[] = [];
      Object.defineProperty(document, 'cookie', {
        get: () => cookies.join('; '),
        set: (value: string) => {
          cookies.push(value);
        },
        configurable: true,
      });

      setPreferenceClient('react', 'tailwind');

      expect(cookies).toHaveLength(2);
      expect(cookies[0]).toContain('vjs_docs_framework=react');
      expect(cookies[0]).toContain('max-age=31536000');
      expect(cookies[0]).toContain('path=/');
      expect(cookies[0]).toContain('samesite=lax');
      expect(cookies[1]).toContain('vjs_docs_style=tailwind');
    });

    it('should throw error for invalid framework', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        setPreferenceClient('invalid-framework', 'css');
      }).toThrow('Invalid framework: invalid-framework');
    });

    it('should throw error for invalid style for framework', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        setPreferenceClient('html', 'styled-components');
      }).toThrow('Invalid style "styled-components" for framework "html"');
    });

    it('should accept all valid framework/style combinations', () => {
      const testCases: Array<{ framework: 'react' | 'html'; style: any }> = [
        { framework: 'react', style: 'css' },
        { framework: 'react', style: 'tailwind' },
        { framework: 'react', style: 'styled-components' },
        { framework: 'html', style: 'css' },
        { framework: 'html', style: 'tailwind' },
      ];

      for (const { framework, style } of testCases) {
        // Mock document.cookie
        const cookies: string[] = [];
        Object.defineProperty(document, 'cookie', {
          get: () => cookies.join('; '),
          set: (value: string) => {
            cookies.push(value);
          },
          configurable: true,
        });

        expect(() => {
          setPreferenceClient(framework, style);
        }).not.toThrow();
      }
    });

    it('should do nothing when document is undefined (SSR)', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error Testing SSR scenario
      globalThis.document = undefined;

      expect(() => {
        setPreferenceClient('react', 'css');
      }).not.toThrow();

      globalThis.document = originalDocument;
    });
  });
});
