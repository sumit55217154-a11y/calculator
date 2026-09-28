/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Volume2, VolumeX, History, BookOpen, Command } from 'lucide-react';
import { AngleMode } from '../utils/mathEngine';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  calcMode: 'standard' | 'scientific';
  setCalcMode: (mode: 'standard' | 'scientific') => void;
  angleMode: AngleMode;
  toggleAngleMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenConstants: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  calcMode,
  setCalcMode,
  angleMode,
  toggleAngleMode,
  soundEnabled,
  toggleSound,
  onOpenHistory,
  historyCount,
  onOpenConstants,
  onOpenShortcuts,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-colors duration-200 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <span className="font-mono font-bold text-sm leading-none">∫x</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Calculis
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Scientific
          </span>
        </div>
      </div>

      {/* Zone 2: Mode Selectors & Quick Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mode Segmented Switch */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setCalcMode('standard')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              calcMode === 'standard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('scientific')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              calcMode === 'scientific'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scientific
          </button>
        </div>

        {/* Angle Unit Quick Switch (DEG / RAD) */}
        <button
          type="button"
          onClick={toggleAngleMode}
          title="Toggle Angle Mode (Degrees / Radians)"
          className="px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500"
        >
          {angleMode}
        </button>

        {/* Constants Reference Button */}
        <button
          type="button"
          onClick={onOpenConstants}
          title="Physical and Mathematical Constants"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Constants</span>
        </button>
      </div>

      {/* Zone 3: Utility Actions (Sound, Shortcuts, History, Theme) */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Keyboard Shortcuts */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
          aria-label="Keyboard Shortcuts"
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:inline-flex"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Key Clicks' : 'Enable Key Clicks'}
          aria-label={soundEnabled ? 'Mute Key Clicks' : 'Enable Key Clicks'}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          )}
        </button>

        {/* History Panel Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          title="Calculation History"
          aria-label="Calculation History"
          className="relative p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <History className="w-4 h-4" />
          {historyCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};
