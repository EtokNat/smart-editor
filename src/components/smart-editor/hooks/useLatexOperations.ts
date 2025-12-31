import { useCallback } from 'react';
import Quill from 'quill';
import katex from 'katex';
import { insertContentAtSelection } from '../utils/deltaOperations';
import { NEW_LINE_TEMPLATES } from '../constants/mathSymbols';

export const useLatexOperations = () => {
  /**
   * Inserts a new line in aligned environment
   */
  const addNewLine = useCallback((latex: string, isBlockMode: boolean): string => {
    const trimmed = latex.trim();
    let newLatex = '';

    if (trimmed.startsWith('\\begin{aligned}')) {
      newLatex = NEW_LINE_TEMPLATES.aligned(latex);
    } else if (
      trimmed.startsWith('\\begin{cases}') ||
      trimmed.startsWith('\\begin{pmatrix}') ||
      trimmed.startsWith('\\begin{matrix}')
    ) {
      newLatex = NEW_LINE_TEMPLATES.matrix(latex);
    } else {
      let alignedLatex = latex;
      if (alignedLatex.indexOf('=') !== -1) {
        alignedLatex = alignedLatex.replace('=', '&=');
      }
      newLatex = `\\begin{aligned}${alignedLatex} \\\\ & #? \\end{aligned}`;
    }

    return newLatex;
  }, []);

  /**
   * Updates an existing math blot
   */
  const updateMathBlot = useCallback((
    quill: Quill | null,
    editNode: HTMLElement | null,
    latex: string,
    isBlockMode: boolean
  ): boolean => {
    if (!quill || !editNode) return false;

    const blot = Quill.find(editNode);
    if (blot) {
      const index = quill.getIndex(blot);
      quill.deleteText(index, 1);
      quill.insertEmbed(index, isBlockMode ? 'blockMath' : 'inlineMath', latex, Quill.sources.USER);
      return true;
    }

    // Fallback: direct DOM update
    editNode.setAttribute('data-value', latex);
    try {
      katex.render(latex, editNode, {
        displayMode: isBlockMode,
        throwOnError: false,
      });
      return true;
    } catch (error) {
      console.error('Failed to update math blot:', error);
      return false;
    }
  }, []);

  /**
   * Inserts math into a table cell
   */
  const insertMathIntoCell = useCallback((
    cell: HTMLElement,
    latex: string,
    isBlockMode: boolean,
    onChange?: (content: any) => void
  ): boolean => {
    if (!document.body.contains(cell)) return false;

    const span = document.createElement(isBlockMode ? 'div' : 'span');
    span.setAttribute('class', isBlockMode ? 'ql-block-math' : 'ql-inline-math');
    span.setAttribute('data-value', latex);
    span.setAttribute('contenteditable', 'false');
    
    try {
      katex.render(latex, span, {
        displayMode: isBlockMode,
        throwOnError: false,
      });
      
      cell.appendChild(span);

      // Restore focus
      const range = document.createRange();
      range.setStartAfter(span);
      range.setEndAfter(span);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      // Trigger onChange
      if (onChange) {
        const editorContent = cell.closest('.ql-editor')?.innerHTML;
        if (editorContent) {
          onChange(editorContent);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to insert math into cell:', error);
      return false;
    }
  }, []);

  /**
   * Inserts math at current selection
   */
  const insertMathAtSelection = useCallback((
    quill: Quill | null,
    latex: string,
    isBlockMode: boolean,
    source: 'user' | 'api' | 'silent' = 'user'
  ): void => {
    if (!quill || !latex.trim()) return;

    insertContentAtSelection(quill, latex.trim(), isBlockMode, source);
  }, []);

  return {
    addNewLine,
    updateMathBlot,
    insertMathIntoCell,
    insertMathAtSelection,
  };
};
