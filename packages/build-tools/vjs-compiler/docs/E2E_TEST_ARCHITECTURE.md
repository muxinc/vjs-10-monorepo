# E2E Test Architecture

**Last Updated:** 2025-10-15

Understanding why the Playwright E2E tests require a real build environment (not simple stubs).

---

## Key Insight: Integration Tests, Not Unit Tests

The Playwright E2E tests are **integration tests**, not unit tests. They validate the entire compilation pipeline in realistic usage conditions.

**What They Test:**
- Full compilation pipeline: React + Tailwind → Web Component + Vanilla CSS
- Real package transformations: `@vjs-10/react-icons` → `@vjs-10/html-icons`
- Component interactions with actual implementations
- Visual and functional equivalence between React and Web Component versions

**This is CORRECT** - integration testing provides more value than isolated unit testing.

---

## Why E2E Tests Need Real Build Environment

The Playwright tests cannot run with simple `file://` protocol or stub implementations. They require:

### 1. Real Package Imports

```typescript
// Generated skins need actual package imports
import { MediaSkin } from '@vjs-10/html';

import '@vjs-10/html/components/media-play-button';
import '@vjs-10/html-icons/play';
```

**Requirements:**
- Vite/bundler to resolve `@vjs-10/*` monorepo packages
- Cannot use `file://` protocol with raw ES modules
- Need dev server or static build with bundled dependencies

### 2. Real Component Implementations

```typescript
// All media-* components need working implementations
<media-play-button>
  <media-play-icon></media-play-icon>
</media-play-button>
```

**Requirements:**
- All `media-*` components need real implementations from `@vjs-10/html`
- Cannot use empty HTMLElement stubs for state/interaction testing
- Components must handle video element communication and state synchronization

### 3. Full Integration Environment

**Cannot work with stubs because:**
- ❌ Components like `<media-play-button>` need real implementations
- ❌ Video state synchronization requires component logic
- ❌ Cannot test CSS/interaction without functional components
- ❌ Stubbing 25+ components defeats the purpose of integration testing

---

## Test Infrastructure Requirements

### Current Working Approach

The existing demos (`test/e2e/app/`) use the correct infrastructure:

**WC Demo:**
- ✅ Vite dev server for proper module resolution
- ✅ Real imports from compiled skins
- ✅ Component implementations from `@vjs-10/html`
- ✅ Manual validation working

**React Demo:**
- ✅ Vite project with proper build setup
- ✅ Proper imports and dependencies
- ✅ Component implementations

### For Playwright Tests

**Requirements:**
1. Point tests to dev server URLs (not `file://` paths)
2. Ensure both pages import real compiled skins
3. Verify real `@vjs-10/html` components are available
4. Build environment handles monorepo package resolution

**Current Status:**
- Manual validation works in demos
- Playwright tests need to point to demo server URLs
- Infrastructure is ready, just needs test configuration updates

---

## What This Means for Development

### When Adding New Features

1. **Test in demos first** - Manual validation before automated tests
2. **Require build environment** - Cannot validate in isolation
3. **Integration over unit** - Focus on end-to-end equivalence
4. **Real packages required** - No shortcuts with stubs

### When Debugging Test Failures

1. **Check build output** - Are packages resolving correctly?
2. **Verify component implementations** - Are all required components available?
3. **Inspect browser console** - Real runtime errors, not stub limitations
4. **Compare to React version** - Visual/functional equivalence is the goal

---

## References

- E2E test app: `test/e2e/app/`
- Compiled skins: `test/e2e/app/src/compiled/`
- Playwright tests: `test/e2e/equivalence.test.ts`
- E2E capabilities: `docs/E2E_CAPABILITIES.md`

---

## Historical Context

This understanding emerged during Phase 1 (import generation) when we attempted to create self-contained test fixtures with stubs. We learned that:

1. Stubs cannot replicate real component behavior
2. Integration testing requires full build environment
3. Manual validation in demos is sufficient for development
4. Playwright tests should use the same infrastructure as demos

This insight clarified that E2E test infrastructure is a **separate concern** from compiler implementation, and that requiring a real build environment is the **correct approach** for integration testing.
