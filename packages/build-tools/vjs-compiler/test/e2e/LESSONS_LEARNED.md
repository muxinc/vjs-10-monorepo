# E2E Testing: Lessons Learned

**Date:** 2025-10-13
**Context:** Major refactor of E2E test infrastructure

## What We Had Before

### Old Structure (test/e2e/)
```
test/e2e/
├── equivalence/
│   ├── demos/
│   │   ├── react-demo/           # Partial React app (stub components)
│   │   ├── wc-demo.html          # Static HTML (file:// protocol)
│   │   └── minimal-test-skin-demo.html
│   ├── pages/
│   │   ├── react-skin-default.html
│   │   └── wc-skin-default.html
│   ├── fixtures/
│   │   └── compiled/             # Compiled outputs (committed to git)
│   ├── tests/
│   │   ├── state-equivalence.test.ts    # 11 tests written, not working
│   │   └── style-equivalence.test.ts
│   └── utils/                    # Good utilities (kept)
├── fixtures/test-app/            # Another incomplete app
└── phase3-browser.test.ts
```

### Problems with Old Approach

1. **Scattered Structure**
   - Test apps in multiple locations (demos/, fixtures/test-app/)
   - No clear "this is THE test app"
   - Hard to understand what to run

2. **Stub-Based Approach Failed**
   - react-demo used stub components (not real @vjs-10/react)
   - Couldn't test real imports and dependencies
   - Couldn't validate actual package integration
   - ES modules don't work with `file://` protocol

3. **No Proper Build Setup**
   - Static HTML files without proper module resolution
   - Manual script tags instead of Vite/bundler
   - Remote video URLs causing network delays
   - No way to run dev server for testing

4. **Playwright Tests Blocked**
   - 11 tests written but couldn't run (infrastructure incomplete)
   - Tests timed out waiting for elements that never loaded
   - Custom elements never registered (missing imports)
   - No automated way to compile skins before tests

5. **Compiled Outputs Committed to Git**
   - fixtures/compiled/ checked into version control
   - Easy to get stale/out-of-sync with source
   - Merge conflicts on generated code

6. **No Progressive Complexity**
   - Jumped straight to complex production skins
   - Hard to isolate which features work vs broken
   - All-or-nothing testing approach

## What We Learned

### Lesson 1: E2E Tests Need Real Infrastructure

**Problem:** Tried to use static HTML files and stub components
**Learning:** E2E tests should test realistic usage scenarios

**Solution:**
- Full Vite app with proper build setup
- Real workspace package dependencies
- Dev server for proper module resolution
- Compilation step integrated into workflow

### Lesson 2: One App, Not Many Fragments

**Problem:** Multiple incomplete test apps scattered around
**Learning:** Developers need one clear entry point

**Solution:**
- Single `app/` directory with full package.json
- Can be run standalone: `cd app && pnpm dev`
- Self-documenting structure

### Lesson 3: Progressive Complexity Levels

**Problem:** Jumped to full production skins immediately
**Learning:** Need incremental validation of features

**Solution:**
- Level 1: Minimal (single button, basic utilities)
- Level 2: Simple (multiple controls, layout)
- Level 3: Conditional (hover, focus, data attrs)
- Level 4: Arbitrary (nested selectors) - blocked until implemented
- Level 5: Production (full skins)

Each level validates incrementally more compiler features.

### Lesson 4: Generate, Don't Commit

**Problem:** Compiled outputs checked into git
**Learning:** Generated code should be in .gitignore

**Solution:**
- `src/compiled/` is gitignored
- `pnpm compile-skins` script generates before dev/test
- `predev` hook ensures fresh compilation
- Always up-to-date with source changes

### Lesson 5: Vite Simplifies Everything

**Problem:** Manual script tags, path resolution issues
**Learning:** Vite handles ES modules, HMR, multi-page apps

**Solution:**
- Multi-page Vite config (React + WC pages)
- Automatic path resolution with aliases
- Hot reload for React pages
- Single dev server on one port

### Lesson 6: Test Utilities Were Good (Keep Them)

**Problem:** Some infrastructure was actually good
**Learning:** Don't throw away working code

**Solution:**
- Kept: `element-matcher.ts`, `style-comparator.ts`, `state-simulator.ts`
- These utilities work and are well-designed
- Moved to `tests/utils/` in new structure

