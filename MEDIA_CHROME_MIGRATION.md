# Migration Guide: Media Chrome to VJS-10 Monorepo (Extended)

## Overview

This guide demonstrates how to migrate components and state management from Media Chrome's monolithic architecture to VJS-10's layered monorepo approach, using the mute button as a comprehensive example.

## Architecture Comparison

### Media Chrome: Monolithic Event-Driven Architecture
- **Single package** with all functionality
- **Web Components** with direct DOM state coupling
- **Custom event system** for state changes
- **Integrated state management** within MediaController

### VJS-10: Layered Platform-Specific Architecture  
- **Multi-package monorepo** organized by platform
- **Hook-style components** with state injection
- **Nanostores-based** reactive state management
- **Strict dependency hierarchy** preventing circular dependencies

## Migration Pattern: 3-Phase Decomposition

Based on commit history analysis (`ad7aa79` → `882019f` → `e1d326f`), the migration follows this pattern:

1. **State Extraction** → Move state logic to core packages
2. **Component Refactoring** → Implement hook-style architecture  
3. **Platform Specialization** → Create platform-specific implementations

---

## Phase 1: State Management Migration

### Before: Media Chrome Monolithic State

```typescript
// media-chrome/src/js/media-store/request-map.ts
export const requestMap = {
  [MediaUIEvents.MEDIA_MUTE_REQUEST](stateMediator, stateOwners) {
    const key = 'mediaMuted';
    const value = true;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_UNMUTE_REQUEST](stateMediator, stateOwners) {
    const key = 'mediaMuted'; 
    const value = false;
    stateMediator[key].set(value, stateOwners);
  },
};

// media-chrome/src/js/media-store/state-mediator.ts  
export const stateMediator = {
  mediaMuted: {
    get: (stateOwners) => stateOwners.media?.muted ?? false,
    set: (value, stateOwners) => {
      if (!stateOwners.media) return;
      stateOwners.media.muted = value;
      if (!value && !stateOwners.media.volume) {
        stateOwners.media.volume = 0.25; // Auto-unmute behavior
      }
    },
    mediaEvents: ['volumechange'],
  },
  mediaVolumeLevel: {
    get: (stateOwners) => {
      const { media } = stateOwners;
      if (media?.muted || media?.volume === 0) return 'off';
      if (media?.volume < 0.5) return 'low';  
      if (media?.volume < 0.75) return 'medium';
      return 'high';
    },
    mediaEvents: ['volumechange'],
  },
};
```

### After: VJS-10 Decomposed State Architecture

#### 1. Core State Mediator
**Location**: `packages/core/media-store/src/state-mediators/audible.ts`

```typescript
export const audible = {
  muted: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.muted ?? false;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      media.muted = value;
      if (!value && !media.volume) {
        media.volume = 0.25;
      }
    },
    mediaEvents: ['volumechange'],
    actions: {
      muterequest: () => true,
      unmuterequest: () => false,
    },
  },
  volumeLevel: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      if (typeof media?.volume == 'undefined') return 'high';
      if (media.muted || media.volume === 0) return 'off';
      if (media.volume < 0.5) return 'low';
      if (media.volume < 0.75) return 'medium';
      return 'high';
    },
    mediaEvents: ['volumechange'],
  },
};
```

#### 2. Component State Definition
**Location**: `packages/core/media-store/src/component-state-definitions/mute-button.ts`

```typescript
export interface MuteButtonState {
  muted: boolean;
  volumeLevel: string;
}

export interface MuteButtonMethods {
  requestMute: () => void;
  requestUnmute: () => void;
}

export const muteButtonStateDefinition: MuteButtonStateDefinition = {
  keys: ['muted', 'volumeLevel'],

  stateTransform: (rawState: any): MuteButtonState => ({
    muted: rawState.muted ?? false,
    volumeLevel: rawState.volumeLevel ?? 'off',
  }),

  createRequestMethods: (dispatch): MuteButtonMethods => ({
    requestMute: () => dispatch({ type: 'muterequest' }),
    requestUnmute: () => dispatch({ type: 'unmuterequest' }),
  }),
};
```

---

## Phase 2: Component Refactoring

### Before: Media Chrome Monolithic Component

```typescript
// media-chrome/src/js/media-mute-button.ts
import { MediaChromeButton } from './media-chrome-button.js';
import { MediaUIEvents, MediaUIAttributes } from './constants.js';

class MediaMuteButton extends MediaChromeButton {
  static get observedAttributes(): string[] {
    return [...super.observedAttributes, MediaUIAttributes.MEDIA_VOLUME_LEVEL];
  }

  handleClick(): void {
    const eventName: string =
      this.mediaVolumeLevel === 'off'
        ? MediaUIEvents.MEDIA_UNMUTE_REQUEST
        : MediaUIEvents.MEDIA_MUTE_REQUEST;
    this.dispatchEvent(
      new globalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
```

