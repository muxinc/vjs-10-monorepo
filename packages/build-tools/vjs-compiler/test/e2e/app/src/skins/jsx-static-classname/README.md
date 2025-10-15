# JSX Static ClassName Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test static string className values

## What This Tests

**React → HTML Pattern:**
```tsx
className="wrapper"
```

Should transform to:
```html
class="wrapper"
```

This tests handling of literal string className values (no style key lookup).

## Expected Output

Web component should have:
- Static class attribute with literal value preserved
- No transformation needed for literal strings

## Why This Matters

Not all class names come from the styles object - some are just static strings for hooks or utility classes.
