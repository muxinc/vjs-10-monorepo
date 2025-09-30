import { parseCandidate, createSimplifiedDesignSystem } from './dist/index.js';

// Let's manually trace what happens with compound parsing
const designSystem = createSimplifiedDesignSystem();

console.log('=== DEBUGGING COMPOUND VARIANT ===');
console.log('Input: "group-[&_p]/parent-name:flex"');

// Manually segment like parseCandidate does
const input = 'group-[&_p]/parent-name:flex';
const rawVariants = input.split(':');
console.log('Raw variants:', rawVariants);

const base = rawVariants.pop(); // "flex"
const variantString = rawVariants[0]; // "group-[&_p]/parent-name"

console.log('Base utility:', base);
console.log('Variant string:', variantString);

// Check if base utility exists
console.log('\nUtility checks:');
console.log('  utilities.has("flex", "static"):', designSystem.utilities.has('flex', 'static'));
console.log('  utilities.has("flex", "functional"):', designSystem.utilities.has('flex', 'functional'));

// Now let's check the variant parsing manually
console.log('\nVariant parsing for:', variantString);

// The variant parsing logic from candidate.ts
// First split by '/' to get modifier
const [variantWithoutModifier, modifier] = variantString.split('/');
console.log('  Variant without modifier:', variantWithoutModifier);
console.log('  Modifier:', modifier);

// Check if this looks like an arbitrary variant
if (variantWithoutModifier.includes('[')) {
  console.log('  → Contains brackets, might be compound with arbitrary');
}

// Check what our design system says about "group"
console.log('\nDesignSystem variant checks:');
console.log('  variants.has("group"):', designSystem.variants.has('group'));
console.log('  variants.kind("group"):', designSystem.variants.kind('group'));

// Let's try parsing a simpler compound variant first
console.log('\n=== TESTING SIMPLER COMPOUND ===');
const simple = Array.from(parseCandidate('group-hover:flex', designSystem));
console.log('Simple compound result:', JSON.stringify(simple, null, 2));