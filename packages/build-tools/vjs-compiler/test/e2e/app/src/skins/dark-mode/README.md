# Dark Mode Test

**Category:** Category 3 - State Modifiers
**Purpose:** Test dark: modifier (opacity-only for isolation)

## What This Tests

**Tailwind Classes:**
- `opacity-80` - base opacity (light mode)
- `dark:opacity-60` - different opacity in dark mode

**Test Isolation:** Uses ONLY opacity utilities to test dark mode modifier mechanism.

## Expected CSS Output

```css
.button {
  opacity: 0.8;
}

@media (prefers-color-scheme: dark) {
  .button {
    opacity: 0.6;
  }
}
```

OR (if using class strategy):

```css
.button {
  opacity: 0.8;
}

.dark .button {
  opacity: 0.6;
}
```

## Why This Matters

Dark mode support is essential for modern applications. This tests the `dark:` modifier transformation.
