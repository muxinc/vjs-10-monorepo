/**
 * Process CSS through Tailwind v4 CLI (file-based pipeline)
 *
 * This approach uses Tailwind's CLI instead of the PostCSS plugin API
 * to work around limitations with @theme, @container, and semantic colors.
 *
 * The PostCSS plugin API doesn't process @theme directives properly when
 * used programmatically, which breaks:
 * - Semantic color classes (bg-blue-500)
 * - Container query at-rules (@container)
 * - Theme CSS variables (--spacing, etc.)
 *
 * The CLI processes CSS files directly and properly handles all Tailwind v4 features.
 *
 * See: https://github.com/tailwindlabs/tailwindcss/issues/18966
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Process Tailwind classes through Tailwind v4 CLI
 *
 * Creates temporary files, invokes Tailwind CLI, and returns processed CSS.
 *
 * @param styles - Map of style keys to Tailwind class strings
 * @param html - HTML content for Tailwind to scan
 * @returns Processed CSS from Tailwind CLI
 */
export async function processTailwindWithCLI(
  styles: Record<string, string>,
  html: string
): Promise<string> {
  // Create temp directory
  const tempDir = mkdtempSync(join(tmpdir(), 'vjs-tailwind-'));

  try {
    // Write HTML file for Tailwind to scan
    const htmlPath = join(tempDir, 'input.html');
    writeFileSync(htmlPath, html, 'utf-8');

    // Write input CSS with Tailwind directives
    // NOTE: Don't use @import "tailwindcss" as it tries to resolve from temp dir
    // Instead use @tailwind directives (v3 syntax, still supported in v4)
    const inputCSSPath = join(tempDir, 'input.css');
    const inputCSS = `
@tailwind theme;
@tailwind utilities;

@theme {
  /* Spacing scale - enables p-*, m-*, gap-*, etc. */
  --spacing-0: 0px;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* Border radius values */
  --radius-none: 0px;
  --radius-sm: 0.125rem;
  --radius: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}
`;
    writeFileSync(inputCSSPath, inputCSS, 'utf-8');

    // Write Tailwind config that points to HTML
    const configPath = join(tempDir, 'tailwind.config.js');
    const config = `export default {
  content: ["${htmlPath.replace(/\\/g, '\\\\')}"],
  darkMode: 'media',
  corePlugins: {
    preflight: false,
  },
};
`;
    writeFileSync(configPath, config, 'utf-8');

    // Run Tailwind CLI
    const outputCSSPath = join(tempDir, 'output.css');

    // Use execSync with config file
    const tailwindCommand = `npx @tailwindcss/cli@4.1.13 -i "${inputCSSPath}" -o "${outputCSSPath}" -c "${configPath}"`;

    if (process.env.DEBUG_TAILWIND_CLI) {
      console.log('[DEBUG] Tailwind CLI command:', tailwindCommand);
      console.log('[DEBUG] Working directory:', tempDir);
      console.log('[DEBUG] HTML content:');
      console.log(html.substring(0, 500) + '...');
      console.log('[DEBUG] Input CSS:');
      console.log(inputCSS);
    }

    let stderr = '';
    let stdout = '';

    try {
      const result = execSync(tailwindCommand, {
        cwd: tempDir,
        stdio: process.env.DEBUG_TAILWIND_CLI ? 'inherit' : 'pipe',
        encoding: 'utf-8',
      });
      stdout = result;
    } catch (execError: any) {
      stderr = execError.stderr || '';
      stdout = execError.stdout || '';

      if (process.env.DEBUG_TAILWIND_CLI) {
        console.error('[DEBUG] Tailwind CLI failed');
        console.error('[DEBUG] stderr:', stderr);
        console.error('[DEBUG] stdout:', stdout);
      }

      throw new Error(`Tailwind CLI execution failed: ${stderr || execError.message}`);
    }

    // Read output CSS
    const outputCSS = readFileSync(outputCSSPath, 'utf-8');

    if (process.env.DEBUG_TAILWIND_CLI) {
      console.log('[DEBUG] Output CSS length:', outputCSS.length);
      console.log('[DEBUG] Has @container rules:', outputCSS.includes('@container'));
      if (stdout) console.log('[DEBUG] stdout:', stdout);
      if (stderr) console.log('[DEBUG] stderr:', stderr);
    }

    return outputCSS;
  } catch (error) {
    // Enhanced error message with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Tailwind CLI processing failed:', errorMessage);
    console.error('Temp directory:', tempDir);
    throw new Error(`Tailwind CLI processing failed: ${errorMessage}`);
  } finally {
    // Cleanup temp directory
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.warn('Failed to cleanup temp directory:', tempDir);
    }
  }
}
