/**
 * Visual Comparison Utilities for E2E Tests
 *
 * Provides pixel-diff comparison between React and Web Component screenshots
 * to validate visual equivalence of compiled skins.
 */

import pixelmatch from 'pixelmatch/index.js';
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface VisualComparisonResult {
  /**
   * Percentage of pixels that differ (0-100)
   */
  percentDiff: number;

  /**
   * Absolute number of differing pixels
   */
  numDiffPixels: number;

  /**
   * PNG image showing differences (red highlights)
   */
  diffImage: PNG;

  /**
   * Width and height of compared images
   */
  dimensions: { width: number; height: number };
}

export interface ComparisonOptions {
  /**
   * Pixel difference threshold (0.0 = exact, 1.0 = very lenient)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Whether to include anti-aliasing detection
   * @default false
   */
  includeAA?: boolean;

  /**
   * Save screenshots and diff image on any difference
   * @default false
   */
  saveOnAnyDiff?: boolean;
}

/**
 * Compare two screenshots pixel-by-pixel
 *
 * @param img1 - First screenshot buffer (React version)
 * @param img2 - Second screenshot buffer (WC version)
 * @param options - Comparison options
 * @returns Comparison result with diff percentage and image
 */
export function compareScreenshots(
  img1: Buffer,
  img2: Buffer,
  options: ComparisonOptions = {}
): VisualComparisonResult {
  const {
    threshold = 0.1,
    includeAA = false,
  } = options;

  // Decode PNG images
  const png1 = PNG.sync.read(img1);
  const png2 = PNG.sync.read(img2);

  // Validate dimensions match
  if (png1.width !== png2.width || png1.height !== png2.height) {
    throw new Error(
      `Image dimensions don't match: ` +
      `${png1.width}x${png1.height} vs ${png2.width}x${png2.height}`
    );
  }

  const { width, height } = png1;

  // Create diff image
  const diff = new PNG({ width, height });

  // Compare pixel-by-pixel
  const numDiffPixels = pixelmatch(
    png1.data,
    png2.data,
    diff.data,
    width,
    height,
    {
      threshold,
      includeAA,
      alpha: 0.1,
      aaColor: [255, 255, 0], // Yellow for anti-aliasing differences
      diffColor: [255, 0, 0],  // Red for pixel differences
    }
  );

  // Calculate percentage
  const totalPixels = width * height;
  const percentDiff = (numDiffPixels / totalPixels) * 100;

  return {
    percentDiff,
    numDiffPixels,
    diffImage: diff,
    dimensions: { width, height },
  };
}

/**
 * Save comparison artifacts (screenshots and diff) to test results directory
 *
 * @param reactImg - React screenshot buffer
 * @param wcImg - Web Component screenshot buffer
 * @param result - Comparison result
 * @param testName - Name of test (used for filenames)
 * @param outputDir - Directory to save to (relative to test root)
 */
export function saveComparisonArtifacts(
  reactImg: Buffer,
  wcImg: Buffer,
  result: VisualComparisonResult,
  testName: string,
  outputDir = 'test-results/visual-diffs'
): void {
  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  // Sanitize test name for filename
  const safeName = testName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  // Save all three images
  const reactPath = join(outputDir, `${safeName}-react.png`);
  const wcPath = join(outputDir, `${safeName}-wc.png`);
  const diffPath = join(outputDir, `${safeName}-diff.png`);

  writeFileSync(reactPath, reactImg);
  writeFileSync(wcPath, wcImg);
  writeFileSync(diffPath, PNG.sync.write(result.diffImage));

  console.log(`Visual comparison artifacts saved:`);
  console.log(`  React: ${reactPath}`);
  console.log(`  WC:    ${wcPath}`);
  console.log(`  Diff:  ${diffPath}`);
  console.log(`  Diff:  ${result.percentDiff.toFixed(2)}% (${result.numDiffPixels} pixels)`);
}

/**
 * Assert visual equivalence with detailed failure message
 *
 * @param result - Comparison result
 * @param maxDiffPercent - Maximum acceptable difference percentage
 * @throws Error with details if difference exceeds threshold
 */
export function assertVisualEquivalence(
  result: VisualComparisonResult,
  maxDiffPercent: number = 2.0
): void {
  if (result.percentDiff >= maxDiffPercent) {
    throw new Error(
      `Visual difference exceeds threshold:\n` +
      `  Expected: < ${maxDiffPercent}%\n` +
      `  Received: ${result.percentDiff.toFixed(2)}%\n` +
      `  Diff pixels: ${result.numDiffPixels} / ${result.dimensions.width * result.dimensions.height}\n` +
      `  Check test-results/visual-diffs/ for diff images`
    );
  }
}
