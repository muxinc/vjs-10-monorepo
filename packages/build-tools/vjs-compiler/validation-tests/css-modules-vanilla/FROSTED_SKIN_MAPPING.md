# Frosted Skin: Tailwind → Vanilla CSS Translation Map

This document maps EVERY "Category 1" pattern used in the frosted skin to its vanilla CSS equivalent.

## Summary

**Result:** ALL patterns are translatable. No hard blockers exist.

## Translation Strategy

1. **Named Containers** → `container-name` property + `@container name (...)` queries
2. **Named Groups** → Semantic element selector + pseudo-class + descendant selector
3. **Group Names** → Element names (e.g., `group/root` → `media-container`, `group/button` → `.button`)

---

## Pattern Inventory from Frosted Skin

### 1. MediaContainer

#### Pattern: Named Container + Named Group Combined

**Tailwind (styles.ts:14):**
```tsx
MediaContainer: '@container/root group/root overflow-clip ...'
```

**Vanilla CSS Translation:**
```css
media-container {
  /* Named container definition */
  container-name: root;
  container-type: inline-size;

  /* Other styles */
  position: relative;
  overflow: clip;
}
```

**Usage by children:**
- Container queries: `@7xl/root:text-sm` → `@container root (min-width: 80rem) { font-size: 0.875rem }`
- Group hover: `group-hover/root:opacity-100` → `media-container:hover .child { opacity: 1 }`

---

### 2. Overlay

#### Pattern: Named Group Hover Reactions

**Tailwind (styles.ts:30):**
```tsx
Overlay: 'group-hover/root:opacity-100 group-hover/root:delay-0'
```

**Vanilla CSS Translation:**
```css
media-container:hover .overlay {
  opacity: 1;
  transition-delay: 0s;
}
```

---

### 3. Controls

#### Pattern: Multiple Named Containers + Group Hover

**Tailwind (styles.ts:34, 43):**
```tsx
Controls: cn(
  '@container/controls',
  'group-hover/root:scale-100 group-hover/root:opacity-100 group-hover/root:delay-0',
)
```

**Vanilla CSS Translation:**
```css
.controls {
  /* This element is BOTH a container AND responds to parent hover */
  container-name: controls;
  container-type: inline-size;
}

/* Responds to media-container hover */
media-container:hover .controls {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0s;
}
```

---

### 4. Button

#### Pattern: Nested Named Group

**Tailwind (styles.ts:54):**
```tsx
Button: 'group/button cursor-pointer ...'
```

**Vanilla CSS Translation:**
```css
/* The button element itself establishes a group scope */
.button {
  cursor: pointer;
  /* ... other properties */
}

/* Children can react to button:hover */
.button:hover .some-child {
  /* ... */
}
```

**Key Insight:** Nested groups maintain independent scopes. `group/button` inside `group/root` doesn't conflict.

---

### 5. TooltipPopup

#### Pattern: Container Query with Named Container

**Tailwind (styles.ts:81):**
```tsx
TooltipPopup: '@7xl/root:text-sm ...'
```

**Vanilla CSS Translation:**
```css
/* Responds to the root container's size */
@container root (min-width: 80rem) {
  .tooltip-popup {
    font-size: 0.875rem;
  }
}
```

**Note:** This queries the `root` container defined on `MediaContainer` (ancestor element).

---

### 6. FullScreenEnterIcon

#### Pattern: Nested Named Group with Descendant Selector

**Tailwind (styles.ts:116-117):**
```tsx
FullScreenEnterIcon: cn(
  'group-hover/button:[&_.arrow-1]:-translate-x-px',
  'group-hover/button:[&_.arrow-2]:translate-x-px',
)
```

**Vanilla CSS Translation:**
```css
/* Hover on .fullscreen-button affects nested SVG paths */
.fullscreen-button:hover .arrow-1 {
  transform: translate(-1px, -1px);
}

.fullscreen-button:hover .arrow-2 {
  transform: translate(1px, 1px);
}
```

**Key Insight:** The arbitrary selector `[&_.arrow-1]` becomes a standard descendant selector `.arrow-1`.

---

### 7. SliderRoot

