import type { TableGenerationOptions } from '../types/utils.types';

/**
 * Generates HTML for a table with given options
 */
export const generateTableHTML = (options: TableGenerationOptions): string => {
  const {
    rows,
    cols,
    hasHeader,
    isBordered,
    isStriped,
    isCompact,
    widthStrategy,
  } = options;

  // Build CSS classes
  const classes = ['custom-table'];
  if (isBordered) classes.push('bordered');
  if (isStriped) classes.push('striped');
  if (isCompact) classes.push('compact');
  if (widthStrategy === 'fit') classes.push('fit-content');
  if (widthStrategy === 'scroll') classes.push('scrollable');

  // Generate header row if needed
  let headerHTML = '';
  if (hasHeader) {
    let headerCols = '';
    for (let k = 0; k < cols; k++) {
      headerCols += `<th contenteditable="true">Header ${k + 1}</th>`;
    }
    headerHTML = `<thead><tr>${headerCols}</tr></thead>`;
  }

  // Generate body rows
  let rowsHTML = '';
  for (let i = 0; i < rows; i++) {
    let colsHTML = '';
    for (let j = 0; j < cols; j++) {
      colsHTML += `<td contenteditable="true"></td>`;
    }
    rowsHTML += `<tr>${colsHTML}</tr>`;
  }

  // Combine into full table
  const tableHTML = `
    <table class="${classes.join(' ')}" style="--col-count: ${cols}">
      ${headerHTML}
      <tbody>${rowsHTML}</tbody>
    </table>
  `;

  // Wrap in container
  return `
    <div class="table-wrapper">
      ${tableHTML}
    </div>
  `;
};

/**
 * Calculates table dimensions based on content
 */
export const calculateTableDimensions = (tableElement: HTMLTableElement): {
  rows: number;
  cols: number;
  maxCellContentLength: number;
} => {
  const rows = tableElement.rows.length;
  let cols = 0;
  let maxCellContentLength = 0;

  for (let i = 0; i < rows; i++) {
    const rowCols = tableElement.rows[i].cells.length;
    cols = Math.max(cols, rowCols);
    
    for (let j = 0; j < rowCols; j++) {
      const cell = tableElement.rows[i].cells[j];
      const contentLength = cell.textContent?.length || 0;
      maxCellContentLength = Math.max(maxCellContentLength, contentLength);
    }
  }

  return { rows, cols, maxCellContentLength };
};

/**
 * Validates table settings
 */
export const validateTableSettings = (settings: Partial<TableGenerationOptions>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (settings.rows !== undefined && (settings.rows < 1 || settings.rows > 50)) {
    errors.push('Rows must be between 1 and 50');
  }

  if (settings.cols !== undefined && (settings.cols < 1 || settings.cols > 20)) {
    errors.push('Columns must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
