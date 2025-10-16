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

### Patterns Removed (Build Errors)

**Category 1: Named Groups/Containers - These cause literal compilation errors:**

- ❌ Named groups: `group/root`, `group/button`, `group/slider`
- ❌ Named containers: `@container/root`, `@container/controls`
- ❌ Reactions to named groups: `group-hover/root:opacity-100`
- ❌ Container query size variants: `@7xl/root:text-sm`
- ❌ Custom utilities: `text-shadow`, `text-shadow-2xs` (not in standard Tailwind)
- ❌ Custom variants: `reduced-transparency:*`, `contrast-more:*` (require `@custom-variant` definition)

**Error when used:**
```
Cannot apply unknown utility class `group/root`.
```

### Patterns Kept (These DO work with @apply!)

**Category 2: Arbitrary Child Selectors - These compile but may not work as expected:**

These patterns work syntactically with `@apply`, but have a critical limitation: **they require exact class names on descendant elements**. When you use `@apply [&_.pause-icon]:opacity-100`, the CSS expects child elements to have the exact class `pause-icon`. This creates a tight coupling between CSS and JSX that breaks the abstraction of CSS modules.

Examples that work syntactically but create class name dependencies:
- ⚠️ `[&_.icon]:[grid-area:1/1]` - Requires children with class `icon`
- ⚠️ `[&_.pause-icon]:opacity-100` - Requires children with class `pause-icon`
- ⚠️ `[&[data-paused]_.play-icon]:opacity-0` - Requires children with class `play-icon`

**Working patterns (no class name dependencies):**
- ✅ Basic utility classes: `relative`, `overflow-clip`, `text-sm`
- ✅ Standard pseudo-classes: `hover:`, `focus-visible:`, `active:`
- ✅ Standard variants: `dark:`
- ✅ Data attribute selectors on self: `data-[paused]`, `data-[fullscreen]`
- ✅ Arbitrary values: `rounded-[inherit]`, `origin-[var(--transform-origin)]`
- ✅ Arbitrary properties: `[grid-area:1/1]`
- ✅ Backdrop filters: `backdrop-blur-3xl`, `backdrop-saturate-150`
- ✅ Gradients: `bg-gradient-to-t from-black/50 via-black/20`
- ✅ Transitions: `transition-[transform,scale,opacity]`
- ✅ Ring utilities: `ring-1 ring-white/10 ring-inset`
- ✅ Pseudo-elements: `before:`, `after:` with arbitrary values

### Result

**✅ COMPILATION SUCCESSFUL!**

The simplified CSS module version compiles without errors when using `@reference "../../globals.css"` and removing all named group/container patterns.

### Key Insights

The `@apply` directive has **two categories of limitations**:

**Category 1: Build Errors (Cannot use at all)**
- Named variant groups (`group/name`, `@container/name`)
- Custom utilities/variants not defined in standard Tailwind

**Category 2: Class Name Dependencies (Compile but break abstraction)**
- Arbitrary child/descendant selectors (`[&_.class-name]`) work syntactically
- BUT they create tight coupling between CSS and JSX
- Require exact class names on child elements
- Break the abstraction benefit of CSS modules
- Defeated the purpose of using CSS modules in the first place

These patterns are fundamental to the frosted skin's architecture for:
- Coordinating hover states across parent/child elements
- Responsive typography via container queries
- Icon visibility toggling via descendant selectors

## Summary: Two Categories of @apply Limitations

### Category 1: Build-Time Errors ❌

These patterns cause **literal compilation errors** and cannot be used with `@apply`:

```css
/* ❌ ERROR: Cannot apply unknown utility class */
.Container {
  @apply group/root;              /* Named groups */
  @apply @container/controls;     /* Named containers */
  @apply text-shadow;             /* Custom utilities */
  @apply reduced-transparency:*;  /* Custom variants */
}
```

**Impact:** Build fails immediately. Must be removed or replaced with vanilla CSS.

### Category 2: Class Name Dependencies ⚠️

These patterns compile successfully but create **tight coupling** between CSS and JSX:

```css
/* ⚠️ COMPILES but requires exact class names on children */
.IconButton {
  @apply [&_.icon]:[grid-area:1/1];           /* Expects child with class="icon" */
  @apply [&_.pause-icon]:opacity-100;         /* Expects child with class="pause-icon" */
  @apply [&[data-paused]_.play-icon]:hidden;  /* Expects child with class="play-icon" */
}
```

**Impact:**
- CSS compiles without errors
- BUT requires JSX to use specific class names: `<svg className="icon">`, `<span className="pause-icon">`
- Breaks CSS module abstraction (defeats the purpose)
- Creates maintenance burden (must coordinate class names between CSS and JSX)

### Why This Matters

The frosted skin uses **both categories** extensively:

1. **Named groups** for coordinating hover states → Category 1 (build errors)
2. **Arbitrary child selectors** for icon visibility → Category 2 (class name dependencies)

Both limitations make CSS modules impractical for this use case.

### Recommendation

**Use inline Tailwind classes** (current approach) instead of CSS modules with `@apply`:
- Avoids both categories of limitations
- No class name coordination required
- Maintains Tailwind's full feature set
- Simpler mental model (all styling in one place)

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
- Full version demonstrates Category 1 limitations (build errors)
- Simplified version demonstrates Category 2 limitations (class name dependencies)
