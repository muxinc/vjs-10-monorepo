# CSS Module @apply Validation Findings

## Test Objective

Validate whether Tailwind v4's `@apply` directive can be used with CSS modules to convert inline Tailwind classes (from TypeScript) into CSS module classes.

## Test Setup

Created a CSS module version of the frosted skin:

**Location:** `examples/react-demo/src/skins/frosted-css-module/`

**Files Created:**
1. `styles.module.css` - CSS module with @apply directives
2. `MediaSkinDefault.tsx` - React component using CSS module
3. Updated `App.tsx` to register the new skin

**Conversion Pattern:**

```typescript
// FROM: styles.ts
const styles: MediaDefaultSkinStyles = {
  MediaContainer: cn(
    'relative @container/root group/root overflow-clip',
    'text-sm',
    // ...more classes
  ),
};
```

```css
/* TO: styles.module.css */
.MediaContainer {
  @apply relative @container/root group/root overflow-clip;
  @apply text-sm;
}
```

## Critical Finding: @apply Cannot Handle Named Groups

**Error Encountered:**

```
Cannot apply unknown utility class `group/root`.
Are you using CSS modules or similar and missing `@reference`?
```

**Cause:**

Tailwind v4's `@apply` directive does NOT support named variant groups like:
- `group/root`
- `group/button`
- `group/slider`
- `@container/root`
- `@container/controls`

These are special Tailwind utilities that create scoped group/container contexts and cannot be extracted via `@apply`.

## Attempted Solutions

### 1. Added @reference Directive

```css
@reference "../../globals.css";

.MediaContainer {
  @apply relative @container/root group/root overflow-clip;
}
```

**Result:** Same error. The `@reference` directive is for scanning other CSS files for utility definitions, but doesn't help with named variants.

## Why This Matters for the Compiler

### Current Compilation Strategy

The frosted skin uses **extensive named group patterns**:

```typescript
// Parent element establishes group
MediaContainer: 'group/root @container/root'

// Children react to group state
Overlay: 'group-hover/root:opacity-100'
Controls: 'group-hover/root:scale-100'
```

### Implications

1. **Cannot use CSS modules with @apply** - This pattern is fundamental to the skin's architecture
2. **Must use inline classes** - The current approach (inline Tailwind classes in template strings) is the correct approach
3. **Compiler output must preserve inline classes** - Cannot extract to separate CSS file using @apply

## Alternative Approaches

### Approach 1: Inline Classes (Current/Correct)

```html
<style>
  /* CSS custom properties and utility definitions */
</style>
<media-container class="group/root @container/root overflow-clip">
  <div class="group-hover/root:opacity-100"></div>
</media-container>
```

**Status:** ✅ Works with Tailwind CLI

### Approach 2: CSS Modules with @apply

```css
.MediaContainer {
  @apply group/root @container/root overflow-clip;
}
```

**Status:** ❌ Fails - cannot apply named groups

### Approach 3: Vanilla CSS (Manual Extraction)

```css
.media-container {
  position: relative;
  container-type: inline-size;
  container-name: root;
  overflow: clip;
}

.media-container:has(:hover) .overlay {
  opacity: 1;
}
```

**Status:** ⚠️ Possible but loses Tailwind benefits:
- No automatic responsive variants
- No automatic dark mode
- Harder to maintain
- More verbose

## Recommendations

### For the Compiler

1. **Use inline classes** - Keep Tailwind classes in the HTML template strings
2. **Include Tailwind CLI output** - Process HTML with Tailwind CLI to generate final CSS
3. **Do NOT use @apply** - It cannot handle the complex patterns we need

### Test Case Validation

This test confirms that our **inline-tailwind validation approach** was correct:

✅ Inline classes + Tailwind CLI = Works
❌ CSS modules + @apply = Fails with named groups

## Conclusion

**The @apply directive is NOT suitable for converting our Tailwind-based skins to CSS modules** due to limitations with named variant groups (`group/name`, `@container/name`).

The correct approach for the compiler is to:
1. Keep Tailwind classes inline in HTML template strings
2. Process the output with Tailwind CLI
3. Include the generated CSS in the final build

This matches what we validated in `validation-tests/inline-tailwind/`.

## Follow-Up Test: Simplified CSS Module (Success!)

To determine exactly which Tailwind patterns work with `@apply`, created a second test version that removes ALL problematic patterns:

**Location:** `examples/react-demo/src/skins/frosted-css-module-simple/`

### Patterns Removed

- ❌ Named groups: `group/root`, `group/button`, `group/slider`
- ❌ Named containers: `@container/root`, `@container/controls`
- ❌ Reactions to named groups: `group-hover/root:opacity-100`
- ❌ Container query size variants: `@7xl/root:text-sm`
- ❌ Arbitrary child selectors: `[&_svg]:opacity-0`, `[&_.pause-icon]:opacity-100`

### Patterns Kept (These DO work with @apply!)

- ✅ Basic utility classes: `relative`, `overflow-clip`, `text-sm`
- ✅ Standard pseudo-classes: `hover:`, `focus-visible:`, `active:`
- ✅ Standard variants: `dark:`
- ✅ Data attribute selectors: `data-[paused]`, `data-[fullscreen]`
- ✅ Arbitrary values: `rounded-[inherit]`, `origin-[var(--transform-origin)]`
- ✅ Backdrop filters: `backdrop-blur-3xl`, `backdrop-saturate-150`
- ✅ Gradients: `bg-gradient-to-t from-black/50 via-black/20`
- ✅ Transitions: `transition-[transform,scale,opacity]`
- ✅ Ring utilities: `ring-1 ring-white/10 ring-inset`

### Result

**✅ COMPILATION SUCCESSFUL!**

The simplified CSS module version compiles without errors when using `@reference "../../globals.css"` and removing all named group/container patterns.

### Key Insight

The `@apply` directive works with **most** Tailwind utilities EXCEPT:
1. Named variant groups (`group/name`, `@container/name`)
2. Arbitrary child/descendant selectors (`[&_element]`, `[&_.class]`)

These patterns are fundamental to the frosted skin's architecture for:
- Coordinating hover states across parent/child elements
- Responsive typography via container queries
- Icon visibility toggling via descendant selectors

## Files Changed

### Full CSS Module Test (Fails)
- `examples/react-demo/src/skins/frosted-css-module/styles.module.css` (created)
- `examples/react-demo/src/skins/frosted-css-module/MediaSkinDefault.tsx` (created)

### Simplified CSS Module Test (Works!)
- `examples/react-demo/src/skins/frosted-css-module-simple/styles.module.css` (created)
- `examples/react-demo/src/skins/frosted-css-module-simple/MediaSkinDefault.tsx` (created)

### App Registration
- `examples/react-demo/src/App.tsx` (updated to register both CSS module skins)

**Status:** Both test versions remain in place:
- Full version demonstrates the limitation with named groups
- Simplified version demonstrates what DOES work with @apply
