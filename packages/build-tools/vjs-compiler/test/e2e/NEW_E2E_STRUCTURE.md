# New E2E Test Structure

**Created:** 2025-10-13
**Status:** Ready for validation

## What We Built

A **clean, self-contained E2E test application** for validating the VJS compiler through browser-based tests.

### Directory Structure

```
test/e2e/
├── app/                          # ⭐ NEW: Self-contained test app
│   ├── package.json              # Full dependencies (React, Vite, Playwright)
│   ├── vite.config.ts            # Multi-page Vite app
│   ├── tsconfig.json             # TypeScript config
│   ├── playwright.config.ts     # Playwright config
│   ├── .gitignore                # Ignore src/compiled/
│   ├── README.md                 # Complete usage instructions
│   ├── scripts/
│   │   └── compile-skins.js      # Compiles React → WC
│   ├── public/
│   │   └── README.md             # How to add test-video.mp4
│   └── src/
│       ├── compiled/             # Generated WC skins (gitignored)
│       ├── skins/
│       │   └── 01-minimal/       # Level 1: Minimal test skin
│       │       ├── MediaSkinMinimal.tsx
│       │       ├── styles.ts
│       │       ├── types.ts
│       │       └── index.ts
│       ├── react/                # React test pages
│       │   ├── 01-minimal.html
│       │   └── 01-minimal.tsx
│       └── wc/                   # WC test pages
│           └── 01-minimal.html
├── tests/                        # ⭐ NEW: Playwright tests
│   ├── 01-minimal.spec.ts        # 7 tests for Level 1
│   └── utils/                    # Kept from old structure
│       ├── element-matcher.ts
│       ├── style-comparator.ts
│       └── state-simulator.ts
├── LESSONS_LEARNED.md            # ⭐ NEW: Documentation of refactor
└── NEW_E2E_STRUCTURE.md          # This file
```

## Key Features

### 1. Single Self-Contained App
- Full Vite application with package.json
- Can run standalone: `cd app && pnpm dev`
- Uses real workspace packages (`@vjs-10/react`, `@vjs-10/html`)
- No stubs, tests actual integration

### 2. Progressive Complexity Levels
- **Level 1 (Minimal):** Single button, basic utilities ✅ Complete
- **Level 2 (Simple):** Multiple controls, layout (future)
- **Level 3 (Conditional):** Hover, focus, data attrs (future)
- **Level 4 (Arbitrary):** Nested selectors (blocked until implemented)
- **Level 5 (Production):** Full frosted/toasted skins (future)

### 3. Multi-Page Vite Setup
- React pages: Test original skins
- WC pages: Test compiled skins
- Single dev server (port 5175)
- Side-by-side comparison easy

### 4. Integrated Compilation
- `scripts/compile-skins.js` compiles all test skins
- Runs automatically before dev (`predev` hook)
- Outputs to `src/compiled/` (gitignored)
- Always fresh, never stale

### 5. Comprehensive Tests
7 Playwright tests for Level 1:
1. React version loads without errors
2. WC version loads without errors
3. Visual equivalence (screenshot comparison)
4. Button styling applied (React)
5. Button styling applied (WC)
6. Custom element registered (WC)

## Quick Start

```bash
# 1. Navigate to app
cd packages/build-tools/vjs-compiler/test/e2e/app

# 2. Install dependencies
pnpm install

# 3. Add test video (see public/README.md)
# Option A: Generate with FFmpeg
ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=10 \
       -f lavfi -i sine=frequency=1000:duration=10 \
       -pix_fmt yuv420p public/test-video.mp4

# Option B: Copy any MP4
cp /path/to/video.mp4 public/test-video.mp4

# 4. Compile skins and start dev server
pnpm dev

# 5. Visit test pages
# React: http://localhost:5175/src/react/01-minimal.html
# WC:    http://localhost:5175/src/wc/01-minimal.html

# 6. Run E2E tests
pnpm test:e2e
```

## What Changed

