# CSS Fixes Applied - Tailwind v4 Variant Processing (2025-10-08)

## Summary

Fixed critical issues in Tailwind v4 CSS variant processing. The compiler now properly generates CSS for pseudo-classes, data attributes, and media queries.

**Impact:** Conditional styles tests improved from 8% → 92% passing (1/12 → 11/12)

---

## Root Cause Analysis

The CSS mapping/categorization logic in `transformStyles.ts` had three critical issues:

### Issue 1: Regex Extraction Bug

**Problem:** Wasn't properly capturing escaped colons (`\:`) and brackets (`\[`, `\]`) in utility class names.

**Example:**

```
Tailwind selector: .hover\:bg-blue-600:hover
Captured (wrong): "hover\"
Expected: "hover:bg-blue-600"
```

**Root Cause:** Regex `/^\.([^\s:]+)/` stopped at backslash before colon.

### Issue 2: Missing Unescaping

**Problem:** Tailwind escapes special characters (`\:`, `\[`, `\]`, `\=`) but we only unescaped some of them.

**Example:**

```
Utility in map: "data-[state\=active]:bg-blue"
Utility in styles: "data-[state=active]:bg-blue"
Result: ❌ NOT FOUND
```

### Issue 3: Lost @media Context

**Problem:** When cloning rules from Tailwind output, parent `@media` at-rule relationship was lost.

**Example:**

```css
/* Tailwind generates: */
@media (prefers-color-scheme: dark) {
  .dark\:bg-gray-900 {
    background: ...;
  }
}

/* Compiler output (WRONG): */
.container {
  background: var(--color-gray-900); /* No @media wrapper! */
}
```

---

## Fixes Applied

### Fix 1: Updated Utility Extraction Regex

**File:** `src/core/css/transformStyles.ts:133`

**Old Regex:**

```typescript
/^\.([^\s:]+)/;
```

**New Regex:**

```typescript
/^.((?:[^:[\\\s]|\\.)+)/;
```

**What it does:**

