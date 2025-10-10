import antfu from '@antfu/eslint-config';

import jsxA11y from 'eslint-plugin-jsx-a11y';

export default antfu(
  {
    react: true,
    astro: true,
    typescript: true,
    astro: true,
    formatters: {
      css: true,
      html: true,
      astro: 'prettier',
      markdown: 'prettier',
      svg: 'prettier',
      astro: 'prettier',
    },
    stylistic: {
      semi: true,
      spacedComment: true,
      indent: 2,
      quotes: 'single',
    },
    // Many are ignored by default.
    // https://github.com/antfu/eslint-config/blob/main/src/globs.ts#L56
    ignores: ['**/.astro/'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Allow single line bracing.
      'antfu/if-newline': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      // Only quote props when necessary.
      'style/quote-props': ['error', 'as-needed'],
      // JSX A11Y plugin rules
      ...jsxA11y.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'style/max-len': 'off',
    },
  },
);
