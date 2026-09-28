/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useCalculator } from './hooks/useCalculator';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { DisplayScreen } from './components/DisplayScreen';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ConstantsModal } from './components/ConstantsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ScientificConstant } from './utils/mathEngine';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [calcMode, setCalcMode] = useState<'standard' | 'scientific'>('scientific');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConstantsOpen, setIsConstantsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const calc = useCalculator();

  // Keyboard navigation & inputs
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input element (e.g. search)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isConstantsOpen ||
        isShortcutsOpen
      ) {
        if (e.key === 'Escape') {
          setIsConstantsOpen(false);
          setIsShortcutsOpen(false);
        }
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        calc.inputDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        calc.inputDigit('.');
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        calc.inputOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calc.calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        calc.deleteChar();
      } else if (key === 'Escape') {
        e.preventDefault();
        calc.clear();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        calc.inputParenthesis(key as '(' | ')');
      } else if (key === '^') {
        e.preventDefault();
        calc.inputOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        calc.inputPercentage();
      } else if (key === '!') {
        e.preventDefault();
        calc.inputFactorial();
      } else if (key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputConstant('π');
      } else if (key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputConstant('e');
      } else if (key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputFunction('sin');
      } else if (key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputFunction('cos');
      } else if (key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputFunction('tan');
      } else if (key.toLowerCase() === 'l' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.inputFunction('ln');
      } else if (key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        calc.applyUnaryTransform('sqrt');
      }
    },
    [calc, isConstantsOpen, isShortcutsOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelectConstant = (constant: ScientificConstant) => {
    // If it is pi or e, insert the symbol; otherwise insert exact value
    if (constant.symbol === 'π' || constant.symbol === 'e' || constant.symbol === 'φ') {
      calc.inputConstant(constant.symbol);
    } else {
      calc.inputDigit(constant.value.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 selection:bg-blue-500/20">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        calcMode={calcMode}
        setCalcMode={setCalcMode}
        angleMode={calc.angleMode}
        toggleAngleMode={calc.toggleAngleMode}
        soundEnabled={calc.soundEnabled}
        toggleSound={calc.toggleSound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={calc.history.length}
        onOpenConstants={() => setIsConstantsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        <div
          className={`w-full transition-all duration-300 ${
            calcMode === 'scientific' ? 'max-w-xl' : 'max-w-md'
          }`}
        >
          {/* Outer Calculator Shell */}
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl p-4 sm:p-6 flex flex-col gap-3">
            {/* Display Screen */}
            <DisplayScreen
              expression={calc.expression}
              resultDisplay={calc.resultDisplay}
              livePreview={calc.livePreview}
              angleMode={calc.angleMode}
              isSecondMode={calc.isSecondMode}
              isHypMode={calc.isHypMode}
              memory={calc.memory}
              error={calc.error}
              onClear={calc.clear}
              onDeleteChar={calc.deleteChar}
            />

            {/* Tactile Keypad */}
            <Keypad
              calcMode={calcMode}
              angleMode={calc.angleMode}
              toggleAngleMode={calc.toggleAngleMode}
              isSecondMode={calc.isSecondMode}
              toggleSecondMode={calc.toggleSecondMode}
              isHypMode={calc.isHypMode}
              toggleHypMode={calc.toggleHypMode}
              memory={calc.memory}
              inputDigit={calc.inputDigit}
              inputOperator={calc.inputOperator}
              inputFunction={calc.inputFunction}
              inputConstant={calc.inputConstant}
              inputParenthesis={calc.inputParenthesis}
              inputFactorial={calc.inputFactorial}
              inputPercentage={calc.inputPercentage}
              toggleSign={calc.toggleSign}
              applyUnaryTransform={calc.applyUnaryTransform}
              calculate={calc.calculate}
              clear={calc.clear}
              clearEntry={calc.clearEntry}
              deleteChar={calc.deleteChar}
              memoryClear={calc.memoryClear}
              memoryRecall={calc.memoryRecall}
              memoryStore={calc.memoryStore}
              memoryAdd={calc.memoryAdd}
              memorySubtract={calc.memorySubtract}
            />
          </div>

          {/* Quiet Subtext / Feature Tips (Zero-Pill) */}
          <div className="flex items-center justify-between px-2 pt-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="hidden sm:inline">Type numbers or use keyboard shortcuts</span>
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-auto underline-offset-2 hover:underline"
            >
              Press ? or click for shortcuts
            </button>
          </div>
        </div>
      </main>

      {/* Slide-out History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={calc.history}
        onRestore={calc.restoreHistory}
        onClear={calc.clearHistory}
      />

      {/* Scientific Constants Modal */}
      <ConstantsModal
        isOpen={isConstantsOpen}
        onClose={() => setIsConstantsOpen(false)}
        onSelectConstant={handleSelectConstant}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
