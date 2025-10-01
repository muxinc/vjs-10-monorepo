declare module 'postcss-nested' {
  import type { PluginCreator } from 'postcss';

  const nested: PluginCreator<void>;
  export default nested;
}
