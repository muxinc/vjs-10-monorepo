# Arbitrary Values Test

**Category:** Category 4 - Advanced Tailwind Features
**Purpose:** Test arbitrary values with bracket notation

## What This Tests

**Tailwind Classes:**
- `text-[0.8125rem]` - font-size with custom value
- `rounded-[0.625rem]` - border-radius with custom value

## Expected CSS Output

```css
.button {
  font-size: 0.8125rem;
  border-radius: 0.625rem;
}
```

## Why This Matters

Arbitrary values allow precise control when predefined utilities don't match design specs. Production code uses these heavily for exact pixel-perfect values.
