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
  // Many are ignored by default.
  // https://github.com/antfu/eslint-config/blob/main/src/globs.ts#L56
  ignores: ['**/.astro/'],
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