### After: VJS-10 Hook-Style Components

#### HTML Implementation
**Location**: `packages/html/html/src/components/media-mute-button.ts`

```typescript
import { muteButtonStateDefinition } from '@vjs-10/media-store';

export class MuteButtonBase extends MediaChromeButton {
  _state: {
    muted: boolean;
    volumeLevel: string;
    requestMute: () => void;
    requestUnmute: () => void;
  } | undefined;

  handleEvent(event: Event) {
    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      if (state.volumeLevel === 'off') {
        state.requestUnmute();
      } else {
        state.requestMute();
      }
    }
  }

  _update(props: any, state: any) {
    this._state = state;
    this.toggleAttribute('data-muted', props['data-muted']);
    this.setAttribute('data-volume-level', props['data-volume-level']);
    this.setAttribute('aria-label', props['aria-label']);
  }
}

export const useMuteButtonState = {
  keys: muteButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...muteButtonStateDefinition.stateTransform(rawState),
    ...muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const useMuteButtonProps = (state, _element) => ({
  'data-muted': state.muted,
  'data-volume-level': state.volumeLevel,
  'aria-label': state.muted ? 'unmute' : 'mute',
  'data-tooltip': state.muted ? 'Unmute' : 'Mute',
});

export const MuteButton = toConnectedHTMLComponent(
  MuteButtonBase,
  useMuteButtonState,
  useMuteButtonProps,
  'MuteButton',
);
```

#### React Implementation  
**Location**: `packages/react/react/src/components/MuteButton.tsx`

```typescript
import { useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { muteButtonStateDefinition } from '@vjs-10/media-store';

export const useMuteButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(
    muteButtonStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    volumeLevel: mediaState.volumeLevel,
    muted: mediaState.muted,
    requestMute: methods.requestMute,
    requestUnmute: methods.requestUnmute,
  } as const;
};

export const renderMuteButton = (props, state) => (
  <button
    {...props}
    onClick={() => {
      if (props.disabled) return;
      if (state.volumeLevel === 'off') {
        state.requestUnmute();
      } else {
        state.requestMute();
      }
    }}
  >
    {props.children}
  </button>
);

export const MuteButton = toConnectedComponent(
  useMuteButtonState,
  useMuteButtonProps,
  renderMuteButton,
  'MuteButton',
);
```

---

## Phase 3: Styling & Theming Migration

### Media Chrome: Shadow DOM with CSS Custom Properties

