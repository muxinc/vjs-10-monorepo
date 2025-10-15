# Border Utilities Test

**Category:** Category 2 - Tailwind Utility Classes
**Purpose:** Test border and ring utilities

## What This Tests

**Tailwind Classes:**
- `rounded-full` - border-radius: 9999px
- `ring` - box-shadow: 0 0 0 3px ...
- `ring-white/10` - ring color with opacity
- `rounded` - border-radius: 0.25rem

## Expected CSS Output

```css
.controls {
  border-radius: 9999px;
  box-shadow: 0 0 0 3px rgb(255 255 255 / 0.1);
}

.button {
  border-radius: 0.25rem;
}
```

## Why This Matters

Rounded corners and rings are heavily used in modern UI design.
