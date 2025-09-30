#!/usr/bin/env tsx
/**
 * Test Tailwind v4 CSS generation directly
 *
 * This script tests whether Tailwind v4 can generate CSS for
 * pseudo-class variants like :hover, :focus-visible, etc.
 */
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

async function testTailwind() {
  console.log('Testing Tailwind v4 CSS Generation\n');

  // Test HTML with hover variant
  const html = `
<!DOCTYPE html>
<html>
<body>
  <button class="bg-blue-500 hover:bg-blue-600 hover:scale-105">Hover Me</button>
  <button class="focus-visible:ring-2">Focus Me</button>
  <div class="dark:bg-gray-900">Dark Mode</div>
</body>
</html>
  `;

  // Tailwind config
  const config = {
    content: [{ raw: html, extension: 'html' }],
    darkMode: 'media',
    corePlugins: {
      preflight: false,
    },
  };

  // Input CSS
  const inputCSS = `
@theme {
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-gray-900: #111827;
}

@tailwind utilities;
  `;

  try {
    const tailwindPlugin = (tailwindcss as any)({ config });
    const result = await postcss([tailwindPlugin]).process(inputCSS, {
      from: undefined,
    });

    console.log('Generated CSS:');
    console.log('='.repeat(80));
    console.log(result.css);
    console.log('='.repeat(80));

    // Check for expected patterns
    const checks = [
      { pattern: /\.bg-blue-500/, name: 'Base utility (bg-blue-500)' },
      { pattern: /:hover/, name: 'Hover pseudo-class' },
      { pattern: /\.hover:bg-blue-600/, name: 'Hover variant class' },
      { pattern: /focus-visible/, name: 'Focus-visible' },
      { pattern: /@media.*dark/, name: 'Dark mode media query' },
    ];

    console.log('\nValidation:');
    for (const check of checks) {
      const found = check.pattern.test(result.css);
      const status = found ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testTailwind();
