# Data Attribute Value Test

**Category:** Category 3 - State Modifiers
**Purpose:** Test data-attribute value matching modifier (opacity-only for isolation)

## What This Tests

**Tailwind Classes:**
- `opacity-0` - base opacity (hidden)
- `[data-volume-level="high"_&]:opacity-100` - show when parent has specific data-volume-level value

**Test Isolation:** Uses ONLY opacity utilities to test data-attribute value matching.

## Expected CSS Output

```css
.icon {
  opacity: 0;
}

[data-volume-level="high"] .icon {
  opacity: 1;
}
```

## Why This Matters

Value-based data attributes are common in VJS (volume levels, playback rates, etc.). This tests the `[data-attr="value"_&]` pattern.
