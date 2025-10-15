# Iteration Process - Every Code Change

**Purpose:** This checklist applies to EVERY code change, no matter how small.

**Philosophy:** Build quality into each iteration, not just at phase boundaries.

---

## Before Writing Any Code

### 1. E2E Validation Path (10 min - MANDATORY)

- [ ] **Can this change be validated e2e?**
  - YES: Document how (which demo, which test)
  - NO: Why not? Document as known limitation
- [ ] **Does this change affect compiled output?**
  - YES: Requires Level 4 validation (browser + visual)
  - NO: Unit/integration tests sufficient
- [ ] **Is there a React equivalent to compare against?**
  - YES: Document the comparison approach
  - NO: This is a WC-only feature (may be okay)
- [ ] **What's the e2e success criteria?**
  - Example: "Play button click works identically in React and WC demos"
  - Example: "Hover styles match within 5% color difference"
  - Example: "Both demos load without console errors"

### 2. Understand the Context (5-10 min)

- [ ] Read the relevant v1 code (if this area existed in v1)
  - Location: `src-v1/[corresponding-area]/`
  - Document lessons in commit message or LESSONS_FROM_V1.md
- [ ] Check CURRENT_STATUS.md (Known Limitations section) - am I fixing a known issue?
- [ ] Check E2E_CAPABILITIES.md - can I test this e2e?
- [ ] Check architecture compliance - which principle applies?
  - Separation of Concerns?
  - Push Assumptions to Boundaries?
  - Functional Over Declarative?
  - Identify, Then Transform?

### 3. Identify What to Remove (5 min)

- [ ] Will this change make any existing code obsolete?
- [ ] Are there TODOs in this area that will be resolved?
- [ ] Are there commented-out code blocks to remove?
- [ ] Plan: What code will I DELETE in this change?

### 4. Identify What to Test (5 min)

- [ ] Which existing tests cover this area?
- [ ] What new test(s) will validate this change?
- [ ] Test type needed: Unit / Integration / E2E?
- [ ] Complexity level: Simple / Medium / Complex?
- [ ] **E2E test needed?** If yes, which demo(s)?

### 5. Check Tool Usage (2 min)

- [ ] Will I use correct package manager? (pnpm, not npm)
- [ ] Will I use correct TypeScript config? (strict mode)
- [ ] Will I run tests before committing? (pnpm test)

---

## During Code Changes

### 1. Type Safety (Continuous)

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] No `any` types introduced (use `unknown` if needed)
- [ ] No `@ts-ignore` without explanation comment
- [ ] Run on save: Editor shows no red squiggles

### 2. Test-Driven Development (Continuous)

- [ ] Write test FIRST (or immediately after) for new functionality
- [ ] Run test in watch mode: `pnpm test --watch`
- [ ] Test fails before implementation (red)
- [ ] Test passes after implementation (green)
- [ ] Run full suite periodically: `pnpm test`

### 3. E2E Validation (For output-affecting changes)

- [ ] Compile a test skin: `pnpm test -- compile-for-e2e.test.ts`
- [ ] Check compiled output manually (look at generated code)
- [ ] Load in WC demo: Open `test/e2e/equivalence/demos/wc-demo.html`
- [ ] Load in React demo: `cd test/e2e/equivalence/demos/react-demo && pnpm dev`
- [ ] Compare visually: Do they look the same?
- [ ] Compare functionally: Do interactions work the same?

### 4. Code Removal (During refactors)

- [ ] Remove identified obsolete code
- [ ] Remove unused imports: `pnpm lint --fix` OR editor auto-fix
- [ ] Remove commented code (use git history instead)
- [ ] Mark remaining code as @deprecated if removal pending

### 5. Documentation (As you go)

- [ ] Update JSDoc comments for public functions
- [ ] Update CURRENT_STATUS.md if crossing phase boundary
- [ ] Update CURRENT_STATUS.md (Known Limitations section) if fixing a known issue
- [ ] Update E2E_CAPABILITIES.md if e2e validation changes
- [ ] Add code comments for "why" not "what"

---

## After Code Changes (Before Commit)

### 1. Clean Up Background Processes (2 min)

**IMPORTANT:** Before running validation, check for runaway processes from previous test runs.

```bash
# Check for hanging test processes
ps aux | grep -E "(vitest|playwright|node.*test)" | grep -v grep

# If you see processes from previous runs, kill them:
pkill -f "node.*vitest"
pkill -f "node.*playwright"

# Or use Activity Monitor to find high-memory node processes
```

**Why This Matters:**

- Interrupted test runs (Ctrl+C, timeouts) don't always clean up worker processes
- Vitest workers can consume 500MB-900MB each
- Multiple hanging workers = system slowdown
- Especially common when running E2E tests that timeout

**When to Check:**

- Before running `pnpm test`
- After interrupting any test run
- When system feels slow
- Before ending a coding session

### 2. Validation Suite (5-10 min)

Run ALL of these commands and fix any issues:

```bash
# TypeScript compilation (MUST pass)
npx tsc --noEmit

# All tests (MUST pass OR document failures)
pnpm test

# Linting (MUST pass)
pnpm lint

# Formatting (auto-fix)
pnpm format

# Optional: Coverage check
pnpm test -- --coverage
```

