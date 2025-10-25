export default {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  ignores: [
    /** @param {string} message */
    (message) => {
      const lower = message.toLowerCase().trim();
      return ['wip'].some(word => lower.startsWith(word));
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
      'packages',
      'react-native',
      'react',
      'root',
      'site',
      'test',
      'utils',
    ]],
  },
};
