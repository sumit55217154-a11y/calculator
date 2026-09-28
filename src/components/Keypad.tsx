/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AngleMode } from '../utils/mathEngine';

interface KeypadProps {
  calcMode: 'standard' | 'scientific';
  angleMode: AngleMode;
  toggleAngleMode: () => void;
  isSecondMode: boolean;
  toggleSecondMode: () => void;
  isHypMode: boolean;
  toggleHypMode: () => void;
  memory: number;
  inputDigit: (d: string) => void;
  inputOperator: (op: string) => void;
  inputFunction: (fn: string) => void;
  inputConstant: (symbol: string) => void;
  inputParenthesis: (p: '(' | ')') => void;
  inputFactorial: () => void;
  inputPercentage: () => void;
  toggleSign: () => void;
  applyUnaryTransform: (type: 'sqr' | 'cube' | 'sqrt' | 'cbrt' | 'inv' | 'pow10' | 'exp') => void;
  calculate: () => void;
  clear: () => void;
  clearEntry: () => void;
  deleteChar: () => void;
  memoryClear: () => void;
  memoryRecall: () => void;
  memoryStore: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  calcMode,
  angleMode,
  toggleAngleMode,
  isSecondMode,
  toggleSecondMode,
  isHypMode,
  toggleHypMode,
  memory,
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
}) => {
  // Key press button wrapper
  const KeyButton = ({
    children,
    onClick,
    className = '',
    variant = 'digit',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: 'digit' | 'operator' | 'function' | 'action' | 'equals' | 'memory' | 'active';
    ariaLabel?: string;
  }) => {
    let baseStyles =
      'relative flex items-center justify-center rounded-xl font-medium transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ';

    switch (variant) {
      case 'equals':
        baseStyles +=
          'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-500/20 ';
        break;
      case 'operator':
        baseStyles +=
          'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-900/50 font-semibold ';
        break;
      case 'action':
        baseStyles +=
          'bg-rose-50/80 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-rose-900/50 font-semibold ';
        break;
      case 'function':
        baseStyles +=
          'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-800/80 text-sm ';
        break;
      case 'active':
        baseStyles +=
          'bg-amber-500 dark:bg-amber-600 text-white font-semibold shadow-xs border-transparent text-sm ';
        break;
      case 'memory':
        baseStyles +=
          'bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-800/50 text-xs font-mono ';
        break;
      case 'digit':
      default:
        baseStyles +=
          'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/70 shadow-2xs font-mono-numbers text-lg sm:text-xl font-medium ';
        break;
    }

    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.08 }}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${baseStyles} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  // Determine current trig and function labels based on 2nd and hyp state
  const getTrigFunc = (base: 'sin' | 'cos' | 'tan') => {
    if (isHypMode) {
      if (isSecondMode) return `a${base}h`;
      return `${base}h`;
    }
    if (isSecondMode) return `a${base}`;
    return base;
  };

  const getTrigDisplay = (base: 'sin' | 'cos' | 'tan') => {
    if (isHypMode) {
      if (isSecondMode) return `${base}h⁻¹`;
      return `${base}h`;
    }
    if (isSecondMode) return `${base}⁻¹`;
    return base;
  };

  return (
    <div className="w-full flex flex-col gap-2 pt-2">
      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <KeyButton variant="memory" onClick={memoryClear} ariaLabel="Memory Clear">
          MC
        </KeyButton>
        <KeyButton
          variant="memory"
          onClick={memoryRecall}
          ariaLabel="Memory Recall"
          className={memory !== 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}
        >
          MR
        </KeyButton>
        <KeyButton variant="memory" onClick={memoryAdd} ariaLabel="Memory Add">
          M+
        </KeyButton>
        <KeyButton variant="memory" onClick={memorySubtract} ariaLabel="Memory Subtract">
          M-
        </KeyButton>
        <KeyButton variant="memory" onClick={memoryStore} ariaLabel="Memory Store">
          MS
        </KeyButton>
      </div>

      {calcMode === 'standard' ? (
        /* STANDARD 4-COLUMN KEYPAD */
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {/* Row 1 */}
          <KeyButton variant="action" onClick={clear} className="h-12 sm:h-14">
            AC
          </KeyButton>
          <KeyButton variant="action" onClick={clearEntry} className="h-12 sm:h-14">
            C
          </KeyButton>
          <KeyButton variant="function" onClick={toggleSign} className="h-12 sm:h-14">
            ±
          </KeyButton>
          <KeyButton variant="operator" onClick={() => inputOperator('/')} className="h-12 sm:h-14">
            ÷
          </KeyButton>

          {/* Row 2 */}
          <KeyButton variant="digit" onClick={() => inputDigit('7')} className="h-12 sm:h-14">
            7
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('8')} className="h-12 sm:h-14">
            8
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('9')} className="h-12 sm:h-14">
            9
          </KeyButton>
          <KeyButton variant="operator" onClick={() => inputOperator('*')} className="h-12 sm:h-14">
            ×
          </KeyButton>

          {/* Row 3 */}
          <KeyButton variant="digit" onClick={() => inputDigit('4')} className="h-12 sm:h-14">
            4
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('5')} className="h-12 sm:h-14">
            5
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('6')} className="h-12 sm:h-14">
            6
          </KeyButton>
          <KeyButton variant="operator" onClick={() => inputOperator('-')} className="h-12 sm:h-14">
            −
          </KeyButton>

          {/* Row 4 */}
          <KeyButton variant="digit" onClick={() => inputDigit('1')} className="h-12 sm:h-14">
            1
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('2')} className="h-12 sm:h-14">
            2
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('3')} className="h-12 sm:h-14">
            3
          </KeyButton>
          <KeyButton variant="operator" onClick={() => inputOperator('+')} className="h-12 sm:h-14">
            +
          </KeyButton>

          {/* Row 5 */}
          <KeyButton variant="function" onClick={inputPercentage} className="h-12 sm:h-14">
            %
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('0')} className="h-12 sm:h-14">
            0
          </KeyButton>
          <KeyButton variant="digit" onClick={() => inputDigit('.')} className="h-12 sm:h-14">
            .
          </KeyButton>
          <KeyButton variant="equals" onClick={calculate} className="h-12 sm:h-14">
            =
          </KeyButton>
        </div>
      ) : (
        /* SCIENTIFIC EXPANDED KEYPAD (Responsive 5-column layout on mobile / 6-column on desktop) */
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* Scientific Row 1: Modes & Angles */}
          <KeyButton
            variant={isSecondMode ? 'active' : 'function'}
            onClick={toggleSecondMode}
            className="h-11 sm:h-12 text-xs font-semibold"
          >
            2nd
          </KeyButton>
          <KeyButton
            variant={isHypMode ? 'active' : 'function'}
            onClick={toggleHypMode}
            className="h-11 sm:h-12 text-xs font-semibold"
          >
            hyp
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={toggleAngleMode}
            className="h-11 sm:h-12 text-xs font-mono font-semibold"
          >
            {angleMode === 'DEG' ? 'deg' : 'rad'}
          </KeyButton>
          <KeyButton variant="action" onClick={clear} className="h-11 sm:h-12 font-semibold">
            AC
          </KeyButton>
          <KeyButton variant="action" onClick={deleteChar} className="h-11 sm:h-12">
            ⌫
          </KeyButton>

          {/* Scientific Row 2: Trig & Constants */}
          <KeyButton
            variant="function"
            onClick={() => inputFunction(getTrigFunc('sin'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {getTrigDisplay('sin')}
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => inputFunction(getTrigFunc('cos'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {getTrigDisplay('cos')}
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => inputFunction(getTrigFunc('tan'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {getTrigDisplay('tan')}
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => inputConstant('π')}
            className="h-11 sm:h-12 font-mono"
          >
            π
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => inputConstant('e')}
            className="h-11 sm:h-12 font-mono"
          >
            e
          </KeyButton>

          {/* Scientific Row 3: Logarithms & Powers */}
          <KeyButton
            variant="function"
            onClick={() => (isSecondMode ? applyUnaryTransform('exp') : inputFunction('ln'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {isSecondMode ? 'eˣ' : 'ln'}
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => (isSecondMode ? applyUnaryTransform('pow10') : inputFunction('log'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {isSecondMode ? '10ˣ' : 'log'}
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => inputOperator('^')}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            xʸ
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={() => (isSecondMode ? applyUnaryTransform('sqrt') : applyUnaryTransform('sqr'))}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            {isSecondMode ? '√x' : 'x²'}
          </KeyButton>
          <KeyButton
            variant="operator"
            onClick={() => inputOperator('/')}
            className="h-11 sm:h-12 text-lg"
          >
            ÷
          </KeyButton>

          {/* Scientific Row 4: Parentheses & Numbers 7,8,9 */}
          <KeyButton
            variant="function"
            onClick={() => inputParenthesis('(')}
            className="h-11 sm:h-12 font-mono text-base"
          >
            (
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('7')}
            className="h-11 sm:h-12"
          >
            7
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('8')}
            className="h-11 sm:h-12"
          >
            8
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('9')}
            className="h-11 sm:h-12"
          >
            9
          </KeyButton>
          <KeyButton
            variant="operator"
            onClick={() => inputOperator('*')}
            className="h-11 sm:h-12 text-lg"
          >
            ×
          </KeyButton>

          {/* Scientific Row 5: Parentheses & Numbers 4,5,6 */}
          <KeyButton
            variant="function"
            onClick={() => inputParenthesis(')')}
            className="h-11 sm:h-12 font-mono text-base"
          >
            )
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('4')}
            className="h-11 sm:h-12"
          >
            4
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('5')}
            className="h-11 sm:h-12"
          >
            5
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('6')}
            className="h-11 sm:h-12"
          >
            6
          </KeyButton>
          <KeyButton
            variant="operator"
            onClick={() => inputOperator('-')}
            className="h-11 sm:h-12 text-lg"
          >
            −
          </KeyButton>

          {/* Scientific Row 6: Factorial & Numbers 1,2,3 */}
          <KeyButton
            variant="function"
            onClick={inputFactorial}
            className="h-11 sm:h-12 font-mono text-sm"
          >
            n!
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('1')}
            className="h-11 sm:h-12"
          >
            1
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('2')}
            className="h-11 sm:h-12"
          >
            2
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('3')}
            className="h-11 sm:h-12"
          >
            3
          </KeyButton>
          <KeyButton
            variant="operator"
            onClick={() => inputOperator('+')}
            className="h-11 sm:h-12 text-lg"
          >
            +
          </KeyButton>

          {/* Scientific Row 7: 1/x, Percent, 0, Dot, Equals */}
          <KeyButton
            variant="function"
            onClick={() => applyUnaryTransform('inv')}
            className="h-11 sm:h-12 font-mono text-xs sm:text-sm"
          >
            1/x
          </KeyButton>
          <KeyButton
            variant="function"
            onClick={inputPercentage}
            className="h-11 sm:h-12 font-mono text-sm"
          >
            %
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('0')}
            className="h-11 sm:h-12"
          >
            0
          </KeyButton>
          <KeyButton
            variant="digit"
            onClick={() => inputDigit('.')}
            className="h-11 sm:h-12"
          >
            .
          </KeyButton>
          <KeyButton
            variant="equals"
            onClick={calculate}
            className="h-11 sm:h-12 text-xl font-bold"
          >
            =
          </KeyButton>
        </div>
      )}
    </div>
  );
};
