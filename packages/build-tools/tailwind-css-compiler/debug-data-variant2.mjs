import { createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('=== CHECKING VARIANTS SET ===');

// Let's manually check what our design system has
console.log('Direct checks:');
console.log('  variants set has "data-disabled":',
  // We need to check the actual Set - let's create the design system and check the internal set
  'Testing what our has method does...');

console.log('\nTesting different data variants:');
console.log('  variants.has("data-disabled"):', designSystem.variants.has('data-disabled'));
console.log('  variants.has("data-[disabled]"):', designSystem.variants.has('data-[disabled]'));
console.log('  variants.has("data-active"):', designSystem.variants.has('data-active'));
console.log('  variants.has("data-[active]"):', designSystem.variants.has('data-[active]'));
console.log('  variants.has("data"):', designSystem.variants.has('data'));

// Let's trace through our has method logic step by step for "data-[disabled]"
const name = 'data-[disabled]';
console.log(`\n=== TRACING variants.has("${name}") ===`);

// Step 1: Direct match check - this calls the internal variants.has()
console.log('Step 1: Direct match check would look for exact match in set');

// Step 2: @-prefix check
console.log('Step 2: @-prefix check:', name.startsWith('@'));

// Step 3: Split and check functional variants
const parts = name.split('-');
console.log('Step 3a: Split parts:', parts);
if (parts.length > 1) {
  const root = parts[0];
  console.log('Step 3b: Root:', root);
  console.log('Step 3c: variants.kind("data"):', designSystem.variants.kind('data'));
}