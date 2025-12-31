import React, { useEffect, useCallback } from 'react';
import Quill from 'quill';
import katex from 'katex';
import 'quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import 'mathlive';

// Global setup
if (typeof window !== 'undefined') {
  window.katex = katex;
}

// Import custom blots and icons
import { registerCustomBlots } from './blots';
import { registerCustomIcons } from './constants/icons';

// Import hooks
import { useQuillInstance } from './hooks/useQuillInstance';
import { useMathKeyboard } from './hooks/useMathKeyboard';
import { useEditorState } from './hooks/useEditorState';
import { useLatexOperations } from './hooks/useLatexOperations';

// Import components
import { TableModal } from './components/TableModal';
import { EquationBar } from './components/EquationBar';

// Import types
import type { SmartEditorProps } from './types/editor.types';

// Import styles
import { editorStyles } from './styles/editorStyles';

// Import utilities
import { generateTableHTML } from './utils/tableGenerator';

// Register custom components
registerCustomBlots();
registerCustomIcons();

// Global types for MathLive
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'virtual-keyboard-mode'?: string;
      };
    }
  }
}

export const SmartEditor: React.FC<SmartEditorProps> = ({
  value,
  onChange,
  minHeight = 150,
  maxHeight = 500,
  placeholder = 'Type something...',
  readOnly = false,
}) => {
  // Initialize all hooks
  const {
    tableSettings,
    isTableModalOpen,
    mathFieldConfig,
    activeMathTab,
    isEquationBarOpen,
    setActiveMathTab,
    setBlockMode,
    openTableModal,
    closeTableModal,
    openEquationBar,
    closeEquationBar,
    updateTableSetting,
    updateMathFieldConfig,
    isBlockModeRef,
  } = useEditorState();

  const {
    editorRef,
    quillInstance,
    isEditorFocused,
    getLastActiveCell,
  } = useQuillInstance(
    { value, onChange, minHeight, maxHeight, placeholder, readOnly },
    openEquationBar,
    openTableModal
  );

  const {
    mathFieldRef,
    keyboardGeometry,
    openMathField,
    closeMathField,
    setMathFieldValue,
    getMathFieldValue,
    executeMathFieldCommand,
  } = useMathKeyboard();

  const {
    addNewLine,
    updateMathBlot,
    insertMathIntoCell,
    insertMathAtSelection,
  } = useLatexOperations();

  // Handle value changes from parent
  useEffect(() => {
    if (!quillInstance.current || !value) return;

    const quill = quillInstance.current;
    const currentHTML = quill.root.innerHTML;

    if (typeof value === 'string' && currentHTML === value) return;

    if (typeof value === 'string') {
      // Handle HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      quill.root.innerHTML = value;
    } else {
      // Handle Delta content
      quill.setContents(value, 'silent');
    }
  }, [value, quillInstance]);

  // Insert table into editor
  const handleInsertTable = useCallback(() => {
    const quill = quillInstance.current;
    if (!quill) return;

    const tableHTML = generateTableHTML(tableSettings);
    const range = quill.getSelection(true) || { index: quill.getLength() };

    // Insert table widget
    quill.insertEmbed(range.index, 'table-widget', tableHTML, Quill.sources.USER);
    quill.insertText(range.index + 1, '\n', Quill.sources.USER);

    // Move selection after table
    setTimeout(() => {
      quill.setSelection(range.index + 2, Quill.sources.SILENT);
    }, 10);

    closeTableModal();
  }, [quillInstance, tableSettings, closeTableModal]);

  // Insert math symbol
  const handleInsertSymbol = useCallback((latex: string) => {
    executeMathFieldCommand(['insert', latex]);
  }, [executeMathFieldCommand]);

  // Wrap selection with symbol
  const handleWrapSymbol = useCallback((latex: string) => {
    executeMathFieldCommand(['insert', latex + '{#?}']);
  }, [executeMathFieldCommand]);

  // Add new line in aligned environment
  const handleAddNewLine = useCallback(() => {
    const currentLatex = getMathFieldValue();
    const newLatex = addNewLine(currentLatex, mathFieldConfig.isBlockMode);
    
    if (newLatex !== currentLatex) {
      setMathFieldValue(newLatex);
      
      // Move cursor to placeholder
      requestAnimationFrame(() => {
        executeMathFieldCommand('moveToMathFieldEnd');
        executeMathFieldCommand('moveToPreviousPlaceholder');
      });
    } else {
      executeMathFieldCommand(['insert', '\\\\']);
    }
  }, [getMathFieldValue, addNewLine, mathFieldConfig.isBlockMode, setMathFieldValue, executeMathFieldCommand]);

  // Insert math into editor
  const handleInsertMath = useCallback(() => {
    const latex = getMathFieldValue().trim();
    if (!latex) {
      closeEquationBar();
      closeMathField();
      return;
    }

    const quill = quillInstance.current;
    const isBlockMode = mathFieldConfig.isBlockMode;

    // 1. Edit existing math blot
    if (mathFieldConfig.editNode) {
      const success = updateMathBlot(quill, mathFieldConfig.editNode, latex, isBlockMode);
      if (success) {
        closeEquationBar();
        closeMathField();
        updateMathFieldConfig({ editNode: null });
        return;
      }
    }

    // 2. Insert into active table cell
    const activeCell = getLastActiveCell();
    if (activeCell && document.body.contains(activeCell)) {
      const success = insertMathIntoCell(activeCell, latex, isBlockMode, onChange);
      if (success) {
        closeEquationBar();
        closeMathField();
        return;
      }
    }

    // 3. Insert at current selection
    insertMathAtSelection(quill, latex, isBlockMode);
    
    closeEquationBar();
    closeMathField();
  }, [
    getMathFieldValue,
    mathFieldConfig,
    quillInstance,
    getLastActiveCell,
    onChange,
    updateMathBlot,
    insertMathIntoCell,
    insertMathAtSelection,
    closeEquationBar,
    closeMathField,
    updateMathFieldConfig,
  ]);

  // Handle keyboard shortcuts in math field
  useEffect(() => {
    const handleKeydown = (evt: KeyboardEvent) => {
      if (evt.key === 'Enter') {
        evt.preventDefault();
        evt.stopPropagation();
        
        if (evt.shiftKey) {
          handleAddNewLine();
        } else {
          handleInsertMath();
        }
      }
    };

    const mathField = mathFieldRef.current;
    if (mathField) {
      mathField.addEventListener('keydown', handleKeydown);
      return () => mathField.removeEventListener('keydown', handleKeydown);
    }
  }, [mathFieldRef, handleAddNewLine, handleInsertMath]);

  // Open equation bar with initial value
  useEffect(() => {
    if (isEquationBarOpen && mathFieldConfig.value) {
      openMathField(mathFieldConfig.value);
    }
  }, [isEquationBarOpen, mathFieldConfig.value, openMathField]);

  // Sync block mode ref with state
  useEffect(() => {
    isBlockModeRef.current = mathFieldConfig.isBlockMode;
  }, [mathFieldConfig.isBlockMode, isBlockModeRef]);

  return (
    <div className={`smart-editor-wrapper ${isEditorFocused ? 'focused' : ''} ${readOnly ? 'read-only' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />

      <div className="smart-editor-area">
        <div
          className="smart-editor-container"
          ref={editorRef}
          style={{
            minHeight: readOnly ? 'auto' : minHeight,
            maxHeight: readOnly ? 'auto' : maxHeight,
          }}
        />

        <TableModal
          isOpen={isTableModalOpen}
          settings={tableSettings}
          onClose={closeTableModal}
          onInsert={handleInsertTable}
          onSettingChange={updateTableSetting}
        />
      </div>

      <EquationBar
        isOpen={isEquationBarOpen && !readOnly}
        activeTab={activeMathTab}
        isBlockMode={mathFieldConfig.isBlockMode}
        keyboardHeight={keyboardGeometry.height}
        mathFieldRef={mathFieldRef}
        onTabChange={setActiveMathTab}
        onBlockModeChange={setBlockMode}
        onInsertSymbol={handleInsertSymbol}
        onWrapSymbol={handleWrapSymbol}
        onAddNewLine={handleAddNewLine}
        onClose={() => {
          closeEquationBar();
          closeMathField();
        }}
        onInsert={handleInsertMath}
      />
    </div>
  );
};

export default SmartEditor;
