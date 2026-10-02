'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VerdictCardProps {
  summary: string;
}

export function VerdictCard({ summary }: VerdictCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="w-full bg-[#161c28] border border-white/5 rounded-xl p-4 sm:p-5 flex items-stretch gap-4 shadow-sm"
    >
      {/* Белая акцентная вертикальная полоса слева (как на референсе) */}
      <div className="w-1 bg-white rounded-full shrink-0 my-0.5" />

      {/* Текст вердикта */}
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
        {summary}
      </p>
    </motion.div>
  );
}
