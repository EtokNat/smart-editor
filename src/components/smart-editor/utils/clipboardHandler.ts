import Quill from 'quill';
import { parseClipboardContent } from './latexParser';

const Delta = Quill.import('delta') || Quill.import('parchment').Delta;

/**
 * Handles paste events with LaTeX content detection
 */
export const createPasteHandler = (
  quill: Quill | null,
  readOnly: boolean,
  onChange?: (content: any) => void
) => {
  return (event: ClipboardEvent) => {
    if (!quill || readOnly) return;

    const clipboardData = event.clipboardData;
    const text = clipboardData?.getData('text/plain');

    if (!text) return;

    const { hasMath, operations } = parseClipboardContent(text);

    if (!hasMath) return;

    // Prevent default paste behavior
    event.preventDefault();
    event.stopPropagation();

    const selection = quill.getSelection() || { index: quill.getLength(), length: 0 };
    const delta = new Delta()
      .retain(selection.index)
      .delete(selection.length)
      .concat(new Delta(operations));

    quill.updateContents(delta, Quill.sources.USER);

    // Update selection
    setTimeout(() => {
      const newIndex = selection.index + operations.length;
      quill.setSelection(newIndex, 0, Quill.sources.SILENT);
      quill.scrollIntoView();

      // Trigger onChange if provided
      if (onChange) {
        onChange(quill.root.innerHTML);
      }
    }, 10);
  };
};

/**
 * Sets up clipboard event listeners
 */
export const setupClipboardListeners = (
  container: HTMLElement,
  handler: (event: ClipboardEvent) => void
) => {
  container.addEventListener('paste', handler, { capture: true });

  return () => {
    container.removeEventListener('paste', handler, { capture: true });
  };
};
