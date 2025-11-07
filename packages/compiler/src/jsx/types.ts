/**
 * Core types for JSX transformation
 */

export interface JSXElement {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement: JSXClosingElement | null;
  children: JSXChild[];
}

export interface JSXOpeningElement {
  type: 'JSXOpeningElement';
  name: JSXElementName;
  attributes: JSXAttribute[];
  selfClosing: boolean;
}

export interface JSXClosingElement {
  type: 'JSXClosingElement';
  name: JSXElementName;
}

export type JSXElementName
  = | JSXIdentifier
    | JSXMemberExpression;

export interface JSXIdentifier {
  type: 'JSXIdentifier';
  name: string;
}

export interface JSXMemberExpression {
  type: 'JSXMemberExpression';
  object: JSXIdentifier | JSXMemberExpression;
  property: JSXIdentifier;
}

export interface JSXAttribute {
  type: 'JSXAttribute';
  name: JSXIdentifier;
  value: JSXAttributeValue | null;
}

export type JSXAttributeValue
  = | StringLiteral
    | JSXExpressionContainer;

export interface StringLiteral {
  type: 'StringLiteral';
  value: string;
}

export interface JSXExpressionContainer {
  type: 'JSXExpressionContainer';
  expression: Expression;
}

export type Expression
  = | Identifier
    | MemberExpression
    | TemplateLiteral
    | NumericLiteral
    | BooleanLiteral
    | NullLiteral;

export interface Identifier {
  type: 'Identifier';
  name: string;
}

export interface MemberExpression {
  type: 'MemberExpression';
  object: Expression;
  property: Identifier;
}

export interface TemplateLiteral {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

export interface TemplateElement {
  type: 'TemplateElement';
  value: {
    raw: string;
    cooked: string;
  };
}

export interface NumericLiteral {
  type: 'NumericLiteral';
  value: number;
}

export interface BooleanLiteral {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface NullLiteral {
  type: 'NullLiteral';
}

export type JSXChild
  = | JSXElement
    | JSXText
    | JSXExpressionContainer;

export interface JSXText {
  type: 'JSXText';
  value: string;
}

/**
 * Transformation configuration
 */
export interface TransformConfig {
  /** Prefix for custom element names (default: 'media-') */
  elementPrefix?: string;
  /** Built-in HTML elements that should not be transformed */
  builtInElements?: Set<string>;
}

/**
 * Transformation result
 */
export interface TransformResult {
  /** Transformed HTML string */
  html: string;
  /** Extracted class names for CSS generation */
  classNames: Set<string>;
}
