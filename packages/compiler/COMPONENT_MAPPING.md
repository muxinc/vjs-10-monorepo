# Component Mapping Reference

**Purpose**: Documents the verified mapping between React components and HTML web components

**Status**: ✅ Verified against `packages/html` implementation

---

## Transformation Rules

### Simple Components

| React Component        | HTML Element                   | Notes                  |
| ---------------------- | ------------------------------ | ---------------------- |
| `<PlayButton>`         | `<media-play-button>`          | ✅ Verified            |
| `<MuteButton>`         | `<media-mute-button>`          | ✅ Verified            |
| `<FullscreenButton>`   | `<media-fullscreen-button>`    | ✅ Verified            |
| `<MediaContainer>`     | `<media-container>`            | ✅ Verified            |
| `<CurrentTimeDisplay>` | `<media-current-time-display>` | ✅ Verified            |
| `<DurationDisplay>`    | `<media-duration-display>`     | ✅ Verified            |
| `<PreviewTimeDisplay>` | `<media-preview-time-display>` | ✅ Verified            |
| `<Popover>`            | `<media-popover>`              | Single element in HTML |
| `<Tooltip>`            | `<media-tooltip>`              | Single element in HTML |

### Icon Components

| React Component         | HTML Element                    |
| ----------------------- | ------------------------------- |
| `<PlayIcon>`            | `<media-play-icon>`             |
| `<PauseIcon>`           | `<media-pause-icon>`            |
| `<VolumeHighIcon>`      | `<media-volume-high-icon>`      |
| `<VolumeLowIcon>`       | `<media-volume-low-icon>`       |
| `<VolumeOffIcon>`       | `<media-volume-off-icon>`       |
| `<FullscreenEnterIcon>` | `<media-fullscreen-enter-icon>` |
| `<FullscreenExitIcon>`  | `<media-fullscreen-exit-icon>`  |

### Compound Components (TimeSlider)

**Important**: `.Root` maps to base element name (no `-root` suffix)

| React Component         | HTML Element                   | Rule                |
| ----------------------- | ------------------------------ | ------------------- |
| `<TimeSlider.Root>`     | `<media-time-slider>`          | ⚠️ Root → base name |
| `<TimeSlider.Track>`    | `<media-time-slider-track>`    | ✅ Standard         |
| `<TimeSlider.Progress>` | `<media-time-slider-progress>` | ✅ Standard         |
| `<TimeSlider.Pointer>`  | `<media-time-slider-pointer>`  | ✅ Standard         |
| `<TimeSlider.Thumb>`    | `<media-time-slider-thumb>`    | ✅ Standard         |

### Compound Components (VolumeSlider)

| React Component            | HTML Element                      | Rule                |
| -------------------------- | --------------------------------- | ------------------- |
| `<VolumeSlider.Root>`      | `<media-volume-slider>`           | ⚠️ Root → base name |
| `<VolumeSlider.Track>`     | `<media-volume-slider-track>`     | ✅ Standard         |
| `<VolumeSlider.Progress>`  | `<media-volume-slider-progress>`  | ✅ Standard         |
| `<VolumeSlider.Indicator>` | `<media-volume-slider-indicator>` | ✅ Standard         |
| `<VolumeSlider.Thumb>`     | `<media-volume-slider-thumb>`     | ✅ Standard         |

---

## Algorithm

### Element Name Transformation

1. **Built-in HTML elements** → Unchanged
   - `<div>`, `<button>`, `<span>`, etc. → lowercase, no prefix

2. **Simple custom elements** → PascalCase to kebab-case with prefix
   - `<PlayButton>` → `media-` + `play-button` → `<media-play-button>`

3. **Compound elements (Member expressions)**
   - Extract object and property: `TimeSlider.Root` → `TimeSlider` + `Root`
   - **Special case**: If property is `Root` → use base name only
     - `TimeSlider.Root` → `media-time-slider` (NOT `media-time-slider-root`)
   - **All other properties**: Concatenate and transform
     - `TimeSlider.Track` → `TimeSlider` + `Track` → `media-time-slider-track`