```typescript
// media-chrome/src/js/media-mute-button.ts
function getSlotTemplateHTML(_attrs: Record<string, string>) {
  return /*html*/ `
    <style>
      :host(:not([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }
    </style>

    <slot name="icon">
      <slot name="off">${offIcon}</slot>
      <slot name="low">${lowIcon}</slot>
      <slot name="medium">${lowIcon}</slot>
      <slot name="high">${highIcon}</slot>
    </slot>
  `;
}
```

**CSS Custom Properties for Theming:**
```css
/* Media Chrome approach */
media-mute-button {
  --media-primary-color: #fff;
  --media-secondary-color: rgba(20, 20, 30, 0.7);
  --media-icon-color: var(--media-primary-color);
  --media-control-background: var(--media-secondary-color);
  --media-control-hover-background: rgba(50, 50, 70, 0.7);
}
```

### VJS-10: Platform-Specific Styling Approaches

#### HTML Styling - Data Attributes + External CSS

```typescript
// packages/html/html/src/components/media-mute-button.ts
export const useMuteButtonProps = (state, _element) => ({
  'data-muted': state.muted,
  'data-volume-level': state.volumeLevel,
  'aria-label': state.muted ? 'unmute' : 'mute',
  'data-tooltip': state.muted ? 'Unmute' : 'Mute',
});
```

**External CSS Targeting Data Attributes:**
```css
/* VJS-10 HTML approach - external stylesheets */
media-mute-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vjs-control-bg, rgba(0, 0, 0, 0.5));
  color: var(--vjs-control-color, #fff);
  border: none;
  padding: 8px;
  cursor: pointer;
}

media-mute-button[data-volume-level="off"] .volume-icon:not(.volume-off) {
  display: none;
}

media-mute-button[data-volume-level="low"] .volume-icon:not(.volume-low) {
  display: none;
}

media-mute-button[data-volume-level="medium"] .volume-icon:not(.volume-medium) {
  display: none;
}

media-mute-button[data-volume-level="high"] .volume-icon:not(.volume-high) {
  display: none;
}
```

#### React Styling - CSS-in-JS or Styled Components

```tsx
// packages/react/react/src/components/MuteButton.tsx
export const renderMuteButton = (props, state) => (
  <button
    {...props}
    className={`mute-button ${state.muted ? 'muted' : ''}`}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--vjs-control-bg, rgba(0, 0, 0, 0.5))',
      color: 'var(--vjs-control-color, #fff)',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      ...props.style,
    }}
  >
    {props.children}
  </button>
);
```

---

## Phase 4: Icon Management Migration

### Media Chrome: Inline SVG with Slots

```typescript
// media-chrome/src/js/media-mute-button.ts
const offIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0..."/>
</svg>`;

const lowIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`;

const highIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;

// Usage in template with slot-based icon switching
function getSlotTemplateHTML() {
  return `
    <slot name="icon">
      <slot name="off">${offIcon}</slot>
      <slot name="low">${lowIcon}</slot>
      <slot name="medium">${lowIcon}</slot>
      <slot name="high">${highIcon}</slot>
    </slot>
  `;
}
```

### VJS-10: Centralized Icon System

#### Core Icon Package
**Location**: `packages/core/icons/src/index.ts`

```typescript
// Import SVG files as strings
import playSvg from '../assets/play.svg';
import pauseSvg from '../assets/pause.svg';
import volumeHighSvg from '../assets/volume-high.svg';
import volumeLowSvg from '../assets/volume-low.svg';
import volumeOffSvg from '../assets/volume-off.svg';

// Export SVG strings directly
export const SVG_ICONS = {
  play: playSvg,
  pause: pauseSvg,
  volumeHigh: volumeHighSvg,
  volumeLow: volumeLowSvg,
  volumeOff: volumeOffSvg,
} as const;

// Legacy interface for backward compatibility
export interface IconDefinition {
  name: string;
  viewBox: string;
  paths: string[];
}

export const ICON_DEFINITIONS: Record<string, IconDefinition> = {
  play: {
    name: 'play',
    viewBox: '0 0 24 24',
    paths: ['M8 5v14l11-7z']
  },
  // ... other icons
};
```

#### HTML Icon Components
**Location**: `packages/html/html-icons/src/media-volume-off-icon.ts`

```typescript
import { MediaChromeIcon } from './media-chrome-icon.js';
import { SVG_ICONS } from '@vjs-10/icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-volume-off-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.volumeOff}
  `;
}

export class MediaVolumeOffIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-volume-off-icon', MediaVolumeOffIcon);
```

#### React Icon Components (Auto-Generated)
**Location**: `packages/react/react-icons/src/generated-icons/VolumeOff.tsx`

```tsx
/**
 * @fileoverview Auto-generated React component from SVG
 * @generated
 */
import * as React from "react";
import type { IconProps } from "../types";

const SvgVolumeOff = ({ color = "currentColor", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0..."
      fill={color}
    />
  </svg>
);
export default SvgVolumeOff;
```

---

## Phase 5: React Component Architecture Migration

### Media Chrome: Auto-Generated Thin Wrappers

Media Chrome uses **ce-la-react** to automatically generate React wrappers around web components:

```typescript
// media-chrome/scripts/react/build.js
const toReactComponentStr = (config) => {
  const { elementName } = config;
  const ReactComponentName = toPascalCase(elementName);
  return `
export const ${ReactComponentName} = createComponent({
  tagName: "${elementName}",
  elementClass: Modules.${ReactComponentName},
  react: React,
  toAttributeValue: toAttributeValue,
  defaultProps: {
    suppressHydrationWarning: true,
  },
});`;
};
```

**Generated React Component:**
```tsx
// Generated: media-chrome/dist/react/media-mute-button.js
import React from "react";
import { createComponent } from 'ce-la-react';
import * as Modules from "../index.js";

export const MediaMuteButton = createComponent({
  tagName: "media-mute-button",
  elementClass: Modules.MediaMuteButton,
  react: React,
  toAttributeValue: toAttributeValue,
  defaultProps: {
    suppressHydrationWarning: true,
  },
});
```

**Usage:**
```tsx
// Media Chrome approach - thin wrapper around web component
import { MediaMuteButton } from 'media-chrome/react';

function MyPlayer() {
  return (
    <MediaController>
      <video slot="media" src="video.mp4" />
      <MediaControlBar>
        <MediaMuteButton />
      </MediaControlBar>
    </MediaController>
  );
}
```

### VJS-10: Native React Components with Shared State

VJS-10 creates **completely separate React components** that share only the core state logic:

```tsx
// packages/react/react/src/components/MuteButton.tsx
export const useMuteButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(
    muteButtonStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return { ...mediaState, ...methods };
};

export const useMuteButtonProps = (props, state) => {
  const baseProps = {
    'data-volume-level': state.volumeLevel,
    'aria-label': state.muted ? 'unmute' : 'mute',
    ...props,
  };

  if (state.muted) {
    baseProps['data-muted'] = '';
  }

  return baseProps;
};

export const renderMuteButton = (props, state) => (
  <button
    {...props}
    onClick={() => {
      if (state.volumeLevel === 'off') {
        state.requestUnmute();
      } else {
        state.requestMute();
      }
    }}
  >
    {props.children}
  </button>
);

export const MuteButton = toConnectedComponent(
  useMuteButtonState,
  useMuteButtonProps,
  renderMuteButton,
  'MuteButton',
);
```

**Usage:**
```tsx
// VJS-10 approach - native React with shared state
import { MediaProvider } from '@vjs-10/react-media-store';
import { MuteButton } from '@vjs-10/react';
import { VolumeOffIcon } from '@vjs-10/react-icons';

function MyPlayer() {
  return (
    <MediaProvider>
      <video ref={mediaRef} src="video.mp4" />
      <div className="controls">
        <MuteButton>
          <VolumeOffIcon />
        </MuteButton>
      </div>
    </MediaProvider>
  );
}
```

---

## Phase 6: Subcomponent & Slot Pattern Migration

### Media Chrome: Web Component Slots

Media Chrome uses **Shadow DOM slots** for composability:

```typescript
// media-chrome/src/js/media-chrome-button.ts
function getTemplateHTML(_attrs, _props) {
  return /*html*/ `
    <style>
      :host([aria-disabled='true']) {
        pointer-events: none;
        opacity: 0.6;
      }
      
      slot[name="tooltip"]:not([hidden]) ~ :host([notooltip]) {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(_attrs, _props)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${MediaTooltip.shadowRootOptions.mode}">
          ${MediaTooltip.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(_attrs)}
        </slot>
      </media-tooltip>
    </slot>
  `;
}

// media-chrome/src/js/media-mute-button.ts
function getSlotTemplateHTML() {
  return /*html*/ `
    <slot name="icon">
      <slot name="off">${offIcon}</slot>
      <slot name="low">${lowIcon}</slot>
      <slot name="medium">${lowIcon}</slot>
      <slot name="high">${highIcon}</slot>
    </slot>
  `;
}

function getTooltipContentHTML() {
  return /*html*/ `
    <slot name="tooltip-mute">${t('Mute')}</slot>
    <slot name="tooltip-unmute">${t('Unmute')}</slot>
  `;
}
```

**Usage:**
```html
<!-- Media Chrome slot-based customization -->
<media-mute-button>
  <span slot="tooltip-mute">Click to mute audio</span>
  <span slot="tooltip-unmute">Click to unmute audio</span>
  <svg slot="off" viewBox="0 0 24 24">
    <!-- Custom mute icon -->
  </svg>
</media-mute-button>
```

### VJS-10: React Children & Render Props

VJS-10 uses **React children patterns** and **render props** for composability:

#### HTML Implementation (Web Component Slots)
```typescript
// packages/html/html/src/components/media-mute-button.ts - Similar to Media Chrome
export class MuteButtonBase extends MediaChromeButton {
  // Inherits slot-based template system from MediaChromeButton base
}
```

#### React Implementation (Children & Render Props)
```tsx
// packages/react/react/src/components/MuteButton.tsx
export const renderMuteButton = (props, state) => (
  <button
    {...props}
    onClick={() => {
      if (state.volumeLevel === 'off') {
        state.requestUnmute();
      } else {
        state.requestMute();
      }
    }}
  >
    {props.children || <DefaultMuteIcon volumeLevel={state.volumeLevel} />}
  </button>
);

// Advanced render prop pattern
export const MuteButtonRender = ({ children, ...props }) => {
  const state = useMuteButtonState(props);
  const buttonProps = useMuteButtonProps(props, state);
  
  return children(buttonProps, state);
};
```

**Usage:**
```tsx
// VJS-10 React children patterns
import { MuteButton, MuteButtonRender } from '@vjs-10/react';
import { VolumeOffIcon, VolumeLowIcon, VolumeHighIcon } from '@vjs-10/react-icons';

// Simple children
function SimpleUsage() {
  return (
    <MuteButton>
      <VolumeOffIcon />
    </MuteButton>
  );
}

// Conditional rendering based on state
function ConditionalIcons() {
  return (
    <MuteButton>
      {({ volumeLevel }) => {
        switch (volumeLevel) {
          case 'off': return <VolumeOffIcon />;
          case 'low': return <VolumeLowIcon />;
          default: return <VolumeHighIcon />;
        }
      }}
    </MuteButton>
  );
}

// Render prop pattern for maximum control
function RenderPropUsage() {
  return (
    <MuteButtonRender>
      {(buttonProps, state) => (
        <div className="custom-mute-wrapper">
          <button {...buttonProps}>
            <span>Volume: {state.volumeLevel}</span>
            <CustomIcon muted={state.muted} />
          </button>
          <span className="tooltip">
            {state.muted ? 'Unmute' : 'Mute'}
          </span>
        </div>
      )}
    </MuteButtonRender>
  );
}
```

---

## Migration Comparison Summary

### Architecture Changes

| Aspect | Media Chrome | VJS-10 |
|--------|-------------|--------|
| **State Management** | Monolithic MediaStore with custom events | Layered nanostores with mediators |
| **Component Style** | Web Components with Shadow DOM | Hook-style with platform adapters |
| **React Integration** | Auto-generated thin wrappers | Native React components |
| **Styling** | Shadow DOM + CSS custom properties | Data attributes + external CSS |
| **Icons** | Inline SVG strings with slots | Centralized icon packages |
| **Theming** | CSS custom properties | Platform-specific approaches |
| **Composition** | Slot-based (HTML) | Children/render props (React) |

### Migration Benefits

#### 1. **Platform Optimization**
- **HTML**: Web Components with Shadow DOM encapsulation
- **React**: Native React patterns with hooks and JSX
- **React Native**: Native mobile components (future)

#### 2. **Bundle Size Control**
- **Tree-shakable**: Import only needed components/icons
- **Platform-specific builds**: No unused code
- **Selective state subscriptions**: Optimized reactivity

#### 3. **Developer Experience**
- **Type safety**: Explicit interfaces and platform types
- **Framework familiarity**: Native patterns per platform  
- **Customization**: More flexible composition patterns

#### 4. **Maintainability**
- **Separation of concerns**: Core logic vs. UI implementation
- **Dependency hierarchy**: Clear, acyclic relationships
- **Shared testing**: Core state logic tested once

### Migration Checklist (Extended)

#### ✅ Phase 1: State Extraction
- [ ] Create state mediator in `packages/core/media-store/src/state-mediators/`
- [ ] Define component state interface in `packages/core/media-store/src/component-state-definitions/`
- [ ] Add state keys and transformation logic
- [ ] Implement request method factories

#### ✅ Phase 2: Icon System Migration
- [ ] Add SVG assets to `packages/core/icons/assets/`
- [ ] Export icon strings from `packages/core/icons/src/index.ts`
- [ ] Create HTML icon components in `packages/html/html-icons/src/`
- [ ] Generate React icon components in `packages/react/react-icons/src/generated-icons/`

#### ✅ Phase 3: HTML Component Implementation
- [ ] Create base component class in `packages/html/*/src/components/`
- [ ] Implement state hook with keys and transform function
- [ ] Implement props hook for attribute management
- [ ] Connect with `toConnectedHTMLComponent` factory
- [ ] Register custom element

#### ✅ Phase 4: React Component Implementation
- [ ] Create React hooks in `packages/react/*/src/components/`
- [ ] Use `useMediaSelector` with `shallowEqual` optimization
- [ ] Implement props transformation for React patterns
- [ ] Create render function component
- [ ] Connect with `toConnectedComponent` factory

#### ✅ Phase 5: Styling Migration
- [ ] Convert Shadow DOM styles to external CSS (HTML)
- [ ] Implement CSS-in-JS or styled-components (React)
- [ ] Update CSS custom property naming conventions
- [ ] Create platform-specific theming approaches

#### ✅ Phase 6: Testing & Documentation
- [ ] Create platform-specific tests
- [ ] Verify dependency hierarchy compliance
- [ ] Document component API and usage patterns
- [ ] Create migration guide for users

This comprehensive migration guide demonstrates how VJS-10's layered architecture enables **maximum reusability** while providing **platform-optimized developer experiences** and maintaining **strict separation of concerns**.