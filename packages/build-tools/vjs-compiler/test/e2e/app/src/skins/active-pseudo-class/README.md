# Active Pseudo-Class Test

**Category:** Category 3 - State Modifiers
**Purpose:** Test active: modifier (opacity-only for isolation)

## What This Tests

**Tailwind Classes:**
- `opacity-100` - base opacity
- `active:opacity-60` - opacity when pressed/clicked

**Test Isolation:** Uses ONLY opacity utilities to test active modifier mechanism without dependencies on other utilities.

## Expected CSS Output

```css
.button {
  opacity: 1;
}

.button:active {
  opacity: 0.6;
}
```

## Why This Matters

Active states provide visual feedback during button presses. This tests the `:active` pseudo-class transformation.
