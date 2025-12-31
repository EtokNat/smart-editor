import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

export class TableWidget extends BlockEmbed {
  static blotName = 'table-widget';
  static tagName = 'div';
  static className = 'custom-widget-container';

  static create(value: string | { html: string }): HTMLElement {
    const node = super.create() as HTMLElement;
    
    let tableHTML: string;
    
    if (typeof value === 'string' && value.includes('<table')) {
      tableHTML = value;
    } else if (typeof value === 'object' && value.html) {
      tableHTML = value.html;
    } else {
      tableHTML = `
        <div class="table-wrapper">
          <table class="custom-table bordered" style="--col-count: 3">
            <tbody>
              <tr><td>Cell</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    node.innerHTML = tableHTML;
    node.setAttribute('contenteditable', 'false');
    return node;
  }

  static value(node: HTMLElement): string {
    return node.innerHTML;
  }
}
