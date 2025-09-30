#!/usr/bin/env node

import fs from 'fs';
import { ASTParser, parseCandidate, createSimplifiedDesignSystem } from './dist/index.js';

console.log('🔍 TAILWIND AST ANALYSIS: MediaSkinDefaultInlineClasses.tsx');
console.log('============================================================\n');

const skinFile = '/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/MediaSkinDefaultInlineClasses.tsx';

// 1. Extract class usages
const parser = new ASTParser();
const parsed = parser.parseFile(skinFile);

console.log('📄 File analyzed:', skinFile);
console.log('📊 Total className usages found:', parsed.usages.length);

// 2. Get all unique individual classes
const allClasses = parsed.usages.flatMap(usage => usage.classes);
const uniqueClasses = [...new Set(allClasses)];
console.log('🎯 Total unique classes:', uniqueClasses.length);

// 3. Parse each class with official Tailwind AST
const designSystem = createSimplifiedDesignSystem();
const astResults = {};
const astSummary = {
  static: [],
  functional: [],
  arbitrary: [],
  unparseable: []
};

console.log('\n🧪 PARSING EACH CLASS WITH OFFICIAL TAILWIND AST');
console.log('=================================================\n');

uniqueClasses.forEach((className, index) => {
  console.log(`${(index + 1).toString().padStart(3)}. "${className}"`);

  try {
    const candidates = Array.from(parseCandidate(className, designSystem));

    if (candidates.length === 0) {
      console.log('     ❌ UNPARSEABLE - No candidates generated');
      astResults[className] = { unparseable: true, reason: 'No candidates' };
      astSummary.unparseable.push(className);
    } else {
      candidates.forEach((candidate, candidateIndex) => {
        if (candidateIndex === 0) {
          console.log(`     ✅ ${candidate.kind.toUpperCase()}`);
        } else {
          console.log(`        + ${candidate.kind.toUpperCase()} (additional candidate)`);
        }

        // Pretty print the candidate structure
        const prettyCandidate = JSON.stringify(candidate, null, 8).replace(/\n/g, '\n        ');
        console.log(`        ${prettyCandidate}`);

        // Categorize for summary
        if (candidateIndex === 0) { // Only count primary candidate for summary
          astResults[className] = candidate;
          astSummary[candidate.kind].push(className);
        }
      });
    }
  } catch (error) {
    console.log(`     ❌ ERROR: ${error.message}`);
    astResults[className] = { error: error.message };
    astSummary.unparseable.push(className);
  }

  console.log(); // Empty line for readability
});

// 4. Generate summary statistics
console.log('📊 SUMMARY STATISTICS');
console.log('=====================');
console.log(`Static utilities:    ${astSummary.static.length.toString().padStart(3)} classes`);
console.log(`Functional utilities: ${astSummary.functional.length.toString().padStart(3)} classes`);
console.log(`Arbitrary properties: ${astSummary.arbitrary.length.toString().padStart(3)} classes`);
console.log(`Unparseable:         ${astSummary.unparseable.length.toString().padStart(3)} classes`);
console.log(`Total:               ${uniqueClasses.length.toString().padStart(3)} classes`);

const parseableCount = uniqueClasses.length - astSummary.unparseable.length;
const parseRate = ((parseableCount / uniqueClasses.length) * 100).toFixed(1);
console.log(`\nParse success rate: ${parseRate}%`);

// 5. Breakdown by category
if (astSummary.static.length > 0) {
  console.log('\n🟢 STATIC UTILITIES:');
  astSummary.static.forEach(cls => console.log(`   ${cls}`));
}

if (astSummary.functional.length > 0) {
  console.log('\n🔧 FUNCTIONAL UTILITIES:');
  astSummary.functional.forEach(cls => {
    const candidate = astResults[cls];
    let valueDesc = 'null';
    if (candidate.value) {
      if (candidate.value.kind === 'arbitrary') {
        valueDesc = `[${candidate.value.value}]`;
      } else if (candidate.value.kind === 'named') {
        valueDesc = candidate.value.value;
      }
    }
    console.log(`   ${cls} → ${candidate.root}(${valueDesc})`);
  });
}

if (astSummary.arbitrary.length > 0) {
  console.log('\n🎯 ARBITRARY PROPERTIES:');
  astSummary.arbitrary.forEach(cls => {
    const candidate = astResults[cls];
    console.log(`   ${cls} → ${candidate.property}: ${candidate.value}`);
  });
}

if (astSummary.unparseable.length > 0) {
  console.log('\n❌ UNPARSEABLE CLASSES:');
  astSummary.unparseable.forEach(cls => console.log(`   ${cls}`));
}

// 6. Save detailed results to file
const detailedReport = {
  file: skinFile,
  totalClasses: uniqueClasses.length,
  parseableClasses: parseableCount,
  parseSuccessRate: parseRate + '%',
  summary: astSummary,
  detailedResults: astResults,
  allClasses: uniqueClasses
};

fs.writeFileSync('./MediaSkinDefaultInlineClasses-AST-Output.json', JSON.stringify(detailedReport, null, 2));

console.log('\n💾 Detailed AST output saved to: MediaSkinDefaultInlineClasses-AST-Output.json');
console.log('\n🎉 Analysis complete!');