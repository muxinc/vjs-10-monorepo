import antfu from '@antfu/eslint-config';

import jsxA11y from 'eslint-plugin-jsx-a11y';

export default antfu(
  {
    react: true,
    astro: true,
    typescript: true,
    formatters: {
      css: true,
      html: true,
      astro: 'prettier',
      markdown: 'prettier',
      svg: 'prettier',
    },
    stylistic: {
      semi: true,
      indent: 2,
      quotes: 'single',
    },
    // Many are ignored by default.
    // https://github.com/antfu/eslint-config/blob/main/src/globs.ts#L56
    ignores: [
      '**/.astro/',
      '**/.vercel/',
      '**/dist/',
      '**/styles/vjs.css',
      'website/src/components/Posthog.astro',
    ],
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
  {
    files: ['**/*.md/**'],
    rules: {
      // Disable rules that conflict with documentation code examples in markdown
      'ts/no-unsafe-function-type': 'off',
      'ts/method-signature-style': 'off',
      'node/handle-callback-err': 'off',
      'react-refresh/only-export-components': 'off',
      'react-dom/no-missing-button-type': 'off',
      'react/no-array-index-key': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'import/first': 'off',
      'import/newline-after-import': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'format/prettier': 'off',
      'perfectionist/sort-named-imports': 'off',
      'style/quotes': 'off',
      'style/semi': 'off',
      'style/member-delimiter-style': 'off',
      'style/jsx-one-expression-per-line': 'off',
    },
  },
);
