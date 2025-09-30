// Simple test of Set behavior
const testSet = new Set(['data-disabled', 'data-active']);

console.log('=== TESTING SET BEHAVIOR ===');
console.log('Set contains:', Array.from(testSet));
console.log('testSet.has("data-disabled"):', testSet.has('data-disabled'));
console.log('testSet.has("data-[disabled]"):', testSet.has('data-[disabled]'));
console.log('testSet.has("data-active"):', testSet.has('data-active'));
console.log('testSet.has("data-[active]"):', testSet.has('data-[active]'));

// This should confirm that Set.has() does exact matching