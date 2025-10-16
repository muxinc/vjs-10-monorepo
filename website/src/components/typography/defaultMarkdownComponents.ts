import A from './A.astro';
import Blockquote from './Blockquote.astro';
import Em from './Em.astro';
import H1Warning from './H1Warning.astro';
import H2Markdown from './H2Markdown.astro';
import H3Markdown from './H3Markdown.astro';
import H4Markdown from './H4Markdown.astro';
import H5Markdown from './H5Markdown.astro';
import H6Markdown from './H6Markdown.astro';
import Hr from './Hr.astro';
// import Img from './Img.astro';
import Li from './Li.astro';
import MarkdownCode from './MarkdownCode.astro';
import Ol from './Ol.astro';
import P from './P.astro';
import Pre from './Pre.astro';
import Strong from './Strong.astro';
import Table from './Table.astro';
import Tbody from './Tbody.astro';
import Td from './Td.astro';
import Th from './Th.astro';
import Thead from './Thead.astro';
import Tr from './Tr.astro';
import Ul from './Ul.astro';

const defaultMarkdownComponents = {
  h1: H1Warning,
  h2: H2Markdown,
  h3: H3Markdown,
  h4: H4Markdown,
  h5: H5Markdown,
  h6: H6Markdown,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  em: Em,
  strong: Strong,
  blockquote: Blockquote,
  hr: Hr,
  // img: Img,
  pre: Pre,
  code: MarkdownCode,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
};

export default defaultMarkdownComponents;
