/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AngleMode,
  evaluateExpression,
  formatResult,
} from '../utils/mathEngine';
import { playKeySound } from '../utils/audio';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  angleMode: AngleMode;
}

const STORAGE_KEY_HISTORY = 'kinetic_calc_history_v1';
const STORAGE_KEY_MEMORY = 'kinetic_calc_memory_v1';
const STORAGE_KEY_SOUND = 'kinetic_calc_sound_v1';
const STORAGE_KEY_ANGLE = 'kinetic_calc_angle_v1';

export function useCalculator() {
  const [expression, setExpression] = useState<string>('');
  const [resultDisplay, setResultDisplay] = useState<string>('0');
  const [isNewCalculation, setIsNewCalculation] = useState<boolean>(true);
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANGLE);
      return saved === 'RAD' ? 'RAD' : 'DEG';
    } catch {
      return 'DEG';
    }
  });
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [isHypMode, setIsHypMode] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMORY);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Ignore quota exceeded
    }
  }, [history]);

  // Save memory to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, memory.toString());
    } catch {
      // Ignore
    }
  }, [memory]);

  // Save sound setting
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled.toString());
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Save angle mode setting
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANGLE, angleMode);
    } catch {
      // Ignore
    }
  }, [angleMode]);

  // Audio trigger helper
  const sound = useCallback(
    (type: Parameters<typeof playKeySound>[0] = 'digit') => {
      if (soundEnabled) {
        playKeySound(type);
      }
    },
    [soundEnabled]
  );

  // Live preview calculation as user types
  const livePreview = useMemo(() => {
    if (!expression || expression.trim() === '' || isNewCalculation) {
      return null;
    }
    // Don't preview if ends with dangling operator
    const trimmed = expression.trim();
    if (/[+\-*/×÷^%]$/.test(trimmed)) {
      return null;
    }
    const evalRes = evaluateExpression(trimmed, angleMode);
    if (evalRes.success && evalRes.value !== null && evalRes.formatted !== resultDisplay) {
      return evalRes.formatted;
    }
    return null;
  }, [expression, isNewCalculation, angleMode, resultDisplay]);

  // Clear all (AC)
  const clear = useCallback(() => {
    sound('delete');
    setExpression('');
    setResultDisplay('0');
    setError(null);
    setIsNewCalculation(true);
  }, [sound]);

  // Clear current entry (C)
  const clearEntry = useCallback(() => {
    sound('delete');
    setError(null);
    if (isNewCalculation) {
      setExpression('');
      setResultDisplay('0');
      return;
    }
    // Remove last number/token block
    const match = expression.match(/(.*[+\-*/×÷^(])([^+\-*/×÷^(]*)$/);
    if (match) {
      setExpression(match[1]);
    } else {
      setExpression('');
      setResultDisplay('0');
      setIsNewCalculation(true);
    }
  }, [expression, isNewCalculation, sound]);

  // Backspace one character
  const deleteChar = useCallback(() => {
    sound('delete');
    setError(null);
    if (isNewCalculation) {
      setExpression('');
      setResultDisplay('0');
      return;
    }

    if (expression.length <= 1) {
      setExpression('');
      setResultDisplay('0');
      setIsNewCalculation(true);
      return;
    }

    // Check if deleting a multi-char function at end, e.g. "sin(", "sqrt(", "cos("
    const fnMatch = expression.match(/(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|ln|log|sqrt|cbrt|abs)\($/);
    if (fnMatch) {
      setExpression((prev) => prev.slice(0, prev.length - fnMatch[0].length));
      return;
    }

    setExpression((prev) => prev.slice(0, -1));
  }, [expression, isNewCalculation, sound]);

  // Input a numeric digit (0-9) or decimal point
  const inputDigit = useCallback(
    (digit: string) => {
      sound('digit');
      setError(null);

      if (isNewCalculation) {
        if (digit === '.') {
          setExpression('0.');
        } else {
          setExpression(digit);
        }
        setIsNewCalculation(false);
        return;
      }

      // Check decimal point restrictions in current number token
      if (digit === '.') {
        const tokens = expression.split(/[^0-9.]/);
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.includes('.')) {
          return; // Ignore second dot in same number
        }
        if (lastToken === '' || /[+\-*/×÷^(]$/.test(expression)) {
          setExpression((prev) => prev + '0.');
          return;
        }
      }

      setExpression((prev) => prev + digit);
    },
    [isNewCalculation, expression, sound]
  );

  // Input an operator (+, −, ×, ÷, ^, %)
  const inputOperator = useCallback(
    (op: string) => {
      sound('operator');
      setError(null);

      const displayOp = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op;

      if (isNewCalculation) {
        // Continue from previous result
        if (resultDisplay !== '0' && resultDisplay !== 'Error') {
          setExpression(resultDisplay + ' ' + displayOp + ' ');
          setIsNewCalculation(false);
          return;
        }
        if (op === '-') {
          setExpression('−');
          setIsNewCalculation(false);
          return;
        }
        setExpression('0 ' + displayOp + ' ');
        setIsNewCalculation(false);
        return;
      }

      // Replace trailing operator if already ending in one
      const trimmed = expression.trimEnd();
      if (/[+−×÷^%]$/.test(trimmed)) {
        setExpression(trimmed.slice(0, -1) + displayOp + ' ');
        return;
      }

      setExpression((prev) => prev + ' ' + displayOp + ' ');
    },
    [isNewCalculation, resultDisplay, expression, sound]
  );

  // Input a scientific function like sin(, cos(, sqrt(, etc.
  const inputFunction = useCallback(
    (funcName: string) => {
      sound('operator');
      setError(null);

      if (isNewCalculation) {
        setExpression(`${funcName}(`);
        setIsNewCalculation(false);
        return;
      }

      // If preceded by a digit or closing parenthesis, add implicit multiplication
      if (/[0-9)πeφ!]$/.test(expression.trimEnd())) {
        setExpression((prev) => `${prev} × ${funcName}(`);
      } else {
        setExpression((prev) => `${prev}${funcName}(`);
      }
    },
    [isNewCalculation, expression, sound]
  );

  // Input constants like π, e, φ
  const inputConstant = useCallback(
    (symbol: string) => {
      sound('digit');
      setError(null);

      if (isNewCalculation) {
        setExpression(symbol);
        setIsNewCalculation(false);
        return;
      }

      if (/[0-9)πeφ!]$/.test(expression.trimEnd())) {
        setExpression((prev) => `${prev} × ${symbol}`);
      } else {
        setExpression((prev) => `${prev}${symbol}`);
      }
    },
    [isNewCalculation, expression, sound]
  );

  // Input Parentheses
  const inputParenthesis = useCallback(
    (paren: '(' | ')') => {
      sound('operator');
      setError(null);

      if (paren === '(') {
        if (isNewCalculation) {
          setExpression('(');
          setIsNewCalculation(false);
          return;
        }
        if (/[0-9)πeφ!]$/.test(expression.trimEnd())) {
          setExpression((prev) => `${prev} × (`);
        } else {
          setExpression((prev) => `${prev}(`);
        }
      } else {
        // Closing parenthesis: only allowed if there is an unmatched open parenthesis
        let openCount = 0;
        let closeCount = 0;
        for (const ch of expression) {
          if (ch === '(') openCount++;
          if (ch === ')') closeCount++;
        }
        if (openCount > closeCount) {
          setExpression((prev) => `${prev})`);
        }
      }
    },
    [isNewCalculation, expression, sound]
  );

  // Input Factorial (!)
  const inputFactorial = useCallback(() => {
    sound('operator');
    setError(null);
    if (!expression || /[+−×÷^(]$/.test(expression.trimEnd())) return;
    setExpression((prev) => `${prev}!`);
  }, [expression, sound]);

  // Toggle +/- sign of the current number or expression
  const toggleSign = useCallback(() => {
    sound('action');
    setError(null);

    if (isNewCalculation) {
      if (resultDisplay !== '0' && resultDisplay !== 'Error') {
        const num = parseFloat(resultDisplay);
        const toggled = (-num).toString();
        setResultDisplay(toggled);
        setExpression(toggled);
      }
      return;
    }

    // Toggle sign on active token
    const match = expression.match(/(.*[+\-*/×÷^(]|^)(-?[0-9.]+)$/);
    if (match) {
      const prefix = match[1];
      const num = match[2];
      const toggled = num.startsWith('-') ? num.slice(1) : `-${num}`;
      setExpression(prefix + toggled);
    } else {
      // Wrap entire expression with -(...)
      setExpression((prev) => `-(${prev})`);
    }
  }, [isNewCalculation, resultDisplay, expression, sound]);

  // Percentage %
  const inputPercentage = useCallback(() => {
    sound('operator');
    setError(null);

    if (isNewCalculation) {
      if (resultDisplay !== '0' && resultDisplay !== 'Error') {
        const val = parseFloat(resultDisplay) / 100;
        const formatted = formatResult(val);
        setResultDisplay(formatted);
        setExpression(formatted);
      }
      return;
    }

    // Add % operator to expression
    if (!expression || /[+−×÷^(]$/.test(expression.trimEnd())) return;
    setExpression((prev) => `${prev} %`);
  }, [isNewCalculation, resultDisplay, expression, sound]);

  // Execute calculation (=)
  const calculate = useCallback(() => {
    if (!expression || expression.trim() === '') {
      return;
    }

    const evalRes = evaluateExpression(expression, angleMode);
    if (evalRes.success && evalRes.value !== null) {
      sound('equals');
      const formatted = evalRes.formatted;
      setResultDisplay(formatted);
      setError(null);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        expression: expression.trim(),
        result: formatted,
        timestamp: Date.now(),
        angleMode,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
      setIsNewCalculation(true);
    } else {
      sound('error');
      setError(evalRes.error || 'Syntax Error');
      setResultDisplay('Error');
    }
  }, [expression, angleMode, sound]);

  // Quick Unary transforms (e.g. x², x³, 1/x, √x)
  const applyUnaryTransform = useCallback(
    (type: 'sqr' | 'cube' | 'sqrt' | 'cbrt' | 'inv' | 'pow10' | 'exp') => {
      sound('operator');
      setError(null);

      const target = isNewCalculation ? resultDisplay : expression.trim();
      if (!target || target === 'Error') return;

      let newExpr = '';
      switch (type) {
        case 'sqr':
          newExpr = `(${target})^2`;
          break;
        case 'cube':
          newExpr = `(${target})^3`;
          break;
        case 'sqrt':
          newExpr = `sqrt(${target})`;
          break;
        case 'cbrt':
          newExpr = `cbrt(${target})`;
          break;
        case 'inv':
          newExpr = `1/(${target})`;
          break;
        case 'pow10':
          newExpr = `10^(${target})`;
          break;
        case 'exp':
          newExpr = `exp(${target})`;
          break;
      }

      setExpression(newExpr);
      setIsNewCalculation(false);

      // Auto-evaluate immediate results
      const res = evaluateExpression(newExpr, angleMode);
      if (res.success && res.value !== null) {
        setResultDisplay(res.formatted);
      }
    },
    [isNewCalculation, resultDisplay, expression, angleMode, sound]
  );

  // Memory functions
  const memoryClear = useCallback(() => {
    sound('action');
    setMemory(0);
  }, [sound]);

  const memoryRecall = useCallback(() => {
    sound('action');
    inputDigit(memory.toString());
  }, [memory, inputDigit, sound]);

  const memoryStore = useCallback(() => {
    sound('action');
    const currentVal = parseFloat(resultDisplay);
    if (!isNaN(currentVal) && isFinite(currentVal)) {
      setMemory(currentVal);
    }
  }, [resultDisplay, sound]);

  const memoryAdd = useCallback(() => {
    sound('action');
    const currentVal = parseFloat(resultDisplay);
    if (!isNaN(currentVal) && isFinite(currentVal)) {
      setMemory((prev) => prev + currentVal);
    }
  }, [resultDisplay, sound]);

  const memorySubtract = useCallback(() => {
    sound('action');
    const currentVal = parseFloat(resultDisplay);
    if (!isNaN(currentVal) && isFinite(currentVal)) {
      setMemory((prev) => prev - currentVal);
    }
  }, [resultDisplay, sound]);

  // Restore item from history
  const restoreHistory = useCallback(
    (item: HistoryItem, mode: 'expression' | 'result') => {
      sound('action');
      setError(null);
      if (mode === 'expression') {
        setExpression(item.expression);
        setResultDisplay(item.result);
        setIsNewCalculation(false);
      } else {
        setExpression(item.result);
        setResultDisplay(item.result);
        setIsNewCalculation(true);
      }
    },
    [sound]
  );

  const clearHistory = useCallback(() => {
    sound('delete');
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // Ignore
    }
  }, [sound]);

  const toggleAngleMode = useCallback(() => {
    sound('action');
    setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
  }, [sound]);

  const toggleSecondMode = useCallback(() => {
    sound('action');
    setIsSecondMode((prev) => !prev);
  }, [sound]);

  const toggleHypMode = useCallback(() => {
    sound('action');
    setIsHypMode((prev) => !prev);
  }, [sound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    expression,
    setExpression,
    resultDisplay,
    livePreview,
    angleMode,
    toggleAngleMode,
    isSecondMode,
    toggleSecondMode,
    isHypMode,
    toggleHypMode,
    memory,
    error,
    history,
    soundEnabled,
    toggleSound,
    inputDigit,
    inputOperator,
    inputFunction,
    inputConstant,
    inputParenthesis,
    inputFactorial,
    inputPercentage,
    toggleSign,
    applyUnaryTransform,
    calculate,
    clear,
    clearEntry,
    deleteChar,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
    restoreHistory,
    clearHistory,
  };
}
