/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, ArrowUpLeft, Copy, Check, Download } from 'lucide-react';
import { HistoryItem } from '../hooks/useCalculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem, mode: 'expression' | 'result') => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onClear,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyItem = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Fallback
    }
  };

  const handleExportText = () => {
    if (history.length === 0) return;
    const text = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleTimeString()}] (${h.angleMode}) ${h.expression} = ${h.result}`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculis-history-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Calculation History"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Calculation History
            </h2>
            <span className="text-xs font-mono text-slate-400">({history.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportText}
                  title="Export history as text file"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  title="Clear all history"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <p className="text-sm font-medium">No calculations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                Completed calculations will appear here for quick recall.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                {/* Meta row: timestamp and angle mode */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1 font-mono">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>{item.angleMode}</span>
                </div>

                {/* Expression */}
                <div className="font-mono-numbers text-sm text-slate-600 dark:text-slate-300 break-all select-all">
                  {item.expression}
                </div>

                {/* Result */}
                <div className="font-mono-numbers text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 break-all select-all">
                  = {item.result}
                </div>

                {/* Hover / Touch Quick Action Bar */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => handleCopyItem(item)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRestore(item, 'expression');
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline py-0.5 px-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  >
                    <ArrowUpLeft className="w-3 h-3" />
                    <span>Use Expr</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRestore(item, 'result');
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline py-0.5 px-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-medium"
                  >
                    <span>Use Ans</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