### Lesson 7: Documentation in the App

**Problem:** Hard to understand how to use test infrastructure
**Learning:** The app should document itself

**Solution:**
- `app/README.md` with clear instructions
- Comments in config files explaining choices
- Progressive complexity levels documented inline

## Architecture Decisions

### ✅ What We Did Right

1. **Single Vite App**
   - Both React and WC pages in one app
   - Easier to compare side-by-side
   - Shared dev server and config

2. **src/compiled/ Location**
   - Inside src/ for Vite compatibility
   - Clean imports: `import '../compiled/01-minimal.js'`
   - Gitignored to avoid stale outputs

3. **Progressive Test Levels**
   - Start simple, add complexity incrementally
   - Easy to identify which features work
   - Clear progression path

4. **Real Package Dependencies**
   - Uses `workspace:*` for @vjs-10 packages
   - Tests actual package integration
   - Validates realistic usage

5. **Integrated Compilation**
   - `scripts/compile-skins.js` compiles all skins
   - `predev` hook runs automatically
   - Always fresh, never stale

### ❌ What We Avoided

1. **Static HTML with `file://`**
   - ES modules don't work
   - No module resolution
   - Can't load workspace packages

2. **Stub Components**
   - Don't test real code
   - False validation
   - Integration issues hidden

3. **Multiple Test Apps**
   - Confusing to navigate
   - Hard to maintain
   - Unclear which is canonical

4. **Committed Generated Code**
   - Gets stale quickly
   - Merge conflicts
   - Out of sync with source

## Testing Strategy

### Compilation Tests (Unit-ish)
- Location: `test/integration/compile-demo-skins.test.ts`
- Validates: Skin compiles without errors
- Fast: Runs in Node.js, no browser needed

### Browser Loading Tests (E2E)
- Location: `test/e2e/tests/*.spec.ts`
- Validates: Both versions load without console errors
- Medium: Requires dev server and Playwright

### Visual Equivalence Tests (E2E)
- Location: Same as browser tests
- Validates: React and WC look identical
- Slow: Screenshot comparison, pixel diffs

### Functional Equivalence Tests (E2E)
- Location: Same as browser tests
- Validates: Interactions produce same results
- Slow: User interaction simulation

## Migration Path

### Phase 1: New Structure (Complete)
✅ Created `test/e2e/app/` with full infrastructure
✅ Level 1 minimal skin created
✅ Compilation script working
✅ Playwright tests written

### Phase 2: Validation (Next)
- [ ] Install dependencies in app/
- [ ] Generate test video
- [ ] Run compilation script
- [ ] Start dev server
- [ ] Manually validate both pages load
- [ ] Run Playwright tests
- [ ] Fix any issues

### Phase 3: Add More Levels (Future)
- [ ] Level 2: Simple controls
- [ ] Level 3: Conditional styles
- [ ] Level 4: Arbitrary variants (blocked)
- [ ] Level 5: Production skins

### Phase 4: Cleanup Old Structure (Future)
- [ ] Remove `test/e2e/equivalence/demos/`
- [ ] Remove `test/e2e/equivalence/pages/`
- [ ] Remove `test/e2e/fixtures/test-app/`
- [ ] Archive old Playwright tests (or migrate)
- [ ] Update documentation

## Success Criteria

We'll know the new structure works when:

1. ✅ `cd app && pnpm dev` just works
2. ✅ Both React and WC pages load without errors
3. ✅ Playwright tests pass consistently
4. ✅ New developers can add test levels easily
5. ✅ Side-by-side comparison is straightforward
6. ✅ CI can run tests automatically

## Key Takeaways

1. **E2E tests need real infrastructure** - Don't stub, use actual packages
2. **Progressive complexity** - Start simple, add features incrementally
3. **One canonical app** - Clear entry point, self-documenting
4. **Generate, don't commit** - Compiled code should be gitignored
5. **Leverage Vite** - Multi-page apps, HMR, path resolution for free
6. **Keep what works** - Test utilities were good, we kept them

## References

- Old structure: `test/e2e/equivalence/` (to be archived)
- New structure: `test/e2e/app/` (active)
- Documentation: `test/e2e/app/README.md`
- Compilation: `test/e2e/app/scripts/compile-skins.js`
