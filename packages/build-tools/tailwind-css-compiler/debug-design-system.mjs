import { createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('Testing utilities.has for "flex":');
console.log('  Static:', designSystem.utilities.has('flex', 'static'));
console.log('  Functional:', designSystem.utilities.has('flex', 'functional'));

console.log('\nTesting some other utilities:');
console.log('  bg static:', designSystem.utilities.has('bg', 'static'));
console.log('  bg functional:', designSystem.utilities.has('bg', 'functional'));
console.log('  hover static:', designSystem.utilities.has('hover', 'static'));
console.log('  hover functional:', designSystem.utilities.has('hover', 'functional'));