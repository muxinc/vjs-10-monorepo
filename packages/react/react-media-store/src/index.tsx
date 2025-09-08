// Re-export everything from MediaProvider - this is the primary implementation
export {
  MediaProvider,
  MediaContext,
  useMediaStore,
  useMediaDispatch,
  useMediaRef,
  useMediaSelector,
  shallowEqual,
} from './MediaProvider.js';

// @ts-ignore - Placeholder types until media-store exports are updated
export type MediaStore = any;
export type MediaState = any;
export type MediaStateOwner = any;