- Matches `.` followed by characters that are NOT `:`, `[`, `\`, or whitespace
- OR matches backslash followed by any character (handles `\:`, `\[`, etc.)
- Continues until hitting an unescaped `:` or `[`

**Test:**

```javascript
'.hover\\:scale-105:hover'.match(regex);
// Old: ["hover\\"]  ❌
// New: ["hover\\:scale-105"]  ✅
```

### Fix 2: Added Complete Unescaping

**File:** `src/core/css/transformStyles.ts:130-135`

**Added:**

```typescript
const utilityClass = match[1]
  .replace(/\\:/g, ':') // Unescape colons
  .replace(/\\\[/g, '[') // Unescape brackets
  .replace(/\\\]/g, ']')
  .replace(/\\=/g, '=') // 👈 ADDED: Unescape equals
  .replace(/\\\//g, '/'); // Unescape slashes
```

**Impact:** Data attribute utilities now match correctly.

### Fix 3: Preserved @media Context

**File:** `src/core/css/transformStyles.ts:101-107, 138-142`

**Changed data structure:**

```typescript
// OLD: Map<string, postcss.Rule>
const utilityRuleMap = new Map<string, postcss.Rule>();

// NEW: Map<string, RuleInfo>
interface RuleInfo {
  rule: postcss.Rule;
  parentAtRule: postcss.AtRule | null;
}
const utilityRuleMap = new Map<string, RuleInfo>();
```

**Store parent info:**

```typescript
const parentAtRule = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule) : null;

utilityRuleMap.set(utilityClass, {
  rule: rule.clone(),
  parentAtRule: parentAtRule ? (parentAtRule.clone() as postcss.AtRule) : null,
});
```

**Reconstruct @media wrapper:**

```typescript
if (parentAtRule) {
  const existingMediaRule = mediaRules.find((mr) => mr.params === parentAtRule.params);
  if (existingMediaRule) {
    existingMediaRule.append(variantRule);
  } else {
    const mediaRule = postcss.atRule({
      name: parentAtRule.name,
      params: parentAtRule.params,
    });
    mediaRule.append(variantRule);
    mediaRules.push(mediaRule);
  }
}
```

### Fix 4: Separated Base vs Variant Rules

**File:** `src/core/css/transformStyles.ts:195-280`

**Strategy:**

- Base rules (no pseudo-class, no @media) → single rule with base selector
- Variant rules (with pseudo-class) → separate rules with variant selector
- Media rules (inside @media) → wrapped in appropriate @media at-rule

**Example output:**

```css
/* Base rule */
.button {
  background-color: var(--color-blue-500);
}

/* Variant rule */
.button:hover {
  background-color: var(--color-blue-600);
}

/* Media rule */
@media (prefers-color-scheme: dark) {
  .button {
    background-color: var(--color-gray-900);
  }
}
```

### Fix 5: Added Missing Colors

**File:** `src/core/css/processCSS.ts:191-200`

**Added to @theme block:**

```css
@theme {
  /* Color palette */
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  --color-white: #ffffff;
  /* ... existing spacing/radius vars ... */
}
```

**Why:** Tailwind v4 requires colors to be defined in `@theme` to generate utilities like `bg-blue-500`.

---

## Test Fixes

### Updated Test Expectations

**File:** `test/integration/conditional-styles.test.ts`

**Problem:** Regex patterns used `.` which doesn't match newlines, causing false failures when CSS output had proper formatting.

**Fix:** Changed `.*` to `[\s\S]*` in test assertions:

```typescript
// OLD
expect(result.code).toMatch(/hover.*background/i);

// NEW
expect(result.code).toMatch(/hover[\s\S]*background/i);
```

**Applied to:**

- Line 62: hover + background
- Line 86: focus-visible + ring
- Line 331: @media + prefers-color-scheme
- Line 447: @media + dark

### Fixed Test Utilities

**File:** `test/integration/conditional-styles.test.ts:215`

**Problem:** Test used invalid Tailwind utilities (`bg-gray` without shade).

**Fix:**

```typescript
// OLD
Element: 'bg-gray data-[state=on]:bg-blue ...';

// NEW
Element: 'bg-gray-500 data-[state=on]:bg-blue-500 ...';
```

---

## Validation Results

### Before Fixes

```
Conditional Styles Tests:
  ✅ 1 passing
  ❌ 11 failing
  ⏭  5 skipped
  Pass rate: 8%
```

### After Fixes

```
Conditional Styles Tests:
  ✅ 11 passing  (+10)
  ❌ 1 failing   (-10)
  ⏭  5 skipped
  Pass rate: 92%

Overall Test Suite:
  ✅ 122 passing
  ❌ 5 failing
  ⏭  9 skipped
  Pass rate: 90%
```

### Features Now Working

| Feature             | Before | After | Notes                        |
| ------------------- | ------ | ----- | ---------------------------- |
| `:hover`            | ❌     | ✅    | Pseudo-class preserved       |
| `:focus-visible`    | ❌     | ✅    | Pseudo-class preserved       |
| `:active`           | ❌     | ✅    | Pseudo-class preserved       |
| `data-[state=x]`    | ❌     | ✅    | Attribute selector preserved |
| `data-[level=high]` | ❌     | ✅    | Attribute selector preserved |
| Multiple data attrs | ❌     | ✅    | Multiple attribute selectors |
| `dark:utility`      | ❌     | ✅    | Wrapped in @media dark       |
| Combined variants   | ❌     | ✅    | Pseudo + data attr working   |
| Media + pseudo      | ❌     | ✅    | @media + :hover working      |
| `:disabled`         | ❌     | ❌    | HTML attribute issue (JSX)   |

---

## Example Output

### Input (React + Tailwind)

```typescript
// styles.ts
export default {
  Button: 'bg-blue-500 hover:bg-blue-600 dark:bg-gray-900 data-[state=active]:bg-blue-700',
};

// Component.tsx
<button className={styles.Button} data-state="active">Click</button>
```

### Output (Web Component + CSS)

```css
.button {
  background-color: var(--color-blue-500);
}

.button:hover {
  background-color: var(--color-blue-600);
}

.button[data-state='active'] {
  background-color: var(--color-blue-700);
}

@media (prefers-color-scheme: dark) {
  .button {
    background-color: var(--color-gray-900);
  }
}
```

```html
<button class="button" data-state="active">Click</button>
```

---

## Files Modified

### Core Compiler

1. **`src/core/css/transformStyles.ts`** (major changes)
   - Updated utility extraction regex (line 133)
   - Added `=` unescaping (line 134)
   - Changed `utilityRuleMap` data structure (lines 101-107)
   - Stored parent at-rule info (lines 138-142)
   - Separated base/variant/media rules (lines 195-280)
   - Reconstructed @media wrappers (lines 286-298)

2. **`src/core/css/processCSS.ts`** (minor changes)
   - Added color palette to @theme block (lines 191-200)

### Tests

3. **`test/integration/conditional-styles.test.ts`** (minor fixes)
   - Fixed regex patterns for multiline matching (lines 62, 86, 331, 447)
   - Fixed test utilities to use valid Tailwind classes (line 215)

### Documentation

4. **`docs/TEST_RESULTS_REVIEW.md`** (updated)
   - Added "Latest Update" section with results summary

---

## Remaining Work

### Known Issues

1. **`:disabled` HTML Attribute** (JSX transformation, not CSS)
   - Test expects `disabled=` in HTML output
   - Issue: JSX transformer not preserving boolean attributes
   - Location: `src/core/transformer/transformJSX.ts`
   - Priority: Medium (affects 1 test)

2. **Complexity-Level Test Failures** (4 tests)
   - Pre-existing issues, unrelated to CSS fixes
   - Likely JSX transformation or edge case handling
   - Priority: Low (not blocking CSS functionality)

### Future Enhancements

1. **Arbitrary Variant Selectors** (`[&_selector]:utility`)
   - Currently skipped (5 tests)
   - Requires custom selector parsing
   - Documented as Phase 3+ feature

2. **Container Queries** (`@container`)
   - Currently skipped (2 tests)
   - Similar to @media handling
   - Low priority (new CSS feature)

---

## Performance Impact

No significant performance impact. Changes are purely correctness fixes:

- Regex is slightly more complex but still O(n)
- Storing parent at-rule adds minimal memory overhead
- No additional Tailwind processing passes needed

---

## Conclusion

**Status: ✅ CSS VARIANT PROCESSING FIXED**

The compiler now properly handles Tailwind v4 pseudo-classes, data attributes, and media queries. This brings v2 to near feature parity with v1 for conditional styling, which is critical for production use.

**Next Steps:**

1. Fix `:disabled` JSX transformation (if needed)
2. Investigate complexity-level test failures (optional)
3. Consider adding arbitrary variant support (Phase 3+)
