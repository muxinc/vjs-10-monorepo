# Color Utilities Test

**Category:** Category 2 - Tailwind Utility Classes
**Purpose:** Test color utilities with opacity modifiers

## What This Tests

**Tailwind Classes:**
- `bg-white/10` - background-color: rgb(255 255 255 / 0.1)
- `text-white` - color: rgb(255 255 255)
- `bg-transparent` - background-color: transparent

## Expected CSS Output

```css
.controls {
  background-color: rgb(255 255 255 / 0.1);
  color: rgb(255 255 255);
}

.button {
  background-color: transparent;
}
```

## Why This Matters

Color with opacity is heavily used in production for glass-morphism effects.
