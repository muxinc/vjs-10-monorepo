#!/usr/bin/env node

/**
 * Extract Computed Styles from React Demo
 *
 * This script uses Playwright to:
 * 1. Launch the React demo app
 * 2. Find elements with Tailwind classes
 * 3. Extract computed styles using getComputedStyle
 * 4. Capture styles in different states (hover, focus, active)
 * 5. Test container query breakpoints
 * 6. Extract pseudo-element styles (::before, ::after)
 *
 * Output: JSON fixture files for test validation
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Demo app URL (assumes it's running)
const DEMO_URL = 'http://localhost:5173';

// CSS properties we care about for validation
const RELEVANT_PROPERTIES = [
  // Positioning
  'position', 'top', 'right', 'bottom', 'left', 'inset', 'inset-inline', 'inset-block',
  'z-index',
  // Box model
  'display', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-inline', 'padding-block',
  // Flexbox
  'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
  'gap', 'row-gap', 'column-gap',
  // Colors
  'color', 'background-color', 'border-color',
  // Borders
  'border', 'border-width', 'border-style', 'border-radius',
  // Effects
  'box-shadow', 'text-shadow', 'opacity',
  // Filters
  'filter', 'backdrop-filter',
  // Transforms
  'transform', 'transform-origin',
  // Transitions
  'transition', 'transition-property', 'transition-duration', 'transition-timing-function',
  // Typography
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  // Container queries
  'container-type', 'container-name',
];

/**
 * Extract all Tailwind classes from the demo app HTML
 */
async function extractTailwindClasses(page) {
  return await page.evaluate(() => {
    const classMap = new Map();

    // Find all elements with class attributes
    const elements = document.querySelectorAll('[class]');

    elements.forEach((element, index) => {
      // Handle both HTML elements (className is string) and SVG elements (className is SVGAnimatedString)
      const classNameValue = typeof element.className === 'string'
        ? element.className
        : element.className?.baseVal || '';

      const classes = classNameValue.split(/\s+/).filter(c => c.trim());
      const tagName = element.tagName.toLowerCase();
      const elementId = element.id || `element-${index}`;

      if (classes.length > 0) {
        classMap.set(elementId, {
          tagName,
          classes,
          // Store selector for later lookup
          selector: element.id ? `#${element.id}` : null,
          dataAttributes: Array.from(element.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => ({ name: attr.name, value: attr.value })),
        });
      }
    });

    return Object.fromEntries(classMap);
  });
}

/**
 * Get computed styles for an element
 */
async function getComputedStyles(page, selector, pseudoElement = null) {
  return await page.evaluate(({ sel, pseudo, props }) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const computed = window.getComputedStyle(element, pseudo);
    const styles = {};

    props.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        styles[prop] = value;
      }
    });

    return styles;
  }, { sel: selector, pseudo: pseudoElement, props: RELEVANT_PROPERTIES });
}

/**
 * Get styles in different interaction states
 */
async function captureStatePermutations(page, selector) {
  const element = await page.$(selector);
  if (!element) return null;

  const states = {};

  // Default state
  states.default = await getComputedStyles(page, selector);

  // Hover state
  await element.hover();
  await page.waitForTimeout(100); // Let hover animations settle
  states.hover = await getComputedStyles(page, selector);

  // Focus state
  await element.focus();
  await page.waitForTimeout(100);
  states.focus = await getComputedStyles(page, selector);

  // Active state (mousedown)
  await element.hover(); // Ensure hover first
  await page.mouse.down();
  await page.waitForTimeout(100);
  states.active = await getComputedStyles(page, selector);
  await page.mouse.up();

  // Blur to reset
  await page.evaluate(() => document.activeElement?.blur());

  // Pseudo-elements
  states.before = await getComputedStyles(page, selector, '::before');
  states.after = await getComputedStyles(page, selector, '::after');

  return states;
}

/**
 * Test container query breakpoints
 */
async function captureContainerQueries(page, selector) {
  const element = await page.$(selector);
  if (!element) return null;

  // Get the container element
  const containerInfo = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;

    // Find parent with container-type
    let container = el;
    while (container && container !== document.body) {
      const computed = window.getComputedStyle(container);
      const containerType = computed.getPropertyValue('container-type');
      if (containerType && containerType !== 'normal') {
        return {
          selector: container.id ? `#${container.id}` : null,
          containerName: computed.getPropertyValue('container-name'),
          initialWidth: container.offsetWidth,
          initialHeight: container.offsetHeight,
        };
      }
      container = container.parentElement;
    }
    return null;
  }, selector);

  if (!containerInfo || !containerInfo.selector) {
    return null;
  }

  // Test at different container widths
  const breakpoints = [320, 480, 640, 768, 1024, 1280, 1536];
  const breakpointStyles = {};

  for (const width of breakpoints) {
    // Resize the container
    await page.evaluate(({ sel, w }) => {
      const container = document.querySelector(sel);
      if (container) {
        container.style.width = `${w}px`;
      }
    }, { sel: containerInfo.selector, w: width });

    await page.waitForTimeout(100); // Let layout settle

    breakpointStyles[`${width}px`] = await getComputedStyles(page, selector);
  }

  // Restore original width
  await page.evaluate(({ sel }) => {
    const container = document.querySelector(sel);
    if (container) {
      container.style.width = '';
    }
  }, { sel: containerInfo.selector });

  return {
    containerInfo,
    breakpoints: breakpointStyles,
  };
}

