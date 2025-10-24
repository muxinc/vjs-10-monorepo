export default {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  ignores: [
    /** @param {string} message */
    (message) => {
      const lower = message.toLowerCase().trim();
      return ['wip'].includes(lower);
    },
  ],
  rules: {
    'scope-enum': [2, 'always', [
      'cd',
      'ci',
      'core',
      'docs',
      'example/html',
      'example/react',
      'html',
      'icons',
      'react-native',
      'react',
      'root',
      'site',
      'test',
      'utils',
    ]],
  },
};
