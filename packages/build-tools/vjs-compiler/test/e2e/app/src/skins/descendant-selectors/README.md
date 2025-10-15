# Descendant Selectors Test

**Category:** Category 4 - Advanced Tailwind Features
**Purpose:** Test arbitrary variant descendant selectors with `[&_selector]` pattern

## What This Tests

**Tailwind Classes:**
- `[&_.pause-icon]:opacity-100` - targets .pause-icon descendants
- `[&_.play-icon]:opacity-0` - targets .play-icon descendants

## Expected CSS Output

```css
.button .pause-icon {
  opacity: 1;
}

.button .play-icon {
  opacity: 0;
}
```

## Why This Matters

Descendant selectors are heavily used in production for targeting nested icon states. This tests the `[&_selector]` pattern transformation.
