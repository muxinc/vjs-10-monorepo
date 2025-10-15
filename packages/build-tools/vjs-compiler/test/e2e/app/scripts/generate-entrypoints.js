#!/usr/bin/env node
/**
 * Generate React and Web Component entrypoint files for all test skins
 *
 * This script automatically creates .html and .tsx files for each skin
 * in src/skins/, eliminating manual maintenance overhead.
 *
 * Usage: node scripts/generate-entrypoints.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKINS_DIR = path.resolve(__dirname, '../src/skins');
const REACT_DIR = path.resolve(__dirname, '../src/react');
const WC_DIR = path.resolve(__dirname, '../src/wc');

/**
 * Convert skin directory name to component name
 * Examples:
 *   jsx-single-style-key → MediaSkinJSXSingleStyleKey
 *   hover-pseudo-class → MediaSkinHoverPseudoClass
 *   production → MediaSkinProduction
 */
function skinDirToComponentName(dirName) {
  // Special case: production skin
  if (dirName === 'production') {
    return 'MediaSkinProduction';
  }

  // Split on hyphens and capitalize each word
  const words = dirName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );

  return `MediaSkin${words.join('')}`;
}

/**
 * Convert directory name to title case
 * Examples:
 *   jsx-single-style-key → JSX Single Style Key
 *   hover-pseudo-class → Hover Pseudo Class
 */
function skinDirToTitle(dirName) {
  return dirName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Read README.md from skin directory to extract description
 */
function getSkinDescription(skinDir) {
  const readmePath = path.join(SKINS_DIR, skinDir, 'README.md');

  if (!fs.existsSync(readmePath)) {
    return 'No description available';
  }

  const readme = fs.readFileSync(readmePath, 'utf-8');

  // Extract "Purpose:" line
  const purposeMatch = readme.match(/\*\*Purpose:\*\*\s+(.+)/);
  if (purposeMatch) {
    return purposeMatch[1];
  }

  // Fallback: extract first paragraph after title
  const lines = readme.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    return lines[1];
  }

  return 'Test skin';
}

/**
 * Generate React HTML entrypoint
 */
function generateReactHTML(skinDir, componentName, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} (React)</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }
    #root {
      max-width: 800px;
      margin: 0 auto;
    }
    video {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./${skinDir}.tsx"></script>
</body>
</html>
`;
}

/**
 * Generate React TSX entrypoint
 */
function generateReactTSX(skinDir, componentName, title, description) {
  return `/**
 * React test page for ${title}
 * ${description}
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaProvider, SimpleVideo } from '@vjs-10/react';
import ${componentName} from '../skins/${skinDir}/${componentName}';
import '../globals.css';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>${title} (React)</h1>
      <p>${description}</p>

      <MediaProvider>
        <${componentName}>
          <SimpleVideo src="/blue-30s-110hz.mp4" />
        </${componentName}>
      </MediaProvider>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <p><strong>Skin:</strong> <code>${skinDir}</code></p>
        <p><strong>Component:</strong> <code>${componentName}</code></p>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
`;
}

/**
 * Generate Web Component HTML entrypoint
 */
function generateWCHTML(skinDir, componentName, title, description) {
  const tagName = componentName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} (Web Component)</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .info {
      margin-top: 20px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    video {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title} (Web Component)</h1>
    <p>${description}</p>

    <media-provider>
      <${tagName}>
        <video slot="media" src="/blue-30s-110hz.mp4"></video>
      </${tagName}>
    </media-provider>

    <div class="info">
      <p><strong>Skin:</strong> <code>${skinDir}</code></p>
      <p><strong>Component:</strong> <code>${tagName}</code></p>
      <p><strong>Compiled from:</strong> <code>../compiled/${skinDir}.js</code></p>
    </div>
  </div>

  <script type="module">
    // Import compiled web component skin
    import '../compiled/${skinDir}.js';

    // Import HTML package for MediaProvider and other base components
    import '@vjs-10/html';
  </script>
</body>
</html>
`;
}

/**
 * Main generation function
 */
function generateEntrypoints() {
  console.log('Generating test entrypoints...\n');

  // Get all skin directories
  const skinDirs = fs.readdirSync(SKINS_DIR)
    .filter(name => {
      const fullPath = path.join(SKINS_DIR, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();

  console.log(`Found ${skinDirs.length} skins:\n`);

  // Ensure output directories exist
  if (!fs.existsSync(REACT_DIR)) {
    fs.mkdirSync(REACT_DIR, { recursive: true });
  }
  if (!fs.existsSync(WC_DIR)) {
    fs.mkdirSync(WC_DIR, { recursive: true });
  }

  // Generate entrypoints for each skin
  for (const skinDir of skinDirs) {
    const componentName = skinDirToComponentName(skinDir);
    const title = skinDirToTitle(skinDir);
    const description = getSkinDescription(skinDir);

    console.log(`  ${skinDir}/`);
    console.log(`    → ${componentName}`);
    console.log(`    → ${description}`);

    // Generate React entrypoints
    const reactHTML = generateReactHTML(skinDir, componentName, title);
    const reactTSX = generateReactTSX(skinDir, componentName, title, description);

    fs.writeFileSync(path.join(REACT_DIR, `${skinDir}.html`), reactHTML);
    fs.writeFileSync(path.join(REACT_DIR, `${skinDir}.tsx`), reactTSX);

    // Generate WC entrypoint
    const wcHTML = generateWCHTML(skinDir, componentName, title, description);
    fs.writeFileSync(path.join(WC_DIR, `${skinDir}.html`), wcHTML);

    console.log(`    ✓ react/${skinDir}.html`);
    console.log(`    ✓ react/${skinDir}.tsx`);
    console.log(`    ✓ wc/${skinDir}.html\n`);
  }

  console.log(`\nGenerated ${skinDirs.length * 3} entrypoint files!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run: pnpm dev`);
  console.log(`  2. Open: http://localhost:5175/src/react/[skin-name].html`);
  console.log(`  3. Open: http://localhost:5175/src/wc/[skin-name].html`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEntrypoints();
}