**Policy:** If any command fails, DO NOT COMMIT until fixed.

**If tests timeout or you interrupt them:**

1. Use Ctrl+C to stop
2. Wait 5 seconds for cleanup
3. Run `pkill -f "node.*vitest"` to ensure cleanup
4. Check `ps aux | grep vitest` to verify
5. Restart test run if needed

### 2. E2E Validation (For output-affecting changes)

**Level 1: Syntactic Validation** (REQUIRED)

- [ ] Generated code compiles: Compile test skin, run `npx tsc --noEmit` on output
- [ ] HTML is valid: No JSX syntax in template strings (`class=` not `className=`)
- [ ] CSS is parseable: No syntax errors in `<style>` blocks
- [ ] Imports are correct: No broken import paths

**Level 2: Output Comparison** (If v1 equivalent exists)

- [ ] Compare to v1 output: `diff <v1-output> <v2-output>`
- [ ] Document differences: Are they intentional improvements?
- [ ] Verify no regressions: Previous working features still work

**Level 3: Browser Validation** (REQUIRED for output changes)

- [ ] WC demo loads without errors:
  ```bash
  # Open test/e2e/equivalence/demos/wc-demo.html
  # Check browser console - zero errors
  ```
- [ ] React demo loads without errors:
  ```bash
  cd test/e2e/equivalence/demos/react-demo
  pnpm dev
  # Check browser console - zero errors
  ```
- [ ] Custom element registers: `customElements.get('media-skin-default')` returns class

**Level 4: Visual & Functional Equivalence** (REQUIRED for e2e features)

- [ ] Visual comparison:
  - Load both demos side-by-side
  - Compare initial render (do they look identical?)
  - Compare hover states (do styles match?)
  - Compare focus states (do outlines match?)
- [ ] Functional comparison:
  - Click play button (both work?)
  - Seek in timeline (both update?)
  - Adjust volume (both respond?)
  - Test keyboard navigation (both accessible?)
- [ ] Performance comparison:
  - Check render time (roughly equivalent?)
  - Check memory usage (no leaks?)
- [ ] Document results:
  - Screenshot both versions
  - Note any differences (even minor ones)
  - Update E2E_CAPABILITIES.md if validation coverage changed

**If E2E validation fails or is incomplete:**

- [ ] Document in CURRENT_STATUS.md (Known Limitations section)
- [ ] Mark feature as "partially implemented"
- [ ] Create GitHub issue for e2e validation gap
- [ ] DO NOT claim feature is "complete"

### 3. Architecture Compliance Self-Review (5 min)

- [ ] Pure functions? (no hidden file I/O in core/)
- [ ] Assumptions as data? (passed via config, not hardcoded)
- [ ] Predicates/projections? (not large registries)
- [ ] Identify-then-transform? (analysis before transformation)

### 4. Documentation Updates (5 min)

- [ ] CURRENT_STATUS.md updated? (if phase progress made)
- [ ] CURRENT_STATUS.md (Known Limitations section) updated? (if limitation fixed or added)
- [ ] E2E_CAPABILITIES.md updated? (if e2e validation coverage changed)
- [ ] LESSONS_FROM_V1.md updated? (if v1 insight applied)
- [ ] CHANGELOG.md updated? (if user-facing change)
- [ ] README.md updated? (if public API changed)

### 5. Commit Message Quality

```bash
# Format: Conventional Commits
<type>(<scope>): <description>

[optional body explaining e2e validation approach]

[optional footer with validation checklist results]

# Examples:
feat(css): add support for arbitrary variant selectors

Implemented custom CSS generation for [&_selector] syntax.
Validated e2e with MediaSkinDefault demo.

E2E Validation:
- Level 1: ✅ Syntactic (TypeScript compiles, HTML valid)
- Level 2: ✅ Comparison (matches v1 output)
- Level 3: ✅ Browser (loads without errors in both demos)
- Level 4: ✅ Visual (icon visibility matches React version)

Closes #45

---

fix(transform): resolve TypeScript strict mode errors in transformStyles

Fixed null pointer errors in utility class extraction.
No output changes, unit tests only.

E2E Validation: N/A (internal refactor, no output changes)

---

docs(process): add iteration checklist and v1 lessons

Establishes baseline quality process for all iterations.
No code changes, documentation only.

E2E Validation: N/A (documentation only)
```

**Policy:** Every commit message must:

- Use Conventional Commits format
- Include scope (package area)
- Document e2e validation approach (or N/A with reason)
- Reference issue number if applicable (#123)
- Use present tense ("add" not "added")

---

## Quick Reference

**Before Coding:**

1. Plan e2e validation
2. Check v1 code
3. Plan code removal
4. Plan tests
5. Use pnpm

**During Coding:**

1. Type safety on
2. Test-driven
3. E2E check (if output changes)
4. Remove obsolete code
5. Document why

**Before Commit:**

1. Run validation suite
2. E2E validation (4 levels if output changes)
3. Architecture check
4. Update docs
5. Quality commit message
