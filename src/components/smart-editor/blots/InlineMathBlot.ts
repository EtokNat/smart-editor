import Quill from 'quill';
import katex from 'katex';

const Embed = Quill.import('blots/embed');

export class InlineMathBlot extends Embed {
  static blotName = 'inlineMath';
  static className = 'ql-inline-math';
  static tagName = 'span';

  static create(value: string): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-value', value);
    node.setAttribute('contenteditable', 'false');
    
    try {
      katex.render(value, node, {
        displayMode: false,
        throwOnError: false,
        trust: true,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      node.textContent = `$${value}$`;
    }
    
    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute('data-value') || '';
  }
}
