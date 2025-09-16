# React to HTML Transpilation Context Guide

This document serves as a context reference for transpiling React VJS-10 components and skins to their HTML equivalents using Claude Code as a CLI tool.

## Architectural Overview

VJS-10 follows a strict dependency hierarchy where HTML packages depend only on core packages, and React packages depend only on core packages. The transpilation process converts React platform implementations to HTML platform implementations while maintaining this architectural constraint.

### Package Mapping

| React Package                  | HTML Equivalent               | Purpose           |
| ------------------------------ | ----------------------------- | ----------------- |
| `@vjs-10/react`                | `@vjs-10/html`                | UI components     |
| `@vjs-10/react-icons`          | `@vjs-10/html-icons`          | Icon components   |
| `@vjs-10/react-media-elements` | `@vjs-10/html-media-elements` | Media wrappers    |
| `@vjs-10/react-media-store`    | `@vjs-10/html-media-store`    | Store integration |

## Core Transpilation Patterns

### 1. Component Structure Transformation

**React Pattern:**

```typescript
// React component with hooks architecture
export const ComponentName = toConnectedComponent(
  useComponentState,
  useComponentProps,
  renderComponent,
  'ComponentName',
);
```

**HTML Pattern:**

```typescript
// HTML component with class-based architecture
export const ComponentName = toConnectedHTMLComponent(
  ComponentBase,
  useComponentState,
  useComponentProps,
  'ComponentName',
);

customElements.define('media-component-name', ComponentName);
```

### 2. Import Statement Transformations

**React Imports → HTML Imports:**

```typescript
// FROM (React):
import * as React from 'react';
import PlayButton from '../components/PlayButton';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import { MediaContainer } from '../components/MediaContainer';

// TO (HTML):
import { MediaSkin } from '../media-skin';
import '../components/media-play-button';
import '@vjs-10/html-icons';
import '../media-container';
```

#### Important

- Do not include any `import` from `react` in HTML
- For skins, make sure you `import { MediaSkin } from '../media-skin';` in HTML

### 3. Component Declaration Patterns

**React Function Component → HTML Template Function:**

```typescript
// FROM (React):
export const MediaSkinTestReference: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <MediaContainer>
      {children}
      <div>
        <PlayButton>
          <PlayIcon />
          <PauseIcon />
        </PlayButton>
      </div>
    </MediaContainer>
  );
};

// TO (HTML):
export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <media-container>
      <slot name="media" slot="media"></slot>
      <div>
        <media-play-button>
          <media-play-icon></media-play-icon>
          <media-pause-icon></media-pause-icon>
        </media-play-button>
      </div>
    </media-container>
  `;
}

export class MediaSkinTestReference extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-skin-test-reference', MediaSkinTestReference);
```

### 4. JSX to HTML Template Literals

**Element Transformations:**

- React JSX → HTML template literals
- Self-closing tags → Explicit closing tags
- camelCase props → kebab-case attributes
- `{children}` → `<slot name="media" slot="media"></slot>`
- Boolean props → Boolean attributes

**Examples:**

```typescript
// React JSX:
<PlayButton>
  <PlayIcon />
  <PauseIcon />
</PlayButton>
<CurrentTimeDisplay showRemaining />

// HTML Template:
<media-play-button>
  <media-play-icon></media-play-icon>
  <media-pause-icon></media-pause-icon>
</media-play-button>
<media-current-time-display show-remaining></media-current-time-display>
```

### 5. Component Naming Conventions

**React Component Names → HTML Element Names:**

- PascalCase → kebab-case with `media-` prefix
- `PlayButton` → `media-play-button`
- `CurrentTimeDisplay` → `media-current-time-display`
- `FullscreenButton` → `media-fullscreen-button`
- `PlayIcon` → `media-play-icon`

### 6. State Hook Patterns

Both React and HTML use similar state hook patterns, but with different implementations:

**React State Hook:**

```typescript
export const usePlayButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(
    playButtonStateDefinition.stateTransform,
    shallowEqual,
  );
  const methods = React.useMemo(
    () => playButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );
  return { paused: mediaState.paused, ...methods } as const;
};
```

**HTML State Hook:**

```typescript
export const usePlayButtonState: StateHook<{ paused: boolean }> = {
  keys: playButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...playButtonStateDefinition.stateTransform(rawState),
    ...playButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};
```

### 7. Props Hook Patterns

**React Props Hook:**

```typescript
export const usePlayButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof usePlayButtonState>,
) => {
  const baseProps: Record<string, any> = {
    role: 'button',
    ['aria-label']: state.paused ? 'play' : 'pause',
    ['data-tooltip']: state.paused ? 'Play' : 'Pause',
    ...props,
  };
  if (state.paused) {
    baseProps['data-paused'] = '';
  }
  return baseProps;
};
```

**HTML Props Hook:**

```typescript
export const usePlayButtonProps: PropsHook<{ paused: boolean }> = (
  state,
  _element,
) => {
  const baseProps: Record<string, any> = {
    ['data-paused']: state.paused,
    role: 'button',
    ['aria-label']: state.paused ? 'play' : 'pause',
    ['data-tooltip']: state.paused ? 'Play' : 'Pause',
  };
  return baseProps;
};
```

### 8. Render Function Patterns

**React Render Function:**

```typescript
export const renderPlayButton = (
  props: PlayButtonProps,
  state: PlayButtonState,
) => {
  return (
    <button
      {...props}
      onClick={() => {
        if (props.disabled) return;
        if (state.paused) {
          state.requestPlay();
        } else {
          state.requestPause();
        }
      }}
    >
      {props.children}
    </button>
  );
};
```

**HTML Base Class:**

```typescript
export class PlayButtonBase extends MediaChromeButton {
  _state:
    | { paused: boolean; requestPlay: () => void; requestPause: () => void }
    | undefined;

