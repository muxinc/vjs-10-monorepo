# Focus Pseudo-Class Test

**Category:** Category 3 - State Modifiers
**Purpose:** Test focus-visible: modifier (opacity-only for isolation)

## What This Tests

**Tailwind Classes:**
- `opacity-80` - base opacity
- `focus-visible:opacity-100` - opacity on keyboard focus

**Test Isolation:** Uses ONLY opacity utilities to test focus modifier mechanism without dependencies on other utilities.

## Expected CSS Output

```css
.button {
  opacity: 0.8;
}

.button:focus-visible {
  opacity: 1;
}
```

## Why This Matters

Focus states are critical for keyboard accessibility. This tests the `:focus-visible` pseudo-class transformation.