#### Pattern: Named Group Scope Definition

**Tailwind (styles.ts:135):**
```tsx
SliderRoot: 'group/slider relative ...'
```

**Vanilla CSS Translation:**
```css
.slider-root {
  position: relative;
  /* ... other properties */
}
```

**Usage by SliderThumb:** Multiple pseudo-classes on same named group.

---

### 8. SliderThumb

#### Pattern: Multiple Pseudo-Classes on Same Named Group

**Tailwind (styles.ts:151-152):**
```tsx
SliderThumb: cn(
  'group-hover/slider:opacity-100',
  'group-focus-within/slider:opacity-100',
  'group-active/slider:size-3',
)
```

**Vanilla CSS Translation:**
```css
/* Multiple selectors targeting same element */
.slider-root:hover .slider-thumb,
.slider-root:focus-within .slider-thumb {
  opacity: 1;
}

.slider-root:active .slider-thumb {
  width: 0.75rem;
  height: 0.75rem;
}
```

**Key Insight:** Multiple group variants on same element → Multiple CSS selectors (can be combined with `,`).

---

## Complete Translation Reference

### Container Query Breakpoints

Tailwind uses size names that map to pixel widths:

| Tailwind | Container Width | Translation |
|----------|-----------------|-------------|
| `@sm/name:` | 24rem (384px) | `@container name (min-width: 24rem)` |
| `@md/name:` | 28rem (448px) | `@container name (min-width: 28rem)` |
| `@lg/name:` | 32rem (512px) | `@container name (min-width: 32rem)` |
| `@xl/name:` | 36rem (576px) | `@container name (min-width: 36rem)` |
| `@2xl/name:` | 42rem (672px) | `@container name (min-width: 42rem)` |
| `@3xl/name:` | 48rem (768px) | `@container name (min-width: 48rem)` |
| `@4xl/name:` | 56rem (896px) | `@container name (min-width: 56rem)` |
| `@5xl/name:` | 64rem (1024px) | `@container name (min-width: 64rem)` |
| `@6xl/name:` | 72rem (1152px) | `@container name (min-width: 72rem)` |
| `@7xl/name:` | 80rem (1280px) | `@container name (min-width: 80rem)` |

### Group Name → Element Mapping

| Tailwind Group Name | Semantic Element | Rationale |
|---------------------|------------------|-----------|
| `group/root` | `media-container` | Root container custom element |
| `group/button` | `.button` | Generic button class |
| `group/slider` | `.slider-root` | Slider root element |
| `group/controls` | `.controls` | Controls container |

**Pattern:** Group names become semantic class names or element names. The compiler must maintain this mapping.

---

## Implementation Requirements

### For the Compiler

To support CSS modules as final output, the compiler must:

1. **Track Container Names**
   - Parse `@container/name` from Tailwind classes
   - Generate `container-name: name` CSS property
   - Transform size variants to `@container name (min-width: ...)` queries

2. **Track Group Names**
   - Parse `group/name` from Tailwind classes
   - Map group name to semantic element/class name
   - Transform group variants to descendant selectors with pseudo-classes

3. **Handle Nested Groups**
   - Maintain independent scope for each named group
   - `group/button` inside `group/root` should generate separate rules
   - No conflicts between nested scopes

4. **Coordinate Class Names (Category 2)**
   - Arbitrary selectors `[&_.icon]` require class names on children
   - Must ensure JSX transformation adds required classes
   - See Category 2 limitations for details

### Validation

All patterns have been validated in `demo.html`:
- ✅ Named container queries respond to resize
- ✅ Named group hover effects work
- ✅ Named group focus-within effects work
- ✅ Nested named groups maintain independent scopes
- ✅ Multiple queries on same container work independently

---

## Conclusion

**Category 1 is NOT a hard blocker.** Every named container and named group pattern used in the frosted skin can be translated to vanilla CSS with identical behavior.

The challenge is implementation complexity, not technical impossibility:
- Container queries use native CSS features (excellent browser support in 2025)
- Named groups are syntactic sugar for descendant selectors
- All patterns are standard CSS

**CSS modules CAN be a viable final output format** if the compiler implements the translation logic documented here.
