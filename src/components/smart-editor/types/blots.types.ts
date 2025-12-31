export interface TableWidgetValue {
  html: string;
  settings?: {
    rows: number;
    cols: number;
  };
}

export interface MathBlotValue {
  latex: string;
  displayMode: boolean;
}

export interface CustomBlotOptions {
  blotName: string;
  className: string;
  tagName: string;
}

export type BlotType = 'table-widget' | 'inlineMath' | 'blockMath';
