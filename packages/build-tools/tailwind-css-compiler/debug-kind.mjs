import { createSimplifiedDesignSystem } from './dist/index.js';

const designSystem = createSimplifiedDesignSystem();

console.log('=== TESTING KIND METHOD ===');
console.log('variants.kind("data"):', designSystem.variants.kind('data'));
console.log('variants.kind("data-disabled"):', designSystem.variants.kind('data-disabled'));
console.log('variants.kind("data-[disabled]"):', designSystem.variants.kind('data-[disabled]'));
console.log('variants.kind("group"):', designSystem.variants.kind('group'));
console.log('variants.kind("group-hover"):', designSystem.variants.kind('group-hover'));

// The issue might be that our kind method is saying data-[disabled] is static instead of functional