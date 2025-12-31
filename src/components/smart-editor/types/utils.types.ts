export interface LatexMatch {
  latex: string;
  type: 'inline' | 'block';
  start: number;
  end: number;
}

export interface TableGenerationOptions {
  rows: number;
  cols: number;
  hasHeader: boolean;
  isStriped: boolean;
  isBordered: boolean;
  isCompact: boolean;
  widthStrategy: 'full' | 'fit' | 'scroll';
}

export interface DeltaOperation {
  insert?: string | object;
  attributes?: any;
  delete?: number;
  retain?: number;
}

export interface SelectionRange {
  index: number;
  length: number;
}
