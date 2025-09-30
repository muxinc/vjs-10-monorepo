/**
 * E2E test app entry point
 *
 * This file is dynamically populated by tests to load compiled skins
 */

// Will be populated by test setup
declare global {
  interface Window {
    TEST_SKIN_CODE?: string;
    TEST_SKIN_TAG?: string;
  }
}

export function renderTestSkin(code: string, tagName: string): void {
  const container = document.getElementById('test-container');
  if (!container) {
    throw new Error('Test container not found');
  }

  // Inject the compiled skin code
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = code;
  document.head.appendChild(script);

  // Wait for custom element to be defined, then render
  customElements.whenDefined(tagName).then(() => {
    container.innerHTML = `
      <${tagName} style="display: block; width: 100%; max-width: 640px;">
        <video slot="media" src="test.mp4" style="width: 100%; aspect-ratio: 16/9; background: #000;"></video>
      </${tagName}>
    `;
  });
}

// Check if test parameters are provided
if (window.TEST_SKIN_CODE && window.TEST_SKIN_TAG) {
  renderTestSkin(window.TEST_SKIN_CODE, window.TEST_SKIN_TAG);
}
