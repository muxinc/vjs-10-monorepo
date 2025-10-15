# Gradients Test

**Category:** Category 4 - Advanced Tailwind Features
**Purpose:** Test gradient backgrounds with color stops

## What This Tests

**Tailwind Classes:**
- `bg-gradient-to-t` - linear-gradient direction (to top)
- `from-black/50` - gradient start color with opacity
- `via-black/20` - gradient middle color with opacity
- `to-transparent` - gradient end color (transparent)

## Expected CSS Output

```css
.overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to top, rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.2), transparent);
}
```

## Why This Matters

Gradients are used extensively in video player UIs for overlays that improve text contrast. This tests gradient utility transformation.