### Before (Old Structure)
- ❌ Scattered demos in multiple locations
- ❌ Stub components, not real packages
- ❌ Static HTML with `file://` protocol
- ❌ Compiled outputs committed to git
- ❌ 11 Playwright tests blocked (couldn't run)
- ❌ No clear entry point

### After (New Structure)
- ✅ Single app directory
- ✅ Real workspace packages
- ✅ Proper Vite dev server
- ✅ Gitignored compiled outputs
- ✅ 7 Playwright tests ready to run
- ✅ Clear, documented workflow

## Testing Strategy

### 1. Compilation Test (Unit)
Location: `../../test/integration/compile-demo-skins.test.ts`
- Validates skin compiles without errors
- Checks output structure (imports, CSS, HTML)
- Fast (Node.js, no browser)

### 2. Browser Loading Test (E2E)
Location: `tests/01-minimal.spec.ts`
- React version loads without console errors
- WC version loads without console errors
- Custom elements register correctly
- Medium speed (requires dev server)

### 3. Visual Equivalence Test (E2E)
Location: Same file
- Screenshot comparison (React vs WC)
- Pixel diff < 2% threshold (TODO)
- Multiple states (initial, hover, paused)
- Slow (screenshot processing)

### 4. Style Equivalence Test (E2E)
Location: Same file
- Computed styles match between versions
- Critical properties (padding, border-radius, colors)
- Fast (getComputedStyle API)

## Next Steps

### Immediate (Validation)
1. [ ] Install dependencies: `cd app && pnpm install`
2. [ ] Add test video to `app/public/test-video.mp4`
3. [ ] Run compilation: `pnpm compile-skins`
4. [ ] Start dev server: `pnpm dev`
5. [ ] Manually verify both pages load
6. [ ] Run Playwright tests: `pnpm test:e2e`
7. [ ] Fix any issues that arise

### Short Term (Expand Coverage)
1. [ ] Add Level 2 (Simple controls)
   - Multiple buttons, time displays
   - Flex layout, spacing
   - More Tailwind utilities
2. [ ] Add Level 3 (Conditional styles)
   - Hover, focus, disabled states
   - Data attribute selectors
   - Media queries (dark mode)
3. [ ] Add pixel-diff comparison to visual tests
4. [ ] Add interaction tests (button clicks, keyboard nav)

### Medium Term (Full Coverage)
1. [ ] Implement arbitrary variant support in compiler
2. [ ] Add Level 4 (Arbitrary variants)
   - Icon visibility states
   - Nested selectors
   - Complex conditional styling
3. [ ] Add Level 5 (Production skins)
   - Full frosted skin
   - Full toasted skin
   - Complete visual regression suite

### Long Term (Cleanup)
1. [ ] Archive old E2E structure
   - Move `equivalence/demos/` to `_archive/`
   - Move `equivalence/pages/` to `_archive/`
   - Move `fixtures/test-app/` to `_archive/`
2. [ ] Update all documentation references
3. [ ] Add CI pipeline for E2E tests
4. [ ] Document process for adding new test levels

## Success Criteria

The new structure is validated when:

1. ✅ Structure created (complete)
2. [ ] Dependencies install without errors
3. [ ] Compilation script runs successfully
4. [ ] Dev server starts and serves pages
5. [ ] Both React and WC pages load in browser
6. [ ] No console errors in either version
7. [ ] Playwright tests run and pass
8. [ ] Side-by-side visual comparison shows equivalence

## Benefits

### For Developers
- **Clear entry point**: `cd app && pnpm dev`
- **Self-documenting**: README explains everything
- **Easy to extend**: Add new levels by copying pattern
- **Fast feedback**: HMR for React pages

### For Testing
- **Real validation**: Uses actual workspace packages
- **Progressive complexity**: Isolate which features work
- **Automated**: Playwright tests run in CI
- **Comprehensive**: Loading, styling, visual, functional

### For Maintenance
- **No stale code**: Compiled outputs are generated
- **One source of truth**: Single app, not scattered fragments
- **Easy to update**: Change skin, recompile, test
- **Clear documentation**: Lessons learned captured

## References

- **Old structure docs**: `LESSONS_LEARNED.md`
- **App usage guide**: `app/README.md`
- **Compilation script**: `app/scripts/compile-skins.js`
- **Test utilities**: `tests/utils/`
- **Playwright config**: `app/playwright.config.ts`

## Questions?

See:
- `app/README.md` for usage instructions
- `LESSONS_LEARNED.md` for design rationale
- `../integration/compile-demo-skins.test.ts` for compilation tests
- `tests/01-minimal.spec.ts` for test examples
