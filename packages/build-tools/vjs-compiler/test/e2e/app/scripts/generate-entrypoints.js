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
 * Generate index HTML with links to all skins
 */
function generateIndexHTML(skinDirs) {
  const skinLinks = skinDirs.map(skinDir => {
    const title = skinDirToTitle(skinDir);
    const description = getSkinDescription(skinDir);

    return `
      <tr>
        <td>
          <strong>${title}</strong><br>
          <small style="color: #666;">${description}</small>
        </td>
        <td style="text-align: center;">
          <a href="./react/${skinDir}.html" style="color: #61dafb; text-decoration: none; font-weight: 500;">
            React ⚛️
          </a>
        </td>
        <td style="text-align: center;">
          <a href="./wc/${skinDir}.html" style="color: #1976d2; text-decoration: none; font-weight: 500;">
            Web Component 🧩
          </a>
        </td>
      </tr>`.trim();
  }).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VJS Compiler Test Skins</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.95;
      font-weight: 400;
    }

    .stats {
      display: flex;
      gap: 30px;
      justify-content: center;
      margin-top: 20px;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      display: block;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    main {
      padding: 40px;
    }

    .intro {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
    }

    .intro p {
      color: #333;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8f9fa;
      border-bottom: 2px solid #e9ecef;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }

    tbody tr {
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.2s ease;
    }

    tbody tr:hover {
      background-color: #f8f9fa;
    }

    td {
      padding: 20px 15px;
    }

    td:first-child {
      width: 60%;
    }

    td:not(:first-child) {
      width: 20%;
    }

    a {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }

    a:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #e83e8c;
    }

    footer {
      text-align: center;
      padding: 30px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    footer p {
      margin: 5px 0;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .stats {
        gap: 20px;
      }

      .stat-number {
        font-size: 1.5rem;
      }

      main {
        padding: 20px;
      }

      td:first-child {
        width: 100%;
        display: block;
      }

      td:not(:first-child) {
        display: inline-block;
        width: 50%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>VJS Compiler Test Skins</h1>
      <p class="subtitle">End-to-End validation of React → Web Component transformation</p>

      <div class="stats">
        <div class="stat">
          <span class="stat-number">${skinDirs.length}</span>
          <span class="stat-label">Test Skins</span>
        </div>
        <div class="stat">
          <span class="stat-number">${skinDirs.length * 2}</span>
          <span class="stat-label">Test Pages</span>
        </div>
        <div class="stat">
          <span class="stat-number">2</span>
          <span class="stat-label">Frameworks</span>
        </div>
      </div>
    </header>

    <main>
      <div class="intro">
        <p><strong>What is this?</strong> Each test skin validates a specific feature of the VJS compiler's React + Tailwind → Web Component + Vanilla CSS transformation.</p>
        <p><strong>How to test:</strong> Click on React or Web Component links below to view each skin in both formats. They should look and behave identically.</p>
        <p><strong>Source code:</strong> All skins are defined in <code>src/skins/</code> with React + Tailwind, then compiled to Web Components + Vanilla CSS in <code>src/compiled/</code></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Test Skin</th>
            <th style="text-align: center;">React Version</th>
            <th style="text-align: center;">Web Component Version</th>
          </tr>
        </thead>
        <tbody>
      ${skinLinks}
        </tbody>
      </table>
    </main>

    <footer>
      <p><strong>Auto-generated</strong> from <code>src/skins/</code> directory</p>
      <p>Run <code>pnpm generate-entrypoints</code> to regenerate</p>
    </footer>
  </div>
</body>
</html>
`;
}

/**
 * Discover the actual TSX filename in a skin directory
 * Returns the component name (e.g., "MediaSkinHover") or null if not found
 */
function discoverComponentName(skinDir) {
  const skinDirPath = path.join(SKINS_DIR, skinDir);
  const tsxFiles = fs.readdirSync(skinDirPath).filter(f => f.endsWith('.tsx'));

  if (tsxFiles.length === 0) {
    return null;
  }

  // Component name is the TSX filename without extension
  return tsxFiles[0].replace('.tsx', '');
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
    const componentName = discoverComponentName(skinDir);
    if (!componentName) {
      console.error(`  ❌ ${skinDir}: No .tsx file found`);
      continue;
    }

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

  // Generate index page
  const indexHTML = generateIndexHTML(skinDirs);
  const indexPath = path.resolve(__dirname, '../src/index.html');
  fs.writeFileSync(indexPath, indexHTML);
  console.log(`✓ Generated index page: src/index.html\n`);

  console.log(`Generated ${skinDirs.length * 3 + 1} files total!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run: pnpm dev`);
  console.log(`  2. Open: http://localhost:5175/src/index.html`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEntrypoints();
}
