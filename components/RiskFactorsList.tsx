'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RiskFactor } from '@/lib/types';

interface RiskFactorsListProps {
  factors: RiskFactor[];
}

export function RiskFactorsList({ factors }: RiskFactorsListProps) {
  const getBadgeStyle = (points: number) => {
    if (points > 0) {
      return 'text-[#f87171] font-semibold'; // кораллово-красный со скриншота
    }
    if (points < 0) {
      return 'text-[#2dd4bf] font-semibold'; // зеленый для бонусов надежности
    }
    return 'text-slate-400 font-medium';
  };

  const formatPoints = (points: number) => {
    if (points > 0) return `+${points}`;
    if (points < 0) return `${points}`;
    return '0';
  };

  return (
    <div className="w-full space-y-2.5 pt-1">
      {/* Список карточек факторов */}
      <div className="space-y-2">
        {factors.map((factor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 + index * 0.05 }}
            className="w-full bg-[#161c28] border border-white/5 rounded-xl px-4 py-3 sm:py-3.5 flex items-center gap-3.5 shadow-sm"
          >
            {/* Бейдж с очками (+15, +20...) */}
            <span
              className={`min-w-[36px] text-center text-sm sm:text-base font-mono select-none ${getBadgeStyle(
                factor.points
              )}`}
            >
              {formatPoints(factor.points)}
            </span>

            {/* Текст фактора */}
            <span className="text-xs sm:text-sm text-slate-200 font-normal leading-snug">
              {factor.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Дисклеймер внизу */}
      <p className="text-xs text-slate-500 leading-relaxed pt-2 pb-6 select-none">
        Оценка строится на косвенных признаках и может ошибаться: сильный игрок способен получить
        завышенный балл. Не используйте её для обвинений.
      </p>
    </div>
  );
}
