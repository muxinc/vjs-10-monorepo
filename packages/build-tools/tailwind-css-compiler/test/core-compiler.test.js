#!/usr/bin/env node

/**
 * Simple test for the core compiler functions
 * This is a temporary test to validate the new architecture
 */

import { compileFromString } from '../dist/index.js';

async function runTests() {
  console.log('🧪 Testing core compiler functions...\n');

  // Test 1: Basic compilation
  console.log('Test 1: Basic React component compilation');
  const sourceCode = `
import React from 'react';

export function PlayButton() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      <span className="icon text-lg">▶</span>
    </button>
  );
}
`;

  try {
    const result = await compileFromString(sourceCode, 'PlayButton.tsx');

    console.log('✅ Compilation successful!');
    console.log(`📊 Stats: ${result.stats.usageCount} usages found`);
    console.log(`📊 Vanilla generated: ${result.stats.vanillaGenerated}`);
    console.log(`📊 Modules generated: ${result.stats.modulesGenerated}`);

    if (result.vanilla) {
      console.log('\n📄 Vanilla CSS (first 200 chars):');
      console.log(result.vanilla.substring(0, 200) + '...');
    }

    if (result.modules) {
      console.log('\n📄 CSS Modules (first 200 chars):');
      console.log(result.modules.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    return false;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Empty source code
  console.log('Test 2: Empty source code');
  try {
    const result = await compileFromString('', 'empty.tsx');
    console.log('✅ Empty compilation successful!');
    console.log(`📊 Stats: ${result.stats.usageCount} usages found`);

    if (result.stats.usageCount !== 0) {
      console.error('❌ Expected 0 usages, got', result.stats.usageCount);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    return false;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Component with only vanilla CSS
  console.log('Test 3: Generate only vanilla CSS');
  try {
    const result = await compileFromString(sourceCode, 'PlayButton.tsx', {
      generateVanilla: true,
      generateModules: false
    });

    console.log('✅ Vanilla-only compilation successful!');
    console.log(`📊 Vanilla generated: ${result.stats.vanillaGenerated}`);
    console.log(`📊 Modules generated: ${result.stats.modulesGenerated}`);

    if (result.stats.modulesGenerated) {
      console.error('❌ Expected modules NOT to be generated');
      return false;
    }

    if (!result.stats.vanillaGenerated) {
      console.error('❌ Expected vanilla CSS to be generated');
      return false;
    }

  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    return false;
  }

  console.log('\n🎉 All tests passed!');
  return true;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});