import { parseCandidate, createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('=== DEBUGGING DATA VARIANT ===');
console.log('Input: "data-[disabled]:flex"');

console.log('\nVariant checks for "data-[disabled]":');
console.log('  variants.has("data-[disabled]"):', designSystem.variants.has('data-[disabled]'));
console.log('  variants.has("data"):', designSystem.variants.has('data'));
console.log('  variants.kind("data"):', designSystem.variants.kind('data'));

// Test the actual parsing
const result = Array.from(parseCandidate('data-[disabled]:flex', designSystem));
console.log('\nParsing result:', JSON.stringify(result, null, 2));

// Let's also test what happens if we break it down
console.log('\n=== MANUAL BREAKDOWN ===');
const parts = 'data-[disabled]'.split('-');
console.log('Split parts:', parts);
console.log('Root:', parts[0]);
console.log('functionalVariants.has("data"):', designSystem.variants.kind('data') === 'functional');