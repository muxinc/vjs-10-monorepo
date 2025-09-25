import antfu from '@antfu/eslint-config';

import jsxA11y from 'eslint-plugin-jsx-a11y';

export default antfu({
  react: true,
  typescript: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
    svg: 'prettier',
  },
  stylistic: {
    semi: true,
    spacedComment: true,
    indent: 2,
    quotes: 'single',
  },
  ignores: ['node_modules', 'dist'],
  plugins: {
    'jsx-a11y': jsxA11y,
  },
}, {
  rules: {
    'antfu/if-newline': 'off',
  },
}, {
  files: ['**/*.md'],
  rules: {
    'style/max-len': 'off',
  },
});
