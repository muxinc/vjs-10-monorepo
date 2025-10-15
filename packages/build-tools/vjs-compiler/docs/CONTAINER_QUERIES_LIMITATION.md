# Container Queries Limitation

## Issue Summary

Container query support in the VJS compiler is currently limited due to a fundamental issue with how the Tailwind CSS v4 CLI processes CSS with `@tailwind` directives.

**Status:** Container DEFINITIONS work (`@container/name`), but container query VARIANTS do not (`@md/root:`, `@lg/controls:`, etc.)

## Technical Details

### What Works

- ✅ Container definitions: `@container/root` → `container-type: inline-size; container-name: root`
- ✅ Regular utilities via PostCSS: `bg-blue-500`, `p-4`, etc. (Levels 0-11)

### What Doesn't Work

- ❌ Container query variants: `@md/root:bg-[#000]/40` → Should generate `@container root (min-width: 28rem)` media queries
- ❌ ANY utility classes when using Tailwind CLI with `@tailwind` directives

### Root Cause

The Tailwind CSS v4 CLI does **not scan HTML files** specified in the `content: []` configuration when using `@tailwind theme` and `@tailwind utilities` directives.

**Evidence:**

```javascript
// Config correctly points to HTML file
export default {
  content: ["/path/to/input.html"],
  darkMode: 'media',
  corePlugins: { preflight: false },
};

// HTML contains utility classes
<div class="@container">
  <div class="bg-blue-500 p-2 @md:bg-red-500">
    Content
  </div>
</div>

// CSS input with @tailwind directives
@tailwind theme;
@tailwind utilities;

// RESULT: Only @container generates, NO utilities (bg-blue-500, p-2, @md:bg-red-500)
/*! tailwindcss v4.1.13 | MIT License | https://tailwindcss.com */
.\@container {
  container-type: inline-size;
}
```

### Why This Affects Container Queries

The compiler uses two different CSS processing paths:

1. **PostCSS Plugin API** (default) - Used for Levels 0-11
   - Fast, works with HTML scanning
   - ✅ Generates regular utilities correctly
   - ❌ Does NOT support `@container` definitions or `@theme` directives properly

2. **CLI-based Processing** - Used when container queries detected (Level 12)
   - Full Tailwind v4 feature support
   - ✅ Generates `@container` definitions
   - ❌ Does NOT scan HTML files with `@tailwind` directives
   - ❌ Does NOT generate ANY utility classes (not just container variants)

The detection logic switches to CLI when `@container` classes are found:

```typescript
// src/core/css/processCSS.ts:257
const useCLI = process.env.USE_TAILWIND_CLI === '1' || hasContainerQueries(styles);
```

## Comparison with React Demo

The React demo's container queries work because it uses the **Vite plugin** (`@tailwindcss/vite`), not the CLI:

**React Demo (Working):**
- Uses: `@tailwindcss/vite` v4.1.0 plugin
- CSS: `@import 'tailwindcss'`
- Result: ✅ Container definitions AND variants generate

**VJS Compiler (Partially Working):**
- Uses: `@tailwindcss/cli` v4.1.13
- CSS: `@tailwind theme; @tailwind utilities`
- Result: ✅ Container definitions, ❌ Container variants

## Known Tailwind CLI vs Plugin Differences

While no specific GitHub issue documents the container query variant limitation, there is confirmed evidence of CLI vs Vite plugin differences:

- **GitHub Issue #18833**: `source()` handling differs between CLI and Vite plugin
  - Quote: "The same line `@import 'tailwindcss' source('../../components');` works with cli but not with the Vite plugin"
  - Bug: "cli can compile a file that vite cannot"

This confirms the CLI and Vite plugin have fundamentally different code paths and behaviors.

## Impact on Compilation

### Current Behavior

**Level 12 (container-queries) Output:**

```javascript
// Container definitions WORK
.wrapper {
  container-type: inline-size;
  container-name: root
}

.controls-container {
  container-type: inline-size;
  container-name: controls;
}

// Container query variants DON'T WORK
// Missing: @container root (min-width: 28rem) { ... }
// Missing: @container controls (min-width: 28rem) { ... }
```

### Levels 0-11

No regressions. These use PostCSS and continue to work correctly.

## Potential Solutions

### 1. Switch Back to PostCSS (Not Viable)

We originally switched from PostCSS to CLI specifically because PostCSS doesn't process `@theme` directives properly. Switching back would break semantic colors and theme customization.

### 2. Use `@import "tailwindcss"` Instead of `@tailwind` (Can't Resolve)

The preferred v4 syntax `@import "tailwindcss"` requires package resolution, which fails from temporary directories:

```
Error: Can't resolve 'tailwindcss' in '/var/folders/.../tmp-dir'
```

### 3. Hybrid Approach (Complex)

Use CLI for container definitions, PostCSS for variants. This would require:
- Detecting which classes are container definitions vs variants
- Running two separate Tailwind processes
- Merging the CSS outputs correctly
- Managing potential conflicts

### 4. Wait for Tailwind CLI Fix (Recommended)

This may be a v4 CLI bug. The CLI should scan HTML files specified in `content: []` when using `@tailwind` directives, matching the behavior of the Vite plugin.

**Next Steps:**
- Monitor Tailwind CSS GitHub for related issues
- Consider filing a bug report with minimal reproduction
- Update compiler when/if CLI is fixed

### 5. Document as Known Limitation (Current Approach)

Accept that container query variants won't work until Tailwind CLI is fixed or an alternative solution is found.

## Test Case

A minimal reproduction case is available at:
`/private/tmp/test-tailwind-cli/test-container-query.js`

This demonstrates that even simple utilities like `bg-blue-500` don't generate when using the CLI with `@tailwind` directives.

## References

- Tailwind CSS v4 Docs: https://tailwindcss.com/blog/tailwindcss-v4
- Container Queries in v4: Built-in, no plugin required
- GitHub Issue #18833: CLI vs Vite plugin differences (source() handling)
- Test compilation: `packages/build-tools/vjs-compiler/test/e2e/app/src/compiled/12-container-queries.js`

## Date

2025-10-15
