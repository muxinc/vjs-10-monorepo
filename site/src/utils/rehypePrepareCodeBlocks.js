import { visit } from 'unist-util-visit';

/**
 * Adapted from https://mdxjs.com/guides/syntax-highlighting/
 */
export default function rehypePrepareCodeBlocks() {
  // A regex that looks for a simplified attribute name, optionally followed
  // by a double, single, or unquoted attribute value
  const re = /\b([-\w]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g;
  return (tree) => {
    visit(tree, 'element', (node) => {
      let match;

      /**
       * We're looking for <pre> blocks containing <code> blocks to do some work on them because MDX 2 is weird.
       * Here's what we're up to here:
       * 1. taking the classname from code and moving it up to pre
       * 2. notifying code that it's in a pre block so it wouldn't try to format itself as inline code
       * 3. parsing the code block's metadata and putting the results into the pre block
       * metadata, you ask? Stuff like title and lineNumbers in this example below.
       * ```js title="src/pages/index.js" lineNumbers=true
       * ```
       */
      if (node.tagName === 'pre') {
        node.children.forEach((child) => {
          if (child.tagName === 'code') {
            const { className } = child.properties;
            if (className) {
              node.properties.className = className;
            }

            child.properties.codeBlock = 'true';

            if (child.data && child.data.meta) {
              re.lastIndex = 0; // Reset regex.

              // eslint-disable-next-line no-cond-assign
              while ((match = re.exec(child.data.meta))) {
                node.properties[match[1]] = match[2] || match[3] || match[4] || '';
              }
            }
          }
        });
      }
    });
  };
}
