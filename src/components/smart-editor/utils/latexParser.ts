import type { LatexMatch } from '../types/utils.types';

/**
 * Extracts LaTeX expressions from text
 */
export const extractLatexMatches = (text: string): LatexMatch[] => {
  const matches: LatexMatch[] = [];
  const patterns = [
    { regex: /\$\$([\s\S]*?)\$\$/g, type: 'block' as const },
    { regex: /\\\[([\s\S]*?)\\\]/g, type: 'block' as const },
    { regex: /\\\(([\s\S]*?)\\\)/g, type: 'inline' as const },
    { regex: /\$([^$\n]+)\$/g, type: 'inline' as const },
  ];

  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        latex: match[1].trim(),
        type,
        start: match.index,
        end: regex.lastIndex,
      });
    }
  });

  // Sort by start position
  matches.sort((a, b) => a.start - b.start);
  return matches;
};

/**
 * Converts mixed text with LaTeX to Delta operations
 */
export const convertMixedTextToDelta = (text: string): any[] => {
  const matches = extractLatexMatches(text);
  const operations: any[] = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    // Add plain text before match
    if (match.start > lastIndex) {
      const plainText = text.substring(lastIndex, match.start);
      if (plainText.trim()) {
        operations.push({ insert: plainText });
      }
    }

    // Add math operation
    const blotType = match.type === 'block' ? 'blockMath' : 'inlineMath';
    operations.push({ insert: { [blotType]: match.latex } });

    // Add newline after block math for proper formatting
    if (match.type === 'block') {
      operations.push({ insert: '\n' });
    }

    lastIndex = match.end;
  });

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining.trim()) {
      operations.push({ insert: remaining });
    }
  }

  return operations;
};

/**
 * Parses clipboard content for math expressions
 */
export const parseClipboardContent = (text: string): {
  hasMath: boolean;
  operations: any[];
} => {
  const hasMath = /(\$\$|\\\[|\\\(|\$)/.test(text);
  
  if (!hasMath) {
    return { hasMath: false, operations: [{ insert: text }] };
  }

  return {
    hasMath: true,
    operations: convertMixedTextToDelta(text),
  };
};

/**
 * Cleans LaTeX expression by removing delimiters
 */
export const cleanLatexExpression = (latex: string): string => {
  // Remove $$ delimiters
  if (latex.startsWith('$$') && latex.endsWith('$$')) {
    return latex.slice(2, -2).trim();
  }
  // Remove \[ \] delimiters
  if (latex.startsWith('\\[') && latex.endsWith('\\]')) {
    return latex.slice(2, -2).trim();
  }
  // Remove \( \) delimiters
  if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
    return latex.slice(2, -2).trim();
  }
  // Remove $ delimiters
  if (latex.startsWith('$') && latex.endsWith('$')) {
    return latex.slice(1, -1).trim();
  }
  return latex.trim();
};
