export type MathSymbolCategory = 'basic' | 'calc' | 'matrix' | 'greek';

export interface MathSymbol {
  label: string;
  latex: string;
  category: MathSymbolCategory;
  description?: string;
}

export const MATH_SYMBOLS: Record<MathSymbolCategory, MathSymbol[]> = {
  basic: [
    { label: 'x/y', latex: '\\frac{#?}{#?}', description: 'Fraction' },
    { label: '√', latex: '\\sqrt{#?}', description: 'Square root' },
    { label: 'x²', latex: '#?^{2}', description: 'Square' },
    { label: 'xⁿ', latex: '#?^{#?}', description: 'Power' },
    { label: '( )', latex: '(#?)', description: 'Parentheses' },
    { label: '[ ]', latex: '[#?]', description: 'Brackets' },
    { label: '×', latex: '\\times', description: 'Multiplication' },
    { label: '÷', latex: '\\div', description: 'Division' },
    { label: '±', latex: '\\pm', description: 'Plus/minus' },
    { label: 'π', latex: '\\pi', description: 'Pi' },
    { label: 'New Line', latex: 'NEW_LINE', description: 'Insert new line' },
  ],
  calc: [
    { label: '∫', latex: '\\int', description: 'Integral' },
    { label: '∫ab', latex: '\\int_{#?}^{#?}', description: 'Definite integral' },
    { label: '∑', latex: '\\sum', description: 'Summation' },
    { label: '∑ab', latex: '\\sum_{#?}^{#?}', description: 'Sum with limits' },
    { label: 'lim', latex: '\\lim_{x \\to \\infty}', description: 'Limit' },
    { label: 'd/dx', latex: '\\frac{d}{dx}', description: 'Derivative' },
    { label: '∞', latex: '\\infty', description: 'Infinity' },
  ],
  matrix: [
    { label: 'Mat 2x2', latex: '\\begin{pmatrix} #? & #? \\\\ #? & #? \\end{pmatrix}', description: '2x2 matrix' },
    { label: 'Cases', latex: '\\begin{cases} #? & \\text{if } x > 0 \\\\ #? & \\text{otherwise} \\end{cases}', description: 'Piecewise function' },
    { label: 'vec', latex: '\\vec{#?}', description: 'Vector' },
    { label: 'Bold', latex: '\\mathbf{#?}', description: 'Bold text' },
  ],
  greek: [
    { label: 'α', latex: '\\alpha', description: 'Alpha' },
    { label: 'β', latex: '\\beta', description: 'Beta' },
    { label: 'γ', latex: '\\gamma', description: 'Gamma' },
    { label: 'θ', latex: '\\theta', description: 'Theta' },
    { label: 'λ', latex: '\\lambda', description: 'Lambda' },
    { label: 'Δ', latex: '\\Delta', description: 'Delta' },
    { label: 'Ω', latex: '\\Omega', description: 'Omega' },
  ],
};

export const NEW_LINE_TEMPLATES = {
  aligned: (content: string) => {
    const trimmed = content.trim();
    if (trimmed.startsWith('\\begin{aligned}')) {
      const endTag = '\\end{aligned}';
      if (trimmed.endsWith(endTag)) {
        const innerContent = trimmed.substring(15, trimmed.lastIndexOf(endTag));
        return `\\begin{aligned}${innerContent} \\\\ & #? \\end{aligned}`;
      }
    }
    return `\\begin{aligned}${content} \\\\ & #? \\end{aligned}`;
  },
  matrix: (content: string) => {
    return content + '\\\\';
  },
} as const;
