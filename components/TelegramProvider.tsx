'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  isTma: boolean;
  user: any | null;
  hapticFeedback: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isTma: false,
  user: null,
  hapticFeedback: () => {},
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isTma, setIsTma] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        setIsTma(true);

        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }

        if (tg.setBackgroundColor) {
          tg.setBackgroundColor('#0e131b');
        }
        if (tg.setHeaderColor) {
          tg.setHeaderColor('#0e131b');
        }
      } catch (err) {
        console.warn('Telegram WebApp initialization error:', err);
      }
    }
  }, []);

  const hapticFeedback = (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
  ) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      try {
        const hf = window.Telegram.WebApp.HapticFeedback;
        if (type === 'success' || type === 'warning' || type === 'error') {
          hf.notificationOccurred(type);
        } else {
          hf.impactOccurred(type);
        }
      } catch (e) {
        // Ignore haptics errors if not supported
      }
    }
  };

  return (
    <TelegramContext.Provider value={{ isTma, user, hapticFeedback }}>
      {children}
    </TelegramContext.Provider>
  );
}
