import React, { useCallback } from 'react';
import { MATH_SYMBOLS } from '../constants/mathSymbols';

interface EquationBarProps {
  isOpen: boolean;
  activeTab: 'basic' | 'calc' | 'matrix' | 'greek';
  isBlockMode: boolean;
  keyboardHeight: number;
  mathFieldRef: React.RefObject<any>;
  onTabChange: (tab: 'basic' | 'calc' | 'matrix' | 'greek') => void;
  onBlockModeChange: (isBlock: boolean) => void;
  onInsertSymbol: (latex: string) => void;
  onWrapSymbol: (latex: string) => void;
  onAddNewLine: () => void;
  onClose: () => void;
  onInsert: () => void;
}

export const EquationBar: React.FC<EquationBarProps> = ({
  isOpen,
  activeTab,
  isBlockMode,
  keyboardHeight,
  mathFieldRef,
  onTabChange,
  onBlockModeChange,
  onInsertSymbol,
  onWrapSymbol,
  onAddNewLine,
  onClose,
  onInsert,
}) => {
  if (!isOpen) return null;

  const handleSymbolClick = useCallback((symbol: typeof MATH_SYMBOLS[keyof typeof MATH_SYMBOLS][0]) => {
    if (symbol.latex === 'NEW_LINE') {
      onAddNewLine();
    } else if (symbol.latex.includes('#?')) {
      onWrapSymbol(symbol.latex);
    } else {
      onInsertSymbol(symbol.latex);
    }
  }, [onAddNewLine, onWrapSymbol, onInsertSymbol]);

  const renderSymbolButtons = () => {
    const symbols = MATH_SYMBOLS[activeTab];
    
    return symbols.map((symbol, index) => {
      const isNewLine = symbol.latex === 'NEW_LINE';
      
      return (
        <button
          key={`${activeTab}-${index}`}
          className="sym-btn"
          onClick={() => handleSymbolClick(symbol)}
          style={
            isNewLine
              ? {
                  gridColumn: 'span 2',
                  background: '#e6fcf5',
                  color: 'green',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }
              : symbol.latex.length > 15
              ? { fontSize: 12, gridColumn: 'span 2' }
              : {}
          }
          title={symbol.description}
        >
          {symbol.label}
        </button>
      );
    });
  };

  return (
    <div 
      className="equation-bar" 
      style={{ bottom: `${keyboardHeight}px` }}
    >
      <div className="tab-row">
        {(['basic', 'calc', 'matrix', 'greek'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        
        <div style={{ flex: 1 }}></div>
        
        <div className="mode-switch">
          <div 
            className={`mode-opt ${!isBlockMode ? 'active' : ''}`}
            onClick={() => onBlockModeChange(false)}
          >
            Inline
          </div>
          
          <div 
            className={`mode-opt ${isBlockMode ? 'active' : ''}`}
            onClick={() => onBlockModeChange(true)}
          >
            Block
          </div>
        </div>
      </div>

      <div className="palette-grid">
        {renderSymbolButtons()}
      </div>

      <div className="input-row">
        <button 
          className="btn-close" 
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>

        {/* @ts-ignore */}
        <math-field
          ref={mathFieldRef}
          virtual-keyboard-mode="onfocus"
        ></math-field>

        <button
          className="btn-insert-flat"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert();
          }}
        >
          Insert
        </button>
      </div>
    </div>
  );
};