/**
 * Analyze compiled CSS to find which classes are actually used
 */
async function analyzeCompiledCSS() {
  const cssPath = join(__dirname, '../../../../examples/react-demo/dist/assets');
  const fs = await import('fs/promises');

  try {
    const files = await fs.readdir(cssPath);
    const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

    if (!cssFile) {
      console.warn('Could not find compiled CSS file in', cssPath);
      return null;
    }

    const css = readFileSync(join(cssPath, cssFile), 'utf-8');

    // Extract class names from CSS
    const classPattern = /\.([\w\\:\[\]\/\-\(\)\"\'=]+)\s*{/g;
    const classes = new Set();
    let match;

    while ((match = classPattern.exec(css)) !== null) {
      // Unescape Tailwind's escaped characters
      const className = match[1]
        .replace(/\\\//g, '/')
        .replace(/\\:/g, ':')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");

      classes.add(className);
    }

    return {
      file: cssFile,
      totalClasses: classes.size,
      classes: Array.from(classes).sort(),
    };
  } catch (error) {
    console.warn('Error reading compiled CSS:', error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Playwright style extraction...\n');

  // Analyze compiled CSS first
  console.log('📋 Analyzing compiled CSS...');
  const cssAnalysis = await analyzeCompiledCSS();
  if (cssAnalysis) {
    console.log(`   Found ${cssAnalysis.totalClasses} classes in ${cssAnalysis.file}`);
  }

  // Launch browser
  console.log('\n🌐 Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Navigate to demo
    console.log(`\n📱 Loading demo app: ${DEMO_URL}`);
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Let everything settle

    // Extract Tailwind classes from HTML
    console.log('\n🔍 Extracting Tailwind classes from DOM...');
    const elementClasses = await extractTailwindClasses(page);
    console.log(`   Found ${Object.keys(elementClasses).length} elements with classes`);

    // Focus on elements with specific Tailwind classes we're testing
    // These correspond to our RED tests
    const targetClassTests = [
      { name: 'inset-x-3', selector: '[class*="inset-x-3"]' },
      { name: 'bottom-3', selector: '[class*="bottom-3"]' },
      { name: 'p-1', selector: '[class*="p-1"]' },
      { name: 'gap-0.5', selector: '[class*="gap-0"]' },
      { name: 'gap-3', selector: '[class*="gap-3"]' },
      { name: 'px-1.5', selector: '[class*="px-1"]' },
      { name: 'size-2.5', selector: '[class*="size-2"]' },
      { name: 'size-3', selector: '[class*="size-3"]' },
      { name: 'text-shadow-2xs', selector: '[class*="text-shadow-2xs"]' },
      { name: 'bg-white/10', selector: '[class*="bg-white/10"]' },
      { name: 'backdrop-blur-3xl', selector: '[class*="backdrop-blur-3xl"]' },
      { name: 'backdrop-saturate-150', selector: '[class*="backdrop-saturate-150"]' },
      { name: 'backdrop-brightness-90', selector: '[class*="backdrop-brightness-90"]' },
      { name: 'ring-white/10', selector: '[class*="ring-white/10"]' },
    ];

    const results = {
      metadata: {
        url: DEMO_URL,
        timestamp: new Date().toISOString(),
        viewport: { width: 1280, height: 720 },
      },
      cssAnalysis,
      elementClasses,
      computedStyles: {},
    };

    // Extract styles for each target class
    console.log('\n🎨 Extracting computed styles for Tailwind classes...');
    for (const { name, selector } of targetClassTests) {
      console.log(`   Processing: ${name} (${selector})`);

      const element = await page.$(selector);
      if (!element) {
        console.log(`   ⚠️  Not found: ${name}`);
        continue;
      }

      // Get state permutations
      const states = await captureStatePermutations(page, selector);

      // Get container query variations
      const containerQueries = await captureContainerQueries(page, selector);

      results.computedStyles[name] = {
        selector,
        states,
        containerQueries,
      };

      console.log(`   ✅ Captured states for ${name}`);
    }

    // Save results
    const outputPath = join(__dirname, '../test/fixtures/computed-styles-reference.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n✨ Done! Results saved to: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, extractTailwindClasses, getComputedStyles, captureStatePermutations };
