'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { AnalyzeForm } from '@/components/AnalyzeForm';
import { ScoreMeter } from '@/components/ScoreMeter';
import { VerdictCard } from '@/components/VerdictCard';
import { RiskFactorsList } from '@/components/RiskFactorsList';
import { ProfileSummary } from '@/components/ProfileSummary';
import { CompetitiveStatsCard } from '@/components/CompetitiveStatsCard';
import { SCREENSHOT_EXAMPLE } from '@/lib/presets';
import { AnalysisResult, ManualStats } from '@/lib/types';
import { useTelegram } from '@/components/TelegramProvider';

export default function Home() {
  // Инициализируем результатом со скриншота, чтобы сразу соответствовать референсу
  const [result, setResult] = useState<AnalysisResult | null>(SCREENSHOT_EXAMPLE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hapticFeedback } = useTelegram();

  const handleAnalyze = async (input: string, manualStats?: ManualStats) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, manualStats }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Не удалось выполнить анализ аккаунта.');
      }

      setResult(json.data);
      hapticFeedback('success');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Произошла непредвиденная ошибка при проверке.');
      hapticFeedback('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowExample = () => {
    setError(null);
    setResult({ ...SCREENSHOT_EXAMPLE, timestamp: Date.now() });
    hapticFeedback('light');
  };

  return (
    <main className="min-h-screen bg-[#0e131b] text-slate-100 flex justify-center selection:bg-teal-500/20">
      <div className="w-full max-w-[680px] px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Заголовок */}
        <Header />

        {/* Форма ввода ссылки и ручных статов */}
        <AnalyzeForm
          onAnalyze={handleAnalyze}
          onShowExample={handleShowExample}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError(null)}
        />

        {/* Блок результатов анализа */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.timestamp}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-5 pt-2"
            >
              {/* Счётчик риска и 3-сегментная шкала */}
              <ScoreMeter
                score={result.score}
                riskLevel={result.riskLevel}
                riskTitle={result.riskTitle}
                statusHeading={result.statusHeading}
              />

              {/* Сводка профиля (если есть аватар и данные Steam) */}
              {result.profile && (
                <ProfileSummary profile={result.profile} />
              )}

              {/* Соревновательная статистика CSStats / Ручной ввод */}
              <CompetitiveStatsCard
                csstats={result.csstats}
                manualStats={result.manualStats}
                steamId={result.profile.steamId}
              />

              {/* Карточка с человеческим вердиктом и белой полосой */}
              <VerdictCard summary={result.summary} />

              {/* Список факторов риска с бейджами +XX */}
              <RiskFactorsList factors={result.factors} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
