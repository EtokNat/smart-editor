import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardGeometry } from '../types/editor.types';

declare global {
  interface Window {
    mathVirtualKeyboard?: {
      boundingRect: DOMRect;
      addEventListener: (type: string, listener: EventListener) => void;
      removeEventListener: (type: string, listener: EventListener) => void;
    };
  }
}

export const useMathKeyboard = () => {
  const [keyboardGeometry, setKeyboardGeometry] = useState<KeyboardGeometry>({
    height: 0,
    width: 0,
    visible: false,
  });
  const [isMathFieldOpen, setIsMathFieldOpen] = useState(false);
  const mathFieldRef = useRef<any>(null);

  // Listen for MathLive virtual keyboard changes
  useEffect(() => {
    const handleGeometryChange = () => {
      if (window.mathVirtualKeyboard) {
        const rect = window.mathVirtualKeyboard.boundingRect;
        setKeyboardGeometry({
          height: rect.height,
          width: rect.width,
          visible: rect.height > 0,
        });
      }
    };

    if (window.mathVirtualKeyboard) {
      window.mathVirtualKeyboard.addEventListener('geometrychange', handleGeometryChange);
      handleGeometryChange(); // Initial check
    }

    return () => {
      if (window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
      }
    };
  }, []);

  // Focus math field
  const focusMathField = useCallback(() => {
    if (mathFieldRef.current) {
      mathFieldRef.current.focus();
    }
  }, []);

  // Set math field value
  const setMathFieldValue = useCallback((value: string) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.setValue(value || '');
    }
  }, []);

  // Get math field value
  const getMathFieldValue = useCallback((): string => {
    return mathFieldRef.current?.getValue() || '';
  }, []);

  // Execute command on math field
  const executeMathFieldCommand = useCallback((command: string | [string, any]) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.executeCommand(command);
    }
  }, []);

  // Open/close math field
  const openMathField = useCallback((value?: string) => {
    setIsMathFieldOpen(true);
    setTimeout(() => {
      if (value !== undefined) {
        setMathFieldValue(value);
      }
      focusMathField();
    }, 50);
  }, [setMathFieldValue, focusMathField]);

  const closeMathField = useCallback(() => {
    setIsMathFieldOpen(false);
  }, []);

  return {
    mathFieldRef,
    keyboardGeometry,
    isMathFieldOpen,
    setIsMathFieldOpen,
    focusMathField,
    setMathFieldValue,
    getMathFieldValue,
    executeMathFieldCommand,
    openMathField,
    closeMathField,
  };
};
