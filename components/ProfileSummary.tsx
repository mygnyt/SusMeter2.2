'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, ShieldAlert, Clock, Calendar, Lock } from 'lucide-react';
import { SteamProfileData } from '@/lib/types';

interface ProfileSummaryProps {
  profile: SteamProfileData;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const isPrivate = profile.communityvisibilitystate === 1;

  return (
    <div className="w-full bg-[#161c28]/60 border border-white/5 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        {/* Аватар */}
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-700/60 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarfull}
            alt={profile.personaname}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ник и SteamID */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm truncate max-w-[160px] sm:max-w-[220px]">
              {profile.personaname}
            </span>
            <a
              href={profile.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 transition"
              title="Открыть в Steam"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {profile.steamId}
          </span>
        </div>
      </div>

      {/* Метки/статусы */}
      <div className="flex items-center flex-wrap gap-2 text-[11px]">
        {/* Возраст */}
        {profile.accountAgeDays !== undefined && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40">
            <Calendar className="w-3 h-3 text-slate-400" />
            {profile.accountAgeDays < 365
              ? `${profile.accountAgeDays} дн.`
              : `${profile.accountAgeYears || (profile.accountAgeDays / 365).toFixed(1)} г.`}
          </span>
        )}

        {/* Часы CS2 */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40">
          <Clock className="w-3 h-3 text-slate-400" />
          {profile.cs2PlaytimeHours} ч в CS2
        </span>

        {/* Статус приватности */}
        {isPrivate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
            <Lock className="w-3 h-3" />
            Приватный
          </span>
        )}

        {/* Статус банов */}
        {profile.vacBanned || profile.numberOfGameBans > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            {profile.vacBanned ? 'VAC Ban' : 'Game Ban'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Чистый
          </span>
        )}
      </div>
    </div>
  );
}
