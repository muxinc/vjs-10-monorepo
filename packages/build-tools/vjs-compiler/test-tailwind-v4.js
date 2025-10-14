/**
 * Test Tailwind v4 responsive breakpoint support
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const html = readFileSync('./test-tailwind-v4-responsive.html', 'utf-8');

console.log('=== HTML Input ===');
console.log(html);
console.log('\n');

const config = {
  content: [{ raw: html, extension: 'html' }],
  corePlugins: {
    preflight: false,
  },
};

const tailwindPlugin = tailwindcss({ config });

const inputCSS = `
@breakpoint sm (width >= 640px);
@breakpoint md (width >= 768px);
@breakpoint lg (width >= 1024px);
@breakpoint xl (width >= 1280px);

@tailwind utilities;
`;

console.log('=== Processing with Tailwind v4 ===\n');

const result = await postcss([tailwindPlugin]).process(inputCSS, {
  from: undefined,
  map: false,
});

console.log('=== Output CSS ===');
console.log(result.css);
console.log('\n');

// Check for responsive breakpoints
const hasResponsive = result.css.includes('@media (width >= ') || result.css.includes('@media (min-width:');
const hasArbitraryColors = result.css.includes('#1da1f2') || result.css.includes('rgba(0,0,0,0.3)');
const hasClamp = result.css.includes('clamp(3rem');

console.log('=== Analysis ===');
console.log(`Responsive breakpoints generated: ${hasResponsive}`);
console.log(`Arbitrary colors generated: ${hasArbitraryColors}`);
console.log(`Clamp values generated: ${hasClamp}`);
