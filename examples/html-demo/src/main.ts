import { defineVjsPlayer } from '@vjs-10/html';
import '@vjs-10/html/skins/compiled/inline/media-skin-default';
import '@vjs-10/html/skins/compiled/inline/media-skin-toasted';

defineVjsPlayer();

// Skin configuration
const skins = [
  { key: 'original', name: 'Original (Hand-written)', tag: 'media-skin-default' },
  { key: 'default-inline', name: 'Default (Compiled Inline)', tag: 'media-skin-default-compiled' },
  { key: 'toasted-inline', name: 'Toasted (Compiled Inline)', tag: 'media-skin-toasted-compiled' },
] as const;

type SkinKey = (typeof skins)[number]['key'];

// Media source configuration
const mediaSources = [
  { key: '1', name: 'Mux 1', value: 'https://stream.mux.com/a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M.m3u8' },
  { key: '2', name: 'Mux 2', value: 'https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8' },
  { key: '3', name: 'Mux 3', value: 'https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg/high.mp4' },
  { key: '4', name: 'Mux 4', value: 'https://stream.mux.com/lyrKpPcGfqyzeI00jZAfW6MvP6GNPrkML.m3u8' },
] as const;

type MediaSourceKey = (typeof mediaSources)[number]['key'];

// URL parameter helpers
function getParam<T>(key: string, defaultValue: T): T {
  const params = new URLSearchParams(window.location.search);
  return (params.get(key) as T) || defaultValue;
}

function setParam(key: string, value: string): void {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search}` : '');
  window.history.replaceState(null, '', url);
}

// Default values
const DEFAULT_SKIN: SkinKey = 'default-inline';
const DEFAULT_MEDIA_SOURCE: MediaSourceKey = '1';

// State
let currentSkin: SkinKey = getParam('skin', DEFAULT_SKIN);
let currentSource: MediaSourceKey = getParam('source', DEFAULT_MEDIA_SOURCE);

// Get skin tag name
function getSkinTag(skinKey: SkinKey): string {
  const skin = skins.find(s => s.key === skinKey);
  return skin ? skin.tag : skins[0]!.tag;
}

// Get media source URL
function getMediaSource(sourceKey: MediaSourceKey): string {
  const source = mediaSources.find(s => s.key === sourceKey);
  return source ? source.value : mediaSources[0]!.value;
}

// Render player
function renderPlayer(): void {
  const container = document.getElementById('player-container');
  if (!container) return;

  const skinTag = getSkinTag(currentSkin);
  const sourceUrl = getMediaSource(currentSource);

  container.innerHTML = `
    <media-provider>
      <${skinTag} style="display: block; aspect-ratio: 16/9; width: 100%; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <video slot="media" src="${sourceUrl}" muted></video>
      </${skinTag}>
    </media-provider>
  `;
}

// Event handlers
function onSkinChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  currentSkin = select.value as SkinKey;
  setParam('skin', currentSkin);
  renderPlayer();
}

function onSourceChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  currentSource = select.value as MediaSourceKey;
  setParam('source', currentSource);
  renderPlayer();
}

// Initialize
const skinSelect = document.getElementById('skin-select') as HTMLSelectElement;
const sourceSelect = document.getElementById('source-select') as HTMLSelectElement;

if (skinSelect && sourceSelect) {
  // Set initial values
  skinSelect.value = currentSkin;
  sourceSelect.value = currentSource;

  // Attach event listeners
  skinSelect.addEventListener('change', onSkinChange);
  sourceSelect.addEventListener('change', onSourceChange);

  // Initial render
  renderPlayer();
}
