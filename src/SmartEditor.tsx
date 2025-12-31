import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'mathlive';

// Import the extracted types and styles
import type { SmartEditorProps } from './components/smart-editor/types';
import { editorStyles } from './components/smart-editor/styles/editorStyles';

// --- TSX TYPES ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'virtual-keyboard-mode'?: string; 
      };
    }
  }
  interface Window {
    mathVirtualKeyboard?: any;
    katex: any;
  }
}

// 0. ATTACH KATEX GLOBALLY (Required for Quill Blots)
if (typeof window !== 'undefined') {
  window.katex = katex;
}

// --- 1. SETUP ICONS & BLOTS ---

const Icons = Quill.import('ui/icons');

// A. Math Icons
Icons['inlineMath'] = `<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M3,3 L15,3 L9,9 L15,15 L3,15"></path></svg>`;
Icons['blockMath'] = `<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M3,5 L15,5 M3,9 L15,9 M3,13 L15,13 M9,2 L9,16"></path></svg>`;

// B. New Feature Icons
Icons['table'] = `<svg viewBox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect><path class="ql-stroke" d="M3,9 L15,9 M9,3 L9,15"></path></svg>`;
Icons['undo'] = `<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path></svg>`;
Icons['redo'] = `<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>`;

// C. Register Custom Blots
const Embed = Quill.import('blots/embed'); 
const BlockEmbed = Quill.import('blots/block/embed'); 

// *** SAFETY FIX: Import Delta robustly ***
const Delta = Quill.import('delta') || Quill.import('parchment').Delta;

// 1. Table Widget Blot (New Feature)
class TableWidget extends BlockEmbed {
  static create(value: string) {
    const node = super.create();
    if (typeof value === 'string' && value.includes('<table')) {
        node.innerHTML = value;
    } else {
        node.innerHTML = `<div class="table-wrapper"><table class="custom-table bordered" style="--col-count: 3"><tbody><tr><td>Cell</td></tr></tbody></table></div>`;
    }
    node.setAttribute('contenteditable', 'false');
    return node;
  }

  static value(node: HTMLElement) {
    return node.innerHTML;
  }
}
TableWidget.blotName = 'table-widget';
TableWidget.tagName = 'div';
TableWidget.className = 'custom-widget-container';
Quill.register(TableWidget);

// 2. Custom INLINE Blot 
if (!Quill.imports['blots/inlineMath']) {
    class InlineMathBlot extends Embed {
      static create(value: string) {
        const node = super.create();
        node.setAttribute('data-value', value);
        node.setAttribute('contenteditable', 'false');
        
        katex.render(value, node, { 
            displayMode: false, 
            throwOnError: false 
        });
        return node;
      }
      static value(node: HTMLElement) {
        return node.getAttribute('data-value');
      }
    }
    InlineMathBlot.blotName = 'inlineMath';
    InlineMathBlot.className = 'ql-inline-math'; 
    InlineMathBlot.tagName = 'span'; 
    Quill.register(InlineMathBlot);
}

// 3. Custom BLOCK Blot
if (!Quill.imports['blots/blockMath']) {
    class BlockMathBlot extends BlockEmbed {
      static create(value: string) {
        const node = super.create();
        node.setAttribute('data-value', value);
        node.setAttribute('contenteditable', 'false');
        
        katex.render(value, node, { 
            displayMode: true, 
            throwOnError: false 
        });
        return node;
      }
      static value(node: HTMLElement) {
        return node.getAttribute('data-value');
      }
    }
    BlockMathBlot.blotName = 'blockMath';
    BlockMathBlot.className = 'ql-block-math';
    BlockMathBlot.tagName = 'div';
    Quill.register(BlockMathBlot);
}

