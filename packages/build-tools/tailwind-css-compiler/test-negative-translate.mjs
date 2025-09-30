import { parseCandidate, createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('🧪 Testing negative translate utilities:');
console.log('==========================================\n');

const testClasses = [
  '-translate-x-px',
  '-translate-y-px',
  '[&_.arrow-1]:-translate-x-px',
  '[&_.arrow-1]:-translate-y-px',
  'group-hover/button:[&_.arrow-1]:-translate-x-px',
  'group-hover/button:[&_.arrow-1]:-translate-y-px'
];

testClasses.forEach(className => {
  console.log(`Testing: "${className}"`);
  const result = Array.from(parseCandidate(className, designSystem));
  if (result.length > 0) {
    console.log('  ✅ PARSED:', JSON.stringify(result[0], null, 4));
  } else {
    console.log('  ❌ UNPARSEABLE');
  }
  console.log('');
});