  handleEvent(event: Event) {
    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      if (state.paused) {
        state.requestPlay();
      } else {
        state.requestPause();
      }
    }
  }

  _update(props: any, state: any, _mediaStore?: any) {
    this._state = state;
    this.toggleAttribute('data-paused', props['data-paused']);
    this.setAttribute('role', props['role']);
    this.setAttribute('aria-label', props['aria-label']);
    this.setAttribute('data-tooltip', props['data-tooltip']);
  }
}
```

## File Structure Patterns

### React Skin Structure

```
packages/react/react/src/skins/
├── MediaSkinTestReference.tsx    # React skin component
```

### HTML Skin Structure

```
packages/html/html/src/skins/
├── media-skin-test-reference.ts  # HTML skin implementation
```

## Key Transformations Summary

| React Pattern                           | HTML Pattern                                           | Notes                  |
| --------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `React.FC<{children: React.ReactNode}>` | `function getTemplateHTML()`                           | Component definition   |
| `{children}`                            | `<slot name="media" slot="media"></slot>`              | Children rendering     |
| `<ComponentName>`                       | `<media-component-name>`                               | Element names          |
| `camelCaseAttr`                         | `kebab-case-attr`                                      | Attributes             |
| `showRemaining`                         | `show-remaining`                                       | Boolean attributes     |
| Self-closing `<Icon />`                 | `<media-icon></media-icon>`                            | Element closure        |
| `toConnectedComponent()`                | `toConnectedHTMLComponent() + customElements.define()` | Component registration |
| React hooks with `useMediaStore()`      | State hooks with `keys` and `transform`                | State management       |
| JSX render function                     | Base class with `handleEvent` and `_update`            | Event handling         |

## Quality Checklist

After transpilation, verify:

- [ ] All import statements converted to HTML equivalents
- [ ] Component names follow `media-*` kebab-case convention
- [ ] JSX converted to HTML template literal with `/* html */` comment
- [ ] Props converted from camelCase to kebab-case
- [ ] `{children}` replaced with appropriate slot structure
- [ ] Self-closing tags converted to explicit closing tags
- [ ] Custom element definition and registration added
- [ ] State and props hooks maintain equivalent functionality
- [ ] Event handling moved to base class methods
- [ ] File placed in correct HTML package location
- [ ] Maintains architectural dependency constraints

## Common Gotchas

1. **Icon Imports**: React imports specific icons, HTML imports the entire icon package
2. **Children Handling**: HTML uses slots with specific naming patterns
3. **Boolean Attributes**: React uses boolean props, HTML uses presence/absence of attributes
4. **Event Handling**: React uses inline handlers, HTML uses class methods
5. **State Management**: Both platforms use similar patterns but different implementations
6. **Component Factory**: Different factory functions but similar patterns
7. **File Extensions**: `.tsx` → `.ts`
8. **Import Paths**: May need adjustment for HTML package structure

## Simple full example - Skin Transpilation

### React (Before)

```tsx:filename=MediaSkinTestReference.tsx
import * as React from 'react';
import PlayButton from '../components/PlayButton';
import MuteButton from '../components/MuteButton';
import FullscreenButton from '../components/FullscreenButton';
import DurationDisplay from '../components/DurationDisplay';
import CurrentTimeDisplay from '../components/CurrentTimeDisplay';
import { MediaContainer } from '../components/MediaContainer';
import {
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from '@vjs-10/react-icons';

export const MediaSkinTestReference: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <MediaContainer>
      {children}
      <div>
        <div></div>
        <div>
          <PlayButton>
            <PlayIcon />
            <PauseIcon />
          </PlayButton>
          <CurrentTimeDisplay showRemaining />
          <DurationDisplay />
          <MuteButton>
            <VolumeHighIcon />
            <VolumeLowIcon />
            <VolumeOffIcon />
          </MuteButton>
          <FullscreenButton>
            <FullscreenEnterIcon />
            <FullscreenExitIcon />
          </FullscreenButton>
        </div>
      </div>
    </MediaContainer>
  );
};

export default MediaSkinTestReference;
```

### HTML (After)

```ts:filename=media-skin-test-reference.ts
import { MediaSkin } from '../media-skin';

import '../media-container';
import '../components/media-play-button';
import '../components/media-mute-button';
import '../components/media-volume-range';
import '../components/media-time-range';
import '../components/media-fullscreen-button';
import '../components/media-duration-display';
import '../components/media-current-time-display';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <media-container>
      <slot name="media" slot="media"></slot>
      <div>
        <div></div>
        <div>
          <media-play-button>
            <media-play-icon></media-play-icon>
            <media-pause-icon></media-pause-icon>
          </media-play-button>
          <media-current-time-display show-remaining></media-current-time-display>
          <media-duration-display></media-duration-display>
          <media-mute-button>
            <media-volume-high-icon></media-volume-high-icon>
            <media-volume-low-icon></media-volume-low-icon>
            <media-volume-off-icon></media-volume-off-icon>
          </media-mute-button>
          <media-fullscreen-button>
            <media-fullscreen-enter-icon></media-fullscreen-enter-icon>
            <media-fullscreen-exit-icon></media-fullscreen-exit-icon>
          </media-fullscreen-button>
        </div>
      </div>
    </media-container>
  `;
}

export class MediaSkinTestReference extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export default MediaSkinTestReference;

customElements.define('media-skin-test-reference', MediaSkinTestReference);
```
