export default {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  rules: {
    'scope-enum': [2, 'always', [
      'root',
      'core',
      'icons',
      'html',
      'react',
      'react-native',
      'utils',
      'site',
      'docs',
      'test',
      'example/html',
      'example/react',
    ]],
  },
};
