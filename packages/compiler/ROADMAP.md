# Compiler Roadmap

**Current Version**: v0.1.0
**Status**: JSX Transformation Only

---

## Phase 1: JSX Transformation (v0.1) ✅ COMPLETE

**Goal**: Transform React JSX to HTML web components with placeholder CSS

### Completed Features

- ✅ Element name transformation (PascalCase → kebab-case with `media-` prefix)
- ✅ Compound components (TimeSlider.Root → media-time-slider)
- ✅ Root special case (.Root → base element name without suffix)
- ✅ Attribute transformation (className → class, camelCase → kebab-case)
- ✅ Children placeholder ({children} → slot element)
- ✅ Basic className extraction
- ✅ Placeholder CSS generation
- ✅ Pure functions (no filesystem I/O)
- ✅ Comprehensive test suite (26 tests)

### Test Coverage

- Simple components (PlayButton, MuteButton, etc.)
- Icon components
- Compound components (TimeSlider, VolumeSlider)
- Nested structures
- Actual production Frosted skin

---

## Phase 2: Structural Transformations (v0.2) 🎯 NEXT

**Goal**: Handle components that require structural changes, not just element name mapping

### Tooltip/Popover Transformation

**Challenge**: React uses nested compound components, HTML uses flat structure with `commandfor` linking

**Required Implementation**:

1. **Pattern Detection**
   - Identify Tooltip.Root/Popover.Root patterns
   - Extract all nested components (Trigger, Portal, Positioner, Popup)

2. **Structure Flattening**

   ```tsx
   // Input
   <Tooltip.Root delay={500}>
     <Tooltip.Trigger>
       <PlayButton />
     </Tooltip.Trigger>
     <Tooltip.Portal>
       <Tooltip.Positioner side="top" sideOffset={12}>
         <Tooltip.Popup>Content</Tooltip.Popup>
       </Tooltip.Positioner>
     </Tooltip.Portal>
   </Tooltip.Root>
   ```

   ```html
   <!-- Output -->
   <media-play-button commandfor="play-tooltip">
   </media-play-button>
   <media-tooltip
     id="play-tooltip"
     popover="manual"
     delay="500"
     side="top"
     side-offset="12"
   >
     Content
   </media-tooltip>
   ```

3. **ID Generation**
   - Generate unique IDs for tooltip/popover elements
   - Could use component type + counter (e.g., `play-tooltip`, `time-slider-tooltip`)

4. **Attribute Merging**
   - Combine attrs from Root, Positioner, Popup
   - Add `popover="manual"` attribute
   - Map `openOnHover` → `open-on-hover`

5. **Trigger Extraction**
   - Extract first child of Tooltip.Trigger
   - Add `commandfor` attribute linking to tooltip ID

**Estimated Effort**: 2-3 days

---

## Phase 3: CSS Processing (v0.3)

**Goal**: Replace placeholder CSS with actual Tailwind → vanilla CSS transformation

### Required Implementation

1. **Tailwind v4 Integration**
   - PostCSS pipeline
   - Process utility classes to CSS rules
   - Handle responsive variants

2. **Style Key Categorization**
   - Component Selector IDs → element selectors
   - Generic classes → class selectors

3. **CSS Variable Resolution**
   - Resolve `var(--spacing)` to concrete values
   - Theme configuration

4. **Advanced Tailwind Features** (subset needed for Frosted skin)
   - ✅ Basic utilities (flex, grid, spacing, colors)
   - ⏳ Named groups (`group/root`, `group-hover/root:`)
   - ⏳ Has selector (`:has([[data-paused]])`)
   - ⏳ Before/After pseudo-elements
   - ⏳ Container queries (`@md/root:`)
   - ⏳ ARIA state selectors

**Estimated Effort**: 1-2 weeks

---

## Phase 4: Import Transformation (v0.4)

**Goal**: Transform import statements for web component usage

### Required Implementation

1. **Remove Framework Imports**

   ```tsx
   // Remove
   import { useState } from 'react';
   ```

2. **Transform Component Imports**

   ```tsx
   // Input
   import { PlayButton } from '@videojs/react';

   // Output (if needed at all)
   import '@videojs/html/define/media-play-button';
   ```

3. **Remove Style Imports**
   ```tsx
   // Remove (styles inlined)
   import styles from './styles';
   ```

**Estimated Effort**: 3-5 days

---

## Phase 5: Template Literal Resolution (v0.5)

**Goal**: Properly extract classNames from template literals

### Required Implementation

1. **Static Template Literals**

   ```tsx
   <Component
     // Input
     className={`${styles.A} ${styles.B} ${styles.C}`}

     // Extract: ['a', 'b', 'c']
   />
   ```

2. **Conditional Templates**

   ```tsx
   <Component
     // Input
     className={`${styles.Base} ${condition ? styles.Active : ''}`}

     // Extract: ['base', 'active'] (all possible classes)
   />
   ```

3. **Template with Strings**

   ```tsx
   <Component
     // Input
     className={`${styles.Button} custom-class`}

     // Extract: ['button', 'custom-class']
   />
   ```

**Estimated Effort**: 2-3 days

---

## Phase 6: CLI & File I/O (v0.6)

**Goal**: Add command-line interface and batch compilation

### Required Implementation

1. **File Discovery**
   - Glob pattern matching for skin files
   - Multi-file compilation

2. **Output Generation**
   - Write compiled HTML/CSS to disk
   - Generate module structure

3. **Watch Mode**
   - File watching for development
   - Incremental compilation

4. **Configuration**
   - Config file support
   - Command-line options

**Estimated Effort**: 1 week

---

## Future Considerations

### Advanced Features (Post v1.0)

- **Source Maps** - Debug compiled output back to React source
- **Tree Shaking** - Remove unused styles
- **Code Splitting** - Split large skins into chunks
- **Type Generation** - Generate .d.ts for compiled components
- **Validation** - Warn about unsupported patterns
- **Migration Tools** - Codemod for React → HTML patterns

### Integration

- **Build Tool Plugins** - Vite, Rollup, Webpack plugins
- **Framework Support** - Astro, SvelteKit, etc.
- **Documentation** - Auto-generate docs from compiled components

---

## Version Timeline (Estimate)

| Version | Feature                        | Timeline    | Status  |
| ------- | ------------------------------ | ----------- | ------- |
| v0.1    | JSX Transformation             | ✅ Complete | Done    |
| v0.2    | Tooltip/Popover Transformation | 2-3 days    | Planned |
| v0.3    | CSS Processing                 | 1-2 weeks   | Planned |
| v0.4    | Import Transformation          | 3-5 days    | Planned |
| v0.5    | Template Literal Resolution    | 2-3 days    | Planned |
| v0.6    | CLI & File I/O                 | 1 week      | Planned |
| v1.0    | Production Ready               | ~6-8 weeks  | Target  |

---

## Success Criteria for v1.0

- ✅ Compiles Frosted skin to match HTML package output exactly
- ✅ All Tailwind features used in production skins supported
- ✅ CLI for batch compilation
- ✅ Comprehensive test coverage (>90%)
- ✅ Performance: Compile full skin in <100ms
- ✅ Documentation and migration guides

---

**Last Updated**: 2025-11-07
