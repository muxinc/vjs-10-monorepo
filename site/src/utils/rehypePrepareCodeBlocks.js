/**
 * Adapted from https://mdxjs.com/guides/syntax-highlighting/
 *
 * This plugin:
 * 1. Generates stable IDs for <pre> blocks (for tabs)
 * 2. Tags <code> children of <pre> blocks so they know they're in a pre block
 * 3. Marks <pre> blocks with hasFrame based on whether they're inside a <TabsPanel> JSX component
 */

let preBlockCounter = 0;

export default function rehypePrepareCodeBlocks() {
  return (tree) => {
    // Process the tree with a stateful visitor
    function visitWithContext(node, context = { hasFrame: false }) {
      // Handle TabsPanel JSX component
      if (node.type === 'mdxJsxFlowElement' && node.name === 'TabsPanel') {
        // Create new context for children (inside tabs)
        const newContext = { hasFrame: true };

        // Visit children with new context
        if (node.children) {
          node.children.forEach(child => visitWithContext(child, newContext));
        }

        return;
      }

      // Handle <pre> elements
      if (node.type === 'element' && node.tagName === 'pre') {
        // Mark whether this pre block is inside tabs
        node.properties.hasFrame = context.hasFrame;

        // Generate stable ID for this pre block
        node.properties['data-tabs-id'] = `pre-${preBlockCounter++}`;

        // Tag <code> children
        node.children.forEach((child) => {
          if (child.tagName === 'code') {
            child.properties.codeBlock = 'true';
          }
        });
      }

      // Recursively visit children for other node types
      if (node.children) {
        node.children.forEach(child => visitWithContext(child, context));
      }
    }

    // Start visiting from root
    if (tree.children) {
      tree.children.forEach(child => visitWithContext(child));
    }
  };
}
