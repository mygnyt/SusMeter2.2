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
      </div>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
        Вставь ссылку на Steam-профиль, и мы оценим по открытым данным, насколько аккаунт подозрителен
        и почему. Это подсказка, а не приговор.
      </p>
    </header>
  );
}
