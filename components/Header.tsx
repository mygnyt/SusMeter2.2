'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="pt-8 pb-4 text-left">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          SusMeter CS
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          CS2
        </span>
        <a
          href="https://t.me/SusMetr_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/25 hover:bg-[#229ED9]/20 transition"
          title="Открыть в Telegram"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.5l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.95-.92c-.64-.2-.65-.64.13-.95l11.55-4.45c.53-.2 1 .12.86.88z" />
          </svg>
          @SusMetr_bot
        </a>
      </div>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
        Вставь ссылку на Steam-профиль, и мы оценим по открытым данным, насколько аккаунт подозрителен
        и почему. Это подсказка, а не приговор.
      </p>
    </header>
  );
}
