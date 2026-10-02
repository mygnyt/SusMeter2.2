'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { RiskLevel } from '@/lib/types';

interface ScoreMeterProps {
  score: number;
  riskLevel: RiskLevel;
  riskTitle: string;
  statusHeading: string;
}

export function ScoreMeter({ score, riskLevel, riskTitle, statusHeading }: ScoreMeterProps) {
  // Анимированный счётчик очков от 0 до итогового значения
  const [displayScore, setDisplayScore] = useState(0);

  const springValue = useSpring(0, {
    stiffness: 60,
    damping: 18,
  });

  useEffect(() => {
    springValue.set(score);
  }, [score, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayScore(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  // Цвет статуса
  const getRiskTextColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'text-[#2dd4bf]'; // мятно-зеленый
      case 'medium':
        return 'text-[#fbbf24]'; // янтарно-желтый
      case 'high':
      default:
        return 'text-[#f87171]'; // кораллово-красный
    }
  };

  // Позиция ползунка (0-100)
  const pinPosition = Math.max(0, Math.min(100, score));

  return (
    <div className="w-full pt-4 space-y-4">
      {/* Заголовок статуса */}
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        {statusHeading}
      </h2>

      {/* Огромный счётчик риска */}
      <div className="flex items-baseline select-none">
        <motion.span
          key={score}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight"
        >
          {displayScore}
        </motion.span>
        <span className="text-2xl sm:text-3xl font-medium text-slate-400 ml-1">
          /100
        </span>
      </div>

      {/* Цветной статус под цифрой */}
      <div className={`text-base font-semibold ${getRiskTextColor(riskLevel)}`}>
        {riskTitle}
      </div>

      {/* Трёхсегментная горизонтальная шкала */}
      <div className="space-y-1.5 pt-1">
        <div className="relative w-full h-3 rounded-full overflow-visible flex bg-slate-900/80 p-0.5">
          {/* Сегмент 1: Зеленый (0-25%) */}
          <div
            className="h-full rounded-l-full bg-[#2dd4bf] transition-all"
            style={{ width: '25%' }}
            title="Низкий риск: 0 - 25"
          />

          {/* Сегмент 2: Желтый (25-55% -> ширина 30%) */}
          <div
            className="h-full bg-[#fbbf24] transition-all"
            style={{ width: '30%' }}
            title="Средний риск: 25 - 55"
          />

          {/* Сегмент 3: Красный (55-100% -> ширина 45%) */}
          <div
            className="h-full rounded-r-full bg-[#f87171] transition-all"
            style={{ width: '45%' }}
            title="Высокий риск: 55 - 100"
          />

          {/* Белый бегунок-ползунок */}
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${pinPosition}%` }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-6 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)] z-10 pointer-events-none"
          />
        </div>

        {/* Метки под шкалой */}
        <div className="relative w-full text-[11px] sm:text-xs text-slate-400 font-mono select-none h-4">
          <span className="absolute left-0">0</span>
          <span className="absolute left-[25%] -translate-x-1/2">25</span>
          <span className="absolute left-[55%] -translate-x-1/2">55</span>
          <span className="absolute right-0">100</span>
        </div>
      </div>
    </div>
  );
}
