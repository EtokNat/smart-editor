import Quill from 'quill';

export const registerCustomIcons = (): void => {
  const Icons = Quill.import('ui/icons');
  
  // Math icons
  Icons.inlineMath = `
    <svg viewBox="0 0 18 18">
      <path class="ql-stroke" d="M3,3 L15,3 L9,9 L15,15 L3,15"></path>
    </svg>
  `;
  
  Icons.blockMath = `
    <svg viewBox="0 0 18 18">
      <path class="ql-stroke" d="M3,5 L15,5 M3,9 L15,9 M3,13 L15,13 M9,2 L9,16"></path>
    </svg>
  `;
  
  // Table icon
  Icons.table = `
    <svg viewBox="0 0 18 18">
      <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
      <path class="ql-stroke" d="M3,9 L15,9 M9,3 L9,15"></path>
    </svg>
  `;
  
  // Undo/Redo icons
  Icons.undo = `
    <svg viewBox="0 0 18 18">
      <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
      <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
    </svg>
  `;
  
  Icons.redo = `
    <svg viewBox="0 0 18 18">
      <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
      <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
    </svg>
  `;
};

export const getToolbarOptions = (readOnly: boolean, handlers?: any) => {
  if (readOnly) return false;
  
  return {
    container: [
      ['undo', 'redo'],
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['table'],
      ['inlineMath', 'blockMath']
    ],
    handlers: handlers || {}
  };
};

export const TOOLBAR_HANDLERS = {
  undo: (quill: any) => quill?.history?.undo(),
  redo: (quill: any) => quill?.history?.redo(),
  inlineMath: (openMathBar: (isBlock: boolean, node: HTMLElement | null) => void) => () => openMathBar(false, null),
  blockMath: (openMathBar: (isBlock: boolean, node: HTMLElement | null) => void) => () => openMathBar(true, null),
  table: (openTableModal: () => void) => () => openTableModal(),
};
