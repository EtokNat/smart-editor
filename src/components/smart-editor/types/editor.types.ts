import { Quill } from 'quill';
import React from 'react';

export interface SmartEditorProps {
  /** HTML string or Delta object representing editor content */
  value: any;
  /** Callback when content changes */
  onChange: (content: any) => void;
  /** Minimum height of editor in pixels */
  minHeight?: number;
  /** Maximum height of editor in pixels */
  maxHeight?: number;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether editor is read-only */
  readOnly?: boolean;
  /** Custom toolbar configuration */
  toolbarConfig?: ToolbarConfig;
  /** Custom theme configuration */
  themeConfig?: ThemeConfig;
}

export interface ToolbarConfig {
  /** Show/hide toolbar sections */
  sections?: {
    formatting?: boolean;
    lists?: boolean;
    alignment?: boolean;
    media?: boolean;
    math?: boolean;
    tables?: boolean;
  };
  /** Custom toolbar handlers */
  handlers?: {
    [key: string]: () => void;
  };
}

export interface ThemeConfig {
  /** Primary color for editor */
  primaryColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Font family */
  fontFamily?: string;
}

export interface EditorInstance {
  quill: Quill | null;
  container: HTMLDivElement | null;
}

export interface MathFieldConfig {
  /** Use block math (display mode) or inline math */
  isBlockMode: boolean;
  /** Current LaTeX value */
  value: string;
  /** Node being edited (if any) */
  editNode: HTMLElement | null;
}

export interface TableSettings {
  rows: number;
  cols: number;
  hasHeader: boolean;
  isStriped: boolean;
  isBordered: boolean;
  isCompact: boolean;
  widthStrategy: 'full' | 'fit' | 'scroll';
}

export interface KeyboardGeometry {
  height: number;
  width: number;
  visible: boolean;
}

export interface ClipboardMathData {
  text: string;
  hasMath: boolean;
  parsedContent: any[];
}