### Pseudo-Code

```typescript
function transformElementName(name) {
  if (isBuiltIn(name)) {
    return name.toLowerCase();
  }

  if (isMemberExpression(name)) {
    const object = getObjectName(name); // "TimeSlider"
    const property = getPropertyName(name); // "Root"

    if (property === 'Root') {
      return `media-${pascalToKebab(object)}`;
    }

    const combined = object + property; // "TimeSliderTrack"
    return `media-${pascalToKebab(combined)}`;
  }

  // Simple element
  return `media-${pascalToKebab(name)}`;
}
```

---

## Components Requiring Structural Transformation

These React components use floating-ui and require **structural transformation**, not just element name mapping.

### Tooltip Pattern

**React version** (nested compound components):

```tsx
<Tooltip.Root delay={500}>
  <Tooltip.Trigger>
    <PlayButton>
      <PlayIcon />
    </PlayButton>
  </Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner side="top" sideOffset={12} collisionPadding={12}>
      <Tooltip.Popup>
        <span>Play</span>
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
```

**HTML version** (flat with commandfor linking):

```html
<media-play-button commandfor="play-tooltip" class="button">
  <media-play-icon class="icon"></media-play-icon>
</media-play-button>
<media-tooltip
  id="play-tooltip"
  popover="manual"
  delay="500"
  side="top"
  side-offset="12"
  collision-padding="12"
>
  <span>Play</span>
</media-tooltip>
```

### Popover Pattern

**React version**:

```tsx
<Popover.Root openOnHover delay={200} closeDelay={100}>
  <Popover.Trigger>
    <MuteButton>...</MuteButton>
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner side="top" sideOffset={12}>
      <Popover.Popup>
        <VolumeSlider.Root>...</VolumeSlider.Root>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

**HTML version**:

```html
<media-mute-button commandfor="volume-slider-popover" command="toggle-popover">
  ...
</media-mute-button>
<media-popover
  id="volume-slider-popover"
  popover="manual"
  open-on-hover
  delay="200"
  close-delay="100"
  side="top"
  side-offset="12"
>
  <media-volume-slider orientation="vertical">...</media-volume-slider>
</media-popover>
```

### Required Transformations

1. **Flatten nested structure** - Remove Root/Trigger/Portal/Positioner/Popup wrappers
2. **Extract trigger element** - First child of Trigger becomes standalone
3. **Generate IDs** - Create unique IDs for linking (e.g., `play-tooltip`)
4. **Add commandfor attribute** - Link trigger to tooltip/popover
5. **Merge attributes** - Combine attrs from Root/Positioner/Popup into single element
6. **Move content** - Content from Popup becomes tooltip/popover children

### Status

**v0.1**: ❌ Not implemented - Tooltip/Popover will compile but produce incorrect structure
**Future**: ⏳ Requires transformation rule system (Phase 2+)

**Current behavior**: Naively transforms compound components

- `<Tooltip.Root>` → `<media-tooltip>` (Root rule)
- `<Tooltip.Trigger>` → `<media-tooltip-trigger>`
- Result: Incorrect nested structure instead of flat HTML pattern

---

## Test Coverage

**Verified in test suite** (26/26 tests passing):

✅ All simple components (PlayButton, MuteButton, etc.)
✅ All icon components
✅ All TimeSlider subcomponents (including Root special case)
✅ All VolumeSlider subcomponents (including Root special case)
✅ Nested structures
✅ Attribute transformation
✅ className extraction
✅ {children} → slot transformation

---

## Current Limitations (v0.1)

1. **Template literal classNames** - Not fully resolved
   - `className={\`${styles.A} ${styles.B}\`}` → Not extracted
   - **Workaround**: Use single className references for now

2. **Tooltip/Popover compound components** - Need special handling
   - React version uses floating-ui with many subcomponents
   - HTML version is single element
   - **Future**: Add transformation rules or replacement logic

3. **Complex className expressions** - Not supported
   - Conditional classNames
   - Array/object classNames
   - Computed values

---

**Last Updated**: 2025-11-07
**Package Version**: @videojs/compiler@0.1.0
