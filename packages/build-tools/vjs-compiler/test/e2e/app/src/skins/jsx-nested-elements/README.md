# JSX Nested Elements Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test deeply nested element structures

## What This Tests

**React → HTML Pattern:**
```tsx
<div className={styles.Controls}>
  <div className={styles.LeftControls}>
    <div className={styles.ButtonGroup}>
      <PlayButton className={styles.Button}>
```

Should preserve nesting depth and structure correctly.

## Expected Output

Web component should have:
- Correct nesting depth (4+ levels)
- All closing tags present
- Proper indentation
- All class attributes transformed correctly at each level

## Why This Matters

Real skins have deep nesting structures. The compiler must preserve structure while transforming className values.
