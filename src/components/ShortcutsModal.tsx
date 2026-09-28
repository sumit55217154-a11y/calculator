/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 – 9', desc: 'Input digits' },
    { key: '.', desc: 'Decimal point' },
    { key: '+  −  *  /', desc: 'Basic arithmetic operations' },
    { key: 'Enter or =', desc: 'Calculate result' },
    { key: 'Backspace', desc: 'Delete last character' },
    { key: 'Escape', desc: 'Clear all (AC)' },
    { key: '(', desc: 'Open parenthesis' },
    { key: ')', desc: 'Close parenthesis' },
    { key: '^', desc: 'Power (xʸ)' },
    { key: '%', desc: 'Percentage' },
    { key: '!', desc: 'Factorial (n!)' },
    { key: 'p', desc: 'Pi constant (π)' },
    { key: 'e', desc: "Euler's number (e)" },
    { key: 's', desc: 'sin(x)' },
    { key: 'c', desc: 'cos(x)' },
    { key: 't', desc: 'tan(x)' },
    { key: 'l', desc: 'ln(x)' },
    { key: 'r', desc: 'sqrt(x)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <div className="grid grid-cols-1 gap-2">
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 text-xs"
              >
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {sc.desc}
                </span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-mono font-semibold shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
