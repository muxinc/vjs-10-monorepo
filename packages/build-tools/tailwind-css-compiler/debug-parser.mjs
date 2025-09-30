import { parseCandidate, createSimplifiedDesignSystem } from './dist/index.js'

const designSystem = createSimplifiedDesignSystem()

// Test cases from failing tests
const testClasses = [
  '@7xl/root:text-lg',
  '@sm/sidebar:p-2',
  '@container/root',
  'text-[0.9375rem]',
  'font-[510]',
  'group/root',
  'after:absolute',
  'before:ring-white/15',
  'hover:bg-blue-500',
  '[&:fullscreen]:rounded-none'
]

console.log('=== Official Tailwind Parser Results ===\n')

for (const cls of testClasses) {
  console.log(`Class: "${cls}"`)
  try {
    const candidates = Array.from(parseCandidate(cls, designSystem))
    if (candidates.length === 0) {
      console.log('  ❌ No candidates parsed')
    } else {
      candidates.forEach((candidate, i) => {
        console.log(`  Candidate ${i + 1}:`)
        console.log(`    Kind: ${candidate.kind}`)
        if (candidate.kind === 'functional' || candidate.kind === 'arbitrary') {
          if (candidate.kind === 'functional') {
            console.log(`    Root: ${candidate.root}`)
            if (candidate.value) {
              console.log(`    Value: ${JSON.stringify(candidate.value)}`)
            }
          }
          if (candidate.kind === 'arbitrary') {
            console.log(`    Property: ${candidate.property}`)
            console.log(`    Value: ${candidate.value}`)
          }
        }
        if (candidate.variants.length > 0) {
          console.log(`    Variants: ${JSON.stringify(candidate.variants, null, 6)}`)
        }
        console.log(`    Important: ${candidate.important}`)
      })
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
  }
  console.log('')
}