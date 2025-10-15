# JSX Template Literal Two Keys Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test template literal with two style keys

## What This Tests

**React → HTML Pattern:**
```tsx
className={`${styles.Button} ${styles.IconButton}`}
```

Should transform to:
```html
class="button icon-button"
```

This tests the compiler's ability to resolve template literals with multiple style keys.

## Expected Output

Web component should have:
- Static class attributes (no template literal syntax)
- Both class names present in single class attribute
- Correct spacing between class names

## Why This Matters

This is the most common pattern in production code - combining base styles with modifiers or variants.
