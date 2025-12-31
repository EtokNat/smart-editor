import Quill from 'quill';
import type { SelectionRange } from '../types/utils.types';

const Delta = Quill.import('delta') || Quill.import('parchment').Delta;

/**
 * Creates a Delta operation for inserting content
 */
export const createInsertOperation = (
  content: string | object,
  index: number,
  length: number = 0
): any => {
  return new Delta()
    .retain(index)
    .delete(length)
    .insert(content);
};

/**
 * Merges multiple Delta operations
 */
export const mergeDeltaOperations = (operations: any[]): any => {
  return operations.reduce((merged, op) => {
    return merged.concat(op);
  }, new Delta());
};

/**
 * Gets the selection range with fallbacks
 */
export const getSafeSelection = (quill: Quill | null): SelectionRange => {
  if (!quill) {
    return { index: 0, length: 0 };
  }

  const selection = quill.getSelection();
  if (selection) {
    return selection;
  }

  const length = quill.getLength();
  return { index: Math.max(0, length - 1), length: 0 };
};

/**
 * Inserts content at selection with proper newline handling for block math
 */
export const insertContentAtSelection = (
  quill: Quill | null,
  content: any,
  isBlock: boolean = false,
  source: 'user' | 'api' | 'silent' = 'user'
): void => {
  if (!quill) return;

  const selection = getSafeSelection(quill);
  const blotType = isBlock ? 'blockMath' : 'inlineMath';

  // Insert the content
  quill.insertEmbed(selection.index, blotType, content, source);

  // Handle newline for block math
  if (isBlock) {
    const contentAfter = quill.getContents(selection.index + 1);
    const textAfter = quill.getText(selection.index + 1, 10);

    if (contentAfter.length() === 0 || textAfter.charAt(0) !== '\n') {
      quill.insertText(selection.index + 1, '\n', source);
      
      setTimeout(() => {
        quill.setSelection(selection.index + 2, 0, source);
      }, 0);
    } else {
      const newlineIndex = textAfter.indexOf('\n');
      if (newlineIndex !== -1) {
        setTimeout(() => {
          quill.setSelection(selection.index + 1 + newlineIndex + 1, 0, source);
        }, 0);
      } else {
        setTimeout(() => {
          quill.setSelection(selection.index + 1 + contentAfter.length(), 0, source);
        }, 0);
      }
    }
  } else {
    setTimeout(() => {
      quill.setSelection(selection.index + 1, 0, source);
    }, 0);
  }
};
