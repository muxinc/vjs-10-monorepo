import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Fixture {
  name: string;
  input: string;
  expected: string;
}

/**
 * Loads a fixture from the fixtures directory
 * @param fixtureName - Name of the fixture directory (e.g., 'simple-component')
 * @returns Fixture object with input and expected strings
 */
export function loadFixture(fixtureName: string): Fixture {
  const fixtureDir = join(__dirname, '..', 'fixtures', fixtureName);

  const input = readFileSync(join(fixtureDir, 'input.tsx'), 'utf-8');
  const expected = readFileSync(join(fixtureDir, 'expected.html'), 'utf-8');

  return {
    name: fixtureName,
    input,
    expected,
  };
}

/**
 * Loads multiple fixtures
 * @param fixtureNames - Array of fixture directory names
 * @returns Array of Fixture objects
 */
export function loadFixtures(fixtureNames: string[]): Fixture[] {
  return fixtureNames.map(loadFixture);
}
