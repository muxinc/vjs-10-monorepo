type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Alignment = 'start' | 'end';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Prettify<Side | AlignedPlacement>;
export type Strategy = 'absolute' | 'fixed';
export type Axis = 'x' | 'y';
export type Coords = { [key in Axis]: number };
export type Length = 'width' | 'height';
export type Dimensions = { [key in Length]: number };
export type SideObject = { [key in Side]: number };
export type Rect = Prettify<Coords & Dimensions>;
export type Padding = number | Prettify<Partial<SideObject>>;
export type ClientRectObject = Prettify<Rect & SideObject>;

export interface ElementRects {
  reference: Rect;
  floating: Rect;
}

type Promisable<T> = T | Promise<T>;

export interface Point {
  x: number;
  y: number;
}

export interface PositionElements {
  reference: ReferenceElement;
  floating: FloatingElement;
  strategy: Strategy;
}

export interface PositionRects {
  reference: Rect;
  floating: Rect;
}

export interface ComputePositionConfig {
  /**
   * Object to interface with the current platform.
   */
  platform?: Platform;
  /**
   * Where to place the floating element relative to the reference element.
   */
  placement?: Placement;
  /**
   * The strategy to use when positioning the floating element.
   */
  strategy?: Strategy;
  /**
   * Array of middleware objects to modify the positioning or provide data for
   * rendering.
   */
  middleware?: Array<Middleware | null | undefined | false>;
}

export interface ComputePositionReturn extends Coords {
  /**
   * The final chosen placement of the floating element.
   */
  placement: Placement;
  /**
   * The strategy used to position the floating element.
   */
  strategy: Strategy;
  /**
   * Object containing data returned from all middleware, keyed by their name.
   */
  middlewareData: MiddlewareData;
}

export type Positions = PositionElements & {
  placement?: Placement;
};

export interface Middleware {
  name: string;
  options?: any;
  fn: (state: MiddlewareState) => Promisable<MiddlewareReturn>;
}

export type ReferenceElement = any;
export type FloatingElement = any;

export interface Elements {
  reference: ReferenceElement;
  floating: FloatingElement;
}

export interface MiddlewareState extends Coords {
  initialPlacement: Placement;
  placement: Placement;
  strategy: Strategy;
  middlewareData: MiddlewareData;
  elements: Elements;
  rects: ElementRects;
  platform: Platform;
}

export interface MiddlewareReturn extends Partial<Coords> {
  data?: {
    [key: string]: any;
  };
  reset?:
    | boolean
    | {
      placement?: Placement;
      rects?: boolean | ElementRects;
    };
}

export interface MiddlewareData {
  [key: string]: any;
  arrow?: Partial<Coords> & {
    centerOffset: number;
    alignmentOffset?: number;
  };
  offset?: Coords & { placement: Placement };
  shift?: Coords & {
    enabled: { [key in Axis]: boolean };
  };
}

export interface Platform {
  // Required
  getElementRects: (args: {
    reference: ReferenceElement;
    floating: FloatingElement;
    strategy: Strategy;
  }) => Promisable<ElementRects>;
  getClippingRect?: (args: {
    element: any;
    boundary: Boundary;
    rootBoundary: RootBoundary;
    strategy: Strategy;
  }) => Promisable<Rect>;
  getDimensions?: (element: any) => Promisable<Dimensions>;
}

export type Boundary = any;
export type RootBoundary = 'viewport' | 'document' | Rect;
