/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Delete, RotateCcw, AlertCircle } from 'lucide-react';
import { AngleMode } from '../utils/mathEngine';

interface DisplayScreenProps {
  expression: string;
  resultDisplay: string;
  livePreview: string | null;
  angleMode: AngleMode;
  isSecondMode: boolean;
  isHypMode: boolean;
  memory: number;
  error: string | null;
  onClear: () => void;
  onDeleteChar: () => void;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  expression,
  resultDisplay,
  livePreview,
  angleMode,
  isSecondMode,
  isHypMode,
  memory,
  error,
  onClear,
  onDeleteChar,
}) => {
  const [copied, setCopied] = useState(false);
  const exprContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression to right on type
  useEffect(() => {
    if (exprContainerRef.current) {
      exprContainerRef.current.scrollLeft = exprContainerRef.current.scrollWidth;
    }
  }, [expression]);

  const handleCopy = async () => {
    const textToCopy = resultDisplay !== '0' && resultDisplay !== 'Error' ? resultDisplay : expression;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  // Dynamic font sizing for large numbers
  const getResultFontSize = (text: string) => {
    const len = text.length;
    if (len > 18) return 'text-2xl sm:text-3xl';
    if (len > 13) return 'text-3xl sm:text-4xl';
    if (len > 9) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  return (
    <div className="w-full relative flex flex-col justify-between p-4 sm:p-6 bg-slate-50/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors duration-200">
      {/* Top Status & Indicators Bar (Zero-Pill: Clean unboxed metadata with bullet separators) */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 select-none">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
            {angleMode}
          </span>
          {isSecondMode && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-amber-500 dark:text-amber-400 font-medium">2nd</span>
            </>
          )}
          {isHypMode && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">HYP</span>
            </>
          )}
          {memory !== 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                M ({memory})
              </span>
            </>
          )}
        </div>

        {/* Quick Screen Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Result"
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onDeleteChar}
            title="Backspace (Backspace key)"
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear All (Escape key)"
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expression Line with Horizontal Scroll */}
      <div
        ref={exprContainerRef}
        className="w-full overflow-x-auto whitespace-nowrap scrollbar-none py-1 text-right text-slate-500 dark:text-slate-400 font-mono-numbers text-lg sm:text-xl font-medium tracking-wide min-h-[32px] flex items-center justify-end"
      >
        {expression ? (
          <span>{expression}</span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 select-none">0</span>
        )}
      </div>

      {/* Live Preview Line (Ghost evaluation while typing) */}
      <div className="w-full flex items-center justify-end h-5 my-0.5 text-right font-mono-numbers text-xs sm:text-sm text-slate-400 dark:text-slate-500">
        {error ? (
          <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : livePreview ? (
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="text-slate-400 dark:text-slate-600">=</span>
            <span>{livePreview}</span>
          </div>
        ) : null}
      </div>

      {/* Main Evaluated Result Display */}
      <div className="w-full text-right mt-1">
        <div
          className={`font-mono-numbers font-semibold tracking-tight text-slate-900 dark:text-slate-50 transition-all select-all ${getResultFontSize(
            resultDisplay
          )}`}
        >
          {resultDisplay}
        </div>
      </div>
    </div>
  );
};