// --- 4. COMPONENT ---
export const SmartEditor = ({ 
  value, 
  onChange, 
  minHeight = 150, 
  maxHeight = 500, 
  placeholder = 'Type something...', 
  readOnly = false 
}: SmartEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const mathFieldRef = useRef<any>(null);
  const editNodeRef = useRef<HTMLElement | null>(null);
  const lastActiveCellRef = useRef<HTMLElement | null>(null); // New: Track table cell focus
  
  const isBlockModeRef = useRef(false);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false); // New: Table Modal
  const [activeTab, setActiveTab] = useState('basic');
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  
  // Table Settings State (New)
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [isStriped, setIsStriped] = useState(false);
  const [isBordered, setIsBordered] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [widthStrategy, setWidthStrategy] = useState<'full' | 'fit' | 'scroll'>('full');

  // Track Keyboard Height
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --- HELPER TO SYNC STATE AND REF ---
  const setBlockMode = (val: boolean) => {
      setIsBlockMode(val);
      isBlockModeRef.current = val;
      setTimeout(() => {
          if (mathFieldRef.current) mathFieldRef.current.focus();
      }, 0);
  };

  // --- EFFECT: LISTEN FOR MATHLIVE VIRTUAL KEYBOARD ---
  useEffect(() => {
    const handleGeometryChange = () => {
        if (window.mathVirtualKeyboard) {
            const rect = window.mathVirtualKeyboard.boundingRect;
            setKeyboardHeight(rect.height);
        }
    };

    if (window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.addEventListener('geometrychange', handleGeometryChange);
        handleGeometryChange();
    }

    return () => {
        if (window.mathVirtualKeyboard) {
            window.mathVirtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
        }
    };
  }, []);

  // --- SETUP QUILL ---
  useLayoutEffect(() => {
    if (editorRef.current && !quillInstance.current) {
        
        // Toolbar with Undo/Redo/Table (New)
        const toolbarOptions = [
            ['undo', 'redo'], 
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], 
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['table'],
            ['inlineMath', 'blockMath']
        ];

        quillInstance.current = new Quill(editorRef.current, {
            theme: readOnly ? 'bubble' : 'snow',
            readOnly: readOnly,
            modules: { 
                // New: History Module for Undo/Redo
                history: {
                    delay: 2000,
                    maxStack: 500,
                    userOnly: true 
                },
                toolbar: readOnly ? false : {
                    container: toolbarOptions,
                    handlers: {
                        'inlineMath': () => openMathBar(false, null),
                        'blockMath': () => openMathBar(true, null),
                        'table': () => setIsTableModalOpen(true),
                        'undo': () => quillInstance.current?.history.undo(),
                        'redo': () => quillInstance.current?.history.redo()
                    }
                },
                clipboard: { matchVisual: false }
            },
            placeholder: readOnly ? '' : placeholder
        });
        
        const quill = quillInstance.current;

        // --- SMART CELL SELECTION (New Feature) ---
        // Listener to track if we are inside a table cell
        quill.root.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const cell = target.closest('td, th');
            if (cell) {
                lastActiveCellRef.current = cell as HTMLElement;
            } else {
                // If clicking main editor but NOT a math blot, clear cell ref
                if (target === quill.root || target.closest('p') || target.closest('div')) {
                     if (!target.classList.contains('ql-inline-math') && !target.classList.contains('ql-block-math')) {
                         lastActiveCellRef.current = null;
                     }
                }
            }
        });

        quill.root.addEventListener('keyup', (e) => {
            const sel = window.getSelection();
            if (sel?.anchorNode) {
                const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
                const cell = (el as Element).closest('td, th');
                if (cell) lastActiveCellRef.current = cell as HTMLElement;
            }
        });

        // --- NATIVE PASTE INTERCEPTOR (Preserved Robust Logic) ---
        const handlePaste = (e: ClipboardEvent) => {
            if (readOnly) return; 
            
            const clipboardData = e.clipboardData;
            const text = clipboardData?.getData('text/plain');

            // Regex for LaTeX delimiters
            const hasMath = text && /(\$\$|\\\[|\\\(|\$)/.test(text);

            if (hasMath) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const ops: any[] = [];
                const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$[^\$\n]+\$))/g;
                const parts = text.split(regex);

                parts.forEach(part => {
                    if (!part) return;

                    if ((part.startsWith('$$') && part.endsWith('$$')) || 
                        (part.startsWith('\\[') && part.endsWith('\\]'))) {
                        
                        let clean = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
                        ops.push({ insert: { blockMath: clean.trim() } });
                        ops.push({ insert: '\n' }); 
                    }
                    else if ((part.startsWith('\\(') && part.endsWith('\\)')) || 
                             (part.startsWith('$') && part.endsWith('$'))) {
                        
                        let clean = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
                        ops.push({ insert: { inlineMath: clean.trim() } });
                    }
                    else {
                        ops.push({ insert: part });
                    }
                });

                const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
                const delta = new Delta()
                    .retain(range.index)
                    .delete(range.length)
                    .concat(new Delta(ops));
                
                quill.updateContents(delta, Quill.sources.USER);
                
                setTimeout(() => {
                    quill.setSelection(range.index + ops.length + 1, Quill.sources.SILENT);
                    quill.scrollIntoView();
                }, 10);
            }
        };

        editorRef.current.addEventListener('paste', handlePaste, { capture: true });

        // --- CHANGE HANDLING ---
        quill.on('text-change', (delta, oldDelta, source) => {
            if (!readOnly && source === 'user') onChange(quill.root.innerHTML);
        });
        
        // Also listen for input events in table cells (contenteditable)
        quill.root.addEventListener('input', (e) => {
             const target = e.target as HTMLElement;
             if (target && (target.tagName === 'TD' || target.tagName === 'TH')) onChange(quill.root.innerHTML);
        });

        quillInstance.current.on('selection-change', (range) => {
            setIsEditorFocused(!!range);
        });

        // --- DOUBLE CLICK TO EDIT MATH ---
        quillInstance.current.root.addEventListener('dblclick', (evt) => {
            if (readOnly) return; 
            let target = evt.target as HTMLElement;
            while (target && target !== quillInstance.current?.root) {
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
    }
  }, [readOnly]);

  // --- DATA SYNC: LOAD EXTERNAL VALUES ---
  useEffect(() => {
    if (quillInstance.current && value) {
        const quill = quillInstance.current;
        
        let contentToLoad = value;
        if (typeof value === 'string' && value.trim().startsWith('{"ops":')) {
            try {
                contentToLoad = JSON.parse(value);
            } catch (e) {
                console.error("Failed to parse legacy JSON content", e);
            }
        }

        const currentHTML = quill.root.innerHTML;
        if (typeof contentToLoad === 'string' && currentHTML === contentToLoad) return; 

        if (typeof contentToLoad === 'string') {
             const initialDelta = quill.clipboard.convert({ html: contentToLoad });
             
             // --- LATEX HYDRATION LOGIC (Preserved) ---
             const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$[^\$\n]+\$))/g;
             const refinedOps: any[] = [];

             initialDelta.ops.forEach((op: any) => {
                 if (typeof op.insert === 'string' && regex.test(op.insert)) {
                     const parts = op.insert.split(regex);
                     
                     parts.forEach((part: string) => {
                         if (!part) return;

                         if ((part.startsWith('$$') && part.endsWith('$$')) || 
                             (part.startsWith('\\[') && part.endsWith('\\]'))) {
                             
                             let clean = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
                             refinedOps.push({ insert: { blockMath: clean.trim() } });
                             refinedOps.push({ insert: '\n' }); 
                         }
                         else if ((part.startsWith('\\(') && part.endsWith('\\)')) || 
                                  (part.startsWith('$') && part.endsWith('$'))) {
                             
                             let clean = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
                             refinedOps.push({ insert: { inlineMath: clean.trim() } });
                         }
                         else {
                             refinedOps.push({ insert: part, attributes: op.attributes });
                         }
                     });
                 } else {
                     refinedOps.push(op);
                 }
             });
             
             const hydratedDelta = new Delta(refinedOps);
             
             const currentContent = quill.getContents();
             if (currentContent.diff(hydratedDelta).length() > 0) {
                 quill.setContents(hydratedDelta, 'silent');
             }

        } else {
             const currentContent = quill.getContents();
             const incomingDelta = new Delta(contentToLoad);
             const diff = currentContent.diff(incomingDelta);
             if (diff.length() > 0) {
                 quill.setContents(incomingDelta, 'silent');
             }
        }
    } else if (quillInstance.current && !value) {
        if (quillInstance.current.getLength() > 1) {
             quillInstance.current.setText('');
        }
    }
  }, [value]);

  // --- ACTIONS ---

  const insertTable = () => {
      const quill = quillInstance.current;
      if (!quill) return;

      const classes = ['custom-table'];
      if (isBordered) classes.push('bordered');
      if (isStriped) classes.push('striped');
      if (isCompact) classes.push('compact');
      if (widthStrategy === 'fit') classes.push('fit-content');
      if (widthStrategy === 'scroll') classes.push('scrollable');

      let headerHTML = '';
      if (hasHeader) {
          let headerCols = '';
          for(let k=0; k<tableCols; k++) headerCols += `<th contenteditable="true">Header ${k+1}</th>`;
          headerHTML = `<thead><tr>${headerCols}</tr></thead>`;
      }

      let rowsHTML = '';
      for(let i=0; i<tableRows; i++) {
          let colsHTML = '';
          for(let j=0; j<tableCols; j++) colsHTML += `<td contenteditable="true"></td>`;
          rowsHTML += `<tr>${colsHTML}</tr>`;
      }

      const fullTableHTML = `<div class="table-wrapper"><table class="${classes.join(' ')}" style="--col-count: ${tableCols}">${headerHTML}<tbody>${rowsHTML}</tbody></table></div>`;

      const range = quill.getSelection(true) || { index: quill.getLength() };

      // Mark source as USER so Undo works for this action
      quill.insertEmbed(range.index, 'table-widget', fullTableHTML, Quill.sources.USER);
      quill.insertText(range.index + 1, '\n', Quill.sources.USER);

      setTimeout(() => {
        quill.setSelection(range.index + 2, Quill.sources.SILENT);
      }, 10);

      setIsTableModalOpen(false);
      // Reset defaults
      setTableRows(3); setTableCols(3); setWidthStrategy('full');
  };

  const openMathBar = (forceBlock: boolean, node: HTMLElement | null) => {
      editNodeRef.current = node;
      setBlockMode(forceBlock);
      setIsOpen(true);
      
      const val = node ? node.getAttribute('data-value') : '';
      setTimeout(() => {
          if (mathFieldRef.current) {
              mathFieldRef.current.setValue(val || '');
              mathFieldRef.current.focus();
          }
      }, 50);
  };

  const insertSym = (latex: string) => {
      const mf = mathFieldRef.current;
      if (mf) { mf.executeCommand(['insert', latex]); mf.focus(); }
  };

  const wrapSym = (latex: string) => {
      const mf = mathFieldRef.current;
      if (mf) { mf.executeCommand(['insert', latex + '{#?}']); mf.focus(); }
  };

  const addNewLine = () => {
      const mf = mathFieldRef.current;
      if (!mf) return;
      
      const latex = mf.getValue();
      const trimmed = latex.trim();
      let newLatex = '';

      if (trimmed.startsWith('\\begin{aligned}')) {
          const endTag = '\\end{aligned}';
          if (trimmed.endsWith(endTag)) {
              const content = trimmed.substring(0, trimmed.lastIndexOf(endTag));
              newLatex = `${content} \\\\ & #? ${endTag}`;
          }
      } 
      else if (trimmed.startsWith('\\begin{cases}') || trimmed.startsWith('\\begin{pmatrix}') || trimmed.startsWith('\\begin{matrix}')) {
          mf.executeCommand(['insert', '\\\\']);
          return;
      } 
      else {
          let alignedLatex = latex;
          if (alignedLatex.indexOf('=') !== -1) alignedLatex = alignedLatex.replace('=', '&=');
          newLatex = `\\begin{aligned}${alignedLatex} \\\\ & #? \\end{aligned}`;
      }

      if (newLatex) mf.setValue(newLatex);
      if (!isBlockModeRef.current) setBlockMode(true);

      requestAnimationFrame(() => {
          mf.focus();
          mf.executeCommand('moveToMathFieldEnd');
          mf.executeCommand('moveToPreviousPlaceholder');
      });
  };

  const insertMath = () => {
      const mf = mathFieldRef.current;
      const quill = quillInstance.current;
      if (!mf || !quill) return;

      const latex = mf.getValue();
      if (!latex) { setIsOpen(false); return; }

      const isBlock = isBlockModeRef.current;

      // 1. EDIT MODE: Update existing Node (Stable Logic)
      if (editNodeRef.current) {
          const blot = Quill.find(editNodeRef.current);
          if (blot) {
             const index = quill.getIndex(blot);
             quill.deleteText(index, 1);
             quill.insertEmbed(index, isBlock ? 'blockMath' : 'inlineMath', latex, Quill.sources.USER);
          } else {
             // Fallback if blot not found but node exists (rare)
             editNodeRef.current.setAttribute('data-value', latex);
             katex.render(latex, editNodeRef.current, {
                 displayMode: editNodeRef.current.classList.contains('ql-block-math'),
                 throwOnError: false
             });
          }
          setIsOpen(false); editNodeRef.current = null;
          return;
      }

      // 2. TABLE INSERTION: Insert directly into cell (New Feature Logic)
      const targetCell = lastActiveCellRef.current;
      if (targetCell && document.body.contains(targetCell)) {
          const span = document.createElement(isBlock ? 'div' : 'span');
          span.setAttribute('class', isBlock ? 'ql-block-math' : 'ql-inline-math');
          span.setAttribute('data-value', latex);
          span.setAttribute('contenteditable', 'false');
          katex.render(latex, span, { displayMode: isBlock, throwOnError: false });

          targetCell.appendChild(span);

          // Restore focus to that spot
          const range = document.createRange();
          range.setStartAfter(span);
          range.setEndAfter(span);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);

          onChange(quill.root.innerHTML);
          setIsOpen(false);
          return;
      }

      // 3. STANDARD INSERTION (Preserved Stable Cursor Logic)
      const range = quill.getSelection(true) || { index: quill.getLength() };
      quill.insertEmbed(range.index, isBlock ? 'blockMath' : 'inlineMath', latex, Quill.sources.USER);

      if (isBlock) {
          const contentAfter = quill.getContents(range.index + 1);
          const textAfter = quill.getText(range.index + 1, 10); 
          
          if (contentAfter.length() === 0 || textAfter.charAt(0) !== '\n') {
              quill.insertText(range.index + 1, '\n', Quill.sources.USER);
              setTimeout(() => {
                  quill.setSelection(range.index + 2, Quill.sources.USER);
                  setIsEditorFocused(true);
              }, 0);
          } else {
              const newlineIndex = textAfter.indexOf('\n');
              if (newlineIndex !== -1) {
                  setTimeout(() => {
                      quill.setSelection(range.index + 1 + newlineIndex + 1, Quill.sources.USER);
                      setIsEditorFocused(true);
                  }, 0);
              } else {
                  setTimeout(() => {
                      quill.setSelection(range.index + 1 + contentAfter.length(), Quill.sources.USER);
                      setIsEditorFocused(true);
                  }, 0);
              }
          }
      } else {
          setTimeout(() => {
              quill.setSelection(range.index + 1, Quill.sources.USER);
              setIsEditorFocused(true);
          }, 0);
      }
      
      setIsOpen(false);
  };

  const handleKeydown = useCallback((evt: any) => {
      if (evt.key === 'Enter') {
          evt.preventDefault();
          evt.stopPropagation();
          
          if (evt.shiftKey) addNewLine();
          else insertMath();
      }
  }, []);

  useEffect(() => {
      const mf = mathFieldRef.current;
      if (mf) {
          mf.addEventListener('keydown', handleKeydown);
          return () => mf.removeEventListener('keydown', handleKeydown);
      }
  }, [isOpen, handleKeydown]);

  return (
    
    <div className={`smart-editor-wrapper ${isEditorFocused ? 'focused' : ''} ${readOnly ? 'read-only' : ''}`}>
      <hl> i made it</hl>
        <style dangerouslySetInnerHTML={{__html: editorStyles}} />

        <div className="smart-editor-area">
            <div 
                className="smart-editor-container" 
                ref={editorRef}
                style={{ 
                    minHeight: readOnly ? 'auto' : minHeight,
                    maxHeight: readOnly ? 'auto' : maxHeight
                }}
            ></div>

            {/* NEW: Table Modal */}
            {isTableModalOpen && (
                <div className="editor-modal-overlay">
                    <div className="editor-modal">
                        <div className="modal-header">Insert Table</div>
                        <div className="modal-grid-row">
                            <div className="modal-field">
                                <label>Rows</label>
                                <input type="number" min="1" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value))} />
                            </div>
                            <div className="modal-field">
                                <label>Columns</label>
                                <input type="number" min="1" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value))} />
                            </div>
                        </div>

                        <div className="modal-field">
                            <label>Width Strategy</label>
                            <select value={widthStrategy} onChange={(e) => setWidthStrategy(e.target.value as any)}>
                                <option value="full">Full Width (100%) - Default</option>
                                <option value="fit">Fit to Content (Auto Width)</option>
                                <option value="scroll">Scrollable (Wide Data)</option>
                            </select>
                        </div>

                        <div className="modal-checkbox-group">
                            <label className="checkbox-label"><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> Header Row</label>
                            <label className="checkbox-label"><input type="checkbox" checked={isBordered} onChange={(e) => setIsBordered(e.target.checked)} /> Borders</label>
                            <label className="checkbox-label"><input type="checkbox" checked={isStriped} onChange={(e) => setIsStriped(e.target.checked)} /> Zebra Stripes</label>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-insert-flat" onClick={() => setIsTableModalOpen(false)} style={{border:'1px solid #ddd', color: '#555'}}>Cancel</button>
                            <button className="btn-confirm" onClick={insertTable}>Insert</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {isOpen && !readOnly && (
            <div 
                className="equation-bar" 
                style={{ bottom: `${keyboardHeight}px` }}
            >
                <div className="tab-row">
                    {['basic', 'calc', 'matrix', 'greek'].map(t => (
                        <button 
                            key={t} 
                            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                            onClick={() => setActiveTab(t)}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                    <div style={{flex:1}}></div>
                    <div className="mode-switch">
                        <div className={`mode-opt ${!isBlockMode?'active':''}`} onClick={()=>setBlockMode(false)}>Inline</div>
                        <div className={`mode-opt ${isBlockMode?'active':''}`} onClick={()=>setBlockMode(true)}>Block</div>
                    </div>
                </div>

                <div className="palette-grid">
                    {activeTab === 'basic' && <>
                        <button className="sym-btn" onClick={()=>insertSym('\\frac{#?}{#?}')}>x/y</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\sqrt{#?}')}>√</button>
                        <button className="sym-btn" onClick={()=>insertSym('#?^{2}')}>x²</button>
                        <button className="sym-btn" onClick={()=>insertSym('#?^{#?}')}>xⁿ</button>
                        <button className="sym-btn" onClick={()=>insertSym('(#?)')}>( )</button>
                        <button className="sym-btn" onClick={()=>insertSym('[#?]')}>[ ]</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\times')}>×</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\div')}>÷</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\pm')}>±</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\pi')}>π</button>
                        <button className="sym-btn" onClick={addNewLine} style={{gridColumn:'span 2', background:'#e6fcf5', color:'green', fontWeight:'bold', fontSize: '12px'}}>New Line ↵</button>
                    </>}
                    
                    {activeTab === 'calc' && <>
                        <button className="sym-btn" onClick={()=>insertSym('\\int')}>∫</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\int_{#?}^{#?}')}>∫ab</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\sum')}>∑</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\sum_{#?}^{#?}')}>∑ab</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\lim_{x \\to \\infty}')}>lim</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\frac{d}{dx}')}>d/dx</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\infty')}>∞</button>
                    </>}

                    {activeTab === 'matrix' && <>
                        <button className="sym-btn" onClick={()=>insertSym('\\begin{pmatrix} #? & #? \\\\ #? & #? \\end{pmatrix}')} style={{fontSize:12}}>Mat 2x2</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\begin{cases} #? & \\text{if } x > 0 \\\\ #? & \\text{otherwise} \\end{cases}')} style={{fontSize:12, gridColumn:'span 2'}}>Cases</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\vec{#?}')}>vec</button>
                        <button className="sym-btn" onClick={()=>wrapSym('\\mathbf')}>Bold</button>
                    </>}

                    {activeTab === 'greek' && <>
                        <button className="sym-btn" onClick={()=>insertSym('\\alpha')}>α</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\beta')}>β</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\gamma')}>γ</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\theta')}>θ</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\lambda')}>λ</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\Delta')}>Δ</button>
                        <button className="sym-btn" onClick={()=>insertSym('\\Omega')}>Ω</button>
                    </>}
                </div>

                <div className="input-row">
                    <button className="btn-close" onClick={() => setIsOpen(false)} title="Close">✕</button>
                    
                    {/* @ts-ignore */}
                    <math-field 
                        ref={mathFieldRef} 
                        virtual-keyboard-mode="onfocus"
                    ></math-field>

                    <button 
                        className="btn-insert-flat" 
                        onMouseDown={(e)=>{e.preventDefault(); insertMath();}}
                    >
                        Insert
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default SmartEditor;