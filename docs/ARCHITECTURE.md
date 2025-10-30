# Video.js 10 Architecture

**Status:** Technical Preview (initial working showcase for Demuxed)

- Current codebase is an early push by the team to have a working showcase for Demuxed.
- Architecture and patterns will evolve as we refine and plan the long‑term structure.

## Early Goals

- Establish a common, TanStack‑based core for consistent state management across supported platforms and frameworks.
- Ensure composition and compound patterns are first‑class.
- Adopt TypeScript throughout for safety and DX.
- Design for modularity, tree‑shaking, and performance.
- Fully support SSR / hydration.
- Create a compiler to handle transformation and output across multiple JS and CSS frameworks.

## Core Principles

- **Common Core:** TanStack state-driven architecture; DOM lives in a separate package; maps to web, React, and React Native.
- **Composition-first:** Compound component and functional patterns. E.g., React has `render(attrs, state)` prop to allow full control of element type or animations.
- **TypeScript everywhere.**
- **Modular & tree-shakeable.**
- **Performance-focused:** Minimal bundle size and payload, smooth 60+ FPS target.
- **SSR + hydration safe/optimized.**

## Accessibility

- Non-negotiable.
- Core owns ARIA roles, labels, navigation, and focus.
- Captions, keyboard navigation/shortcuts, and focus management.
- Meets WCAG 2.2 / CVAA standards out‑of‑box.

## State & Reactivity

- State hooks and components support **controlled/uncontrolled** mode (`value` / `onChange`).
- State-driven architecture powers Web, React, and React‑Native.
- Maintain 16 ms frame budget.
- Offload heavy style computations to CSS.
- Minimal playback engine per user case.
- Stream + lazy caption parsing for large files.
- SSR: preload rendition segments in document head, ship parsed manifest, minimal composed-playback engine for faster TTF (time‑to‑first‑frame).

## Styling

- **Style‑agnostic core:** No CSS shipped in Core or Primitives.
- **Style‑ready hooks:** Stable `data-*` attrs and CSS vars for easy theming.
- Default skins in separate exports (optional entry points).
- Primitives avoid Shadow DOM; themed skins may opt in.
- DOM trees stay one level deep per component part (Root, Thumb, Track, etc.).
- No internal JS animations.
- Components toggle data attributes (`data-open`, `data-starting-style`, etc.) for CSS or Motion libraries to hook into.

## Cross‑Browser Compatibility

- Ensure consistent behavior across major browsers.
- Abstract differences in media APIs (fullscreen, PiP, captions, streaming).
- Normalize vendor‑specific features through adapters and polyfills.
- Maintain uniform rendering, controls, and accessibility regardless of platform.
