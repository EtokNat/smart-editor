import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import Quill from 'quill';
import { getToolbarOptions, TOOLBAR_HANDLERS } from '../constants/icons';
import { QUILL_MODULES_CONFIG } from '../constants/editorConfig';
import { createPasteHandler } from '../utils/clipboardHandler';
import type { SmartEditorProps, EditorInstance } from '../types/editor.types';

export const useQuillInstance = (
  props: SmartEditorProps,
  openMathBar: (isBlock: boolean, node: HTMLElement | null) => void,
  openTableModal: () => void
) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const lastActiveCellRef = useRef<HTMLElement | null>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Initialize Quill
  useLayoutEffect(() => {
    if (!editorRef.current || quillInstance.current) return;

    const { readOnly, placeholder } = props;

    // Register toolbar handlers
    const handlers = {
      undo: () => quillInstance.current?.history.undo(),
      redo: () => quillInstance.current?.history.redo(),
      inlineMath: TOOLBAR_HANDLERS.inlineMath(openMathBar),
      blockMath: TOOLBAR_HANDLERS.blockMath(openMathBar),
      table: TOOLBAR_HANDLERS.table(openTableModal),
    };

    const toolbarOptions = getToolbarOptions(readOnly || false, handlers);

    // Create Quill instance
    quillInstance.current = new Quill(editorRef.current, {
      theme: readOnly ? 'bubble' : 'snow',
      readOnly: readOnly || false,
      modules: {
        ...QUILL_MODULES_CONFIG,
        toolbar: toolbarOptions,
      },
      placeholder: readOnly ? '' : placeholder,
    });

    const quill = quillInstance.current;

    // Set up table cell tracking
    setupTableCellTracking(quill, lastActiveCellRef);

    // Set up paste handler
    const pasteHandler = createPasteHandler(quill, readOnly || false, props.onChange);
    editorRef.current.addEventListener('paste', pasteHandler, { capture: true });

    // Set up change handlers
    quill.on('text-change', (delta, oldDelta, source) => {
      if (!readOnly && source === 'user' && props.onChange) {
        props.onChange(quill.root.innerHTML);
      }
    });

    // Handle table cell input events
    quill.root.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'TD' || target.tagName === 'TH') && props.onChange) {
        props.onChange(quill.root.innerHTML);
      }
    });

    // Handle selection changes
    quill.on('selection-change', (range) => {
      setIsEditorFocused(!!range);
    });

    // Set up double-click to edit math
    quill.root.addEventListener('dblclick', (evt) => {
      if (readOnly) return;

      let target = evt.target as HTMLElement;
      while (target && target !== quill.root) {
        if (target.classList.contains('ql-block-math')) {
          openMathBar(true, target);
          return;
        }
        if (target.classList.contains('ql-inline-math')) {
          openMathBar(false, target);
          return;
        }
        target = target.parentNode as HTMLElement;
      }
    });

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('paste', pasteHandler, { capture: true });
      }
      quillInstance.current = null;
    };
  }, [props.readOnly, props.placeholder]);

  // Set up table cell tracking
  const setupTableCellTracking = (quill: Quill, cellRef: React.MutableRefObject<HTMLElement | null>) => {
    quill.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th');
      if (cell) {
        cellRef.current = cell as HTMLElement;
      } else {
        if (target === quill.root || target.closest('p') || target.closest('div')) {
          if (!target.classList.contains('ql-inline-math') && !target.classList.contains('ql-block-math')) {
            cellRef.current = null;
          }
        }
      }
    });

    quill.root.addEventListener('keyup', (e) => {
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
        const cell = (el as Element).closest('td, th');
        if (cell) cellRef.current = cell as HTMLElement;
      }
    });
  };

  // Get editor instance
  const getEditorInstance = useCallback((): EditorInstance => ({
    quill: quillInstance.current,
    container: editorRef.current,
  }), []);

  // Get last active cell
  const getLastActiveCell = useCallback((): HTMLElement | null => {
    return lastActiveCellRef.current;
  }, []);

  return {
    editorRef,
    quillInstance,
    isEditorFocused,
    setIsEditorFocused,
    getEditorInstance,
    getLastActiveCell,
  };
};
