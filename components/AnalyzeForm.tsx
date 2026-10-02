'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, X, AlertCircle } from 'lucide-react';
import { ManualStats } from '@/lib/types';
import { useTelegram } from './TelegramProvider';

interface AnalyzeFormProps {
  onAnalyze: (input: string, manualStats?: ManualStats) => Promise<void>;
  onShowExample: () => void;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function AnalyzeForm({
  onAnalyze,
  onShowExample,
  isLoading,
  error,
  onClearError,
}: AnalyzeFormProps) {
  const [input, setInput] = useState('');
  const [showManualStats, setShowManualStats] = useState(false);
  const [kd, setKd] = useState('');
  const [hs, setHs] = useState('');
  const [matches, setMatches] = useState('');
  const [winrate, setWinrate] = useState('');
  const { hapticFeedback } = useTelegram();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    hapticFeedback('medium');
    const manualStats: ManualStats = {};
    if (kd && !isNaN(parseFloat(kd))) manualStats.kd = parseFloat(kd);
    if (hs && !isNaN(parseFloat(hs))) manualStats.hs = parseFloat(hs);
    if (matches && !isNaN(parseInt(matches, 10))) manualStats.matches = parseInt(matches, 10);
    if (winrate && !isNaN(parseFloat(winrate))) manualStats.winrate = parseFloat(winrate);

    onAnalyze(input, Object.keys(manualStats).length > 0 ? manualStats : undefined);
  };

  const handleExampleClick = () => {
    hapticFeedback('light');
    onShowExample();
  };

  return (
    <div className="w-full space-y-4 pt-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Поле ввода ссылки */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error && onClearError) onClearError();
            }}
            placeholder="https://steamcommunity.com/id/... или SteamID"
            className="w-full bg-[#161c28] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition shadow-inner pr-10"
            disabled={isLoading}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Раскрывающийся спойлер для ручных статов */}
        <div>
          <button
            type="button"
            onClick={() => setShowManualStats((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition font-medium"
          >
            <motion.span
              animate={{ rotate: showManualStats ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.span>
            <span>Добавить статистику вручную (из csstats или Leetify)</span>
          </button>

          <AnimatePresence>
            {showManualStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">K/D соотношение</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Напр. 2.1"
                      value={kd}
                      onChange={(e) => setKd(e.target.value)}
                      className="w-full bg-[#161c28] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">HS% (Хедшоты)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="Напр. 72"
                      value={hs}
                      onChange={(e) => setHs(e.target.value)}
                      className="w-full bg-[#161c28] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Матчей сыграно</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Напр. 48"
                      value={matches}
                      onChange={(e) => setMatches(e.target.value)}
                      className="w-full bg-[#161c28] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Винрейт %</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="Напр. 68"
                      value={winrate}
                      onChange={(e) => setWinrate(e.target.value)}
                      className="w-full bg-[#161c28] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Две кнопки рядом */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-white text-slate-950 font-medium text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Проверяем...</span>
              </>
            ) : (
              <span>Проверить аккаунт</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleExampleClick}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg border border-slate-700 bg-transparent text-slate-200 hover:text-white hover:bg-slate-800/80 font-medium text-sm transition"
          >
            Показать пример
          </button>
        </div>
      </form>

      {/* Ошибка */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs sm:text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
            <div className="flex-1">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
