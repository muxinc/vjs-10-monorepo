declare module 'postcss-value-parser' {
  export interface Node {
    type: string;
    value: string;
    sourceIndex: number;
    nodes?: Node[];
  }

  export interface FunctionNode extends Node {
    type: 'function';
  }

  export interface ParsedValue {
    nodes: Node[];
    walk(callback: (node: Node) => void): void;
    toString(): string;
  }

  export interface ValueParser {
    (value: string): ParsedValue;
    stringify(nodes: Node | Node[]): string;
  }

  const valueParser: ValueParser;
  export default valueParser;
}
