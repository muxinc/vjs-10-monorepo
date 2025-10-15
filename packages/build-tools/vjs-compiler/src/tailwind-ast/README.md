# Tailwind AST Parser (V1)

This directory contains the Tailwind CSS AST parser from the V1 compiler implementation.

## Purpose

This code was migrated from `src-v1/tailwind-ast/` to preserve the sophisticated parsing logic that handled **named groups** (`group/root`, `group-hover/root:`) in Tailwind v3.

## Current Status

**NOT CURRENTLY USED** - This code is preserved for potential future integration.

## Why It Exists

The V2 compiler uses Tailwind v4's JIT engine directly, which doesn't support named groups. The V1 implementation (~1900 lines) included:

1. **Custom AST Parser** - Parsed Tailwind class strings into structured AST
2. **Named Group Support** - Handled `group/name` syntax for compound selectors
3. **Arbitrary Value Parsing** - Decoded arbitrary values like `[#3b82f6]`
4. **Design System** - Defined spacing, colors, and other design tokens

## Why Named Groups Matter

Named groups are **CRITICAL** for production use:
- Used 15+ times in production `MediaSkinDefault.tsx`
- Enable show/hide controls on hover: `group-hover/root:opacity-100`
- Interactive button states: `group-hover/button:[&_.arrow]:translate-x-1`
- Focus interactions: `group-focus-within/slider:opacity-100`

## Files

- `candidate.ts` - Main AST parser (~600 lines)
- `segment.ts` - Utility for parsing variant segments
- `decode-arbitrary-value.ts` - Decodes `[...]` arbitrary values
- `is-valid-arbitrary.ts` - Validates arbitrary value syntax
- `value-parser.ts` - Parses Tailwind utility values
- `design-system.ts` - Design token definitions
- `index.ts` - Public API exports

## Future Integration

If implementing named groups support in V2:

1. Study `candidate.ts` lines 604-728 for named group parsing logic
2. Consider adapting the AST approach for Tailwind v4 syntax
3. Or contribute named group support upstream to Tailwind v4

## References

- V1 Implementation: See `archive/v1-compiler` branch at commit `a4d55a5`
- Feature Status: See `docs/tailwind/SUPPORT_STATUS.md`
- Lessons Learned: See `docs/LESSONS_FROM_V1.md`
