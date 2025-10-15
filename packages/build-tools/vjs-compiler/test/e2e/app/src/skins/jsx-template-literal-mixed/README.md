# JSX Template Literal Mixed Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test template literal mixing style keys with component props

## What This Tests

**React → HTML Pattern:**
```tsx
className={`${styles.Container} ${className}`}
```

Should transform to:
```html
class="container"
```

This tests handling of template literals that mix style keys with dynamic props (the prop gets removed in web component).

## Expected Output

Web component should have:
- Only the static style class (props like `className` are for React component interface)
- Correct transformation of mixed template patterns

## Why This Matters

Production code often mixes internal styles with external props for composability.
