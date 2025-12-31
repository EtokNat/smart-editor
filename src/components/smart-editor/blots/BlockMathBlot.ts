import Quill from 'quill';
import katex from 'katex';

const BlockEmbed = Quill.import('blots/block/embed');

export class BlockMathBlot extends BlockEmbed {
  static blotName = 'blockMath';
  static className = 'ql-block-math';
  static tagName = 'div';

  static create(value: string): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-value', value);
    node.setAttribute('contenteditable', 'false');
    
    try {
      katex.render(value, node, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      node.textContent = `$$${value}$$`;
    }
    
    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute('data-value') || '';
  }
}




