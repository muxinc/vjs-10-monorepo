export type ValueWordNode = {
  kind: 'word'
  value: string
}

export type ValueFunctionNode = {
  kind: 'function'
  value: string
  nodes: ValueAstNode[]
}

export type ValueSeparatorNode = {
  kind: 'separator'
  value: string
}

export type ValueAstNode = ValueWordNode | ValueFunctionNode | ValueSeparatorNode
type ValueParentNode = ValueFunctionNode | null

function word(value: string): ValueWordNode {
  return {
    kind: 'word',
    value,
  }
}

function fun(value: string, nodes: ValueAstNode[]): ValueFunctionNode {
  return {
    kind: 'function',
    value: value,
    nodes,
  }
}

function separator(value: string): ValueSeparatorNode {
  return {
    kind: 'separator',
    value,
  }
}

export const enum ValueWalkAction {
  /** Continue walking, which is the default */
  Continue,

  /** Skip visiting the children of this node */
  Skip,

  /** Stop the walk entirely */
  Stop,
}

export function walk(
  ast: ValueAstNode[],
  visit: (
    node: ValueAstNode,
    utils: {
      parent: ValueParentNode
      replaceWith(newNode: ValueAstNode | ValueAstNode[]): void
    },
  ) => void | ValueWalkAction,
  parent: ValueParentNode = null,
): void {
  for (let i = 0; i < ast.length; i++) {
    let node = ast[i]
    if (!node) continue;
    let replacedNode = false
    let replacedNodeOffset = 0
    let status =
      visit(node, {
        parent,
        replaceWith(newNode) {
          if (replacedNode) return
          replacedNode = true

          if (Array.isArray(newNode)) {
            if (newNode.length === 0) {
              ast.splice(i, 1)
              replacedNodeOffset = 0
            } else if (newNode.length === 1) {
              const firstNode = newNode[0];
              if (firstNode) {
                ast[i] = firstNode;
              }
              replacedNodeOffset = 1
            } else {
              ast.splice(i, 1, ...newNode)
              replacedNodeOffset = newNode.length
            }
          } else {
            ast[i] = newNode
          }
        },
      }) ?? ValueWalkAction.Continue

    // We want to visit or skip the newly replaced node(s), which start at the
    // current index (i). By decrementing the index here, the next loop will
    // process this position (containing the replaced node) again.
    if (replacedNode) {
      if (status === ValueWalkAction.Continue) {
        i--
      } else {
        i += replacedNodeOffset - 1
      }
      continue
    }

    if (status === ValueWalkAction.Stop) {
      return
    }

    if (status === ValueWalkAction.Skip) {
      continue
    }

    if (node.kind === 'function') {
      walk(node.nodes, visit, node)
    }
  }
}

// Simplified parser implementation for our use cases
export function parse(input: string): ValueAstNode[] {
  const result: ValueAstNode[] = []
  let i = 0
  let currentWord = ''

  function pushCurrentWord() {
    if (currentWord) {
      result.push(word(currentWord))
      currentWord = ''
    }
  }

  function parseFunctionContent(): ValueAstNode[] {
    const nodes: ValueAstNode[] = []
    let content = ''
    let depth = 0

    while (i < input.length) {
      const char = input[i]

      if (char === '(' && depth >= 0) {
        depth++
        content += char
      } else if (char === ')' && depth > 0) {
        depth--
        if (depth === 0) {
          if (content) {
            nodes.push(...parse(content))
          }
          break
        } else {
          content += char
        }
      } else {
        content += char
      }
      i++
    }

    return nodes
  }

  while (i < input.length) {
    const char = input[i]
    if (!char) break;

    // Handle function calls like calc(), var(), etc.
    if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
      let funcName = ''
      while (i < input.length) {
        const currentChar = input[i];
        if (!currentChar) break;
        if (!((currentChar >= 'a' && currentChar <= 'z') ||
              (currentChar >= 'A' && currentChar <= 'Z') ||
              (currentChar >= '0' && currentChar <= '9') ||
              currentChar === '_' || currentChar === '-')) {
          break;
        }
        funcName += currentChar
        i++
      }

      if (i < input.length && input[i] === '(') {
        pushCurrentWord()
        i++ // skip opening paren
        const functionNodes = parseFunctionContent()
        result.push(fun(funcName, functionNodes))
        i++ // skip closing paren
        continue
      } else {
        currentWord += funcName
        continue
      }
    }

    // Handle separators
    if (char === ' ' || char === ',' || char === '/' || char === '\t' || char === '\n') {
      pushCurrentWord()
      if (char !== ' ' && char !== '\t' && char !== '\n') {
        result.push(separator(char))
      } else if (char === ' ') {
        result.push(separator(' '))
      }
    }
    // Handle regular characters
    else {
      currentWord += char
    }

    i++
  }

  pushCurrentWord()
  return result
}

export function toCss(ast: ValueAstNode[]): string {
  return ast.map(node => {
    switch (node.kind) {
      case 'word':
        return node.value
      case 'separator':
        return node.value
      case 'function':
        return `${node.value}(${toCss(node.nodes)})`
      default:
        never(node)
        return ''
    }
  }).join('')
}

function never(value: never): never {
  throw new Error(`Unexpected value: ${value}`)
}