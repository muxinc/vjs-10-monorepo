import { bundledLanguages } from 'shiki';
import createHighlighter from './createHighlighter';

// eslint-disable-next-line antfu/no-top-level-await
const serverHighlighter = await createHighlighter({
  langs: Object.values(bundledLanguages),
});
// TODO memory leak?
export default serverHighlighter;
