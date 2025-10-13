# VJS Compiler E2E Test Application

This is a self-contained test application for validating the VJS compiler through end-to-end browser tests.

## Architecture

**Single Vite App with Multiple Test Pages:**
- React pages in `src/react/` - Test the original React skins
- Web Component pages in `src/wc/` - Test compiled WC skins
- Both served from one dev server for easy side-by-side comparison

**Test Skin Levels:**
- `01-minimal` - Single button, basic utilities (baseline)
- `02-simple` - Multiple controls, layout (future)
- `03-conditional` - Hover, focus, data attributes (future)
- `04-arbitrary` - Arbitrary variants, nested selectors (future)
- `05-production` - Full production skins (future)

## Quick Start

```bash
# Install dependencies
pnpm install

# Compile skins and start dev server
pnpm dev

# Visit test pages:
# React: http://localhost:5175/src/react/01-minimal.html
# WC:    http://localhost:5175/src/wc/01-minimal.html

# Run E2E tests
pnpm test:e2e
```

## Development Workflow

### 1. Add a New Test Skin

```bash
# Create skin directory
mkdir -p src/skins/02-simple

# Add files:
# - MediaSkinSimple.tsx (React component)
# - styles.ts (Tailwind styles)
# - types.ts (TypeScript types)
# - index.ts (exports)
```

### 2. Add Test Pages

```bash
# React page
# src/react/02-simple.html + 02-simple.tsx

# WC page
# src/wc/02-simple.html
```

### 3. Update Compilation Script

Edit `scripts/compile-skins.js` to add the new skin to the `skins` array.

### 4. Update Vite Config

Edit `vite.config.ts` to add new page entries.

### 5. Write Playwright Tests

Create `../tests/02-simple.spec.ts` with equivalence tests.

## Directory Structure

```
app/
├── package.json              # Dependencies (React, Vite, Playwright)
├── vite.config.ts            # Multi-page Vite config
├── tsconfig.json             # TypeScript config
├── playwright.config.ts      # Playwright config (future)
├── scripts/
│   └── compile-skins.js      # Compiles React → WC
├── public/
│   └── test-video.mp4        # Shared test video
└── src/
    ├── compiled/             # Generated WC skins (gitignored)
    │   ├── 01-minimal.js
    │   └── ...
    ├── skins/                # Source skins (React + Tailwind)
    │   ├── 01-minimal/
    │   │   ├── MediaSkinMinimal.tsx
    │   │   ├── styles.ts
    │   │   ├── types.ts
    │   │   └── index.ts
    │   └── ...
    ├── react/                # React test pages
    │   ├── 01-minimal.html
    │   ├── 01-minimal.tsx
    │   └── ...
    └── wc/                   # WC test pages
        ├── 01-minimal.html
        └── ...
```

## Testing Strategy

### Compilation Test (Unit)
- Validates skin compiles without errors
- Checks output structure (imports, CSS, HTML)
- Location: `../../test/integration/compile-demo-skins.test.ts`

### Browser Loading Test (E2E)
- React version loads without console errors
- WC version loads without console errors
- Custom elements register correctly

### Visual Equivalence Test (E2E)
- Screenshot comparison (React vs WC)
- Pixel diff < 2% threshold
- Tests multiple states (initial, hover, paused)

### Functional Equivalence Test (E2E)
- Interactions produce same results
- Media state matches after user actions
- Data attributes update correctly

## Complexity Levels

### Level 1: Minimal ✅
**Features:** Single button, basic padding/radius, hover state
**Tests:** Compilation, loading, basic styling

### Level 2: Simple (Future)
**Features:** Multiple controls, flex layout, colors, spacing
**Tests:** Layout equivalence, color matching

### Level 3: Conditional (Future)
**Features:** Pseudo-classes, data attributes, media queries
**Tests:** State-based styling, attribute selectors

### Level 4: Arbitrary (Future - Blocked)
**Features:** Arbitrary variants, nested selectors
**Tests:** Icon visibility, complex state styling

### Level 5: Production (Future)
**Features:** Full frosted/toasted skins
**Tests:** Full visual regression suite

## Notes

- **Workspace Dependencies:** Uses `workspace:*` for `@vjs-10/*` packages
- **Compilation:** Runs automatically before `pnpm dev` (predev hook)
- **Hot Reload:** React pages support HMR, WC pages need manual refresh
- **Port:** Dev server runs on port 5175 (avoid conflicts with main demos)
