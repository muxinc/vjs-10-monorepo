# JSX Single Style Key Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test simplest className pattern with single style key

## What This Tests

**React → HTML Pattern:**
```tsx
className={styles.Button}
```

Should transform to:
```html
class="button"
```

This is the **simplest possible** className pattern - a single lookup into the styles object.

## Expected Output

Web component should have:
- Static class attributes (no JSX expressions)
- Correct class names matching style keys
- Valid HTML structure

## Why This Matters

This is the baseline test for JSX className transformation. If this doesn't work, nothing will.
