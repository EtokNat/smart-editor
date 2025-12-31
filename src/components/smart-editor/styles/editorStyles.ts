export const editorStyles = `
  /* Main Layout */
  .smart-editor-wrapper { 
      display: flex; 
      flex-direction: column; 
      width: 100%; 
      position: relative; 
      font-family: 'Segoe UI', sans-serif; 
  }
  
  .smart-editor-area { 
      flex-grow: 1; 
      display: flex; 
      flex-direction: column; 
      position: relative; 
  }
  
  /* --- SCROLLING FIX (PRESERVED) --- */
  .smart-editor-container { 
      background: white; 
      border-radius: 8px; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden;        /* Contain the scrollbar inside */
      border: 1px solid #ddd; 
  }
  
  /* Toolbar: Fixed at top (via flexbox) */
  .ql-toolbar { 
      display: none;
      border-bottom: 1px solid #ddd !important; 
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      background: #fff; 
      flex-shrink: 0; 
      z-index: 5;
  }

  /* Content: Scrollable Area */
  .ql-container.ql-snow { 
      border: none !important; 
      font-size: 16px; 
      flex-grow: 1;        /* Take remaining height */
      overflow-y: auto;    /* Enable scrolling here */
      position: relative;
  }
  
  /* Focus Handling */
  .smart-editor-wrapper.focused .ql-toolbar,
  .smart-editor-wrapper:focus-within .ql-toolbar { display: block; }
  
  /* READ ONLY MODE OVERRIDES */
  .read-only .ql-toolbar { display: none !important; }
  .read-only .smart-editor-container { background: transparent; border: none; }
  .read-only .ql-container { overflow-y: visible; height: auto !important; }
  .read-only .ql-editor { padding: 0; }
  
  /* --- TABLE STYLES (NEW) --- */
  .custom-widget-container { margin: 15px 0; display: block; width: 100%; }

  .table-wrapper {
      width: 100%;
      overflow-x: auto;
      border: 1px solid transparent;
      padding: 4px;
  }

  .custom-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      table-layout: auto;
  }

  .custom-table.fit-content { width: auto; margin: 0 auto; }
  .custom-table.scrollable { min-width: 800px; }

  .custom-table td, .custom-table th {
      vertical-align: top;
      width: 1px;
      white-space: normal;
      max-width: calc(100% / var(--col-count, 1));
      word-wrap: break-word;
      cursor: text;
  }

  .custom-table th { background-color: #f8f9fa; font-weight: 600; text-align: left; border-bottom: 2px solid #ccc !important; }

  .custom-table.bordered td, .custom-table.bordered th { border: 1px solid #ccc; }
  .custom-table:not(.bordered) td, .custom-table:not(.bordered) th { border-bottom: 1px solid #eee; }
  .custom-table.striped tbody tr:nth-of-type(odd) { background-color: rgba(0,0,0,0.03); }
  .custom-table.compact td, .custom-table.compact th { padding: 6px 8px; }
  .custom-table:not(.compact) td, .custom-table:not(.compact) th { padding: 12px; }

  .custom-table td:focus, .custom-table th:focus { outline: 2px solid #007bff; background: #f0f8ff; }

  /* --- MATH BLOT STYLING --- */
  .katex-display { margin: 0 !important; padding: 0 !important; }

  .ql-inline-math {
      display: inline-block;
      padding: 2px 4px;
      margin: 0 2px;
      cursor: pointer;
      border-radius: 3px;
      border: 1px solid transparent;
      vertical-align: middle;
  }
  .ql-inline-math:hover { background-color: #e7f5ff; border-color: #007bff; }

  .ql-block-math { 
      padding: 2px 5px;   
      margin: 10px 0;                 
      line-height: 1;
      background: #f8f9fa; 
      border-radius: 4px; 
      cursor: pointer; 
      text-align: center; 
      border: 1px solid transparent; 
      overflow-x: auto;               
      max-width: 100%;        
  }
  .ql-block-math:hover { border-color: #007bff; background: #eef2f5; }
  .ql-block-math::-webkit-scrollbar { height: 6px; }
  .ql-block-math::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

  /* --- MODAL STYLES (NEW) --- */
  .editor-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
  .editor-modal { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 380px; display: flex; flex-direction: column; gap: 20px; font-size: 14px; }
  .modal-header { font-weight: bold; font-size: 18px; color: #333; }
  .modal-grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .modal-field { display: flex; flex-direction: column; gap: 6px; }
  .modal-field label { font-size: 13px; font-weight: 600; color: #555; }
  .modal-field input, .modal-field select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
  .modal-checkbox-group { display: flex; flex-direction: column; gap: 10px; background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #eee; }
  .checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; color: #444; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
  .btn-confirm { padding: 8px 20px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer; font-weight: 600; }

  /* --- EQUATION BAR --- */
  .equation-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #ccc;
      box-shadow: 0 -4px 25px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      z-index: 99999;
      transition: bottom 0.2s cubic-bezier(0.1, 0.7, 1.0, 0.1);
  }

  .tab-row { display: flex; background: #f1f3f5; border-bottom: 1px solid #e9ecef; }
  .tab-btn { flex: 1; padding: 8px; border: none; background: none; font-size: 13px; font-weight: 600; color: #666; cursor: pointer; }
  .tab-btn:hover { background: #e9ecef; }
  .tab-btn.active { background: white; color: #007bff; border-bottom: 3px solid #007bff; }

  .palette-grid { 
      padding: 6px; 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); 
      gap: 5px; 
      background: #fafafa;
      max-height: 150px;
      overflow-y: auto;
      border-bottom: 1px solid #eee;
  }
  .sym-btn {
      padding: 6px 0;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  .sym-btn:hover { background: #fff; border-color: #007bff; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

  .input-row { 
      padding: 10px; 
      display: flex; 
      align-items: flex-start; 
      gap: 10px; 
      background: white; 
  }
  
  math-field { 
      flex-grow: 1; 
      font-size: 18px;             
      padding: 10px;             
      border: 1px solid #ced4da; 
      border-radius: 6px; 
      background: #fff;
      outline: none;
      min-height: 60px;        
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  }
  math-field:focus-within { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.15); }

  .btn-close { 
      width: 32px; height: 32px; border-radius: 50%; border: 1px solid #eee; 
      background: #f8f9fa; color: #666; cursor: pointer; 
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      margin-top: 5px;
      flex-shrink: 0;
  }
  .btn-close:hover { background: #fee; color: red; border-color: #fcc; }

  .btn-insert-flat {
      background: transparent;
      border: 1px solid #007bff;
      color: #007bff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 5px;
      flex-shrink: 0;
      transition: all 0.2s;
  }
  .btn-insert-flat:hover { background: #007bff; color: white; }
  .btn-insert-flat:active { transform: translateY(1px); }

  .mode-switch { display: flex; border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden; margin: 4px; }
  .mode-opt { padding: 4px 10px; font-size: 12px; cursor: pointer; background: #f8f9fa; }
  .mode-opt.active { background: #e7f5ff; color: #007bff; font-weight: bold; }
`;
