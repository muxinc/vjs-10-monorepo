import type { Highlighter } from 'shiki';
import clsx from 'clsx';
import { createHighlighter, hastToHtml } from 'shiki';
import html from 'shiki/langs/html.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import gruvboxLightHard from 'shiki/themes/gruvbox-light-hard.mjs';

// If you try importing more than one island with ClientCode in it,
// Safari MAY throw a hydration error because of this top-level await.
// https://github.com/withastro/astro/issues/10055
// consolidate the ClientCodes into a single island to work around... for now :(

// eslint-disable-next-line antfu/no-top-level-await
const highlighter: Highlighter = await createHighlighter({
  themes: [gruvboxLightHard],
  langs: [html, tsx],
});

export interface ClientCodeProps {
  code: string;
  lang: 'html' | 'tsx';
  className?: string;
}

export default function ClientCode({ code, lang, className }: ClientCodeProps) {
  const hast = highlighter.codeToHast(code, {
    lang,
    theme: 'gruvbox-light-hard',
  });

  // shiki gives us a root > pre > code > text structure
  // since we want to define pre and code ourselves, let's extract the text
  let preProps: Record<string, any> = {};
  let codeProps: Record<string, any> = {};
  if (hast.type === 'root') {
    const pre = hast.children[0];
    if (pre && pre.type === 'element' && pre.tagName === 'pre') {
      preProps = pre.properties;
      const code = pre.children[0];
      if (code && code.type === 'element' && code.tagName === 'code') {
        codeProps = code.properties;
        // everything looked as expected! Let's use the code's children as the new root
        hast.children = code.children;
      }
    }
  }

  const html = hastToHtml(hast);
  const { class: preClassName } = preProps;
  const { class: codeClassName } = codeProps;

  return (
    <pre
      className={clsx('rounded-lg p-6 overflow-x-auto overflow-y-scroll max-h-96 border border-light-40 bg-light-100', preClassName, className)}
    >
      <code
        className={clsx('font-mono text-code', codeClassName)}
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}
