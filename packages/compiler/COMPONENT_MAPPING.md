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

## React-Only Components

These React components use floating-ui and don't have direct HTML equivalents:

- `<Tooltip.Root>`, `<Tooltip.Trigger>`, `<Tooltip.Portal>`, `<Tooltip.Positioner>`, `<Tooltip.Popup>`
- `<Popover.Root>`, `<Popover.Trigger>`, `<Popover.Portal>`, `<Popover.Positioner>`, `<Popover.Popup>`

In the HTML package, these are simplified to single elements:

- React: `<Tooltip.Root><Tooltip.Trigger>...</Tooltip.Trigger></Tooltip.Root>`
- HTML: `<media-tooltip>...</media-tooltip>`

**For compilation**: These components will need special handling or replacement in future iterations.

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
