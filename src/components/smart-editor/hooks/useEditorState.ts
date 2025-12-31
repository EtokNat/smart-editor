import { useState, useRef, useCallback } from 'react';
import type { TableSettings, MathFieldConfig } from '../types/editor.types';

export const useEditorState = () => {
  // Table state
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    rows: 3,
    cols: 3,
    hasHeader: true,
    isStriped: false,
    isBordered: true,
    isCompact: false,
    widthStrategy: 'full',
  });

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Math state
  const [mathFieldConfig, setMathFieldConfig] = useState<MathFieldConfig>({
    isBlockMode: false,
    value: '',
    editNode: null,
  });

  const isBlockModeRef = useRef(false);

  // Equation bar state
  const [activeMathTab, setActiveMathTab] = useState<'basic' | 'calc' | 'matrix' | 'greek'>('basic');
  const [isEquationBarOpen, setIsEquationBarOpen] = useState(false);

  // Update table settings
  const updateTableSetting = useCallback(<K extends keyof TableSettings>(
    key: K,
    value: TableSettings[K]
  ) => {
    setTableSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset table settings to defaults
  const resetTableSettings = useCallback(() => {
    setTableSettings({
      rows: 3,
      cols: 3,
      hasHeader: true,
      isStriped: false,
      isBordered: true,
      isCompact: false,
      widthStrategy: 'full',
    });
  }, []);

  // Open/close table modal
  const openTableModal = useCallback(() => {
    setIsTableModalOpen(true);
  }, []);

  const closeTableModal = useCallback(() => {
    setIsTableModalOpen(false);
    resetTableSettings();
  }, [resetTableSettings]);

  // Update math field config
  const updateMathFieldConfig = useCallback((config: Partial<MathFieldConfig>) => {
    setMathFieldConfig(prev => ({
      ...prev,
      ...config,
    }));
  }, []);

  // Sync block mode between state and ref
  const setBlockMode = useCallback((isBlock: boolean) => {
    updateMathFieldConfig({ isBlockMode: isBlock });
    isBlockModeRef.current = isBlock;
  }, [updateMathFieldConfig]);

  // Open equation bar
  const openEquationBar = useCallback((isBlock: boolean, editNode: HTMLElement | null = null) => {
    updateMathFieldConfig({
      isBlockMode: isBlock,
      editNode,
      value: editNode?.getAttribute('data-value') || '',
    });
    setIsEquationBarOpen(true);
  }, [updateMathFieldConfig]);

  const closeEquationBar = useCallback(() => {
    setIsEquationBarOpen(false);
    updateMathFieldConfig({ editNode: null, value: '' });
  }, [updateMathFieldConfig]);

  return {
    // Table state
    tableSettings,
    isTableModalOpen,
    updateTableSetting,
    openTableModal,
    closeTableModal,
    
    // Math state
    mathFieldConfig,
    activeMathTab,
    isEquationBarOpen,
    setActiveMathTab,
    setBlockMode,
    openEquationBar,
    closeEquationBar,
    updateMathFieldConfig,
    isBlockModeRef,
  };
};
