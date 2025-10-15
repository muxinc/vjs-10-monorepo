# Data Attribute Presence Test

**Category:** Category 3 - State Modifiers
**Purpose:** Test data-attribute presence modifier (opacity-only for isolation)

## What This Tests

**Tailwind Classes:**
- `opacity-0` - base opacity (hidden)
- `[data-paused_&]:opacity-100` - show when parent has data-paused attribute

**Test Isolation:** Uses ONLY opacity utilities to test data-attribute modifier mechanism.

## Expected CSS Output

```css
.icon {
  opacity: 0;
}

[data-paused] .icon {
  opacity: 1;
}
```

## Why This Matters

Data attributes are how VJS components communicate state. The `[data-paused_&]` pattern tests descendant selectors with data attributes.
