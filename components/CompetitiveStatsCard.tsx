'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, ExternalLink, Info, CheckCircle2, Sliders } from 'lucide-react';
import { CSStatsData } from '@/lib/csstats';
import { ManualStats } from '@/lib/types';

interface CompetitiveStatsCardProps {
  csstats?: CSStatsData;
  manualStats?: ManualStats;
  steamId: string;
}

export function CompetitiveStatsCard({
  csstats,
  manualStats,
  steamId,
}: CompetitiveStatsCardProps) {
  const hasCSStats = csstats && csstats.available;
  const hasManual = manualStats && Object.keys(manualStats).length > 0;

  const kd = csstats?.kd ?? manualStats?.kd;
  const hs = csstats?.hs ?? manualStats?.hs;
  const winrate = csstats?.winrate ?? manualStats?.winrate;
  const matches = csstats?.matches ?? manualStats?.matches;
  const rating = csstats?.rating;

  const hasAnyStats = kd !== undefined || hs !== undefined || winrate !== undefined || matches !== undefined;

  const csstatsUrl = csstats?.url || `https://csstats.gg/player/${steamId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
      className="w-full bg-[#161c28] border border-white/5 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5"
    >
      {/* Шапка карточки со статусом источника */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Соревновательная статистика</h3>
        </div>

        <div className="flex items-center gap-2">
          {hasCSStats ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" />
              CSStats.gg
            </span>
          ) : hasManual ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
              <Sliders className="w-3 h-3" />
              Ручной ввод
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/40">
              Нет данных CSStats
            </span>
          )}

          <a
            href={csstatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
            title="Открыть на csstats.gg"
          >
            <span>csstats.gg</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Сетка показателей или сообщение об отсутствии */}
      {hasAnyStats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* K/D */}
          <div className="bg-[#111620] border border-white/5 rounded-lg p-2.5 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">K/D Ratio</span>
            <span
              className={`text-lg font-bold font-mono ${
                kd && kd >= 2.0 ? 'text-[#f87171]' : 'text-white'
              }`}
            >
              {kd !== undefined ? kd.toFixed(2) : '—'}
            </span>
          </div>

          {/* HS% */}
          <div className="bg-[#111620] border border-white/5 rounded-lg p-2.5 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Headshots %</span>
            <span
              className={`text-lg font-bold font-mono ${
                hs && hs > 65 ? 'text-[#f87171]' : 'text-white'
              }`}
            >
              {hs !== undefined ? `${hs}%` : '—'}
            </span>
          </div>

          {/* Win Rate */}
          <div className="bg-[#111620] border border-white/5 rounded-lg p-2.5 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Win Rate</span>
            <span
              className={`text-lg font-bold font-mono ${
                winrate && winrate > 70 ? 'text-[#fbbf24]' : 'text-white'
              }`}
            >
              {winrate !== undefined ? `${winrate}%` : '—'}
            </span>
          </div>

          {/* Матчи или Рейтинг */}
          <div className="bg-[#111620] border border-white/5 rounded-lg p-2.5 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">
              {rating ? 'Rating HLTV' : 'Матчей'}
            </span>
            <span className="text-lg font-bold font-mono text-white">
              {rating !== undefined
                ? rating.toFixed(2)
                : matches !== undefined
                ? matches
                : '—'}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#111620]/60 border border-white/5 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Матчи не зафиксированы в базе CSStats.gg (или профиль закрыт приватностью). Вы можете
            раскрыть спойлер выше и ввести K/D, HS% и матчи вручную для более точной оценки.
          </p>
        </div>
      )}
    </motion.div>
  );
}
