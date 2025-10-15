# E2E Test App Scripts

Automation scripts for the VJS compiler E2E test application.

## Scripts

### `generate-entrypoints.js`

**Purpose:** Automatically generate React and Web Component entrypoint files for all test skins.

**What it does:**
- Scans `src/skins/` for all skin directories
- Generates `.html` and `.tsx` files in `src/react/` for each skin
- Generates `.html` files in `src/wc/` for each skin
- Extracts descriptions from skin `README.md` files
- Creates consistent test pages with video players and metadata

**Usage:**
```bash
# Manual run
pnpm generate-entrypoints

# Automatic (runs before pnpm dev via predev hook)
pnpm dev
```

**Output:**
- `src/react/[skin-name].html` - React HTML entrypoint
- `src/react/[skin-name].tsx` - React TSX with component import
- `src/wc/[skin-name].html` - Web Component HTML entrypoint

**Why this matters:**
- **Zero maintenance** - Add a skin in `src/skins/`, entrypoints are auto-generated
- **Consistency** - All test pages follow the same structure
- **Scalability** - 29 skins = 87 files generated automatically
- **Documentation** - Descriptions from README.md appear in test pages

### `compile-skins.js`

**Purpose:** Compile all React skins to Web Component skins using the VJS compiler.

**What it does:**
- Scans `src/skins/` for all skin directories with `MediaSkin*.tsx` files
- Compiles each skin using the VJS compiler
- Outputs compiled `.js` files to `src/compiled/`
- Reports compilation errors

**Usage:**
```bash
# Manual run
pnpm compile-skins

# Automatic (runs before pnpm dev via predev hook)
pnpm dev
```

**Output:**
- `src/compiled/[skin-name].js` - Compiled web component skin

## Development Workflow

### Adding a New Test Skin

1. **Create skin directory** in `src/skins/new-feature/`:
   ```
   src/skins/new-feature/
   ├── MediaSkinNewFeature.tsx  # React component
   ├── styles.ts                # Tailwind styles
   └── README.md                # Documentation
   ```

2. **Run dev server** (entrypoints auto-generate):
   ```bash
   pnpm dev
   ```

3. **Test in browser**:
   - React: `http://localhost:5175/src/react/new-feature.html`
   - WC: `http://localhost:5175/src/wc/new-feature.html`

That's it! No manual entrypoint creation needed.

### Modifying an Existing Skin

1. **Edit files** in `src/skins/[skin-name]/`
2. **Restart dev server** to recompile:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

Entrypoints are regenerated automatically.

### Removing a Test Skin

1. **Delete skin directory** from `src/skins/`
2. **Restart dev server**

Old entrypoints are automatically removed (they're .gitignored).

## Architecture

### Why Auto-Generate?

**Before (manual):**
- 29 skins → 87 files to maintain manually
- Error-prone (easy to forget to update)
- Inconsistent structure
- Copy-paste mistakes

**After (auto-generated):**
- 29 skins → 0 manual files
- Single source of truth (`src/skins/`)
- Consistent structure
- Zero maintenance overhead

### File Flow

```
src/skins/[name]/
├── MediaSkin[Name].tsx ──┐
├── styles.ts             │
└── README.md             │
                          │
    generate-entrypoints.js ← Auto-generates
                          │
                          ├─→ src/react/[name].html
                          ├─→ src/react/[name].tsx
                          └─→ src/wc/[name].html

    compile-skins.js ← Compiles

                └─→ src/compiled/[name].js
```

### Gitignore Strategy

**Tracked (committed):**
- `src/skins/**` - Source of truth
- `scripts/**` - Generation scripts

**Ignored (generated):**
- `src/react/*.html` - Auto-generated
- `src/react/*.tsx` - Auto-generated
- `src/wc/*.html` - Auto-generated
- `src/compiled/*.js` - Compiler output

**Why?** Generated files should never be manually edited or committed.

## Troubleshooting

### Entrypoints not updating?

```bash
# Force regeneration
pnpm generate-entrypoints

# Or restart dev server
# (predev hook runs generation automatically)
pnpm dev
```

### Compilation errors?

```bash
# See detailed errors
pnpm compile-skins
```

### Missing entrypoint for a skin?

Check that the skin directory contains:
- `MediaSkin[Name].tsx` file (correct naming)
- `styles.ts` file

## Future Enhancements

Potential improvements:
- [ ] Generate index pages listing all skins
- [ ] Add comparison view (React vs WC side-by-side)
- [ ] Extract more metadata from README.md (categories, tags)
- [ ] Generate Playwright test scaffolding
- [ ] Watch mode for live regeneration
