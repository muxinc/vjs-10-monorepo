# JSX Compound Components Test

**Category:** Category 1 - JSX Transformation Patterns
**Purpose:** Test compound component patterns (e.g., TimeSlider.Root, TimeSlider.Track)

## What This Tests

**React → HTML Pattern:**
```tsx
<TimeSlider.Root>
  <TimeSlider.Track>
    <TimeSlider.Progress />
  </TimeSlider.Track>
</TimeSlider.Root>
```

Should transform to:
```html
<media-time-slider>
  <media-time-slider-track>
    <media-time-slider-progress></media-time-slider-progress>
  </media-time-slider-track>
</media-time-slider>
```

This tests the compiler's ability to handle compound component naming patterns.

## Expected Output

Web component should have:
- Correctly transformed element names (TimeSlider.Root → media-time-slider)
- Preserved nesting structure
- All closing tags present

## Why This Matters

Compound components are a common React pattern for related component families (sliders, popovers, tooltips).
