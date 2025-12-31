import React from 'react';
import type { TableSettings } from '../types/editor.types';

interface TableModalProps {
  isOpen: boolean;
  settings: TableSettings;
  onClose: () => void;
  onInsert: () => void;
  onSettingChange: <K extends keyof TableSettings>(
    key: K,
    value: TableSettings[K]
  ) => void;
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  settings,
  onClose,
  onInsert,
  onSettingChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="editor-modal-overlay">
      <div className="editor-modal">
        <div className="modal-header">Insert Table</div>
        
        <div className="modal-grid-row">
          <div className="modal-field">
            <label>Rows</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              value={settings.rows}
              onChange={(e) => onSettingChange('rows', parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="modal-field">
            <label>Columns</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={settings.cols}
              onChange={(e) => onSettingChange('cols', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="modal-field">
          <label>Width Strategy</label>
          <select 
            value={settings.widthStrategy}
            onChange={(e) => onSettingChange('widthStrategy', e.target.value as any)}
          >
            <option value="full">Full Width (100%) - Default</option>
            <option value="fit">Fit to Content (Auto Width)</option>
            <option value="scroll">Scrollable (Wide Data)</option>
          </select>
        </div>

        <div className="modal-checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.hasHeader}
              onChange={(e) => onSettingChange('hasHeader', e.target.checked)}
            /> 
            Header Row
          </label>
          
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.isBordered}
              onChange={(e) => onSettingChange('isBordered', e.target.checked)}
            /> 
            Borders
          </label>
          
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.isStriped}
              onChange={(e) => onSettingChange('isStriped', e.target.checked)}
            /> 
            Zebra Stripes
          </label>
          
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.isCompact}
              onChange={(e) => onSettingChange('isCompact', e.target.checked)}
            /> 
            Compact Style
          </label>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn-insert-flat" 
            onClick={onClose}
            style={{ border: '1px solid #ddd', color: '#555' }}
          >
            Cancel
          </button>
          
          <button 
            className="btn-confirm" 
            onClick={onInsert}
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};
