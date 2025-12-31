# Smart Editor Documentation

## Overview

The Smart Editor is a rich text editor built on Quill.js with advanced mathematical capabilities using KaTeX and MathLive, featuring table support, LaTeX equation editing, and a modular, extensible architecture designed for enterprise applications.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Custom Blots System](#custom-blots-system)
5. [Hooks Architecture](#hooks-architecture)
6. [Utility Functions](#utility-functions)
7. [Constants & Configuration](#constants--configuration)
8. [Type System](#type-system)
9. [Styling System](#styling-system)
10. [API Reference](#api-reference)
11. [Extension Points](#extension-points)
12. [Performance Considerations](#performance-considerations)
13. [Testing Strategy](#testing-strategy)
14. [Debugging Guide](#debugging-guide)
15. [Common Recipes](#common-recipes)

## Architecture Overview

### Design Principles

1. **Single Responsibility Principle**: Each module handles one specific concern
2. **Dependency Inversion**: High-level modules don't depend on low-level implementations
3. **Composition Over Inheritance**: Features are composed through hooks and utilities
4. **Immutability**: State updates are predictable and traceable
5. **Type Safety**: Full TypeScript coverage with strict typing

### Data Flow

```
User Input → Quill Instance → Delta Operations → State Updates → UI Render
     ↓           ↓                ↓                  ↓            ↓
  Keyboard → Event Handlers → Utility Functions → Hooks → Components
```

### Technology Stack

- **Core**: React 18+, TypeScript 5+
- **Editor**: Quill.js 1.3.7
- **Math Rendering**: KaTeX 0.16.9
- **Math Input**: MathLive 0.86.1
- **Styling**: CSS-in-JS (plain CSS with scoped styles)
- **Build**: Vite/Webpack with ESModules

## Project Structure

```
src/components/smart-editor/
├── index.ts                    # Main exports
├── SmartEditor.tsx             # Main component (158 lines)
├── types/                      # TypeScript definitions
│   ├── index.ts               # Barrel exports
│   ├── editor.types.ts        # Component & state types
│   ├── blots.types.ts         # Quill blot types
│   └── utils.types.ts         # Utility function types
├── blots/                      # Custom Quill blots
│   ├── index.ts               # Blot registration
│   ├── TableWidget.ts         # Table blot (38 lines)
│   ├── InlineMathBlot.ts      # Inline math (35 lines)
│   └── BlockMathBlot.ts       # Block math (35 lines)
├── components/                 # UI Components
│   ├── TableModal.tsx         # Table insertion modal (85 lines)
│   └── EquationBar.tsx        # Math equation bar (130 lines)
├── hooks/                      # Custom React hooks
│   ├── useQuillInstance.ts    # Quill lifecycle (120 lines)
│   ├── useMathKeyboard.ts     # MathLive integration (70 lines)
│   ├── useEditorState.ts      # Editor state management (100 lines)
│   └── useLatexOperations.ts  # LaTeX operations (90 lines)
├── utils/                      # Pure utility functions
│   ├── latexParser.ts         # LaTeX parsing (95 lines)
│   ├── tableGenerator.ts      # Table HTML generation (75 lines)
│   ├── deltaOperations.ts     # Quill Delta operations (70 lines)
│   └── clipboardHandler.ts    # Clipboard handling (60 lines)
├── constants/                  # Configuration constants
│   ├── icons.ts               # Quill toolbar icons (65 lines)
│   ├── mathSymbols.ts         # Math symbol definitions (80 lines)
│   └── editorConfig.ts        # Default configurations (30 lines)
└── styles/                     # Component styles
    └── editorStyles.ts        # All CSS styles (200 lines)
```

### File Purpose Matrix

| File | Purpose | Dependencies | Exports |
|------|---------|--------------|---------|
| `SmartEditor.tsx` | Main component orchestrator | All hooks, components | SmartEditor component |
| `useQuillInstance.ts` | Quill.js lifecycle management | Quill, clipboardHandler | Quill instance, refs, handlers |
| `useMathKeyboard.ts` | MathLive virtual keyboard | window.mathVirtualKeyboard | Math field ref, geometry state |
| `useEditorState.ts` | Centralized state management | None | Table, math, UI states |
| `useLatexOperations.ts` | Math insertion operations | Quill, KaTeX | Math CRUD operations |
| `latexParser.ts` | LaTeX parsing utilities | None | parseClipboardContent, extractLatexMatches |
| `tableGenerator.ts` | Table HTML generation | None | generateTableHTML, validateTableSettings |
| `deltaOperations.ts` | Quill Delta manipulation | Quill | insertContentAtSelection, mergeDeltaOperations |
| `clipboardHandler.ts` | Paste event handling | Quill, latexParser | createPasteHandler, setupClipboardListeners |

## Core Components

### SmartEditor.tsx

The main component that orchestrates all editor functionality.

```typescript
// Key Responsibilities:
// 1. Initialize and coordinate all hooks
// 2. Handle external value synchronization
// 3. Render editor container and modals
// 4. Manage component lifecycle

// Lifecycle:
// Mount → Register blots/icons → Initialize Quill → Setup listeners → Render
// Update → Sync external value → Update state → Re-render if needed
// Unmount → Cleanup listeners → Dispose Quill instance
```

### TableModal.tsx

Modal component for table creation and configuration.

```typescript
// Features:
// - Dynamic table dimension inputs
// - Style configuration (borders, stripes, etc.)
// - Width strategy selection
// - Validation and error handling

// Props Interface:
interface TableModalProps {
  isOpen: boolean;
  settings: TableSettings;
  onClose: () => void;
  onInsert: () => void;
  onSettingChange: <K extends keyof TableSettings>(key: K, value: TableSettings[K]) => void;
}
```

### EquationBar.tsx

Floating toolbar for mathematical equation input.

```typescript
// Features:
// - Tabbed symbol palette (basic, calc, matrix, greek)
// - Block/inline mode toggle
// - MathLive integration
// - Keyboard navigation support

// Props Interface:
interface EquationBarProps {
  isOpen: boolean;
  activeTab: 'basic' | 'calc' | 'matrix' | 'greek';
  isBlockMode: boolean;
  keyboardHeight: number;
  mathFieldRef: React.RefObject<any>;
  onTabChange: (tab: 'basic' | 'calc' | 'matrix' | 'greek') => void;
  onBlockModeChange: (isBlock: boolean) => void;
  onInsertSymbol: (latex: string) => void;
  onWrapSymbol: (latex: string) => void;
  onAddNewLine: () => void;
  onClose: () => void;
  onInsert: () => void;
}
```

## Custom Blots System

### Overview

Quill blots are custom content types that extend Quill's document model. Our system registers three custom blots:

### TableWidget

Handles table insertion and rendering as a non-editable block.

```typescript
// Registration: 'table-widget' blot name
// HTML Structure: <div class="custom-widget-container"> → <div class="table-wrapper"> → <table>
// Features:
// - Contenteditable false (cells are individually editable)
// - Supports table HTML or generates default
// - Preserves table structure on serialization
```

### InlineMathBlot

Renders inline mathematical expressions using KaTeX.

```typescript
// Registration: 'inlineMath' blot name
// HTML Structure: <span class="ql-inline-math" data-value="x^2">
// Features:
// - KaTeX rendering with displayMode: false
// - Double-click to edit
// - Contenteditable false
// - Error fallback to plain LaTeX
```

### BlockMathBlot

Renders block-level mathematical expressions using KaTeX.

```typescript
// Registration: 'blockMath' blot name
// HTML Structure: <div class="ql-block-math" data-value="\sum_{i=1}^n">
// Features:
// - KaTeX rendering with displayMode: true
// - Automatic newline insertion
// - Scrollable overflow for long equations
// - Error fallback to plain LaTeX
```

### Blot Registration Process

```typescript
// 1. Check if blot already registered (avoid conflicts)
// 2. Define static properties: blotName, className, tagName
// 3. Implement create() and value() methods
// 4. Register with Quill using Quill.register()
// 5. Handle errors gracefully
```

## Hooks Architecture

### useQuillInstance

Manages Quill.js lifecycle and editor interactions.

```typescript
// Dependencies: Quill.js, clipboardHandler
// State Managed:
// - quillInstance: Quill | null
// - editorRef: React.RefObject<HTMLDivElement>
// - lastActiveCellRef: HTMLElement | null
// - isEditorFocused: boolean

// Key Methods:
// setupTableCellTracking(): Tracks active table cell
// getEditorInstance(): Returns { quill, container }
// getLastActiveCell(): Returns current cell or null

// Event Handlers:
// - Text change → onChange callback
// - Selection change → isEditorFocused state
// - Double click → Open math editor
// - Paste → LaTeX detection and parsing
```

### useMathKeyboard

Integrates MathLive virtual keyboard and manages math input state.

```typescript
// Dependencies: MathLive, window.mathVirtualKeyboard
// State Managed:
// - keyboardGeometry: { height, width, visible }
// - isMathFieldOpen: boolean
// - mathFieldRef: React.RefObject<any>

// Key Methods:
// focusMathField(): Focuses the math input
// setMathFieldValue(value): Sets math field content
// executeMathFieldCommand(cmd): Executes MathLive command
// openMathField(value): Opens with optional initial value

// Event Listeners:
// - geometrychange: Updates keyboard position
```

### useEditorState

Centralized state management for editor UI and configuration.

```typescript
// State Managed:
// - Table settings (rows, cols, styles, etc.)
// - Math field configuration (mode, value, edit node)
// - Equation bar state (open/close, active tab)
// - Modal visibility states

// Key Methods:
// updateTableSetting(key, value): Type-safe table updates
// resetTableSettings(): Restores defaults
// openEquationBar(isBlock, editNode): Opens math editor
// setBlockMode(isBlock): Syncs state and ref

// State Synchronization:
// - isBlockModeRef mirrors mathFieldConfig.isBlockMode
// - Settings reset on modal close
```

### useLatexOperations

Encapsulates all LaTeX and math insertion operations.

```typescript
// Dependencies: Quill, KaTeX, deltaOperations
// Operations:
// addNewLine(): Adds new line in aligned environments
// updateMathBlot(): Updates existing math element
// insertMathIntoCell(): Inserts math into table cell
// insertMathAtSelection(): Inserts math at cursor

// Error Handling:
// - KaTeX rendering errors → fallback to plain LaTeX
// - Invalid cell references → graceful failure
// - Quill operations → source tracking for undo/redo
```

## Utility Functions

### latexParser.ts

Pure functions for LaTeX parsing and transformation.

```typescript
// Functions:
// extractLatexMatches(text): Finds LaTeX in text with positions
// convertMixedTextToDelta(text): Converts text+LaTeX to Delta ops
// parseClipboardContent(text): Detects and parses clipboard math
// cleanLatexExpression(latex): Removes LaTeX delimiters

// Regex Patterns:
// Block math: /\$\$([\s\S]*?)\$\$/g and /\\\[([\s\S]*?)\\\]/g
// Inline math: /\\\(([\s\S]*?)\\\)/g and /\$([^$\n]+)\$/g

// Output Format:
// Delta operations array compatible with Quill.insertEmbed()
```

### tableGenerator.ts

Generates HTML for tables with configurable options.

```typescript
// Functions:
// generateTableHTML(options): Creates table HTML with classes
// calculateTableDimensions(table): Computes table metrics
// validateTableSettings(settings): Validates input parameters

// CSS Class Generation:
// Based on: bordered, striped, compact, widthStrategy
// Dynamic: --col-count CSS variable for cell sizing

// Validation Rules:
// Rows: 1-50, Columns: 1-20
// Width strategy: 'full' | 'fit' | 'scroll'
```

### deltaOperations.ts

Quill Delta manipulation utilities.

```typescript
// Functions:
// createInsertOperation(content, index, length): Creates Delta
// mergeDeltaOperations(ops): Combines multiple Deltas
// getSafeSelection(quill): Gets selection with fallbacks
// insertContentAtSelection(quill, content, isBlock, source): Inserts with formatting

// Delta Structure:
// {
//   ops: [
//     { retain: number },
//     { delete: number },
//     { insert: string | object, attributes?: any }
//   ]
// }

// Source Tracking:
// 'user': User-initiated (adds to undo stack)
// 'api': Programmatic (no undo)
// 'silent': Internal (no events)
```

### clipboardHandler.ts

Clipboard event handling with LaTeX detection.

```typescript
// Functions:
// createPasteHandler(quill, readOnly, onChange): Creates paste handler
// setupClipboardListeners(container, handler): Manages event lifecycle

// Clipboard Processing:
// 1. Extract text/plain from clipboard
// 2. Detect LaTeX patterns
// 3. Convert to Delta operations
// 4. Insert at selection
// 5. Update selection position

// Event Propagation:
// Stops propagation when LaTeX detected
// Uses capture phase for reliable interception
```

## Constants & Configuration

### editorConfig.ts

Default configurations and constants.

```typescript
// Editor Defaults:
// minHeight: 150, maxHeight: 500
// placeholder: 'Type something...'
// theme: 'snow' (or 'bubble' for readOnly)

// Quill Modules:
// history: { delay: 2000, maxStack: 500, userOnly: true }
// clipboard: { matchVisual: false }

// KaTeX Configuration:
// displayMode: true, throwOnError: false, trust: true
// Custom macros: \RR, \ZZ, \NN, \QQ, \CC

// Table Defaults:
// rows: 3, cols: 3, hasHeader: true, isBordered: true
// widthStrategy: 'full'
```

### icons.ts

Toolbar icon definitions and configuration.

```typescript
// Icon Registration:
// Uses Quill.import('ui/icons') to extend toolbar
// SVG-based icons with consistent styling

// Toolbar Structure:
// [
//   ['undo', 'redo'],
//   [{ header: [1, 2, false] }],
//   ['bold', 'italic', 'underline', 'strike'],
//   // ... additional sections
// ]

// Handler Mapping:
// Connects toolbar buttons to function calls
// Supports dynamic handler injection
```

### mathSymbols.ts

Mathematical symbol definitions and categorization.

```typescript
// Symbol Categories:
// basic: Fractions, roots, powers, operators
// calc: Integrals, sums, limits, derivatives
// matrix: Matrices, vectors, cases, bold text
// greek: Greek letters

// Symbol Format:
// {
//   label: string,      // Display text
//   latex: string,      // LaTeX code (#? for placeholders)
//   category: string,   // Category for filtering
//   description: string // Tooltip text
// }

// Placeholder Syntax:
// #? indicates cursor position after insertion
// Multiple #? for multiple insertion points
```

## Type System

### Editor Types (editor.types.ts)

```typescript
// Component Props:
interface SmartEditorProps {
  value: any;                    // HTML string or Delta object
  onChange: (content: any) => void;
  minHeight?: number;           // Editor min-height in pixels
  maxHeight?: number;           // Editor max-height in pixels
  placeholder?: string;         // Placeholder text
  readOnly?: boolean;           // Read-only mode
  toolbarConfig?: ToolbarConfig;// Custom toolbar
  themeConfig?: ThemeConfig;    // Custom theming
}

// State Types:
interface TableSettings {
  rows: number;
  cols: number;
  hasHeader: boolean;
  isStriped: boolean;
  isBordered: boolean;
  isCompact: boolean;
  widthStrategy: 'full' | 'fit' | 'scroll';
}

interface MathFieldConfig {
  isBlockMode: boolean;    // Block vs inline math
  value: string;           // Current LaTeX
  editNode: HTMLElement | null; // Node being edited
}
```

### Blot Types (blots.types.ts)

```typescript
interface TableWidgetValue {
  html: string;                    // Table HTML
  settings?: {                     // Optional metadata
    rows: number;
    cols: number;
  };
}

interface MathBlotValue {
  latex: string;                   // LaTeX expression
  displayMode: boolean;            // true for block, false for inline
}

type BlotType = 'table-widget' | 'inlineMath' | 'blockMath';
```

### Utility Types (utils.types.ts)

```typescript
interface LatexMatch {
  latex: string;           // Clean LaTeX without delimiters
  type: 'inline' | 'block';// Math type
  start: number;           // Start position in source
  end: number;             // End position in source
}

interface TableGenerationOptions {
  rows: number;
  cols: number;
  hasHeader: boolean;
  isStriped: boolean;
  isBordered: boolean;
  isCompact: boolean;
  widthStrategy: 'full' | 'fit' | 'scroll';
}

interface SelectionRange {
  index: number;           // Position in document
  length: number;          // Selection length
}
```

## Styling System

### CSS Architecture

```css
/* Hierarchy:
.smart-editor-wrapper (.focused, .read-only)
├── .smart-editor-area
│   ├── .smart-editor-container
│   │   ├── .ql-toolbar (conditional display)
│   │   └── .ql-container.ql-snow
│   └── .editor-modal-overlay (conditional)
│       └── .editor-modal
└── .equation-bar (conditional)
*/

/* Naming Convention:
- Component: .component-name
- State: .component-name.state
- Child: .parent-name__child-name
- Modifier: .component-name--modifier
*/

/* CSS Variables:
--col-count: Dynamic column count for tables
--primary-color: Configurable primary color
--border-radius: Consistent rounding
*/
```

### Style Modules

1. **Editor Layout**: Container, toolbar, scrolling behavior
2. **Table Styles**: Borders, stripes, spacing, responsiveness
3. **Math Blot Styles**: Inline vs block, hover states, scrolling
4. **Modal Styles**: Overlay, form elements, animations
5. **Equation Bar**: Tabs, symbols, input field, positioning

### Responsive Design

```css
/* Mobile (< 768px):
- Full-width editor
- Simplified toolbar
- Vertical symbol grid
- Bottom-aligned equation bar

/* Tablet (768px - 1024px):
- Maintain most desktop features
- Adjust modal widths
- Optimize table display

/* Desktop (> 1024px):
- Full feature set
- Side-by-side configurations
- Advanced table options
*/
```

## API Reference

### SmartEditor Component

```typescript
import { SmartEditor } from './components/smart-editor';

<SmartEditor
  value={content}
  onChange={handleChange}
  minHeight={300}
  maxHeight={800}
  placeholder="Start typing..."
  readOnly={false}
/>
```

### Props Detailed

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | `''` | HTML string or Delta object representing content |
| `onChange` | `(content: any) => void` | Required | Callback when content changes |
| `minHeight` | `number` | `150` | Minimum editor height in pixels |
| `maxHeight` | `number` | `500` | Maximum editor height in pixels |
| `placeholder` | `string` | `'Type something...'` | Placeholder text for empty editor |
| `readOnly` | `boolean` | `false` | Disables editing and hides toolbar |
| `toolbarConfig` | `ToolbarConfig` | `undefined` | Custom toolbar configuration |
| `themeConfig` | `ThemeConfig` | `undefined` | Custom theme colors and styles |

### Methods (via ref)

```typescript
interface SmartEditorHandle {
  getEditorInstance: () => EditorInstance;
  insertMath: (latex: string, isBlock?: boolean) => void;
  insertTable: (options: TableGenerationOptions) => void;
  focus: () => void;
  blur: () => void;
}

const editorRef = useRef<SmartEditorHandle>(null);

// Usage:
editorRef.current?.insertMath('x^2 + y^2 = z^2', true);
```

### Events

```typescript
// Custom events dispatched from editor
interface SmartEditorEvents {
  'math-inserted': { latex: string; isBlock: boolean };
  'table-inserted': { rows: number; cols: number };
  'selection-changed': { range: SelectionRange | null };
  'content-changed': { html: string; delta: any };
}

// Listen to events:
editorContainer.addEventListener('math-inserted', (e) => {
  console.log('Math inserted:', e.detail);
});
```

## Extension Points

### Adding New Blots

1. Create blot class in `blots/` directory:

```typescript
// blots/CustomBlot.ts
import Quill from 'quill';

const Embed = Quill.import('blots/embed');

export class CustomBlot extends Embed {
  static blotName = 'custom-blot';
  static tagName = 'span';
  static className = 'ql-custom-blot';

  static create(value: any): HTMLElement {
    const node = super.create();
    // Custom creation logic
    return node;
  }

  static value(node: HTMLElement): any {
    // Return serialized value
    return node.dataset.value;
  }
}
```

2. Register in `blots/index.ts`:

```typescript
import { CustomBlot } from './CustomBlot';

export const registerCustomBlots = (): void => {
  if (!Quill.imports['blots/custom-blot']) {
    Quill.register(CustomBlot);
  }
};
```

### Adding New Math Symbols

1. Extend `MATH_SYMBOLS` constant:

```typescript
// constants/mathSymbols.ts
export const MATH_SYMBOLS = {
  // ... existing categories
  advanced: [
    { label: '∇', latex: '\\nabla', description: 'Nabla operator' },
    { label: '∂', latex: '\\partial', description: 'Partial derivative' },
  ],
};
```

2. Update EquationBar component to include new category.

### Custom Toolbar Handlers

```typescript
// In parent component:
const handleCustomAction = () => {
  // Access quill instance via ref
};

const toolbarConfig: ToolbarConfig = {
  sections: {
    custom: true, // Show custom section
  },
  handlers: {
    customAction: handleCustomAction,
  },
};
```

### Theming System

```typescript
const themeConfig: ThemeConfig = {
  primaryColor: '#3b82f6',
  backgroundColor: '#f9fafb',
  borderRadius: '0.5rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` appropriately
2. **Debounced Updates**: Content changes use 2000ms delay for history
3. **Virtualization**: Equation bar symbol grid uses fixed-height scrolling
4. **Event Delegation**: Table cell events use event delegation
5. **Lazy Loading**: MathLive loaded on demand

### Memory Management

```typescript
// Cleanup in hooks:
useEffect(() => {
  const handler = () => { /* ... */ };
  element.addEventListener('event', handler);
  
  return () => {
    element.removeEventListener('event', handler);
    // Dispose MathLive instance
    // Clear intervals/timeouts
    // Release references
  };
}, []);
```

### Bundle Size Optimization

```typescript
// Dynamic imports for large libraries:
const loadMathLive = async () => {
  const mathlive = await import('mathlive');
  // Initialize when needed
};

// Tree-shaking enabled for:
// - Quill modules
// - KaTeX components
// - MathLive features
```

## Testing Strategy

### Unit Tests

```typescript
// Example test for latexParser
describe('latexParser', () => {
  test('extractLatexMatches finds inline math', () => {
    const text = 'Equation: $x^2$ and more';
    const matches = extractLatexMatches(text);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual({
      latex: 'x^2',
      type: 'inline',
      start: 10,
      end: 15,
    });
  });
});

// Test utilities in isolation
// Mock Quill and MathLive
// Test pure functions without side effects
```

### Integration Tests

```typescript
// Test component interactions
describe('SmartEditor', () => {
  test('inserts table on button click', async () => {
    render(<SmartEditor />);
    fireEvent.click(screen.getByText('Table'));
    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '5' } });
    fireEvent.click(screen.getByText('Insert Table'));
    // Verify table exists in editor
  });
});
```

### E2E Tests

```typescript
// Cypress tests for user workflows
describe('Math Editing', () => {
  it('allows inserting and editing equations', () => {
    cy.get('.ql-inline-math').dblclick();
    cy.get('math-field').type('x^2 + y^2');
    cy.contains('Insert').click();
    cy.get('.ql-inline-math').should('contain', 'x² + y²');
  });
});
```

### Test Coverage Goals

- **Utilities**: 100% coverage (pure functions)
- **Hooks**: 90% coverage (state management)
- **Components**: 80% coverage (UI interactions)
- **Integration**: 70% coverage (workflow tests)

## Debugging Guide

### Common Issues

1. **Quill Not Initializing**
   ```javascript
   // Check: Blots registered before Quill instantiation
   // Fix: Import order - blots → Quill → component
   ```

2. **KaTeX Rendering Errors**
   ```javascript
   // Enable debugging:
   katex.render(latex, element, {
     throwOnError: true, // Change from false
     strict: 'error'
   });
   ```

3. **MathLive Keyboard Not Showing**
   ```javascript
   // Check: Virtual keyboard polyfill
   // Ensure: window.mathVirtualKeyboard exists
   ```

4. **Table Cells Not Editable**
   ```css
   /* Check CSS inheritance */
  .custom-table td[contenteditable="true"] {
    -webkit-user-modify: read-write;
    user-modify: read-write;
  }
   ```

### Debug Tools

```typescript
// Development-only debugging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  // Log Quill operations
  quill.on('text-change', (delta, oldDelta, source) => {
    console.group('Quill Text Change');
    console.log('Source:', source);
    console.log('Delta:', delta);
    console.log('Old Delta:', oldDelta);
    console.groupEnd();
  });
  
  // Monitor selection
  quill.on('selection-change', (range, oldRange, source) => {
    console.log('Selection:', range, 'Source:', source);
  });
}
```

### Performance Profiling

```typescript
// Measure render times
const startTime = performance.now();
// Operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);

// React DevTools for component profiling
// Chrome Performance tab for JavaScript execution
```

## Common Recipes

### Programmatic Content Manipulation

```typescript
// Insert content at specific position
const insertContent = (html: string, index: number) => {
  const quill = editorRef.current?.getEditorInstance()?.quill;
  if (quill) {
    const delta = quill.clipboard.convert({ html });
    quill.updateContents(delta, 'api');
    quill.setSelection(index + delta.length(), 0, 'silent');
  }
};

// Get current selection as HTML
const getSelectedHTML = (): string => {
  const quill = editorRef.current?.getEditorInstance()?.quill;
  if (!quill) return '';
  
  const range = quill.getSelection();
  if (!range) return '';
  
  const contents = quill.getContents(range.index, range.length);
  return quill.clipboard.convert(contents);
};
```

### Custom Export Formats

```typescript
// Export to LaTeX
const exportToLaTeX = (): string => {
  const html = editorRef.current?.getContent();
  // Convert HTML to LaTeX using custom parser
  return convertHTMLToLaTeX(html);
};

// Export to plain text with math
const exportToPlainText = (): string => {
  const quill = editorRef.current?.getEditorInstance()?.quill;
  if (!quill) return '';
  
  let text = '';
  const contents = quill.getContents();
  
  contents.forEach((op) => {
    if (typeof op.insert === 'string') {
      text += op.insert;
    } else if (op.insert?.inlineMath) {
      text += `$${op.insert.inlineMath}$`;
    } else if (op.insert?.blockMath) {
      text += `\n$$\n${op.insert.blockMath}\n$$\n`;
    }
  });
  
  return text;
};
```

### Undo/Redo Customization

```typescript
// Custom undo stack management
const customUndo = () => {
  const quill = editorRef.current?.getEditorInstance()?.quill;
  if (quill?.history?.undo) {
    quill.history.undo();
  }
};

// Clear history
const clearHistory = () => {
  const quill = editorRef.current?.getEditorInstance()?.quill;
  if (quill?.history?.clear) {
    quill.history.clear();
  }
};

// Limit history size
const quill = new Quill(editor, {
  modules: {
    history: {
      maxStack: 1000, // Default 500
      delay: 1000,    // Default 2000
    }
  }
});
```

### Keyboard Shortcuts

```typescript
// Add custom keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      openEquationBar(false, null);
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      openTableModal();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Accessibility Features

```typescript
// ARIA labels and roles
const EquationBar = () => (
  <div 
    role="toolbar" 
    aria-label="Equation editor"
    aria-orientation="horizontal"
  >
    <button
      aria-label="Insert fraction"
      title="Insert fraction (x/y)"
    >
      x/y
    </button>
  </div>
);

// Keyboard navigation
const handleKeyNavigation = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowRight':
      // Move to next symbol
      break;
    case 'ArrowLeft':
      // Move to previous symbol
      break;
    case 'Enter':
      // Activate focused symbol
      break;
  }
};
```

## Migration & Versioning

### Version 2.0 Breaking Changes

```typescript
// From v1 to v2:
// - Changed: value prop now accepts Delta objects
// - Changed: onChange returns Delta instead of HTML
// - Added: toolbarConfig and themeConfig props
// - Removed: onMathInsert and onTableInsert callbacks
// - Updated: All imports now use barrel exports

// Migration script:
const migrateV1toV2 = (v1Content: string): any => {
  // Convert HTML to Delta
  const quill = new Quill(document.createElement('div'));
  quill.clipboard.dangerouslyPasteHTML(v1Content);
  return quill.getContents();
};
```

### Backward Compatibility

```typescript
// Support for legacy formats
const parseContent = (content: any): any => {
  if (typeof content === 'string') {
    // Legacy HTML format
    if (content.trim().startsWith('{"ops":')) {
      try {
        return JSON.parse(content);
      } catch {
        return { html: content };
      }
    }
    return { html: content };
  }
  return content; // Assume already Delta
};
```

## Contributing Guidelines

### Code Standards

1. **TypeScript**: Strict mode, no explicit `any` in new code
2. **Imports**: Alphabetical, grouped by external/internal
3. **Naming**: camelCase for variables/functions, PascalCase for components/types
4. **Documentation**: JSDoc for public APIs, comments for complex logic
5. **Testing**: Write tests for new features, update for changes

### Pull Request Process

1. **Branch naming**: `feature/`, `fix/`, `docs/`, `refactor/`
2. **Commit messages**: Conventional commits format
3. **Testing**: All tests pass, new tests added
4. **Documentation**: Updated README and JSDoc
5. **Review**: 2 approvals required for merge

### Release Process

```bash
# Version bump (semantic versioning)
npm version patch|minor|major

# Build and test
npm run build
npm run test:e2e

# Create release notes
# Tag and push
# Publish to npm (if applicable)
```

## Support & Resources

### Troubleshooting Checklist

- [ ] Blots registered before Quill initialization
- [ ] KaTeX CSS loaded in document
- [ ] MathLive polyfill for virtual keyboard
- [ ] Content security policy allows eval (for KaTeX)
- [ ] No conflicting Quill instances on page
- [ ] Proper cleanup in useEffect hooks
- [ ] CSS classes not overridden by external styles

### Useful Links

- **Quill.js Documentation**: https://quilljs.com/docs
- **KaTeX Documentation**: https://katex.org/docs/api
- **MathLive Documentation**: https://cortexjs.io/mathlive/
- **TypeScript**: https://www.typescriptlang.org/docs
- **React Hooks**: https://react.dev/reference/react/hooks

### Getting Help

1. **GitHub Issues**: For bugs and feature requests
2. **Discussion Forum**: For usage questions
3. **Code Review**: For architectural decisions
4. **Documentation Updates**: For clarifications and improvements

---

*This documentation is maintained as part of the Smart Editor project. For updates, refer to the `DOCUMENTATION.md` file in the repository.*
