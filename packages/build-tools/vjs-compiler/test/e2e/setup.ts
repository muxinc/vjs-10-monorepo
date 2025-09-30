import type { Browser, Page } from 'playwright';
import type { ViteDevServer } from 'vite';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createServer } from 'vite';

/**
 * End-to-end test setup
 *
 * Validates:
 * 1. Browser loadability (no console errors)
 * 2. Visual equivalence (Playwright screenshots)
 * 3. CSS semantic equivalence (computed styles)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface E2ETestContext {
  browser: Browser;
  reactPage: Page;
  webComponentPage: Page;
  viteServer: ViteDevServer;
  serverUrl: string;
}

/**
 * Start Vite dev server, browser, and create pages
 */
export async function setupE2ETest(): Promise<E2ETestContext> {
  // Start Vite dev server for test app
  const testAppDir = join(__dirname, 'fixtures/test-app');
  const viteServer = await createServer({
    root: testAppDir,
    server: {
      port: 5174,
      strictPort: false,
    },
    logLevel: 'error', // Reduce noise in test output
  });

  await viteServer.listen();

  const serverUrl = `http://localhost:${viteServer.config.server.port}`;

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  const reactPage = await browser.newPage();
  const webComponentPage = await browser.newPage();

  // Capture console errors
  reactPage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[React Console Error]:', msg.text());
    }
  });

  webComponentPage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Web Component Console Error]:', msg.text());
    }
  });

  return { browser, reactPage, webComponentPage, viteServer, serverUrl };
}

/**
 * Cleanup browser, pages, and Vite server
 */
export async function teardownE2ETest(context: E2ETestContext): Promise<void> {
  await context.reactPage.close();
  await context.webComponentPage.close();
  await context.browser.close();
  await context.viteServer.close();
}

/**
 * Load test page and inject compiled skin code
 */
export async function loadTestPageWithSkin(
  page: Page,
  serverUrl: string,
  compiledCode: string,
  skinTagName: string
): Promise<void> {
  // Navigate to the test app
  await page.goto(serverUrl);

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  // Create stubs for component dependencies that the compiled skin expects
  await page.evaluate(() => {
    // Stub MediaContainer
    if (!customElements.get('media-container')) {
      class MediaContainer extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
          this.shadowRoot.innerHTML = '<slot></slot>';
        }
      }
      customElements.define('media-container', MediaContainer);
    }

    // Stub MediaPlayButton
    if (!customElements.get('media-play-button')) {
      class MediaPlayButton extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
          this.shadowRoot.innerHTML = '<button>Play</button>';
        }
      }
      customElements.define('media-play-button', MediaPlayButton);
    }

    // Stub base MediaSkin class
    if (!(window as Record<string, unknown>).MediaSkin) {
      class MediaSkin extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
          const html = (this.constructor as { getTemplateHTML: () => string }).getTemplateHTML();
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = html;
          }
        }
      }
      (window as Record<string, unknown>).MediaSkin = MediaSkin;
    }
  });

  // Inject the compiled skin code
  // Remove import statements since dependencies are stubbed
  const cleanedCode = compiledCode.replace(/^import .+?;?\n/gm, '');

  await page.evaluate(
    ({ code, tagName }) => {
      // Create script element to run the compiled code
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = code;
      document.head.appendChild(script);

      // Wait for custom element to be defined, then render
      customElements.whenDefined(tagName).then(() => {
        const container = document.getElementById('test-container');
        if (container) {
          container.innerHTML = `
            <${tagName} style="display: block; width: 100%; max-width: 640px;">
              <video slot="media" src="test.mp4" style="width: 100%; aspect-ratio: 16/9; background: #000;"></video>
            </${tagName}>
          `;
        }
      });
    },
    { code: cleanedCode, tagName: skinTagName }
  );

  // Wait for the custom element to be defined and rendered
  await page.waitForFunction(
    (tagName) => {
      const el = document.querySelector(tagName);
      return el && (el as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot;
    },
    skinTagName,
    { timeout: 5000 }
  );
}

/**
 * Validate no console errors in page
 */
export async function validateNoConsoleErrors(page: Page, context: string): Promise<void> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  // Wait a bit for any errors to surface
  await page.waitForTimeout(1000);

  if (errors.length > 0) {
    throw new Error(`${context} has console errors:\n${errors.join('\n')}`);
  }
}

/**
 * Compare computed styles between two elements
 */
export async function compareComputedStyles(
  reactPage: Page,
  webComponentPage: Page,
  reactSelector: string,
  webComponentSelector: string,
  properties: string[]
): Promise<{ matches: boolean; differences: Record<string, { react: string; webComponent: string }> }> {
  const reactStyles = await reactPage.evaluate(
    ({ selector, props }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      const result: Record<string, string> = {};
      for (const prop of props) {
        result[prop] = computed.getPropertyValue(prop);
      }
      return result;
    },
    { selector: reactSelector, props: properties }
  );

  const webComponentStyles = await webComponentPage.evaluate(
    ({ selector, props }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      const result: Record<string, string> = {};
      for (const prop of props) {
        result[prop] = computed.getPropertyValue(prop);
      }
      return result;
    },
    { selector: webComponentSelector, props: properties }
  );

  if (!reactStyles || !webComponentStyles) {
    throw new Error('Could not find elements to compare styles');
  }

  const differences: Record<string, { react: string; webComponent: string }> = {};
  let matches = true;

  for (const prop of properties) {
    if (reactStyles[prop] !== webComponentStyles[prop]) {
      matches = false;
      differences[prop] = {
        react: reactStyles[prop],
        webComponent: webComponentStyles[prop],
      };
    }
  }

  return { matches, differences };
}
