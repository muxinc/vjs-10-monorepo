import { spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';

/**
 * Claude CLI Provider for real LLM-powered transpilation
 */
export class ClaudeCLIProvider {
  name = 'claude-cli';
  tempDir;
  claudePath;

  constructor() {
    this.tempDir = resolve(process.cwd(), '.claude-temp');
    this.claudePath = process.env.CLAUDE_CLI_PATH || 'claude';
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async generateCode(prompt, config) {
    // Check if Claude CLI is available
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      console.error('BOOOOOOOO');
    }

    try {
      // Construct Claude CLI command using --print flag for non-interactive output
      const args = ['--print'];

      // Add model configuration if specified
      if (config.model && config.model !== 'default') {
        args.push('--model', config.model);
      }

      // Add the prompt as the last argument
      args.push(prompt);

      // Execute Claude CLI
      const result = await this.executeCommand(this.claudePath, args, {
        timeout: config.maxTokens
          ? Math.max(30000, config.maxTokens * 10)
          : 60000,
      });

      if (result.exitCode !== 0) {
        throw new Error(
          `Claude CLI failed with exit code ${result.exitCode}: ${result.stderr}`,
        );
      }

      const output = result.stdout.trim();

      if (!output) {
        throw new Error('Claude CLI produced empty output');
      }

      return output;
    } catch (error) {
      if (error instanceof Error) {
        console.log('NO REALLY BOOOOOOOOOOOOOO');
      }

      throw error;
    }
  }

  async isAvailable() {
    try {
      const result = await this.executeCommand(this.claudePath, ['--version'], {
        timeout: 5000,
      });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  async executeCommand(command, args, options = {}) {
    const { timeout = 30000 } = options;

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false, // Don't use shell to avoid security issues
      });

      let stdout = '';
      let stderr = '';
      let timeoutId;

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);
      }

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      });

      child.on('close', (exitCode) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          exitCode: exitCode || 0,
          stdout,
          stderr,
        });
      });
    });
  }

  cleanup(files) {
    for (const file of files) {
      try {
        if (existsSync(file)) {
          rmSync(file, { force: true });
        }
      } catch (error) {
        console.warn(`Failed to cleanup temporary file ${file}:`, error);
      }
    }
  }

  /**
   * Clean up all temporary files
   */
  dispose() {
    try {
      if (existsSync(this.tempDir)) {
        rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Failed to clean up Claude CLI temp directory:', error);
    }
  }
}

/**
 * Alternative implementation using Claude API if available
 */
// export class ClaudeAPIProvider implements LLMProvider {
//   name = 'claude-api';
//   private apiKey?: string;

//   constructor(apiKey?: string) {
//     this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
//   }

//   async generateCode(prompt: string, config: LLMConfig): Promise<string> {
//     if (!this.apiKey) {
//       throw TranspilationErrorFactory.create(
//         'Claude API key not found. Please set ANTHROPIC_API_KEY environment variable',
//         TranspilationErrorType.LLM_ERROR,
//         { recoverable: false, retryable: false }
//       );
//     }

//     try {
//       const response = await fetch('https://api.anthropic.com/v1/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-API-Key': this.apiKey,
//           'anthropic-version': '2023-06-01',
//         },
//         body: JSON.stringify({
//           model: config.model || 'claude-3-sonnet-20240229',
//           max_tokens: config.maxTokens || 8000,
//           temperature: config.temperature || 0.1,
//           messages: [
//             {
//               role: 'user',
//               content: prompt,
//             },
//           ],
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(`Claude API error ${response.status}: ${errorData.error?.message || response.statusText}`);
//       }

//       const data = await response.json();

//       if (!data.content || !data.content[0] || !data.content[0].text) {
//         throw new Error('Invalid response format from Claude API');
//       }

//       return data.content[0].text;

//     } catch (error) {
//       throw TranspilationErrorFactory.create(
//         `Claude API error: ${error instanceof Error ? error.message : error}`,
//         TranspilationErrorType.LLM_ERROR,
//         {
//           recoverable: true,
//           retryable: true,
//           originalError: error instanceof Error ? error : new Error(String(error)),
//         }
//       );
//     }
//   }

//   async isAvailable(): Promise<boolean> {
//     return !!this.apiKey;
//   }
// }

/**
 * OpenAI Provider as fallback option
 */
// export class OpenAIProvider implements LLMProvider {
//   name = 'openai';
//   private apiKey?: string;

//   constructor(apiKey?: string) {
//     this.apiKey = apiKey || process.env.OPENAI_API_KEY;
//   }

//   async generateCode(prompt: string, config: LLMConfig): Promise<string> {
//     if (!this.apiKey) {
//       throw TranspilationErrorFactory.create(
//         'OpenAI API key not found. Please set OPENAI_API_KEY environment variable',
//         TranspilationErrorType.LLM_ERROR,
//         { recoverable: false, retryable: false }
//       );
//     }

//     try {
//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${this.apiKey}`,
//         },
//         body: JSON.stringify({
//           model: config.model || 'gpt-4',
//           messages: [
//             {
//               role: 'user',
//               content: prompt,
//             },
//           ],
//           max_tokens: config.maxTokens || 8000,
//           temperature: config.temperature || 0.1,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(`OpenAI API error ${response.status}: ${errorData.error?.message || response.statusText}`);
//       }

//       const data = await response.json();

//       if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
//         throw new Error('Invalid response format from OpenAI API');
//       }

//       return data.choices[0].message.content;

//     } catch (error) {
//       throw TranspilationErrorFactory.create(
//         `OpenAI API error: ${error instanceof Error ? error.message : error}`,
//         TranspilationErrorType.LLM_ERROR,
//         {
//           recoverable: true,
//           retryable: true,
//           originalError: error instanceof Error ? error : new Error(String(error)),
//         }
//       );
//     }
//   }

//   async isAvailable(): Promise<boolean> {
//     return !!this.apiKey;
//   }
// }

const test = async () => {
  let claudeCLIProvider = new ClaudeCLIProvider();
  console.log('claude available?', await claudeCLIProvider.isAvailable());
  console.log('generateCode!');
  const result = await claudeCLIProvider.generateCode(
    'Simply print "Hello, World"',
    {},
  );
  console.log('executed!', result);
};

test();
