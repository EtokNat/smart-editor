export const DEFAULT_EDITOR_CONFIG = {
  minHeight: 150,
  maxHeight: 500,
  placeholder: 'Type something...',
  readOnly: false,
  theme: 'snow',
} as const;

export const QUILL_MODULES_CONFIG = {
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
  clipboard: {
    matchVisual: false,
  },
} as const;

export const KATEX_CONFIG = {
  displayMode: true,
  throwOnError: false,
  trust: true,
  macros: {
    '\\RR': '\\mathbb{R}',
    '\\ZZ': '\\mathbb{Z}',
    '\\NN': '\\mathbb{N}',
    '\\QQ': '\\mathbb{Q}',
    '\\CC': '\\mathbb{C}',
  },
} as const;

export const TABLE_DEFAULTS = {
  rows: 3,
  cols: 3,
  hasHeader: true,
  isBordered: true,
  isStriped: false,
  isCompact: false,
  widthStrategy: 'full' as const,
} as const;
