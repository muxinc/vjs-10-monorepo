import type { ImportMappingConfig } from './types.js';

/**
 * Default mapping configuration for React → HTML transformation
 */
export const defaultImportMappings: ImportMappingConfig = {
  packageMappings: {
    // Icons
    '@vjs-10/react-icons': '@vjs-10/html-icons',

    // Components (package level)
    '@vjs-10/react': '@vjs-10/html',
  },

  excludePatterns: [
    // Styles
    '/styles',
    '.css',
    '.module.css',
    '.scss',
    '.sass',
    '.less',

    // React-specific
    'react',
    'react-dom',
    'react/',
  ],
};
