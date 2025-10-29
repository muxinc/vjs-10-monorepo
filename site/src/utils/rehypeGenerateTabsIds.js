/**
 * Rehype plugin that generates stable IDs for TabsRoot and TabsPanel components.
 *
 * This plugin:
 * 1. Generates stable IDs for TabsRoot components (if not already present)
 * 2. Propagates TabsRoot IDs to child TabsPanel components via tabsId attribute
 */

let tabsRootCounter = 0;

export default function rehypeGenerateTabsIds() {
  return (tree) => {
    // Process the tree with a stateful visitor
    function visitWithContext(node, context = { tabsRootId: null }) {
      // Handle TabsRoot JSX component
      if (node.type === 'mdxJsxFlowElement' && node.name === 'TabsRoot') {
        // Generate stable ID
        const generatedId = `tabs-${tabsRootCounter++}`;

        // Check if ID already exists in attributes
        const hasExistingId = node.attributes?.some(
          attr => attr.type === 'mdxJsxAttribute' && attr.name === 'id',
        );

        // Only add ID if not already present (allow manual override)
        if (!hasExistingId) {
          if (!node.attributes) node.attributes = [];
          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'id',
            value: generatedId,
          });
        }

        // Get the actual ID (generated or existing)
        const idAttr = node.attributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'id');
        const tabsRootId = idAttr?.value || generatedId;

        // Create new context with TabsRoot ID
        const newContext = { tabsRootId };

        // Visit children with new context
        if (node.children) {
          node.children.forEach(child => visitWithContext(child, newContext));
        }

        return;
      }

      // Handle TabsPanel JSX component
      if (node.type === 'mdxJsxFlowElement' && node.name === 'TabsPanel') {
        // Check if tabsId already exists
        const hasExistingTabsId = node.attributes?.some(
          attr => attr.type === 'mdxJsxAttribute' && attr.name === 'tabsId',
        );

        // Add tabsId from context if not present
        if (!hasExistingTabsId && context.tabsRootId) {
          if (!node.attributes) node.attributes = [];
          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'tabsId',
            value: context.tabsRootId,
          });
        }

        // Visit children (preserve context for nested panels)
        if (node.children) {
          node.children.forEach(child => visitWithContext(child, context));
        }

        return;
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
