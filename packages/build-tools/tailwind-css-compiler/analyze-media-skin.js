#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { ASTParser, enhanceClassUsages, parseEnhancedClassString } from './dist/index.js';

console.log('🔍 Analyzing MediaSkinDefaultInlineClasses.tsx');
console.log('================================================\n');

const skinFile = '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/MediaSkinDefaultInlineClasses.tsx';

// 1. Extract class usages with AST parser
console.log('1️⃣ EXTRACTING CLASS USAGES WITH AST PARSER');
console.log('===========================================\n');

const parser = new ASTParser();
const parsed = parser.parseFile(skinFile);
const enhanced = enhanceClassUsages(parsed.usages);

console.log(`📄 File: ${path.basename(skinFile)}`);
console.log(`📊 Total usages found: ${enhanced.length}\n`);

// Create detailed usage report
const usageReport = {
  file: skinFile,
  totalUsages: enhanced.length,
  usages: enhanced.map(usage => ({
    component: usage.component,
    element: usage.element,
    line: usage.line,
    column: usage.column,
    componentType: usage.componentType,
    classes: usage.classes,
    simpleClasses: usage.simpleClasses,
    containerDeclarations: usage.containerDeclarations,
    containerQueries: usage.containerQueries,
    arbitraryValues: usage.arbitraryValues
  }))
};

// Write usage report
fs.writeFileSync('./temp-usage-analysis.json', JSON.stringify(usageReport, null, 2));
console.log('✅ Detailed usage analysis saved to: temp-usage-analysis.json\n');

// Display summary
enhanced.forEach((usage, index) => {
  console.log(`📝 Usage ${index + 1}:`);
  console.log(`   Component: ${usage.component}`);
  console.log(`   Element: ${usage.element || 'undefined'}`);
  console.log(`   Location: line ${usage.line}, column ${usage.column}`);
  console.log(`   Type: ${usage.componentType}`);
  console.log(`   Classes (${usage.classes.length}): ${usage.classes.join(' ')}`);
  console.log(`   Simple (${usage.simpleClasses.length}): ${usage.simpleClasses.slice(0, 5).join(' ')}${usage.simpleClasses.length > 5 ? '...' : ''}`);
  console.log(`   Container Queries: ${usage.containerQueries.length}`);
  console.log(`   Arbitrary Values: ${usage.arbitraryValues.length}`);
  console.log(`   Container Declarations: ${usage.containerDeclarations.length}\n`);
});

// 2. Analyze each unique class string with Tailwind AST
console.log('2️⃣ TAILWIND AST PARSING ANALYSIS');
console.log('=================================\n');

// Get all unique class strings
const allClasses = enhanced.flatMap(usage => usage.classes);
const uniqueClassStrings = [...new Set(allClasses)];

console.log(`🎯 Total unique class strings: ${uniqueClassStrings.length}\n`);

const astAnalysis = {
  totalUniqueClasses: uniqueClassStrings.length,
  classAnalysis: []
};

uniqueClassStrings.forEach((classString, index) => {
  console.log(`🔬 Class String ${index + 1}:`);
  console.log(`   "${classString}"`);

  try {
    const parsed = parseEnhancedClassString(classString);

    const analysis = {
      classString,
      simpleClasses: parsed.simpleClasses,
      containerDeclarations: parsed.containerDeclarations,
      containerQueries: parsed.containerQueries.map(cq => ({
        breakpoint: cq.breakpoint,
        container: cq.container,
        utility: cq.utility
      })),
      arbitraryValues: parsed.arbitraryValues.map(av => ({
        property: av.property,
        value: av.value,
        originalClass: av.originalClass
      }))
    };

    astAnalysis.classAnalysis.push(analysis);

    console.log(`   ✅ Simple classes: ${parsed.simpleClasses.length}`);
    console.log(`   🔧 Container queries: ${parsed.containerQueries.length}`);
    console.log(`   🎯 Arbitrary values: ${parsed.arbitraryValues.length}`);
    console.log(`   📦 Container declarations: ${parsed.containerDeclarations.length}`);

    // Show detailed breakdown for complex cases
    if (parsed.containerQueries.length > 0) {
      console.log(`   📋 Container Queries Details:`);
      parsed.containerQueries.forEach(cq => {
        console.log(`      @${cq.breakpoint}/${cq.container}:${cq.utility}`);
      });
    }

    if (parsed.arbitraryValues.length > 0) {
      console.log(`   📋 Arbitrary Values Details:`);
      parsed.arbitraryValues.forEach(av => {
        console.log(`      ${av.originalClass} → ${av.property}: ${av.value}`);
      });
    }

  } catch (error) {
    console.log(`   ❌ Parse error: ${error.message}`);
    astAnalysis.classAnalysis.push({
      classString,
      error: error.message
    });
  }

  console.log('');
});

// Write AST analysis
fs.writeFileSync('./temp-ast-analysis.json', JSON.stringify(astAnalysis, null, 2));
console.log('✅ Detailed AST analysis saved to: temp-ast-analysis.json\n');

// 3. Summary statistics
console.log('3️⃣ SUMMARY STATISTICS');
console.log('=====================\n');

const totalSimple = astAnalysis.classAnalysis.reduce((sum, analysis) => sum + (analysis.simpleClasses?.length || 0), 0);
const totalContainerQueries = astAnalysis.classAnalysis.reduce((sum, analysis) => sum + (analysis.containerQueries?.length || 0), 0);
const totalArbitraryValues = astAnalysis.classAnalysis.reduce((sum, analysis) => sum + (analysis.arbitraryValues?.length || 0), 0);
const totalContainerDeclarations = astAnalysis.classAnalysis.reduce((sum, analysis) => sum + (analysis.containerDeclarations?.length || 0), 0);
const totalErrors = astAnalysis.classAnalysis.filter(analysis => analysis.error).length;

console.log(`📊 Parsing Statistics:`);
console.log(`   Total class strings: ${uniqueClassStrings.length}`);
console.log(`   Simple classes parsed: ${totalSimple}`);
console.log(`   Container queries found: ${totalContainerQueries}`);
console.log(`   Arbitrary values found: ${totalArbitraryValues}`);
console.log(`   Container declarations: ${totalContainerDeclarations}`);
console.log(`   Parse errors: ${totalErrors}`);
console.log(`   Success rate: ${((uniqueClassStrings.length - totalErrors) / uniqueClassStrings.length * 100).toFixed(1)}%`);

console.log('\n🎉 Analysis complete! Check the generated temp files for detailed results.');