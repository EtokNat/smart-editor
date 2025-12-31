import Quill from 'quill';
import { TableWidget } from './TableWidget';
import { InlineMathBlot } from './InlineMathBlot';
import { BlockMathBlot } from './BlockMathBlot';

// Conditional registration to avoid conflicts
export const registerCustomBlots = (): void => {
  try {
    // Register TableWidget if not already registered
    if (!Quill.imports['blots/table-widget']) {
      Quill.register(TableWidget);
    }

    // Register InlineMathBlot if not already registered
    if (!Quill.imports['blots/inlineMath']) {
      Quill.register(InlineMathBlot, true);
    }

    // Register BlockMathBlot if not already registered
    if (!Quill.imports['blots/blockMath']) {
      Quill.register(BlockMathBlot, true);
    }
  } catch (error) {
    console.error('Failed to register custom blots:', error);
  }
};

// Utility to check if blots are registered
export const isBlotRegistered = (blotName: string): boolean => {
  return !!Quill.imports[`blots/${blotName}`];
};

// Export all blots for direct access if needed
export { TableWidget, InlineMathBlot, BlockMathBlot };
