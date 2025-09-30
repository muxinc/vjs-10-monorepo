import { parseCandidate, createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('Testing compound variant parsing:');

// Debug what our parser sees
console.log('\nDesignSystem checks for "group":');
console.log('  variants.has("group"):', designSystem.variants.has('group'));
console.log('  variants.kind("group"):', designSystem.variants.kind('group'));

// Test the actual parsing
console.log('\nParsing "group-[&_p]/parent-name:flex":');
const result = Array.from(parseCandidate('group-[&_p]/parent-name:flex', designSystem));
console.log('Result:', JSON.stringify(result, null, 2));