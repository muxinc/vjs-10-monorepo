import { beforeAll, afterAll } from 'vitest';
import { mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test directory for temporary files
export const TEST_OUTPUT_DIR = resolve(__dirname, 'temp');
export const FIXTURES_DIR = resolve(__dirname, 'fixtures');

beforeAll(() => {
  // Create temp directory for test outputs
  mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
});

afterAll(() => {
  // Clean up temp directory after tests
  try {
    rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn('Failed to cleanup test directory:', error);
  }
});